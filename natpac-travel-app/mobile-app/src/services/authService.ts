import axios from 'axios';
import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';
import { LoginRequest, RegisterRequest, AuthResponse, RefreshTokenResponse, User } from '../types/auth';

const API_BASE_URL = Config.API_URL || 'http://localhost:3000/api/v1';

class AuthService {
  private apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post('/auth/login', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async logout(token: string): Promise<void> {
    try {
      await this.apiClient.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error: any) {
      // Ignore logout errors - we'll clear local data anyway
      console.error('Logout error:', error);
    }
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      const response = await this.apiClient.post('/auth/refresh', { refreshToken });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await this.apiClient.get('/auth/validate', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  async updateProfile(token: string, userData: Partial<User>): Promise<{ success: boolean; data: User }> {
    try {
      const response = await this.apiClient.put('/user/profile', userData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async updateConsent(token: string, consentGiven: boolean): Promise<{ success: boolean; data: User }> {
    try {
      const response = await this.apiClient.put('/user/consent', {
        consentGiven,
        consentTimestamp: new Date().toISOString(),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async updatePrivacySettings(
    token: string, 
    privacySettings: any
  ): Promise<{ success: boolean; data: User }> {
    try {
      const response = await this.apiClient.put('/user/privacy-settings', privacySettings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async sendOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.apiClient.post('/auth/send-otp', { phoneNumber });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async verifyOTP(phoneNumber: string, otp: string): Promise<AuthResponse> {
    try {
      const deviceInfo = await this.getDeviceInfo();
      const response = await this.apiClient.post('/auth/verify-otp', {
        phoneNumber,
        otp,
        deviceInfo,
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getDeviceInfo() {
    return {
      platform: DeviceInfo.getSystemName().toLowerCase(),
      version: DeviceInfo.getSystemVersion(),
      model: DeviceInfo.getModel(),
      manufacturer: await DeviceInfo.getManufacturer(),
      deviceId: await DeviceInfo.getUniqueId(),
    };
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

export const authService = new AuthService();