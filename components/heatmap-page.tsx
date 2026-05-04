"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Crosshair,
  Eye,
  Loader2,
  MapPinned,
  MousePointer2,
  Radar,
  SearchX,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import type { ProjectRecord } from "@/components/projects/project-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateCoordinateGrid } from "@/lib/coordinate-grid";
import { mapboxgl } from "@/lib/mapbox";
import { generateMockRankings, type RankValue } from "@/lib/mock-rankings";
import { calculateRankingSummary, type RankingSummary } from "@/lib/ranking-summary";
import { cn } from "@/lib/utils";

type GridPoint = {
  id: string;
  rank: RankValue;
  keyword: string;
  latitude: number;
  longitude: number;
};

type TooltipState = {
  point: GridPoint;
  x: number;
  y: number;
};

type ApiScan = {
  id: string;
  project: {
    id?: string;
    businessName?: string;
    latitude: number;
    longitude: number;
  };
  keyword: string;
  gridSize: number;
  radius: number;
  createdAt: string;
  source: "mock" | "dataforseo";
  summary: RankingSummary;
  results: Array<{
    lat: number;
    lng: number;
    rank: RankValue;
    keyword: string;
  }>;
};

const LAS_VEGAS_CENTER = {
  longitude: -115.1398,
  latitude: 36.1699,
};

const keyword = "emergency dentist";

const mapStyle = "mapbox://styles/mapbox/dark-v11";
const defaultGridSize = 9;
const defaultRadiusMiles = 4;

