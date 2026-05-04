"use client";

import { ReactNode } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Menu, Search, SlidersHorizontal } from "lucide-react";

import { Sidebar } from "@/components/layout/Sidebar";
import { hasRealClerkPublishableKey } from "@/lib/clerk-config";

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0B1020] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.16),transparent_34rem),radial-gradient(circle_at_82%_18%,rgba(16,185,129,0.12),transparent_30rem)]" />
      <div className="relative flex min-h-screen">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0B1020]/75 backdrop-blur-xl">
            <div className="flex min-h-16 items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.08] lg:hidden">
                  <Menu className="h-4 w-4" />
                </button>
                <div>
                  <p className="text-sm font-medium text-white">Dashboard</p>
                  <p className="hidden text-xs text-slate-400 sm:block">
                    Local ranking intelligence overview
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden h-10 w-64 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 text-sm text-slate-400 md:flex">
                  <Search className="h-4 w-4" />
                  Search projects
                </div>
                <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-300 transition hover:-translate-y-0.5 hover:bg-white/[0.08]">
                  <SlidersHorizontal className="h-4 w-4" />
                </button>
                {hasRealClerkPublishableKey() ? (
                  <>
                    <SignedIn>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05]">
                        <UserButton
                          appearance={{
                            elements: {
                              avatarBox: "h-7 w-7",
                            },
                          }}
                        />
                      </div>
                    </SignedIn>
                    <SignedOut>
                      <SignInButton mode="modal">
                        <button className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:-translate-y-0.5 hover:bg-cyan-300/15">
                          Sign in
                        </button>
                      </SignInButton>
                    </SignedOut>
                  </>
                ) : (
                  <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-medium text-amber-100">
                    Local dev
                  </div>
                )}
              </div>
            </div>
          </header>

          <motion.main
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex-1 px-4 py-6 md:px-6 lg:px-8"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
