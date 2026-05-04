import type { Coordinate } from "@/lib/coordinate-grid";
import type { ScanCompetitor, ScanProject, ScanResultPoint } from "@/lib/scan-store";

type DataForSeoMapsItem = {
  type?: string;
  rank_group?: number;
  rank_absolute?: number;
  title?: string;
  original_title?: string;
  url?: string;
  domain?: string;
  place_id?: string;
  cid?: string;
  address?: string;
  rating?: {
    value?: number;
  };
};

type DataForSeoTask = {
  status_code?: number;
  status_message?: string;
  result?: Array<{
    items?: DataForSeoMapsItem[];
  }>;
};

type DataForSeoResponse = {
  status_code?: number;
  status_message?: string;
  tasks?: DataForSeoTask[];
};

export type DataForSeoScanInput = {
  coordinates: Coordinate[];
  keyword: string;
  project: ScanProject;
};

const endpoint = "https://api.dataforseo.com/v3/serp/google/maps/live/advanced";
const defaultConcurrency = 2;
const defaultDelayMs = 350;
const maxAttempts = 3;

export function hasDataForSeoCredentials() {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;

  return Boolean(
    login &&
      password &&
      login !== "your_login" &&
      password !== "your_password",
  );
}

export async function fetchDataForSeoRankings({
  coordinates,
  keyword,
  project,
}: DataForSeoScanInput): Promise<ScanResultPoint[]> {
  const concurrency = getPositiveInteger(process.env.DATAFORSEO_CONCURRENCY, defaultConcurrency);
  const delayMs = getPositiveInteger(process.env.DATAFORSEO_DELAY_MS, defaultDelayMs);

  return runWithConcurrency(coordinates, concurrency, async (coordinate, index) => {
    if (index > 0 && delayMs > 0) {
      await sleep(delayMs);
    }

    return fetchDataForSeoPoint({ coordinate, keyword, project });
  });
}

async function fetchDataForSeoPoint({
  coordinate,
  keyword,
  project,
}: {
  coordinate: Coordinate;
  keyword: string;
  project: ScanProject;
}): Promise<ScanResultPoint> {
  try {
    const response = await retry(() => requestDataForSeo(coordinate, keyword));
    const items = extractItems(response);
    const competitors = items.map(toCompetitor).filter(isValidCompetitor);
    const matchedBusiness = findMatchedBusiness(competitors, project);
    const rank = matchedBusiness?.rank ?? "NF";

    return {
      lat: coordinate.lat,
      lng: coordinate.lng,
      rank,
      keyword,
      competitors,
      resultUrls: competitors.flatMap((competitor) => (competitor.url ? [competitor.url] : [])),
      matchedBusiness,
      source: "dataforseo",
    };
  } catch (error) {
    return {
      lat: coordinate.lat,
      lng: coordinate.lng,
      rank: "NF",
      keyword,
      competitors: [],
      resultUrls: [],
      matchedBusiness: null,
      source: "dataforseo",
      error: error instanceof Error ? error.message : "DataForSEO request failed.",
    };
  }
}

async function requestDataForSeo(coordinate: Coordinate, keyword: string) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${getDataForSeoToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        keyword,
        language_code: "en",
        location_coordinate: `${coordinate.lat.toFixed(7)},${coordinate.lng.toFixed(7)},17z`,
        depth: 100,
        device: "desktop",
        os: "windows",
        search_this_area: true,
      },
    ]),
  });

  if (response.status === 429 || response.status >= 500) {
    throw new RetryableDataForSeoError(`DataForSEO returned HTTP ${response.status}.`);
  }

  if (!response.ok) {
    throw new Error(`DataForSEO returned HTTP ${response.status}.`);
  }

  const data = (await response.json()) as DataForSeoResponse;

  if (data.status_code !== 20000) {
    const message = data.status_message ?? "Unknown DataForSEO API error.";

    if ((data.status_code ?? 0) >= 50000) {
      throw new RetryableDataForSeoError(message);
    }

    throw new Error(message);
  }

  const task = data.tasks?.[0];

  if (!task || task.status_code !== 20000) {
    const message = task?.status_message ?? "DataForSEO task did not return results.";

    if ((task?.status_code ?? 0) >= 50000) {
      throw new RetryableDataForSeoError(message);
    }

    throw new Error(message);
  }

  return data;
}

function extractItems(response: DataForSeoResponse) {
  return response.tasks?.[0]?.result?.[0]?.items ?? [];
}

function toCompetitor(item: DataForSeoMapsItem): ScanCompetitor {
  return {
    title: item.title ?? item.original_title ?? "Untitled result",
    rank: item.rank_group ?? item.rank_absolute ?? null,
    url: item.url ?? null,
    placeId: item.place_id ?? item.cid ?? null,
    rating: item.rating?.value ?? null,
    address: item.address ?? null,
  };
}

function isValidCompetitor(competitor: ScanCompetitor) {
  return competitor.rank !== null && competitor.title.trim().length > 0;
}

function findMatchedBusiness(competitors: ScanCompetitor[], project: ScanProject) {
  const targetNames = [project.businessName, project.googleBusinessProfileName]
    .filter(Boolean)
    .map((value) => normalizeText(value!));
  const targetHost = getHostname(project.website);
  const targetPlaceId = project.placeId?.trim();

  return (
    competitors.find((competitor) => {
      const competitorTitle = normalizeText(competitor.title);
      const competitorHost = getHostname(competitor.url ?? undefined);

      return (
        (targetPlaceId && competitor.placeId === targetPlaceId) ||
        (targetHost && competitorHost === targetHost) ||
        targetNames.some(
          (targetName) =>
            competitorTitle === targetName ||
            competitorTitle.includes(targetName) ||
            targetName.includes(competitorTitle),
        )
      );
    }) ?? null
  );
}

async function retry<T>(operation: () => Promise<T>) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!(error instanceof RetryableDataForSeoError) || attempt === maxAttempts) {
        break;
      }

      await sleep(600 * 2 ** (attempt - 1));
    }
  }

  throw lastError;
}

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
) {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker()),
  );

  return results;
}

function getDataForSeoToken() {
  return Buffer.from(
    `${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`,
  ).toString("base64");
}

function getPositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function getHostname(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);

    return url.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class RetryableDataForSeoError extends Error {}
