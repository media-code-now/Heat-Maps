import type { MockRanking } from "@/lib/mock-rankings";
import type { RankingSummary } from "@/lib/ranking-summary";

export type RankingZone = {
  label: string;
  count: number;
};

export type AiInsightsInput = {
  rankingData: MockRanking[];
  weakZones: RankingZone[];
  strongZones: RankingZone[];
  summary: RankingSummary;
  keyword: string;
};

export type AiInsights = {
  performanceSummary: string;
  seoRecommendations: string[];
  contentIdeas: string[];
  gbpOptimizationTips: string[];
};

export function generateMockAiInsights({
  weakZones,
  strongZones,
  summary,
  keyword,
}: AiInsightsInput): AiInsights {
  const strongestZone = strongZones[0]?.label ?? "the central scan area";
  const weakestZone = weakZones[0]?.label ?? "outer grid zones";

  return {
    performanceSummary: `${keyword} visibility is strongest around ${strongestZone}, with an average rank of ${summary.avgRank}. The biggest opportunity is ${weakestZone}, where coverage is weaker and not-found results are more likely.`,
    seoRecommendations: [
      `Build localized service content targeting ${weakestZone} and nearby neighborhood modifiers.`,
      "Improve internal links from high-authority service pages to the primary local landing page.",
      "Audit citations for name, address, and phone consistency across priority directories.",
    ],
    contentIdeas: [
      `"Emergency dentist near ${weakestZone}" landing page section with FAQs and service proof.`,
      "Short-form before/after case notes tied to urgent dental care scenarios.",
      "Neighborhood-specific trust content that references parking, access, and same-day availability.",
    ],
    gbpOptimizationTips: [
      "Add fresh GBP posts around urgent care availability and same-day appointments.",
      "Prioritize review requests from customers near weak scan zones.",
      "Add service attributes, appointment links, and photos that reinforce emergency dental intent.",
    ],
  };
}