export function HeatmapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRefs = useRef<mapboxgl.Marker[]>([]);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<GridPoint | null>(null);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [keywordInput, setKeywordInput] = useState(keyword);
  const [gridSize, setGridSize] = useState(defaultGridSize);
  const [radius, setRadius] = useState(defaultRadiusMiles);
  const [scan, setScan] = useState<ApiScan | null>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "posting" | "loading" | "complete">("idle");
  const [scanError, setScanError] = useState<string | null>(null);

  const gridPoints = useMemo(() => (scan ? toGridPoints(scan) : createGridPoints()), [scan]);
  const rankingSummary = scan?.summary ?? calculateRankingSummary(gridPoints.map((point) => point.rank));
  const hasMapboxToken = Boolean(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);

  useEffect(() => {
    async function loadProjects() {
      const response = await fetch("/api/projects");
      const data = await response.json();

      if (response.ok) {
        setProjects(data.projects);
        setSelectedProjectId(data.projects[0]?.id ?? "");
      }
    }

    loadProjects();
  }, []);

  useEffect(() => {
    if (!hasMapboxToken || !mapContainerRef.current || mapRef.current) {
      return;
    }

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: mapStyle,
        center: [LAS_VEGAS_CENTER.longitude, LAS_VEGAS_CENTER.latitude],
        zoom: 11.3,
        pitch: 42,
        bearing: -12,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
      map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
      mapRef.current = map;

      map.on("move", () => setTooltip(null));
      map.on("error", () => setMapError("Mapbox could not load the map style."));

      return () => {
        markerRefs.current.forEach((marker) => marker.remove());
        markerRefs.current = [];
        map.remove();
        mapRef.current = null;
      };
    } catch {
      setMapError("Mapbox could not initialize. Check your access token.");
    }
  }, [hasMapboxToken]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    const addMarkers = () => {
      markerRefs.current.forEach((marker) => marker.remove());
      markerRefs.current = [];
      gridPoints.forEach((point, index) => {
        const markerElement = document.createElement("button");
        markerElement.type = "button";
        const labelElement = document.createElement("span");
        labelElement.textContent = String(point.rank);
        labelElement.className = "relative z-10";
        markerElement.appendChild(labelElement);
        markerElement.className = cn(
          "heatmap-marker group flex h-5 w-5 items-center justify-center rounded-full border text-[8px] font-bold text-slate-950 shadow-lg transition duration-300 hover:scale-125 focus:outline-none focus:ring-2 focus:ring-white sm:h-6 sm:w-6 md:h-7 md:w-7 md:text-[9px]",
          getRankMarkerClass(point.rank),
          isHighRanking(point.rank) && "heatmap-marker-glow",
        );
        markerElement.style.animationDelay = `${index * 26}ms`;
        markerElement.addEventListener("mouseenter", () => {
          const rect = mapContainerRef.current?.getBoundingClientRect();
          const projected = map.project([point.longitude, point.latitude]);
          setTooltip({ point, x: projected.x + (rect?.left ?? 0), y: projected.y + (rect?.top ?? 0) });
        });
        markerElement.addEventListener("mouseleave", () => setTooltip(null));
        markerElement.addEventListener("click", () => setSelectedPoint(point));

        markerRefs.current.push(
          new mapboxgl.Marker({ element: markerElement, anchor: "center" })
            .setLngLat([point.longitude, point.latitude])
            .addTo(map),
        );
      });
    };

    if (map.loaded()) {
      addMarkers();
    } else {
      map.once("load", addMarkers);
    }
  }, [gridPoints]);

  useEffect(() => {
    if (scan && mapRef.current) {
      mapRef.current.flyTo({
        center: [scan.project.longitude, scan.project.latitude],
        zoom: 11.3,
        duration: 900,
      });
    }
  }, [scan]);

  async function runScan() {
    setScanError(null);
    setSelectedPoint(null);

    if (!selectedProjectId) {
      setScanError("Create a project before running a scan.");
      return;
    }

    setScanStatus("posting");

    const postResponse = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: selectedProjectId,
        keyword: keywordInput,
        gridSize,
        radius,
      }),
    });
    const postData = await postResponse.json();

    if (!postResponse.ok) {
      setScanError(postData.error ?? "Unable to start scan.");
      setScanStatus("idle");
      return;
    }

    setScanStatus("loading");
    const getResponse = await fetch(`/api/scan/${postData.id}`);
    const getData = await getResponse.json();

    if (!getResponse.ok) {
      setScanError(getData.error ?? "Scan created, but results could not be loaded.");
      setScanStatus("idle");
      return;
    }

    setScan(getData);
    setScanStatus("complete");
  }

  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-muted-foreground">
            <MapPinned className="h-3.5 w-3.5 text-primary" />
            Las Vegas rank grid
          </div>
          <h1>Heatmaps</h1>
          <p className="mt-4 max-w-2xl">
            Run a project scan to generate grid points, DataForSEO rankings, stored results, and a heatmap.
          </p>
        </div>

        <div className="glass-panel flex items-center gap-3 p-4 sm:w-80">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Live summary</p>
            <p className="text-xs text-muted-foreground">Calculated from {gridPoints.length} grid points</p>
          </div>
        </div>
      </div>

      <ScanWorkflowPanel
        scanId={scan?.id ?? null}
        projects={projects}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
        keywordInput={keywordInput}
        setKeywordInput={setKeywordInput}
        gridSize={gridSize}
        setGridSize={setGridSize}
        radius={radius}
        setRadius={setRadius}
        scanStatus={scanStatus}
        scanError={scanError}
        onRunScan={runScan}
      />

      <StatsPanel summary={rankingSummary} />

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="glass-card overflow-hidden"
        >
          <div className="flex flex-col gap-3 border-b border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl">Rank Heatmap</h2>
              <p className="mt-1 text-sm">
                Hover for quick details, or click a circle to inspect the point.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <LegendItem label="1-3" className="bg-emerald-400" />
              <LegendItem label="4-10" className="bg-yellow-300" />
              <LegendItem label="11-20" className="bg-orange-400" />
              <LegendItem label="21+" className="bg-red-500" />
              <LegendItem label="NF" className="bg-slate-400" />
            </div>
          </div>

          <div className="relative h-[500px] min-h-[460px] bg-slate-950 md:h-[560px]">
            {hasMapboxToken ? (
              <div ref={mapContainerRef} className="h-full w-full" />
            ) : (
              <TokenFallback points={gridPoints} onSelectPoint={setSelectedPoint} />
            )}

            {mapError ? (
              <div className="absolute left-4 top-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 backdrop-blur">
                {mapError}
              </div>
            ) : null}

            {tooltip ? <RankTooltip tooltip={tooltip} /> : null}
          </div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: "easeOut" }}
          className="glass-card h-fit p-5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Crosshair className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl">Scan Setup</h2>
              <p className="text-sm">{scan ? `Scan ${scan.id.slice(0, 8)}` : "Awaiting scan"}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <InfoRow label="Keyword" value={scan?.keyword ?? keywordInput} />
            <InfoRow label="Grid size" value={`${scan?.gridSize ?? gridSize} x ${scan?.gridSize ?? gridSize}`} />
            <InfoRow label="Radius" value={`${scan?.radius ?? radius} miles`} />
            <InfoRow label="Source" value={scan?.source ?? "mock preview"} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <SummaryCard label="Top 3" value={`${rankingSummary.top3Percentage}%`} />
            <SummaryCard label="Not found" value={`${rankingSummary.notFoundPercentage}%`} />
          </div>

          <PointDetailPanel point={selectedPoint} />
        </motion.aside>
      </div>
    </section>
  );
}

