import { DashboardShell } from "@/components/layout/DashboardShell";
import { ProjectEditLoader } from "@/components/projects/ProjectEditLoader";

export default function EditProjectPage({ params }: { params: { id: string } }) {
  return (
    <DashboardShell>
      <ProjectEditLoader id={params.id} />
    </DashboardShell>
  );
}
