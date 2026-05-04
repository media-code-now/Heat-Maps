"use client";

import { useEffect, useState } from "react";

import { ProjectForm } from "@/components/projects/ProjectForm";
import type { ProjectRecord } from "@/components/projects/project-types";
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectEditLoader({ id }: { id: string }) {
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      const response = await fetch(`/api/projects/${id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Unable to load project.");
        setIsLoading(false);
        return;
      }

      setProject(data.project);
      setIsLoading(false);
    }

    loadProject();
  }, [id]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-6xl">
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  if (error || !project) {
    return <div className="glass-card p-8 text-red-300">{error ?? "Project not found."}</div>;
  }

  return <ProjectForm project={project} />;
}
