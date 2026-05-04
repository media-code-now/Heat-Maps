"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  SearchCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Project = {
  businessName: string;
  location: string;
  averageRank: number;
  visibilityScore: number;
  lastScanDate: string;
  status: "improving" | "declining";
};

const projects: Project[] = [
  {
    businessName: "Northstar Dental Studio",
    location: "Austin, TX",
    averageRank: 3.8,
    visibilityScore: 86,
    lastScanDate: "Apr 26, 2026",
    status: "improving",
  },
  {
    businessName: "Maven Coffee Roasters",
    location: "Portland, OR",
    averageRank: 6.4,
    visibilityScore: 72,
    lastScanDate: "Apr 25, 2026",
    status: "declining",
  },
  {
    businessName: "Summit Physical Therapy",
    location: "Denver, CO",
    averageRank: 4.2,
    visibilityScore: 81,
    lastScanDate: "Apr 27, 2026",
    status: "improving",
  },
  {
    businessName: "Harbor Legal Group",
    location: "San Diego, CA",
    averageRank: 8.1,
    visibilityScore: 64,
    lastScanDate: "Apr 24, 2026",
    status: "declining",
  },
  {
    businessName: "Greenline Home Services",
    location: "Charlotte, NC",
    averageRank: 2.9,
    visibilityScore: 91,
    lastScanDate: "Apr 28, 2026",
    status: "improving",
  },
  {
    businessName: "Locale Fitness Club",
    location: "Phoenix, AZ",
    averageRank: 5.7,
    visibilityScore: 77,
    lastScanDate: "Apr 26, 2026",
    status: "improving",
  },
];

export function DashboardShell() {
  const improvingCount = projects.filter((project) => project.status === "improving").length;
  const averageVisibility = Math.round(
    projects.reduce((total, project) => total + project.visibilityScore, 0) / projects.length,
  );

  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-muted-foreground">
            <SearchCheck className="h-3.5 w-3.5 text-primary" />
            Local SEO project performance
          </div>
          <h1>Dashboard</h1>
          <p className="mt-4 max-w-2xl text-base">
            Track rankings, visibility, and scan freshness across active business locations.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:w-80">
          <SummaryStat label="Projects" value={projects.length} />
          <SummaryStat label="Visibility" value={averageVisibility} suffix="%" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project, index) => (
          <ProjectCard key={project.businessName} project={project} index={index} />
        ))}
      </div>

      <div className="mt-6 glass-card p-5">
        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span>{improvingCount} projects are improving this week.</span>
          </div>
          <span className="text-muted-foreground">Mock data for dashboard UI development.</span>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const isImproving = project.status === "improving";
  const StatusIcon = isImproving ? ArrowUpRight : ArrowDownRight;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="group glass-card relative overflow-hidden p-5"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold">{project.businessName}</h2>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{project.location}</span>
          </div>
        </div>

        <div
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium capitalize",
            isImproving
              ? "border-accent/30 bg-accent/10 text-accent"
              : "border-red-400/30 bg-red-500/10 text-red-300",
          )}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {project.status}
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3">
        <MetricTile
          label="Average rank"
          value={project.averageRank}
          decimals={1}
          icon={isImproving ? TrendingUp : TrendingDown}
          inverse
        />
        <MetricTile
          label="Visibility"
          value={project.visibilityScore}
          suffix="%"
          icon={SearchCheck}
        />
      </div>

      <div className="mt-5 flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>Last scan</span>
        </div>
        <span className="font-medium text-foreground">{project.lastScanDate}</span>
      </div>
    </motion.article>
  );
}

function MetricTile({
  label,
  value,
  suffix = "",
  decimals = 0,
  icon: Icon,
  inverse = false,
}: {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  icon: React.ComponentType<{ className?: string }>;
  inverse?: boolean;
}) {
  return (
    <div className="glass-panel glass-hover p-4">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs font-medium uppercase">{label}</span>
        <Icon className={cn("h-4 w-4", inverse ? "text-primary" : "text-accent")} />
      </div>
      <div className="mt-4 text-3xl font-semibold">
        <CountUp value={value} decimals={decimals} suffix={suffix} />
      </div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="glass-panel glass-hover p-4">
      <p className="text-xs font-medium uppercase">{label}</p>
      <div className="mt-2 text-2xl font-semibold text-foreground">
        <CountUp value={value} suffix={suffix} />
      </div>
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
      const eased = 1 - Math.pow(1 - progress, 3);

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
