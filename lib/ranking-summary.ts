import type { RankValue } from "@/lib/mock-rankings";

export type RankingSummary = {
  avgRank: number;
  visibilityScore: number;
  top3Percentage: number;
  notFoundPercentage: number;
};

export function calculateRankingSummary(ranks: RankValue[]): RankingSummary {
  if (ranks.length === 0) {
    return {
      avgRank: 0,
      visibilityScore: 0,
      top3Percentage: 0,
      notFoundPercentage: 0,
    };
  }

  const foundRanks = ranks.filter((rank): rank is number => rank !== "NF");
  const totalVisibilityPoints = ranks.reduce<number>(
    (total, rank) => total + getVisibilityPoints(rank),
    0,
  );
  const top3Count = ranks.filter((rank) => rank !== "NF" && rank >= 1 && rank <= 3).length;
  const notFoundCount = ranks.filter((rank) => rank === "NF").length;

  return {
    avgRank: roundTo(foundRanks.length ? average(foundRanks) : 0, 1),
    visibilityScore: Math.round(totalVisibilityPoints / ranks.length),
    top3Percentage: Math.round((top3Count / ranks.length) * 100),
    notFoundPercentage: Math.round((notFoundCount / ranks.length) * 100),
  };
}

function getVisibilityPoints(rank: RankValue) {
  if (rank === "NF") {
    return 0;
  }

  if (rank >= 1 && rank <= 3) {
    return 100;
  }

  if (rank <= 10) {
    return 70;
  }

  if (rank <= 20) {
    return 40;
  }

  return 0;
}

function average(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function roundTo(value: number, decimals: number) {
  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
}
