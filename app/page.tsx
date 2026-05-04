"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  Globe2,
  MapPinned,
  SearchCheck,
  TrendingUp,
} from "lucide-react";

import { DashboardShell } from "@/components/layout/DashboardShell";
import type { ProjectRecord } from "@/components/projects/project-types";
import { StatCard } from "@/components/ui/StatCard";
import { Skeleton } from "@/components/ui/skeleton";

const stats = [
  {
    label: "Visibility Score",
    value: "84%",
    change: "+12.4%",
    tone: "cyan",
    icon: SearchCheck,
  },
  {
    label: "Average Rank",
    value: "4.8",
    change: "-1.6",
    tone: "emerald",
    icon: TrendingUp,
  },
  {
    label: "Tracked Areas",
    value: "49",
    change: "+7",
    tone: "violet",
    icon: MapPinned,
  },
  {
    label: "Top 3 Coverage",
    value: "61%",
    change: "+8.9%",
    tone: "amber",
    icon: BarChart3,
  },
] as const;

export default function Home() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      const response = await fetch("/api/projects");
      const data = await response.json();

      if (response.ok) {
        setProjects(data.projects);
      }

      setIsLoadingProjects(false);
    }

    loadProjects();
  }, []);

  return (
    <DashboardShell>
      <section className="space-y-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-slate-400">
              <Globe2 className="h-3.5 w-3.5 text-cyan-300" />
              Local SEO Heatmap
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal text-white md:text-6xl">
              Premium visibility tracking for local search teams.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
              Monitor local rankings, identify weak zones, and present client-ready heatmap insights from one clean dashboard.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-300">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Database connected</p>
                <p className="text-xs text-slate-400">Projects load from Postgres</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} {...stat} index={index} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_80px_rgb(8_145_178/0.12)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Active Projects</h2>
                <p className="mt-1 text-sm text-slate-400">Saved business locations</p>
              </div>
              <MapPinned className="h-5 w-5 text-cyan-300" />
            </div>
            <div className="grid gap-3">
              {isLoadingProjects ? (
                <>
                  <Skeleton className="h-20 rounded-lg" />
                  <Skeleton className="h-20 rounded-lg" />
                  <Skeleton className="h-20 rounded-lg" />
                </>
              ) : projects.length === 0 ? (
                <div className="rounded-lg border border-dashed border-white/15 bg-black/20 p-5 text-sm text-slate-400">
                  No projects yet.{" "}
                  <Link href="/projects/new" className="font-medium text-cyan-300 hover:text-cyan-200">
                    Create one
                  </Link>
                  .
                </div>
              ) : (
                projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="group flex flex-col gap-3 rounded-lg border border-white/10 bg-black/20 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/[0.07] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <h3 className="font-medium text-white">{project.businessName}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {[project.city, project.state].filter(Boolean).join(", ") || "No city/state saved"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-300">
                        {project._count?.scans ?? 0} scans
                      </span>
                      <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                        Saved
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold text-white">Heatmap Preview</h2>
            <p className="mt-1 text-sm text-slate-400">9x9 mock rank distribution</p>
            <div className="mt-6 grid aspect-square grid-cols-9 gap-1.5 rounded-lg border border-white/10 bg-slate-950/70 p-4">
              {Array.from({ length: 81 }).map((_, index) => {
                const centerDistance = Math.abs((index % 9) - 4) + Math.abs(Math.floor(index / 9) - 4);
                const tone =
                  centerDistance <= 1
                    ? "bg-emerald-400"
                    : centerDistance <= 3
                      ? "bg-yellow-300"
                      : centerDistance <= 5
                        ? "bg-orange-400"
                        : "bg-red-500 text-white";

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-center rounded-full text-[10px] font-bold text-slate-950 shadow-lg ${tone}`}
                  >
                    {Math.min(20, centerDistance * 3 + 1)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
