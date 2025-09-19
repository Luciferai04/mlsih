import axios from 'axios';
import Config from 'react-native-config';
import { Location } from '../types/location';

const API_BASE_URL = Config.API_URL || 'http://localhost:3000/api/v1';

class LocationService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async sendLocationUpdate(location: Location, token?: string): Promise<void> {
    if (!token) return;
    
    try {
      await this.apiClient.post('/location/update', {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        altitude: location.altitude,
        speed: location.speed,
        heading: location.heading,
        timestamp: location.timestamp,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Failed to send location update:', error);
    }
  }

  async sendBatchLocationUpdate(locations: Location[], token?: string): Promise<void> {
    if (!token || locations.length === 0) return;
    
    try {
      await this.apiClient.post('/location/batch', {
        locations: locations.map(loc => ({
          latitude: loc.latitude,
          longitude: loc.longitude,
          accuracy: loc.accuracy,
          altitude: loc.altitude,
          speed: loc.speed,
          heading: loc.heading,
          timestamp: loc.timestamp,
        })),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Failed to send batch location update:', error);
    }
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  detectSignificantLocationChange(
    prevLocation: Location | null, 
    currentLocation: Location,
    threshold: number = 0.05 // 50 meters
  ): boolean {
    if (!prevLocation) return true;
    
    const distance = this.calculateDistance(
      prevLocation.latitude,
      prevLocation.longitude,
      currentLocation.latitude,
      currentLocation.longitude
    );
    
    return distance >= threshold;
  }

  async reverseGeocode(
    latitude: number, 
    longitude: number
  ): Promise<{ success: boolean; address?: string }> {
    try {
      // This would normally use Google Maps or another geocoding service
      const response = await this.apiClient.get('/location/reverse-geocode', {
        params: { latitude, longitude },
      });
      return response.data;
    } catch (error) {
      console.error('Reverse geocode failed:', error);
      return { success: false };
    }
  }

  detectTransportMode(locations: Location[]): string {
    if (locations.length < 3) return 'unknown';
    
    // Calculate average speed
    const speeds = locations
      .map(loc => loc.speed)
      .filter(speed => speed !== null) as number[];
    
    if (speeds.length === 0) return 'unknown';
    
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const avgSpeedKmh = avgSpeed * 3.6; // Convert m/s to km/h
    
    // Simple heuristic for transport mode detection
    if (avgSpeedKmh < 5) return 'walk';
    if (avgSpeedKmh < 15) return 'bicycle';
    if (avgSpeedKmh < 30) return 'bus';
    if (avgSpeedKmh < 80) return 'car';
    return 'train';
  }

  isStationary(locations: Location[], threshold: number = 0.01): boolean {
    if (locations.length < 2) return true;
    
    const lastLocations = locations.slice(-5); // Check last 5 locations
    
    for (let i = 1; i < lastLocations.length; i++) {
      const distance = this.calculateDistance(
        lastLocations[i-1].latitude,
        lastLocations[i-1].longitude,
        lastLocations[i].latitude,
        lastLocations[i].longitude
      );
      
      if (distance > threshold) return false;
    }
    
    return true;
  }
}

export const locationService = new LocationService();