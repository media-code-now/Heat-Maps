import { Bell, Database, KeyRound, MapPinned, ShieldCheck } from "lucide-react";

import { DashboardShell } from "@/components/layout/DashboardShell";

const settings = [
  {
    title: "Authentication",
    description: "Clerk protects client data when real keys are configured.",
    status: "Local dev fallback active",
    icon: ShieldCheck,
  },
  {
    title: "Database",
    description: "Projects, scans, rankings, and reports persist in Postgres.",
    status: "Connected locally",
    icon: Database,
  },
  {
    title: "Mapbox",
    description: "Add a public Mapbox token to render production maps.",
    status: "Token required",
    icon: MapPinned,
  },
  {
    title: "DataForSEO",
    description: "Real rank scans run only when valid API credentials are present.",
    status: "Mock scans active",
    icon: KeyRound,
  },
];

export default function SettingsPage() {
  return (
    <DashboardShell>
      <section className="mx-auto grid w-full max-w-7xl gap-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-muted-foreground">
              <Bell className="h-3.5 w-3.5 text-primary" />
              Workspace configuration
            </div>
            <h1>Settings</h1>
            <p className="mt-4 max-w-2xl">
              Review the integrations required to move from local demo mode to a production-ready client workspace.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {settings.map((item) => (
            <div
              key={item.title}
              className="glass-card group p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/25"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-cyan-200">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{item.title}</h2>
                    <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-100">
                {item.status}
              </div>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
