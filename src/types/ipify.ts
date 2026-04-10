interface GeoLocation {
  country: string;
  region?: string;
  city?: string;
  lat: number;
  lng: number;
  timezone?: string;
}

interface GeoResponse {
  ip: string;
  isp?: string;
  location: GeoLocation;
  code?: number;
  messages?: string;
}
