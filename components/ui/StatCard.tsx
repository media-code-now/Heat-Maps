"use client";

import { ComponentType } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  change: string;
  tone: "cyan" | "emerald" | "violet" | "amber";
  icon: ComponentType<{ className?: string }>;
  index?: number;
};

const tones = {
  cyan: "from-cyan-400/20 text-cyan-300",
  emerald: "from-emerald-400/20 text-emerald-300",
  violet: "from-violet-400/20 text-violet-300",
  amber: "from-amber-300/20 text-amber-300",
};

export function StatCard({
  label,
  value,
  change,
  tone,
  icon: Icon,
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_80px_rgb(8_145_178/0.12)] backdrop-blur-xl"
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br to-transparent", tones[tone])} />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-black/20">
            <Icon className={cn("h-5 w-5", tones[tone].split(" ").at(-1))} />
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-300">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {change}
          </span>
        </div>

        <div className="mt-6 text-4xl font-semibold tracking-normal text-white">{value}</div>
        <p className="mt-2 text-sm font-medium text-slate-400">{label}</p>
      </div>
    </motion.div>
  );
}
