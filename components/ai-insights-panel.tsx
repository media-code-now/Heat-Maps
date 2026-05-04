"use client";

import { Bot, FileSearch, Lightbulb, ListChecks, Sparkles } from "lucide-react";

import {
  type AiInsightsInput,
  generateMockAiInsights,
} from "@/lib/ai-insights";

export function AiInsightsPanel(input: AiInsightsInput) {
  const insights = generateMockAiInsights(input);

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-glow backdrop-blur-xl print:border-slate-200 print:bg-slate-50 print:shadow-none">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
      <div className="absolute right-0 top-0 h-32 w-32 bg-primary/10 blur-3xl print:hidden" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl print:text-slate-950">AI Insights</h3>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-medium text-primary print:border-slate-200 print:bg-white print:text-slate-500">
                Mock
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground print:text-slate-600">
              Generated from ranking data, weak zones, and strong zones.
            </p>
          </div>
        </div>
        <Sparkles className="h-5 w-5 text-primary print:text-slate-500" />
      </div>

      <div className="relative mt-6 rounded-lg border border-white/10 bg-black/20 p-4 print:border-slate-200 print:bg-white">
        <p className="text-sm leading-6 text-muted-foreground print:text-slate-700">
          {insights.performanceSummary}
        </p>
      </div>

      <div className="relative mt-5 grid gap-4 lg:grid-cols-3">
        <InsightList
          icon={ListChecks}
          title="SEO Recommendations"
          items={insights.seoRecommendations}
        />
        <InsightList icon={Lightbulb} title="Content Ideas" items={insights.contentIdeas} />
        <InsightList
          icon={FileSearch}
          title="GBP Optimization"
          items={insights.gbpOptimizationTips}
        />
      </div>
    </div>
  );
}

function InsightList({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 print:border-slate-200 print:bg-white">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground print:text-slate-950">
        <Icon className="h-4 w-4 text-accent print:text-slate-500" />
        {title}
      </div>
      <div className="grid gap-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-md border border-white/10 bg-black/20 p-3 text-sm text-muted-foreground print:border-slate-200 print:bg-slate-50 print:text-slate-700"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
