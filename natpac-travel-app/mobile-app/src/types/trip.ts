import { Location } from './location';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Place {
  name: string;
  address?: string;
  coordinates: Coordinates;
  placeType?: string;
}

export interface Companion {
  ageGroup: string;
  gender: string;
  relationship: string;
}

export interface Trip {
  id?: number;
  tripId: string;
  userId?: string;
  tripDate: string;
  tripNumber?: number;
  
  // Origin and destination
  origin: Place;
  destination?: Place;
  
  // Timing
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  
  // Trip details
  transportMode?: string;
  tripPurpose?: string;
  distanceKm?: number;
  
  // Data collection
  detectionMethod: 'automatic' | 'manual' | 'assisted';
  confidenceScore?: number;
  
  // Trip chain
  isPartOfChain?: boolean;
  chainId?: string;
  chainSequence?: number;
  
  // Companions
  companions: Companion[];
  
  // Tracking data
  trackingPoints?: Location[];
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface TripState {
  trips: Trip[];
  activeTrip: Trip | null;
  isTracking: boolean;
  isPaused: boolean;
  loading: boolean;
  error: string | null;
  currentTripLocations: Location[];
  companions: Companion[];
}

export interface CreateTripData extends Omit<Trip, 'id' | 'tripId' | 'userId' | 'createdAt' | 'updatedAt'> {
  tripId?: string;
}

export interface TripFilters {
  startDate?: string;
  endDate?: string;
  mode?: string;
  purpose?: string;
  page?: number;
  limit?: number;
}

export interface TripStatistics {
  totalTrips: number;
  totalDistance: number;
  totalDuration: number;
  averageTripLength: number;
  mostUsedMode: string;
  modeDistribution: Record<string, number>;
  purposeDistribution: Record<string, number>;
  timeDistribution: Record<string, number>;
}