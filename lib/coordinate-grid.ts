export type Coordinate = {
  lat: number;
  lng: number;
};

export type GenerateCoordinateGridInput = {
  centerLat: number;
  centerLng: number;
  gridSize: number;
  radiusMiles: number;
};

const MILES_PER_LATITUDE_DEGREE = 69;

export function generateCoordinateGrid({
  centerLat,
  centerLng,
  gridSize,
  radiusMiles,
}: GenerateCoordinateGridInput): Coordinate[] {
  if (!Number.isFinite(centerLat) || centerLat < -90 || centerLat > 90) {
    throw new Error("centerLat must be a valid latitude between -90 and 90.");
  }

  if (!Number.isFinite(centerLng) || centerLng < -180 || centerLng > 180) {
    throw new Error("centerLng must be a valid longitude between -180 and 180.");
  }

  if (!Number.isInteger(gridSize) || gridSize < 1) {
    throw new Error("gridSize must be a positive integer.");
  }

  if (!Number.isFinite(radiusMiles) || radiusMiles < 0) {
    throw new Error("radiusMiles must be a non-negative number.");
  }

  if (gridSize === 1) {
    return [{ lat: centerLat, lng: centerLng }];
  }

  const latitudeRadiusDegrees = radiusMiles / MILES_PER_LATITUDE_DEGREE;
  const longitudeMilesPerDegree =
    MILES_PER_LATITUDE_DEGREE * Math.cos(toRadians(centerLat));
  const longitudeRadiusDegrees =
    longitudeMilesPerDegree === 0 ? 0 : radiusMiles / longitudeMilesPerDegree;
  const stepCount = gridSize - 1;

  return Array.from({ length: gridSize * gridSize }, (_, index) => {
    const row = Math.floor(index / gridSize);
    const column = index % gridSize;
    const latOffset = latitudeRadiusDegrees - (row / stepCount) * latitudeRadiusDegrees * 2;
    const lngOffset = -longitudeRadiusDegrees + (column / stepCount) * longitudeRadiusDegrees * 2;

    return {
      lat: centerLat + latOffset,
      lng: centerLng + lngOffset,
    };
  });
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}
