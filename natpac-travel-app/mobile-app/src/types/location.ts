export interface Location {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

export interface TrackingConfig {
  enableHighAccuracy: boolean;
  distanceFilter: number;
  interval: number;
  fastestInterval: number;
  showLocationDialog: boolean;
  forceRequestLocation: boolean;
  enableBackgroundTracking: boolean;
}

export interface LocationState {
  isTracking: boolean;
  currentLocation: Location | null;
  locationHistory: Location[];
  error: string | null;
  trackingConfig: TrackingConfig;
  permissionGranted: boolean;
}

export interface GeofenceConfig {
  identifier: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
  transitionTypes: ('enter' | 'exit')[];
}

export interface LocationAddress {
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formatted?: string;
}