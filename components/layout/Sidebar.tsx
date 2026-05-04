"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileText, LayoutDashboard, MapPinned, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: BarChart3 },
  { label: "Heatmaps", href: "/heatmaps", icon: MapPinned },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-white/10 bg-[#0B1020]/80 p-4 backdrop-blur-xl lg:block">
      <div className="flex h-full flex-col">
        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400 text-slate-950">
              <MapPinned className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">HeatMap OS</p>
              <p className="text-xs text-slate-400">Local SEO analytics</p>
            </div>
          </div>
        </div>

        <nav className="mt-6 grid gap-2">
          {navigation.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-400 transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.06] hover:text-white",
                  active &&
                    "bg-cyan-400/12 text-white shadow-[0_0_32px_rgb(34_211_238/0.12)] before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r-full before:bg-cyan-300",
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 transition",
                    active ? "text-cyan-300" : "group-hover:text-cyan-300",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-lg border border-white/10 bg-white/[0.06] p-4">
          <p className="text-sm font-medium text-white">Demo workspace</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Built with mock data for a clean SaaS foundation.
          </p>
        </div>
      </div>
    </aside>
  );
}
