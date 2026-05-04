"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, ExternalLink, Trash2 } from "lucide-react";

import type { ProjectRecord } from "@/components/projects/project-types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectDetail({ id }: { id: string }) {
  const router = useRouter();
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

  async function deleteProject() {
    const confirmed = window.confirm("Delete this project? This cannot be undone.");

    if (!confirmed) {
      return;
    }

    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    router.push("/projects");
    router.refresh();
  }

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-5xl">
        <div className="glass-card p-8">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="mt-4 h-5 w-96 max-w-full" />
        </div>
      </section>
    );
  }

  if (error || !project) {
    return <div className="glass-card p-8 text-red-300">{error ?? "Project not found."}</div>;
  }

  return (
    <section className="mx-auto w-full max-w-5xl">
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/projects">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Projects
        </Link>
      </Button>

      <div className="glass-card overflow-hidden">
        <div className="border-b border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <h1 className="text-4xl md:text-5xl">{project.businessName}</h1>
              <p className="mt-3">
                {[project.address, project.city, project.state].filter(Boolean).join(", ")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.website ? (
                <Button asChild>
                  <a href={project.website} target="_blank" rel="noreferrer">
                    Website
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ) : null}
              <Button asChild variant="outline">
                <Link href={`/projects/${project.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Button variant="outline" onClick={deleteProject}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
        <div className="grid gap-4 p-6 md:grid-cols-2">
          <DetailItem label="Google Business Profile" value={project.googleBusinessProfileName ?? "Not set"} />
          <DetailItem label="Website" value={project.website ?? "Not set"} />
          <DetailItem label="Latitude" value={project.latitude.toFixed(6)} />
          <DetailItem label="Longitude" value={project.longitude.toFixed(6)} />
        </div>
      </div>
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel p-4">
      <p className="text-xs font-medium uppercase">{label}</p>
      <div className="mt-2 break-words text-base font-medium text-foreground">{value}</div>
    </div>
  );
}
