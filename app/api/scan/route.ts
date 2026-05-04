import { NextResponse } from "next/server";

import { getActiveUserId } from "@/lib/auth";
import { generateCoordinateGrid } from "@/lib/coordinate-grid";
import { fetchDataForSeoRankings, hasDataForSeoCredentials } from "@/lib/dataforseo";
import { generateMockRankings } from "@/lib/mock-rankings";
import { prisma } from "@/lib/prisma";
import { toProjectData } from "@/lib/project-validation";
import { calculateRankingSummary } from "@/lib/ranking-summary";
import { type ScanProject, type ScanResultPoint } from "@/lib/scan-store";

type CreateScanBody = {
  projectId?: string;
  project?: Partial<ScanProject>;
  keyword?: string;
  gridSize?: number;
  radius?: number;
};

export async function POST(request: Request) {
  const userId = await getActiveUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: CreateScanBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const validationError = validateCreateScanBody(body);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const project = await resolveProject(body, userId);
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const keyword = body.keyword!.trim();
  const gridSize = body.gridSize!;
  const radius = body.radius!;
  const coordinates = generateCoordinateGrid({
    centerLat: project.latitude,
    centerLng: project.longitude,
    gridSize,
    radiusMiles: radius,
  });
  const source = hasDataForSeoCredentials() ? "dataforseo" : "mock";
  const results =
    source === "dataforseo"
      ? await fetchDataForSeoRankings({
          coordinates,
          keyword,
          project,
        })
      : generateMockRankings({
          coordinates,
          centerLat: project.latitude,
          centerLng: project.longitude,
          keyword,
        }).map((result) => ({
          ...result,
          source: "mock" as const,
          competitors: [],
          resultUrls: [],
          matchedBusiness: null,
        }));
  const summary = calculateRankingSummary(results.map((result) => result.rank));
  const keywordRecord = await prisma.keyword.upsert({
    where: {
      projectId_phrase: {
        projectId: project.id!,
        phrase: keyword,
      },
    },
    create: {
      projectId: project.id!,
      phrase: keyword,
    },
    update: {},
  });
  const scan = await prisma.scan.create({
    data: {
      projectId: project.id!,
      keywordId: keywordRecord.id,
      gridSize,
      radiusMiles: radius,
      centerLatitude: project.latitude,
      centerLongitude: project.longitude,
      status: "COMPLETED",
      source: source === "dataforseo" ? "DATAFORSEO" : "MOCK",
      avgRank: summary.avgRank,
      visibilityScore: summary.visibilityScore,
      top3Percentage: summary.top3Percentage,
      notFoundPercentage: summary.notFoundPercentage,
      startedAt: new Date(),
      completedAt: new Date(),
    },
  });

  await persistScanResults(scan.id, gridSize, results);

  return NextResponse.json({
    id: scan.id,
    project,
    keyword,
    gridSize,
    radius,
    createdAt: scan.createdAt.toISOString(),
    source,
    summary,
    results,
  }, { status: 201 });
}

function validateCreateScanBody(body: CreateScanBody) {
  if (!body.projectId && (!body.project || typeof body.project !== "object")) {
    return "projectId or project is required.";
  }

  if (body.project && !body.project.businessName?.trim() && !body.project.googleBusinessProfileName?.trim()) {
    return "project.businessName or project.googleBusinessProfileName is required.";
  }

  if (body.project && (
    !Number.isFinite(body.project.latitude) ||
    body.project.latitude! < -90 ||
    body.project.latitude! > 90
  )) {
    return "project.latitude must be between -90 and 90.";
  }

  if (body.project && (
    !Number.isFinite(body.project.longitude) ||
    body.project.longitude! < -180 ||
    body.project.longitude! > 180
  )) {
    return "project.longitude must be between -180 and 180.";
  }

  if (!body.keyword?.trim()) {
    return "keyword is required.";
  }

  if (!Number.isInteger(body.gridSize) || body.gridSize! < 1 || body.gridSize! > 25) {
    return "gridSize must be an integer between 1 and 25.";
  }

  if (!Number.isFinite(body.radius) || body.radius! <= 0 || body.radius! > 100) {
    return "radius must be a number greater than 0 and no more than 100 miles.";
  }

  return null;
}

async function resolveProject(body: CreateScanBody, userId: string): Promise<ScanProject | null> {
  if (body.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: body.projectId, userId },
    });

    if (!project) {
      return null;
    }

    return {
      id: project.id,
      businessName: project.businessName,
      googleBusinessProfileName: project.googleBusinessProfileName ?? undefined,
      website: project.website ?? undefined,
      placeId: project.placeId ?? undefined,
      latitude: project.latitude,
      longitude: project.longitude,
    };
  }

  if (!body.project) {
    return null;
  }

  const created = await prisma.project.create({
    data: {
      ...toProjectData({
        businessName: body.project.businessName,
        website: body.project.website,
        googleBusinessProfileName: body.project.googleBusinessProfileName,
        latitude: body.project.latitude,
        longitude: body.project.longitude,
      }),
      userId,
    },
  });

  return {
    id: created.id,
    businessName: created.businessName,
    googleBusinessProfileName: created.googleBusinessProfileName ?? undefined,
    website: created.website ?? undefined,
    placeId: created.placeId ?? undefined,
    latitude: created.latitude,
    longitude: created.longitude,
  };
}

async function persistScanResults(scanId: string, gridSize: number, results: ScanResultPoint[]) {
  await prisma.scanGridPoint.createMany({
    data: results.map((result, index) => ({
      scanId,
      row: Math.floor(index / gridSize),
      column: index % gridSize,
      latitude: result.lat,
      longitude: result.lng,
    })),
  });

  const gridPoints = await prisma.scanGridPoint.findMany({
    where: { scanId },
    orderBy: [{ row: "asc" }, { column: "asc" }],
  });

  for (let index = 0; index < results.length; index += 1) {
    const result = results[index];

    await prisma.rankingResult.create({
      data: {
        scanId,
        gridPointId: gridPoints[index].id,
        rank: result.rank === "NF" ? null : result.rank,
        notFound: result.rank === "NF",
        matchedTitle: result.matchedBusiness?.title ?? null,
        matchedUrl: result.matchedBusiness?.url ?? null,
        matchedPlaceId: result.matchedBusiness?.placeId ?? null,
        resultUrls: result.resultUrls ?? [],
        competitors: {
          create: (result.competitors ?? []).slice(0, 20).map((competitor) => ({
            title: competitor.title,
            rank: competitor.rank,
            url: competitor.url,
            placeId: competitor.placeId,
            rating: competitor.rating,
            address: competitor.address,
          })),
        },
      },
    });
  }
}
