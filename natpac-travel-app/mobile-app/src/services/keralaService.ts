import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/constants';

const API_URL = `${API_BASE_URL}/api/v1/kerala`;

interface WeatherAlert {
  id: string;
  title: string;
  district: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

interface Business {
  id: string;
  name: string;
  type: string;
  district: string;
  rating: number;
  reviewCount: number;
  address: string;
  phone: string;
  description: string;
  images: string[];
  features: string[];
  isVerified: boolean;
  isFeatured: boolean;
}

interface EmergencyService {
  id: string;
  name: string;
  type: string;
  district: string;
  contact: string;
  address: string;
  available24x7: boolean;
}

interface EmergencyContact {
  name: string;
  number: string;
  type: string;
  description: string;
}

class KeralaService {
  private async getAuthHeader() {
    const token = await AsyncStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Weather API
  async getWeatherAlerts(params?: {
    district?: string;
    severity?: string;
    active?: boolean;
  }): Promise<WeatherAlert[]> {
    try {
      const response = await axios.get(`${API_URL}/weather/alerts`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      throw error;
    }
  }

  async getWeatherForecast(district: string): Promise<any> {
    // This would integrate with a weather API service
    // For now, return mock data
    return {
      location: district,
      current: {
        temperature: 31,
        condition: 'Partly Cloudy',
        humidity: 78,
        windSpeed: 12,
      },
      forecast: [
        { day: 'Today', high: 31, low: 24, condition: 'Partly Cloudy', rainChance: 20 },
        { day: 'Tomorrow', high: 29, low: 23, condition: 'Light Rain', rainChance: 80 },
      ],
    };
  }

  // Business API
  async getBusinesses(params?: {
    type?: string;
    district?: string;
    verified?: boolean;
    featured?: boolean;
    rating?: number;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Business[]; pagination: any }> {
    try {
      const response = await axios.get(`${API_URL}/businesses`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching businesses:', error);
      throw error;
    }
  }

  async getBusinessById(id: string): Promise<Business> {
    try {
      const response = await axios.get(`${API_URL}/businesses/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching business:', error);
      throw error;
    }
  }

  async addBusinessReview(businessId: string, rating: number, comment: string): Promise<Business> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.post(
        `${API_URL}/businesses/${businessId}/review`,
        { rating, comment },
        { headers }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

  // Emergency Services API
  async getEmergencyServices(params?: {
    type?: string;
    district?: string;
    available24x7?: boolean;
  }): Promise<EmergencyService[]> {
    try {
      const response = await axios.get(`${API_URL}/emergency/services`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching emergency services:', error);
      throw error;
    }
  }

  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    try {
      const response = await axios.get(`${API_URL}/emergency/contacts`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      throw error;
    }
  }

  async sendSOSAlert(data: {
    location: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    message: string;
    contactNumbers?: string[];
  }): Promise<any> {
    try {
      const headers = await this.getAuthHeader();
      const response = await axios.post(`${API_URL}/emergency/sos`, data, { headers });
      return response.data;
    } catch (error) {
      console.error('Error sending SOS alert:', error);
      throw error;
    }
  }

  // Districts API
  async getDistricts(): Promise<any[]> {
    try {
      const response = await axios.get(`${API_URL}/districts`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching districts:', error);
      throw error;
    }
  }

  // AI Recommendations (Mock for now)
  async getAIRecommendations(location: string, weather: any): Promise<any[]> {
    // This would integrate with an AI service
    // For now, return mock recommendations based on weather
    const recommendations = [];

    if (weather.condition.includes('Rain')) {
      recommendations.push({
        id: 1,
        type: 'transport',
        priority: 'high',
        title: 'Avoid Hill Stations',
        description: 'Heavy rainfall predicted in hilly areas. Consider postponing hill station visits.',
        confidence: 95,
      });
    }

    if (weather.temperature > 30 && weather.humidity < 60) {
      recommendations.push({
        id: 2,
        type: 'travel',
        priority: 'medium',
        title: 'Perfect Beach Weather',
        description: 'Ideal conditions for visiting Kerala beaches like Kovalam and Varkala.',
        confidence: 90,
      });
    }

    return recommendations;
  }
}

export const keralaService = new KeralaService();