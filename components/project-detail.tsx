"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  ExternalLink,
  FileText,
  Flame,
  KeyRound,
  MapPin,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type Project, useProjectStore } from "@/hooks/use-project-store";
import { cn } from "@/lib/utils";

type ProjectTab = "overview" | "heatmaps" | "keywords" | "reports";

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "heatmaps", label: "Heatmaps", icon: Flame },
  { id: "keywords", label: "Keywords", icon: KeyRound },
  { id: "reports", label: "Reports", icon: FileText },
] as const;

const overviewStats = [
  { label: "Visibility score", value: "84%", delta: "+7.2%", trend: "up" },
  { label: "Average rank", value: "4.6", delta: "-1.4", trend: "up" },
  { label: "Top 3 coverage", value: "62%", delta: "+9.8%", trend: "up" },
  { label: "Not found %", value: "11%", delta: "-4.1%", trend: "down" },
] as const;

export function ProjectDetail() {
  const params = useParams<{ id: string }>();
  const project = useProjectStore((state) => state.getProject(params.id));
  const hasHydrated = useProjectStore((state) => state.hasHydrated);
  const [activeTab, setActiveTab] = useState<ProjectTab>("overview");

  if (!hasHydrated) {
    return (
      <section className="mx-auto w-full max-w-6xl">
        <div className="glass-card p-8">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="mt-4 h-5 w-96 max-w-full" />
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!project) {
    return (
      <section className="mx-auto w-full max-w-3xl">
        <div className="glass-card p-8 text-center">
          <h1 className="text-4xl">Project not found</h1>
          <p className="mt-4">This project is not available in local state.</p>
          <Button asChild className="mt-6">
            <Link href="/projects/new">Create Project</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/projects">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Projects
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-white/10 bg-white/[0.03]">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle className="text-3xl md:text-4xl">{project.businessName}</CardTitle>
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {project.address}, {project.city}, {project.state}
                </span>
              </div>
            </div>
            <Button asChild>
              <a href={project.website} target="_blank" rel="noreferrer">
                Website
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardHeader>

        <div className="border-b border-white/10 px-4 py-3 md:px-6">
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-black/20 p-1 md:flex md:w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition duration-300 hover:text-foreground md:min-w-32",
                  activeTab === tab.id && "text-primary-foreground",
                )}
              >
                {activeTab === tab.id ? (
                  <motion.span
                    layoutId="active-project-tab"
                    className="absolute inset-0 rounded-md bg-primary"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                ) : null}
                <tab.icon className="relative h-4 w-4" />
                <span className="relative">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {activeTab === "overview" ? (
                <OverviewTab project={project} />
              ) : (
                <PlaceholderTab tab={activeTab} />
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </section>
  );
}

function OverviewTab({ project }: { project: Project }) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        {overviewStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl">Business info</h2>
              <p className="mt-2 text-sm">Core project details saved locally.</p>
            </div>
            <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              Active
            </span>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <DetailItem label="Business name" value={project.businessName} />
            <DetailItem label="GBP name" value={project.googleBusinessProfileName} />
            <DetailItem label="Website" value={project.website} />
            <DetailItem label="Created" value={new Date(project.createdAt).toLocaleDateString()} />
            <DetailItem
              label="Address"
              value={`${project.address}, ${project.city}, ${project.state}`}
            />
            <DetailItem
              label="Coordinates"
              value={`${project.latitude.toFixed(5)}, ${project.longitude.toFixed(5)}`}
            />
          </div>
        </div>

        <div className="glass-panel p-5">
          <h2 className="text-2xl">Coverage snapshot</h2>
          <p className="mt-2 text-sm">Mock local ranking distribution for the latest scan.</p>

          <div className="mt-6 space-y-4">
            <ProgressRow label="Top 3" value={62} tone="bg-accent" />
            <ProgressRow label="Positions 4-10" value={27} tone="bg-primary" />
            <ProgressRow label="Not found" value={11} tone="bg-red-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  delta,
  trend,
}: {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
}) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;

  return (
    <div className="glass-panel glass-hover p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase">{label}</p>
        <TrendIcon
          className={cn("h-4 w-4", trend === "up" ? "text-accent" : "text-red-300")}
        />
      </div>
      <div className="mt-4 text-3xl font-semibold text-foreground">{value}</div>
      <div
        className={cn(
          "mt-2 text-sm font-medium",
          trend === "up" ? "text-accent" : "text-red-300",
        )}
      >
        {delta} vs last scan
      </div>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={cn("h-full rounded-full", tone)}
        />
      </div>
    </div>
  );
}

function PlaceholderTab({ tab }: { tab: ProjectTab }) {
  const copy = {
    overview: "",
    heatmaps: "Heatmap scan history and map visualizations will appear here.",
    keywords: "Tracked keywords, rank changes, and grid coverage will appear here.",
    reports: "Scheduled reports and export history will appear here.",
  };

  return (
    <div className="glass-panel p-8 text-center">
      <h2 className="capitalize">{tab}</h2>
      <p className="mx-auto mt-3 max-w-md">{copy[tab]}</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <div className="mt-2 break-words text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