function createGridPoints() {
  const coordinates = generateCoordinateGrid({
    centerLat: LAS_VEGAS_CENTER.latitude,
    centerLng: LAS_VEGAS_CENTER.longitude,
    gridSize: defaultGridSize,
    radiusMiles: defaultRadiusMiles,
  });
  const rankings = generateMockRankings({
    coordinates,
    centerLat: LAS_VEGAS_CENTER.latitude,
    centerLng: LAS_VEGAS_CENTER.longitude,
    keyword,
  });

  return rankings.map((ranking, index) => ({
    id: String(index),
    rank: ranking.rank,
    keyword: ranking.keyword,
    latitude: ranking.lat,
    longitude: ranking.lng,
  }));
}

function toGridPoints(scan: ApiScan): GridPoint[] {
  return scan.results.map((result, index) => ({
    id: String(index),
    rank: result.rank,
    keyword: result.keyword,
    latitude: result.lat,
    longitude: result.lng,
  }));
}

function ScanWorkflowPanel({
  projects,
  scanId,
  selectedProjectId,
  setSelectedProjectId,
  keywordInput,
  setKeywordInput,
  gridSize,
  setGridSize,
  radius,
  setRadius,
  scanStatus,
  scanError,
  onRunScan,
}: {
  projects: ProjectRecord[];
  scanId: string | null;
  selectedProjectId: string;
  setSelectedProjectId: (value: string) => void;
  keywordInput: string;
  setKeywordInput: (value: string) => void;
  gridSize: number;
  setGridSize: (value: number) => void;
  radius: number;
  setRadius: (value: number) => void;
  scanStatus: "idle" | "posting" | "loading" | "complete";
  scanError: string | null;
  onRunScan: () => void;
}) {
  const isRunning = scanStatus === "posting" || scanStatus === "loading";

  return (
    <div className="mb-6 glass-card p-5">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl">Run Scan</h2>
          <p className="mt-1 text-sm">POST creates the scan, then GET reloads persisted results.</p>
        </div>
        <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium text-muted-foreground">
          {scanStatus === "complete" ? "Complete" : isRunning ? "Running" : "Ready"}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_140px_140px_auto] lg:items-end">
        <div className="grid gap-2">
          <Label htmlFor="project">Project</Label>
          <select
            id="project"
            value={selectedProjectId}
            onChange={(event) => setSelectedProjectId(event.target.value)}
            className="h-11 rounded-md border border-input bg-white/[0.04] px-3 text-sm text-foreground outline-none transition hover:border-white/20 focus:ring-2 focus:ring-ring"
          >
            {projects.length === 0 ? <option value="">No projects found</option> : null}
            {projects.map((project) => (
              <option key={project.id} value={project.id} className="bg-slate-950">
                {project.businessName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="keyword">Keyword</Label>
          <Input
            id="keyword"
            value={keywordInput}
            onChange={(event) => setKeywordInput(event.target.value)}
            placeholder="emergency dentist"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="gridSize">Grid Size</Label>
          <Input
            id="gridSize"
            type="number"
            min={3}
            max={15}
            value={gridSize}
            onChange={(event) => setGridSize(Number(event.target.value))}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="radius">Radius</Label>
          <Input
            id="radius"
            type="number"
            min={1}
            max={100}
            value={radius}
            onChange={(event) => setRadius(Number(event.target.value))}
          />
        </div>

        <Button onClick={onRunScan} disabled={isRunning || projects.length === 0}>
          {isRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {scanStatus === "posting"
            ? "Starting..."
            : scanStatus === "loading"
              ? "Loading..."
              : "Run Scan"}
        </Button>
      </div>

      {scanError ? <p className="mt-4 text-sm text-red-300">{scanError}</p> : null}
      {isRunning ? (
        <div className="mt-4 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: "12%" }}
            animate={{ width: scanStatus === "posting" ? "45%" : "86%" }}
            className="h-2 rounded-full bg-primary"
          />
        </div>
      ) : null}
      {scanId && !isRunning ? (
        <div className="mt-4 flex justify-end">
          <Button asChild variant="outline" size="sm">
            <Link href={`/reports/${scanId}`}>Open Report</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function getRankMarkerClass(rank: RankValue) {
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

function isHighRanking(rank: RankValue) {
  return rank !== "NF" && rank <= 3;
}

function RankTooltip({ tooltip }: { tooltip: TooltipState }) {
  return (
    <div
      className="pointer-events-none fixed z-50 w-56 -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-lg border border-white/10 bg-slate-950/90 p-3 text-sm shadow-2xl backdrop-blur-xl"
      style={{ left: tooltip.x, top: tooltip.y }}
    >
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">Rank</span>
        <span className="text-lg font-semibold text-foreground">{tooltip.point.rank}</span>
      </div>
      <div className="mt-2 text-muted-foreground">Keyword</div>
      <div className="font-medium text-foreground">{tooltip.point.keyword}</div>
      <div className="mt-2 text-muted-foreground">Coordinates</div>
      <div className="font-mono text-xs text-foreground">
        {tooltip.point.latitude.toFixed(5)}, {tooltip.point.longitude.toFixed(5)}
      </div>
    </div>
  );
}

function TokenFallback({
  points,
  onSelectPoint,
}: {
  points: GridPoint[];
  onSelectPoint: (point: GridPoint) => void;
}) {
  const columnCount = Math.max(1, Math.round(Math.sqrt(points.length)));

  return (
    <div className="relative h-full w-full overflow-hidden bg-[linear-gradient(135deg,rgba(14,165,233,0.18),rgba(15,23,42,0.92)),radial-gradient(circle_at_50%_50%,rgba(45,212,191,0.18),transparent_34%)]">
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="absolute left-4 top-4 rounded-lg border border-yellow-300/30 bg-yellow-300/10 px-3 py-2 text-sm text-yellow-100 backdrop-blur">
        Add `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` to display the live Mapbox map.
      </div>
      <div className="absolute inset-0 grid place-items-center p-6">
        <div
          className="grid aspect-square w-full max-w-[380px] gap-1.5"
          style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
        >
          {points.map((point) => (
            <button
              type="button"
              key={point.id}
              className={cn(
                "heatmap-marker flex aspect-square w-full items-center justify-center rounded-full border text-[8px] font-bold text-slate-950 shadow-lg transition duration-300 hover:scale-110 sm:text-[9px]",
                getRankMarkerClass(point.rank),
                isHighRanking(point.rank) && "heatmap-marker-glow",
              )}
              onClick={() => onSelectPoint(point)}
              title={`${point.keyword}: ${point.rank}`}
            >
              <span className="relative z-10">{point.rank}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsPanel({ summary }: { summary: RankingSummary }) {
  const stats = [
    {
      label: "Visibility Score",
      value: summary.visibilityScore,
      decimals: 0,
      suffix: "%",
      trend: "up",
      trendLabel: "+8.4%",
      icon: Eye,
      tone: "from-cyan-400/24 to-cyan-400/5",
      accent: "text-cyan-300",
      dot: "bg-cyan-300",
      positiveWhenUp: true,
    },
    {
      label: "Average Rank",
      value: summary.avgRank,
      decimals: 1,
      suffix: "",
      trend: "down",
      trendLabel: "-1.7",
      icon: Target,
      tone: "from-emerald-400/24 to-emerald-400/5",
      accent: "text-emerald-300",
      dot: "bg-emerald-300",
      positiveWhenUp: false,
    },
    {
      label: "Top 3 Coverage",
      value: summary.top3Percentage,
      decimals: 0,
      suffix: "%",
      trend: "up",
      trendLabel: "+12.1%",
      icon: TrendingUp,
      tone: "from-lime-300/24 to-lime-300/5",
      accent: "text-lime-300",
      dot: "bg-lime-300",
      positiveWhenUp: true,
    },
    {
      label: "Not Found",
      value: summary.notFoundPercentage,
      decimals: 0,
      suffix: "%",
      trend: "down",
      trendLabel: "-5.6%",
      icon: SearchX,
      tone: "from-red-400/22 to-red-400/5",
      accent: "text-red-300",
      dot: "bg-red-300",
      positiveWhenUp: false,
    },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: index * 0.06, ease: "easeOut" }}
          className={cn(
            "group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-glow backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20",
            "before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
          )}
        >
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-100", stat.tone)} />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-black/20">
                <stat.icon className={cn("h-5 w-5", stat.accent)} />
              </div>
              <TrendBadge
                trend={stat.trend}
                label={stat.trendLabel}
                positiveWhenUp={stat.positiveWhenUp}
              />
            </div>

            <div className="mt-6 text-4xl font-semibold tracking-normal text-foreground md:text-5xl">
              <CountUp value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <div className={cn("h-2 w-2 rounded-full", stat.dot)} />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function TrendBadge({
  trend,
  label,
  positiveWhenUp,
}: {
  trend: "up" | "down";
  label: string;
  positiveWhenUp: boolean;
}) {
  const Icon = trend === "up" ? TrendingUp : TrendingDown;
  const isGood = positiveWhenUp ? trend === "up" : trend === "down";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium",
        isGood
          ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-300"
          : "border-red-300/30 bg-red-400/10 text-red-300",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}

function CountUp({
  value,
  decimals = 0,
  suffix = "",
}: {
  value: number;
  decimals?: number;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const duration = 900;
    const start = performance.now();

    const animate = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;

      setDisplayValue(value * eased);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <>
      {displayValue.toFixed(decimals)}
      {suffix}
    </>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel p-4">
      <p className="text-xs font-medium uppercase">{label}</p>
      <div className="mt-2 text-xl font-semibold text-foreground">{value}</div>
    </div>
  );
}

function LegendItem({ label, className }: { label: string; className: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-muted-foreground">
      <span className={cn("h-2.5 w-2.5 rounded-full", className)} />
      {label}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <div className="mt-1 font-medium text-foreground">{value}</div>
    </div>
  );
}

function PointDetailPanel({ point }: { point: GridPoint | null }) {
  if (!point) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-5 text-sm">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <MousePointer2 className="h-4 w-4 text-primary" />
          Select a grid point
        </div>
        <p className="mt-2">
          Click any ranked circle on the map to open detailed data in this panel.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      key={point.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="mt-6 rounded-lg border border-white/10 bg-white/[0.05] p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Radar className="h-4 w-4 text-primary" />
            Selected Point
          </div>
          <p className="mt-1 text-sm">Detailed mock ranking data.</p>
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full border text-sm font-bold text-slate-950",
            getRankMarkerClass(point.rank),
            isHighRanking(point.rank) && "heatmap-marker-glow",
          )}
        >
          {point.rank}
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <InfoRow label="Keyword" value={point.keyword} />
        <InfoRow label="Rank" value={String(point.rank)} />
        <InfoRow label="Latitude" value={point.latitude.toFixed(6)} />
        <InfoRow label="Longitude" value={point.longitude.toFixed(6)} />
        <InfoRow label="Status" value={getRankStatus(point.rank)} />
      </div>
    </motion.div>
  );
}

function getRankStatus(rank: RankValue) {
  if (rank === "NF") {
    return "Not found";
  }

  if (rank <= 3) {
    return "High visibility";
  }

  if (rank <= 10) {
    return "Competitive";
  }

  if (rank <= 20) {
    return "Needs improvement";
  }

  return "Poor coverage";
}
