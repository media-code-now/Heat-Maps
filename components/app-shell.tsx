"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  FolderKanban,
  Gauge,
  Layers3,
  Menu,
  Search,
  Settings,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", href: "/", icon: Gauge },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Heatmaps", href: "/heatmaps", icon: Layers3 },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0B1020] text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/10 bg-[#0B1020]/80 px-4 py-5 backdrop-blur-xl lg:block">
        <SidebarContent pathname={pathname} />
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0B1020]/78 backdrop-blur-xl">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open navigation</span>
              </Button>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">Global Overview</p>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  Monitor activity, heatmap layers, and reports.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden h-10 w-64 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 text-sm text-muted-foreground md:flex">
                <Search className="h-4 w-4" />
                <span>Search workspace</span>
              </div>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Filters</span>
              </Button>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto border-t border-white/10 px-4 py-3 lg:hidden">
            {navigation.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                active={isActive(pathname, item.href)}
                compact
              />
            ))}
          </nav>
        </header>

        <main className="min-h-[calc(100vh-4rem)] px-4 py-6 md:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex h-full flex-col">
      <div className="glass-panel flex items-center gap-3 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Layers3 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">Heat Map</p>
          <p className="text-xs text-muted-foreground">Spatial intelligence</p>
        </div>
      </div>

      <nav className="mt-6 grid gap-2">
        {navigation.map((item) => (
          <NavItem key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      <div className="mt-auto glass-card glass-hover p-4">
        <p className="text-sm font-medium">System status</p>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Live ingestion</span>
          <span className="rounded-full bg-accent/15 px-2 py-1 text-xs font-medium text-accent">
            Online
          </span>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  item,
  active,
  compact = false,
}: {
  item: (typeof navigation)[number];
  active: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg border border-transparent text-sm font-medium text-muted-foreground transition duration-300 ease-out hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.06] hover:text-foreground",
        active &&
          "border-primary/30 bg-primary/12 text-foreground shadow-[0_0_32px_hsl(var(--primary)/0.12)] before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r-full before:bg-primary",
        compact ? "h-10 shrink-0 px-3" : "h-11 px-3",
      )}
    >
      <item.icon
        className={cn(
          "h-4 w-4 transition-colors",
          active ? "text-primary" : "text-muted-foreground group-hover:text-primary",
        )}
      />
      <span>{item.label}</span>
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
