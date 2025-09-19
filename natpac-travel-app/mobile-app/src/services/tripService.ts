import axios from 'axios';
import Config from 'react-native-config';
import { Trip, CreateTripData, TripFilters, TripStatistics } from '../types/trip';

const API_BASE_URL = Config.API_URL || 'http://localhost:3000/api/v1';

class TripService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async createTrip(token: string, tripData: CreateTripData): Promise<Trip> {
    try {
      const response = await this.apiClient.post('/trips', tripData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getTrips(token: string, filters?: TripFilters): Promise<Trip[]> {
    try {
      const response = await this.apiClient.get('/trips', {
        headers: { Authorization: `Bearer ${token}` },
        params: filters,
      });
      return response.data.data.trips;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getTrip(token: string, tripId: string): Promise<Trip> {
    try {
      const response = await this.apiClient.get(`/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async updateTrip(token: string, tripId: string, updates: Partial<Trip>): Promise<Trip> {
    try {
      const response = await this.apiClient.put(`/trips/${tripId}`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async deleteTrip(token: string, tripId: string): Promise<void> {
    try {
      await this.apiClient.delete(`/trips/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async createTripChain(token: string, tripIds: string[], chainName?: string): Promise<{ success: boolean; chainId: string }> {
    try {
      const response = await this.apiClient.post('/trips/chain', {
        tripIds,
        chainName,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getStatistics(token: string, period: 'week' | 'month' | 'year' = 'month'): Promise<TripStatistics> {
    try {
      const response = await this.apiClient.get('/analytics/personal', {
        headers: { Authorization: `Bearer ${token}` },
        params: { period },
      });
      return response.data.data.summary;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async exportTrips(token: string, format: 'csv' | 'json' | 'geojson', filters?: TripFilters): Promise<{ downloadUrl: string }> {
    try {
      const response = await this.apiClient.get('/trips/export', {
        headers: { Authorization: `Bearer ${token}` },
        params: { format, ...filters },
      });
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async startTracking(token: string, config: any): Promise<{ success: boolean; sessionId: string }> {
    try {
      const response = await this.apiClient.post('/trips/start-tracking', config, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async stopTracking(token: string): Promise<{ success: boolean }> {
    try {
      const response = await this.apiClient.post('/trips/stop-tracking', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async sendTrackingData(token: string, trackingData: any): Promise<void> {
    try {
      await this.apiClient.post('/trips/tracking-data', trackingData, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error: any) {
      // Silently fail for tracking data to not interrupt user experience
      console.error('Failed to send tracking data:', error);
    }
  }

  async getSuggestions(token: string): Promise<any[]> {
    try {
      const response = await this.apiClient.get('/trips/suggestions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      const { data } = error.response;
      if (data.error) {
        return new Error(data.error.message || 'An error occurred');
      }
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error('Network error. Please check your connection.');
  }
}

export const tripService = new TripService();