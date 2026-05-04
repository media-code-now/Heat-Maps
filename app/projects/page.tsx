import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProjectsList } from "@/components/projects/ProjectsList";

export default function ProjectsPage() {
  return (
    <DashboardShell>
      <ProjectsList />
    </DashboardShell>
  );
}
