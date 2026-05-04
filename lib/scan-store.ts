import type { RankValue } from "@/lib/mock-rankings";
import type { RankingSummary } from "@/lib/ranking-summary";

export type ScanProject = {
  id?: string;
  businessName?: string;
  googleBusinessProfileName?: string;
  website?: string;
  placeId?: string;
  latitude: number;
  longitude: number;
};

export type ScanCompetitor = {
  title: string;
  rank: number | null;
  url: string | null;
  placeId: string | null;
  rating: number | null;
  address: string | null;
};

export type ScanResultPoint = {
  lat: number;
  lng: number;
  rank: RankValue;
  keyword: string;
  competitors?: ScanCompetitor[];
  resultUrls?: string[];
  matchedBusiness?: ScanCompetitor | null;
  source?: "mock" | "dataforseo";
  error?: string;
};

export type ScanResult = {
  id: string;
  project: ScanProject;
  keyword: string;
  gridSize: number;
  radius: number;
  createdAt: string;
  source: "mock" | "dataforseo";
  summary: RankingSummary;
  results: ScanResultPoint[];
};

const globalForScans = globalThis as typeof globalThis & {
  heatMapScans?: Map<string, ScanResult>;
};

export const scanStore = globalForScans.heatMapScans ?? new Map<string, ScanResult>();

globalForScans.heatMapScans = scanStore;
