import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';
import { LocationContext } from './LocationContext';
import { tripService } from '../services/tripService';
import { Trip, TripState, CreateTripData, Companion } from '../types/trip';
import { Location } from '../types/location';

interface TripContextType extends TripState {
  startTrip: (origin: Location, purpose?: string, mode?: string) => Promise<Trip>;
  endTrip: (destination: Location) => Promise<void>;
  pauseTrip: () => void;
  resumeTrip: () => void;
  cancelTrip: () => void;
  saveTrip: (tripData: CreateTripData) => Promise<Trip>;
  updateCurrentTrip: (updates: Partial<Trip>) => void;
  fetchTrips: (filters?: any) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  setActiveTrip: (trip: Trip | null) => void;
  addCompanion: (companion: Companion) => void;
  removeCompanion: (index: number) => void;
  detectTripStart: (location: Location) => Promise<boolean>;
  detectTripEnd: (locations: Location[]) => Promise<boolean>;
}

export const TripContext = createContext<TripContextType>({} as TripContextType);

interface TripProviderProps {
  children: ReactNode;
}

export const TripProvider: React.FC<TripProviderProps> = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const { locationHistory, startTracking, stopTracking } = useContext(LocationContext);
  
  const [state, setState] = useState<TripState>({
    trips: [],
    activeTrip: null,
    isTracking: false,
    isPaused: false,
    loading: false,
    error: null,
    currentTripLocations: [],
    companions: [],
  });

  useEffect(() => {
    // Load cached trips on mount
    loadCachedTrips();
  }, []);

  useEffect(() => {
    // Auto-detect trip start/end based on location changes
    if (locationHistory.length > 0 && !state.isTracking) {
      const lastLocation = locationHistory[locationHistory.length - 1];
      detectTripStart(lastLocation);
    } else if (state.isTracking && locationHistory.length > 5) {
      detectTripEnd(locationHistory.slice(-10));
    }
  }, [locationHistory]);

  const loadCachedTrips = async () => {
    try {
      const cachedTrips = await AsyncStorage.getItem('@cached_trips');
      if (cachedTrips) {
        setState(prev => ({ ...prev, trips: JSON.parse(cachedTrips) }));
      }
    } catch (error) {
      console.error('Failed to load cached trips:', error);
    }
  };

  const startTrip = async (origin: Location, purpose?: string, mode?: string): Promise<Trip> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Start location tracking
      await startTracking({ enableBackgroundTracking: true });
      
      const tripData: Partial<Trip> = {
        tripId: `temp_${Date.now()}`,
        origin: {
          name: 'Current Location',
          coordinates: {
            latitude: origin.latitude,
            longitude: origin.longitude,
          },
        },
        startTime: new Date().toISOString(),
        tripDate: new Date().toISOString().split('T')[0],
        tripPurpose: purpose,
        transportMode: mode,
        detectionMethod: 'manual',
        companions: state.companions,
        isActive: true,
      };

      setState(prev => ({
        ...prev,
        activeTrip: tripData as Trip,
        isTracking: true,
        loading: false,
        currentTripLocations: [origin],
      }));

      return tripData as Trip;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to start trip' 
      }));
      throw error;
    }
  };

  const endTrip = async (destination: Location) => {
    if (!state.activeTrip || !token) return;

    setState(prev => ({ ...prev, loading: true }));
    
    try {
      // Stop location tracking
      stopTracking();

      // Calculate distance and duration
      const distance = calculateTripDistance(state.currentTripLocations);
      const duration = calculateDuration(state.activeTrip.startTime!, new Date().toISOString());

      const completedTrip: CreateTripData = {
        ...state.activeTrip,
        destination: {
          name: 'Current Location',
          coordinates: {
            latitude: destination.latitude,
            longitude: destination.longitude,
          },
        },
        endTime: new Date().toISOString(),
        distanceKm: distance,
        durationMinutes: duration,
        trackingPoints: state.currentTripLocations,
      };

      // Save trip to backend
      const savedTrip = await tripService.createTrip(token, completedTrip);
      
      // Update local state
      setState(prev => ({
        ...prev,
        trips: [savedTrip, ...prev.trips],
        activeTrip: null,
        isTracking: false,
        loading: false,
        currentTripLocations: [],
        companions: [],
      }));

      // Cache trips
      await AsyncStorage.setItem('@cached_trips', JSON.stringify([savedTrip, ...state.trips]));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to end trip' 
      }));
      throw error;
    }
  };

  const pauseTrip = () => {
    setState(prev => ({ ...prev, isPaused: true }));
    stopTracking();
  };

  const resumeTrip = () => {
    setState(prev => ({ ...prev, isPaused: false }));
    startTracking({ enableBackgroundTracking: true });
  };

  const cancelTrip = () => {
    stopTracking();
    setState(prev => ({
      ...prev,
      activeTrip: null,
      isTracking: false,
      isPaused: false,
      currentTripLocations: [],
      companions: [],
    }));
  };

  const saveTrip = async (tripData: CreateTripData): Promise<Trip> => {
    if (!token) throw new Error('Not authenticated');

    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const savedTrip = await tripService.createTrip(token, tripData);
      
      setState(prev => ({
        ...prev,
        trips: [savedTrip, ...prev.trips],
        loading: false,
      }));

      // Cache trips
      await AsyncStorage.setItem('@cached_trips', JSON.stringify([savedTrip, ...state.trips]));
      
      return savedTrip;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to save trip' 
      }));
      throw error;
    }
  };

  const updateCurrentTrip = (updates: Partial<Trip>) => {
    setState(prev => ({
      ...prev,
      activeTrip: prev.activeTrip ? { ...prev.activeTrip, ...updates } : null,
    }));
  };

  const fetchTrips = async (filters?: any) => {
    if (!token) return;

    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const trips = await tripService.getTrips(token, filters);
      
      setState(prev => ({
        ...prev,
        trips,
        loading: false,
      }));

      // Cache trips
      await AsyncStorage.setItem('@cached_trips', JSON.stringify(trips));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch trips' 
      }));
    }
  };

  const deleteTrip = async (tripId: string) => {
    if (!token) return;

    try {
      await tripService.deleteTrip(token, tripId);
      
      setState(prev => ({
        ...prev,
        trips: prev.trips.filter(trip => trip.tripId !== tripId),
      }));

      // Update cache
      const updatedTrips = state.trips.filter(trip => trip.tripId !== tripId);
      await AsyncStorage.setItem('@cached_trips', JSON.stringify(updatedTrips));
    } catch (error) {
      throw error;
    }
  };

  const setActiveTrip = (trip: Trip | null) => {
    setState(prev => ({ ...prev, activeTrip: trip }));
  };

  const addCompanion = (companion: Companion) => {
    setState(prev => ({
      ...prev,
      companions: [...prev.companions, companion],
    }));
  };

  const removeCompanion = (index: number) => {
    setState(prev => ({
      ...prev,
      companions: prev.companions.filter((_, i) => i !== index),
    }));
  };

  const detectTripStart = async (location: Location): Promise<boolean> => {
    // Simple heuristic: detect movement from a stationary position
    if (state.isTracking) return false;

    const threshold = 0.1; // 100 meters
    const recentLocations = locationHistory.slice(-5);
    
    if (recentLocations.length < 5) return false;

    const distances = recentLocations.map((loc, i) => {
      if (i === 0) return 0;
      return calculateDistance(
        recentLocations[i-1].latitude,
        recentLocations[i-1].longitude,
        loc.latitude,
        loc.longitude
      );
    });

    const totalMovement = distances.reduce((a, b) => a + b, 0);
    
    if (totalMovement > threshold) {
      // Auto-start trip
      await startTrip(location, 'unknown', 'unknown');
      return true;
    }

    return false;
  };

  const detectTripEnd = async (locations: Location[]): Promise<boolean> => {
    // Simple heuristic: detect stationary for extended period
    if (!state.isTracking) return false;

    const threshold = 0.05; // 50 meters
    const stationaryTime = 300000; // 5 minutes

    const now = Date.now();
    const recentMovement = locations
      .filter(loc => now - loc.timestamp < stationaryTime)
      .map((loc, i, arr) => {
        if (i === 0) return 0;
        return calculateDistance(
          arr[i-1].latitude,
          arr[i-1].longitude,
          loc.latitude,
          loc.longitude
        );
      })
      .reduce((a, b) => a + b, 0);

    if (recentMovement < threshold) {
      // Auto-end trip
      await endTrip(locations[locations.length - 1]);
      return true;
    }

    return false;
  };

  // Helper functions
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const deg2rad = (deg: number): number => deg * (Math.PI/180);

  const calculateTripDistance = (locations: Location[]): number => {
    let totalDistance = 0;
    for (let i = 1; i < locations.length; i++) {
      totalDistance += calculateDistance(
        locations[i-1].latitude,
        locations[i-1].longitude,
        locations[i].latitude,
        locations[i].longitude
      );
    }
    return Math.round(totalDistance * 10) / 10;
  };

  const calculateDuration = (startTime: string, endTime: string): number => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return Math.round((end - start) / 60000); // minutes
  };

  const value: TripContextType = {
    ...state,
    startTrip,
    endTrip,
    pauseTrip,
    resumeTrip,
    cancelTrip,
    saveTrip,
    updateCurrentTrip,
    fetchTrips,
    deleteTrip,
    setActiveTrip,
    addCompanion,
    removeCompanion,
    detectTripStart,
    detectTripEnd,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};