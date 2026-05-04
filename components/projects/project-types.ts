export type ProjectRecord = {
  id: string;
  businessName: string;
  website: string | null;
  googleBusinessProfileName: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    scans: number;
    keywords: number;
  };
};
