"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectStore } from "@/hooks/use-project-store";

export function ProjectsList() {
  const projects = useProjectStore((state) => state.projects);
  const hasHydrated = useProjectStore((state) => state.hasHydrated);

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1>Projects</h1>
          <p className="mt-4 max-w-2xl">Manage locally saved project profiles.</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {!hasHydrated ? (
          <ProjectsSkeleton />
        ) : projects.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <h2>No projects yet</h2>
            <p className="mt-3">Create your first project to start configuring heatmap scans.</p>
          </div>
        ) : (
          projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: index * 0.04, ease: "easeOut" }}
            >
              <Link
                href={`/projects/${project.id}`}
                className="group glass-card glass-hover flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
              >
                <div>
                  <h2 className="text-xl">{project.businessName}</h2>
                  <p className="mt-2 text-sm">
                    {project.city}, {project.state} · {project.googleBusinessProfileName}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-primary transition group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}

function ProjectsSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="glass-card p-5">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="mt-3 h-4 w-80 max-w-full" />
        </div>
      ))}
    </>
  );
}
