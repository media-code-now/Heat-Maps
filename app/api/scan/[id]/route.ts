import { NextResponse } from "next/server";

import { getActiveUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const userId = await getActiveUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const scan = await prisma.scan.findFirst({
    where: {
      id: params.id,
      project: { userId },
    },
    include: {
      project: true,
      keyword: true,
      gridPoints: {
        orderBy: [{ row: "asc" }, { column: "asc" }],
        include: {
          ranking: {
            include: {
              competitors: {
                orderBy: { rank: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!scan) {
    return NextResponse.json({ error: "Scan not found." }, { status: 404 });
  }

  const results = scan.gridPoints.map((point) => ({
    lat: point.latitude,
    lng: point.longitude,
    rank: point.ranking?.notFound ? "NF" : point.ranking?.rank ?? "NF",
    keyword: scan.keyword.phrase,
    competitors:
      point.ranking?.competitors.map((competitor) => ({
        title: competitor.title,
        rank: competitor.rank,
        url: competitor.url,
        placeId: competitor.placeId,
        rating: competitor.rating,
        address: competitor.address,
      })) ?? [],
    resultUrls: point.ranking?.resultUrls ?? [],
    matchedBusiness: point.ranking?.matchedTitle
      ? {
          title: point.ranking.matchedTitle,
          rank: point.ranking.rank,
          url: point.ranking.matchedUrl,
          placeId: point.ranking.matchedPlaceId,
          rating: null,
          address: null,
        }
      : null,
    source: scan.source === "DATAFORSEO" ? "dataforseo" : "mock",
  }));

  return NextResponse.json({
    id: scan.id,
    project: {
      id: scan.project.id,
      businessName: scan.project.businessName,
      googleBusinessProfileName: scan.project.googleBusinessProfileName,
      website: scan.project.website,
      placeId: scan.project.placeId,
      latitude: scan.project.latitude,
      longitude: scan.project.longitude,
    },
    keyword: scan.keyword.phrase,
    gridSize: scan.gridSize,
    radius: scan.radiusMiles,
    createdAt: scan.createdAt.toISOString(),
    source: scan.source === "DATAFORSEO" ? "dataforseo" : "mock",
    summary: {
      avgRank: scan.avgRank ?? 0,
      visibilityScore: scan.visibilityScore ?? 0,
      top3Percentage: scan.top3Percentage ?? 0,
      notFoundPercentage: scan.notFoundPercentage ?? 0,
    },
    results,
  });
}
