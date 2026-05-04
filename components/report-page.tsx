"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Download,
  FileText,
  Link2,
  MapPinned,
} from "lucide-react";

import { AiInsightsPanel } from "@/components/ai-insights-panel";
import { Button } from "@/components/ui/button";
import type { RankingZone } from "@/lib/ai-insights";
import { generateCoordinateGrid } from "@/lib/coordinate-grid";
import { generateMockRankings, type MockRanking, type RankValue } from "@/lib/mock-rankings";
import { calculateRankingSummary, type RankingSummary } from "@/lib/ranking-summary";
import { cn } from "@/lib/utils";

export type ReportScan = {
  id: string;
  project: {
    id?: string;
    businessName?: string;
    googleBusinessProfileName?: string | null;
    website?: string | null;
    latitude: number;
    longitude: number;
  };
  keyword: string;
  gridSize: number;
  radius: number;
  createdAt: string;
  summary: RankingSummary;
  results: MockRanking[];
};

const mockReport = {
  businessName: "Northstar Dental Studio",
  location: "Las Vegas, NV",
  address: "3200 Las Vegas Blvd S, Las Vegas, NV",
  website: "northstardental.example",
  keyword: "emergency dentist",
  scanDate: "April 30, 2026",
  centerLat: 36.1699,
  centerLng: -115.1398,
};

export function ReportPage({ scan }: { scan?: ReportScan }) {
  const [copied, setCopied] = useState(false);
  const mockPoints = useMemo(() => {
    const coordinates = generateCoordinateGrid({
      centerLat: mockReport.centerLat,
      centerLng: mockReport.centerLng,
      gridSize: 7,
      radiusMiles: 4,
    });

    return generateMockRankings({
      coordinates,
      centerLat: mockReport.centerLat,
      centerLng: mockReport.centerLng,
      keyword: mockReport.keyword,
    });
  }, []);
  const points = scan?.results ?? mockPoints;
  const summary = scan?.summary ?? calculateRankingSummary(points.map((point) => point.rank));
  const zones = useMemo(() => getRankingZones(points), [points]);
  const report = scan
    ? {
        businessName: scan.project.businessName ?? "Saved Project",
        location: `${scan.project.latitude.toFixed(4)}, ${scan.project.longitude.toFixed(4)}`,
        address: scan.project.googleBusinessProfileName ?? "Stored scan result",
        website: scan.project.website ?? "Not set",
        keyword: scan.keyword,
        scanDate: new Date(scan.createdAt).toLocaleDateString(),
        centerLat: scan.project.latitude,
        centerLng: scan.project.longitude,
        gridSize: scan.gridSize,
      }
    : { ...mockReport, gridSize: 7 };

  async function copyShareLink() {
    const url = window.location.href;

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="mx-auto w-full max-w-7xl print:bg-white print:text-slate-950">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end print:hidden">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-muted-foreground">
            <FileText className="h-3.5 w-3.5 text-primary" />
            Client-ready scan report
          </div>
          <h1>Report</h1>
          <p className="mt-4 max-w-2xl">
            A polished local ranking report with summary metrics, heatmap snapshot, and clear next-step insights.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={copyShareLink}>
            {copied ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Link2 className="mr-2 h-4 w-4" />}
            {copied ? "Copied" : "Share Link"}
          </Button>
          <Button onClick={() => window.print()}>
            <Download className="mr-2 h-4 w-4" />
            Download as PDF
          </Button>
        </div>
      </div>

      <article className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] shadow-glow backdrop-blur-xl print:border-slate-200 print:bg-white print:shadow-none">
        <header className="border-b border-white/10 bg-white/[0.03] p-6 md:p-8 print:border-slate-200 print:bg-white">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-primary print:text-slate-500">Local Visibility Report</p>
              <h2 className="mt-3 text-3xl font-semibold md:text-4xl print:text-slate-950">
                {report.businessName}
              </h2>
              <p className="mt-3 text-muted-foreground print:text-slate-600">{report.address}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm print:border-slate-200 print:bg-slate-50">
              <div className="text-muted-foreground print:text-slate-500">Keyword scanned</div>
              <div className="mt-1 text-lg font-semibold text-foreground print:text-slate-950">
                {report.keyword}
              </div>
              <div className="mt-3 text-muted-foreground print:text-slate-500">Scan date</div>
              <div className="mt-1 font-medium text-foreground print:text-slate-950">{report.scanDate}</div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 p-6 md:p-8">
          <section className="grid gap-4 md:grid-cols-4">
            <StatCard label="Visibility Score" value={`${summary.visibilityScore}%`} trend="up" />
            <StatCard label="Average Rank" value={String(summary.avgRank)} trend="down" />
            <StatCard label="Top 3 Coverage" value={`${summary.top3Percentage}%`} trend="up" />
            <StatCard label="Not Found" value={`${summary.notFoundPercentage}%`} trend="down" inverse />
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-4">
              <InfoPanel report={report} />
            </div>

            <div className="rounded-lg border border-white/10 bg-slate-950/60 p-5 print:border-slate-200 print:bg-slate-50">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl print:text-slate-950">Heatmap Snapshot</h3>
                  <p className="mt-1 text-sm text-muted-foreground print:text-slate-600">
                    {report.gridSize}x{report.gridSize} grid centered on {report.location}
                  </p>
                </div>
                <MapPinned className="h-5 w-5 text-primary print:text-slate-500" />
              </div>

              <div className="rounded-lg border border-white/10 bg-[linear-gradient(135deg,rgba(14,165,233,0.18),rgba(15,23,42,0.88)),radial-gradient(circle_at_50%_50%,rgba(45,212,191,0.2),transparent_34%)] p-4 print:border-slate-200 print:bg-white">
                <div
                  className="grid aspect-square gap-2"
                  style={{ gridTemplateColumns: `repeat(${report.gridSize}, minmax(0, 1fr))` }}
                >
                  {points.map((point, index) => (
                    <div
                      key={`${point.lat}-${point.lng}-${index}`}
                      className={cn(
                        "flex items-center justify-center rounded-full border text-[10px] font-bold text-slate-950 shadow-lg",
                        getRankClass(point.rank),
                      )}
                    >
                      {point.rank}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <Legend label="1-3" className="bg-emerald-400" />
                <Legend label="4-10" className="bg-yellow-300" />
                <Legend label="11-20" className="bg-orange-400" />
                <Legend label="21+" className="bg-red-500" />
                <Legend label="NF" className="bg-slate-400" />
              </div>
            </div>
          </section>

          <AiInsightsPanel
            rankingData={points}
            weakZones={zones.weakZones}
            strongZones={zones.strongZones}
            summary={summary}
            keyword={report.keyword}
          />
        </div>
      </article>
    </section>
  );
}

function StatCard({
  label,
  value,
  trend,
  inverse = false,
}: {
  label: string;
  value: string;
  trend: "up" | "down";
  inverse?: boolean;
}) {
  const TrendIcon = trend === "up" ? ArrowUpRight : ArrowDownRight;
  const isPositive = inverse ? trend === "down" : trend === "up";

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5 print:border-slate-200 print:bg-slate-50">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase text-muted-foreground print:text-slate-500">{label}</p>
        <TrendIcon className={cn("h-4 w-4", isPositive ? "text-accent" : "text-red-300")} />
      </div>
      <div className="mt-4 text-4xl font-semibold text-foreground print:text-slate-950">{value}</div>
    </div>
  );
}

function InfoPanel({
  report,
}: {
  report: {
    businessName: string;
    location: string;
    website: string;
    centerLat: number;
    centerLng: number;
  };
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.05] p-5 print:border-slate-200 print:bg-slate-50">
      <div className="mb-5 flex items-center gap-2">
        <Building2 className="h-5 w-5 text-primary print:text-slate-500" />
        <h3 className="text-2xl print:text-slate-950">Business Info</h3>
      </div>
      <div className="grid gap-3 text-sm">
        <ReportRow label="Business" value={report.businessName} />
        <ReportRow label="Location" value={report.location} />
        <ReportRow label="Website" value={report.website} />
        <ReportRow label="Center" value={`${report.centerLat}, ${report.centerLng}`} />
      </div>
    </div>
  );
}

function ReportRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/20 px-3 py-2 print:border-slate-200 print:bg-white">
      <span className="text-muted-foreground print:text-slate-500">{label}</span>
      <span className="text-right font-medium text-foreground print:text-slate-950">{value}</span>
    </div>
  );
}

function Legend({ label, className }: { label: string; className: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-muted-foreground print:border-slate-200 print:bg-white print:text-slate-600">
      <span className={cn("h-2.5 w-2.5 rounded-full", className)} />
      {label}
    </span>
  );
}

function getRankClass(rank: RankValue) {
  if (rank === "NF") {
    return "border-slate-200/70 bg-slate-400";
  }

  if (rank <= 3) {
    return "border-emerald-100/80 bg-emerald-400";
  }

  if (rank <= 10) {
    return "border-yellow-100/80 bg-yellow-300";
  }

  if (rank <= 20) {
    return "border-orange-100/80 bg-orange-400";
  }

  return "border-red-100/80 bg-red-500 text-white";
}

function getRankingZones(points: MockRanking[]) {
  const zoneDefinitions = [
    { label: "Northwest", indexes: [0, 1, 7, 8] },
    { label: "North", indexes: [2, 3, 4, 9, 10, 11] },
    { label: "Northeast", indexes: [5, 6, 12, 13] },
    { label: "West", indexes: [14, 15, 21, 22, 28, 29] },
    { label: "Center", indexes: [16, 17, 18, 23, 24, 25, 30, 31, 32] },
    { label: "East", indexes: [19, 20, 26, 27, 33, 34] },
    { label: "Southwest", indexes: [35, 36, 42, 43] },
    { label: "South", indexes: [37, 38, 39, 44, 45, 46] },
    { label: "Southeast", indexes: [40, 41, 47, 48] },
  ];

  const zones = zoneDefinitions.map((zone) => {
    const zonePoints = zone.indexes.map((index) => points[index]).filter(Boolean);
    const weakCount = zonePoints.filter(
      (point) => point.rank === "NF" || point.rank > 10,
    ).length;
    const strongCount = zonePoints.filter(
      (point) => point.rank !== "NF" && point.rank <= 3,
    ).length;

    return {
      label: zone.label,
      weakCount,
      strongCount,
    };
  });

  return {
    weakZones: zones
      .filter((zone) => zone.weakCount > 0)
      .sort((a, b) => b.weakCount - a.weakCount)
      .slice(0, 3)
      .map(({ label, weakCount }): RankingZone => ({ label, count: weakCount })),
    strongZones: zones
      .filter((zone) => zone.strongCount > 0)
      .sort((a, b) => b.strongCount - a.strongCount)
      .slice(0, 3)
      .map(({ label, strongCount }): RankingZone => ({ label, count: strongCount })),
  };
}
