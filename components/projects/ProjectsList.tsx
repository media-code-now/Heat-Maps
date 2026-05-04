"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Edit, Plus, Trash2 } from "lucide-react";

import type { ProjectRecord } from "@/components/projects/project-types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectsList() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setIsLoading(true);
    const response = await fetch("/api/projects");
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Unable to load projects.");
      setIsLoading(false);
      return;
    }

    setProjects(data.projects);
    setError(null);
    setIsLoading(false);
  }

  async function deleteProject(id: string) {
    const confirmed = window.confirm("Delete this project? This also deletes related scans and reports.");

    if (!confirmed) {
      return;
    }

    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setProjects((current) => current.filter((project) => project.id !== id));
  }

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1>Projects</h1>
          <p className="mt-4 max-w-2xl">Create, edit, delete, and manage saved business locations.</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Link>
        </Button>
      </div>

      {error ? <div className="glass-card p-5 text-sm text-red-300">{error}</div> : null}

      <div className="grid gap-4">
        {isLoading ? (
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
              className="glass-card glass-hover flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center"
            >
              <Link href={`/projects/${project.id}`} className="min-w-0 flex-1">
                <h2 className="truncate text-xl">{project.businessName}</h2>
                <p className="mt-2 text-sm">
                  {[project.city, project.state].filter(Boolean).join(", ") || "No location label"} · {project.googleBusinessProfileName || "No GBP name"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {project.latitude.toFixed(4)}, {project.longitude.toFixed(4)}
                </p>
              </Link>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/projects/${project.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => deleteProject(project.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
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
