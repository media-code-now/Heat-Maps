import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProjectDetail } from "@/components/projects/ProjectDetail";

export default function ProjectPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell>
      <ProjectDetail id={params.id} />
    </DashboardShell>
  );
}
