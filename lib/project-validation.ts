export type ProjectBody = {
  businessName?: string;
  website?: string;
  googleBusinessProfileName?: string;
  address?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
};

export function validateProjectBody(body: ProjectBody) {
  if (!body.businessName?.trim()) {
    return "Business name is required.";
  }

  if (!Number.isFinite(body.latitude) || body.latitude! < -90 || body.latitude! > 90) {
    return "Latitude must be between -90 and 90.";
  }

  if (!Number.isFinite(body.longitude) || body.longitude! < -180 || body.longitude! > 180) {
    return "Longitude must be between -180 and 180.";
  }

  return null;
}

export function toProjectData(body: ProjectBody) {
  return {
    businessName: body.businessName!.trim(),
    website: cleanOptional(body.website),
    googleBusinessProfileName: cleanOptional(body.googleBusinessProfileName),
    address: cleanOptional(body.address),
    city: cleanOptional(body.city),
    state: cleanOptional(body.state)?.toUpperCase() ?? null,
    latitude: Number(body.latitude),
    longitude: Number(body.longitude),
  };
}

function cleanOptional(value: string | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}
