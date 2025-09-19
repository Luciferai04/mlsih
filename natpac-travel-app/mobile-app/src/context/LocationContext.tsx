import React, { createContext, useState, useEffect, ReactNode } from 'react';
import Geolocation from 'react-native-geolocation-service';
import BackgroundTimer from 'react-native-background-timer';
import { Platform, PermissionsAndroid } from 'react-native';
import { locationService } from '../services/locationService';
import { Location, LocationState, TrackingConfig } from '../types/location';

interface LocationContextType extends LocationState {
  startTracking: (config?: TrackingConfig) => Promise<void>;
  stopTracking: () => void;
  getCurrentLocation: () => Promise<Location>;
  updateLocation: (location: Location) => void;
  setTrackingConfig: (config: Partial<TrackingConfig>) => void;
  checkLocationPermission: () => Promise<boolean>;
}

export const LocationContext = createContext<LocationContextType>({} as LocationContextType);

interface LocationProviderProps {
  children: ReactNode;
}

const DEFAULT_TRACKING_CONFIG: TrackingConfig = {
  enableHighAccuracy: true,
  distanceFilter: 10, // meters
  interval: 5000, // 5 seconds
  fastestInterval: 2000, // 2 seconds
  showLocationDialog: true,
  forceRequestLocation: true,
  enableBackgroundTracking: false,
};

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [state, setState] = useState<LocationState>({
    isTracking: false,
    currentLocation: null,
    locationHistory: [],
    error: null,
    trackingConfig: DEFAULT_TRACKING_CONFIG,
    permissionGranted: false,
  });

  const [watchId, setWatchId] = useState<number | null>(null);
  const [backgroundTimer, setBackgroundTimer] = useState<number | null>(null);

  useEffect(() => {
    checkInitialPermission();
    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
      if (backgroundTimer !== null) {
        BackgroundTimer.clearInterval(backgroundTimer);
      }
    };
  }, []);

  const checkInitialPermission = async () => {
    const hasPermission = await checkLocationPermission();
    setState(prev => ({ ...prev, permissionGranted: hasPermission }));
  };

  const checkLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      const status = await Geolocation.requestAuthorization('whenInUse');
      return status === 'granted';
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'NATPAC Travel needs access to your location to track trips.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  };

  const startTracking = async (config?: TrackingConfig) => {
    try {
      const hasPermission = await checkLocationPermission();
      if (!hasPermission) {
        setState(prev => ({
          ...prev,
          error: 'Location permission not granted',
          permissionGranted: false,
        }));
        throw new Error('Location permission not granted');
      }

      const trackingConfig = { ...DEFAULT_TRACKING_CONFIG, ...config };
      setState(prev => ({
        ...prev,
        isTracking: true,
        error: null,
        trackingConfig,
        permissionGranted: true,
      }));

      // Start foreground tracking
      const id = Geolocation.watchPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            speed: position.coords.speed,
            heading: position.coords.heading,
            timestamp: position.timestamp,
          };
          updateLocation(location);
        },
        (error) => {
          console.error('Location error:', error);
          setState(prev => ({
            ...prev,
            error: error.message,
          }));
        },
        {
          enableHighAccuracy: trackingConfig.enableHighAccuracy,
          distanceFilter: trackingConfig.distanceFilter,
          interval: trackingConfig.interval,
          fastestInterval: trackingConfig.fastestInterval,
          showLocationDialog: trackingConfig.showLocationDialog,
          forceRequestLocation: trackingConfig.forceRequestLocation,
        }
      );
      setWatchId(id);

      // Start background tracking if enabled
      if (trackingConfig.enableBackgroundTracking && Platform.OS === 'android') {
        const timerId = BackgroundTimer.setInterval(() => {
          getCurrentLocation();
        }, trackingConfig.interval);
        setBackgroundTimer(timerId);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isTracking: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
      throw error;
    }
  };

  const stopTracking = () => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    if (backgroundTimer !== null) {
      BackgroundTimer.clearInterval(backgroundTimer);
      setBackgroundTimer(null);
    }
    setState(prev => ({
      ...prev,
      isTracking: false,
    }));
  };

  const getCurrentLocation = async (): Promise<Location> => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            speed: position.coords.speed,
            heading: position.coords.heading,
            timestamp: position.timestamp,
          };
          updateLocation(location);
          resolve(location);
        },
        (error) => {
          setState(prev => ({
            ...prev,
            error: error.message,
          }));
          reject(error);
        },
        {
          enableHighAccuracy: state.trackingConfig.enableHighAccuracy,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  };

  const updateLocation = (location: Location) => {
    setState(prev => ({
      ...prev,
      currentLocation: location,
      locationHistory: [...prev.locationHistory, location].slice(-100), // Keep last 100 locations
      error: null,
    }));

    // Send location to backend if tracking
    if (state.isTracking) {
      locationService.sendLocationUpdate(location).catch(console.error);
    }
  };

  const setTrackingConfig = (config: Partial<TrackingConfig>) => {
    setState(prev => ({
      ...prev,
      trackingConfig: { ...prev.trackingConfig, ...config },
    }));
  };

  const value: LocationContextType = {
    ...state,
    startTracking,
    stopTracking,
    getCurrentLocation,
    updateLocation,
    setTrackingConfig,
    checkLocationPermission,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};