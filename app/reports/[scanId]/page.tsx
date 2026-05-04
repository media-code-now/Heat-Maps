import { DashboardShell } from "@/components/layout/DashboardShell";
import { ReportPage, type ReportScan } from "@/components/report-page";
import { getActiveUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ScanReportPage({
  params,
}: {
  params: { scanId: string };
}) {
  const scan = await getScan(params.scanId);

  return (
    <DashboardShell>
      {scan ? (
        <ReportPage scan={scan} />
      ) : (
        <div className="glass-card mx-auto max-w-3xl p-8 text-center">
          <h1 className="text-4xl">Report not found</h1>
          <p className="mt-4">Run a scan first, then open its report link.</p>
        </div>
      )}
    </DashboardShell>
  );
}

async function getScan(scanId: string): Promise<ReportScan | null> {
  const userId = await getActiveUserId();

  if (!userId) {
    return null;
  }

  try {
    const scan = await prisma.scan.findFirst({
      where: {
        id: scanId,
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
      return null;
    }

    return {
      id: scan.id,
      project: {
        id: scan.project.id,
        businessName: scan.project.businessName,
        googleBusinessProfileName: scan.project.googleBusinessProfileName,
        website: scan.project.website,
        latitude: scan.project.latitude,
        longitude: scan.project.longitude,
      },
      keyword: scan.keyword.phrase,
      gridSize: scan.gridSize,
      radius: scan.radiusMiles,
      createdAt: scan.createdAt.toISOString(),
      summary: {
        avgRank: scan.avgRank ?? 0,
        visibilityScore: scan.visibilityScore ?? 0,
        top3Percentage: scan.top3Percentage ?? 0,
        notFoundPercentage: scan.notFoundPercentage ?? 0,
      },
      results: scan.gridPoints.map((point) => ({
        lat: point.latitude,
        lng: point.longitude,
        rank: point.ranking?.notFound ? "NF" : point.ranking?.rank ?? "NF",
        keyword: scan.keyword.phrase,
      })),
    };
  } catch {
    return null;
  }
}
