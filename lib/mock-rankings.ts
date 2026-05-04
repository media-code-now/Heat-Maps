import type { Coordinate } from "@/lib/coordinate-grid";

export type RankValue = number | "NF";

export type MockRanking = {
  lat: number;
  lng: number;
  rank: RankValue;
  keyword: string;
};

export type GenerateMockRankingsInput = {
  coordinates: Coordinate[];
  centerLat: number;
  centerLng: number;
  keyword: string;
  notFoundRate?: number;
};

export function generateMockRankings({
  coordinates,
  centerLat,
  centerLng,
  keyword,
  notFoundRate = 0.12,
}: GenerateMockRankingsInput): MockRanking[] {
  const maxDistance = Math.max(
    ...coordinates.map((coordinate) =>
      getDistanceMiles(centerLat, centerLng, coordinate.lat, coordinate.lng),
    ),
    1,
  );

  return coordinates.map((coordinate) => {
    const distance = getDistanceMiles(centerLat, centerLng, coordinate.lat, coordinate.lng);
    const distanceScore = Math.min(distance / maxDistance, 1);
    const notFoundProbability = clamp(notFoundRate + distanceScore * 0.28, 0, 0.65);

    return {
      lat: coordinate.lat,
      lng: coordinate.lng,
      rank:
        Math.random() < notFoundProbability
          ? "NF"
          : generateDistanceWeightedRank(distanceScore),
      keyword,
    };
  });
}

function generateDistanceWeightedRank(distanceScore: number) {
  const baseRank = 1 + distanceScore * 22;
  const noise = (Math.random() - 0.5) * 8;

  return Math.round(clamp(baseRank + noise, 1, 25));
}

function getDistanceMiles(latA: number, lngA: number, latB: number, lngB: number) {
  const earthRadiusMiles = 3958.8;
  const latDelta = toRadians(latB - latA);
  const lngDelta = toRadians(lngB - lngA);
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(latA)) *
      Math.cos(toRadians(latB)) *
      Math.sin(lngDelta / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMiles * c;
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
