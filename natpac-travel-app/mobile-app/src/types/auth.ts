export interface User {
  id: number;
  userId: string;
  phoneNumber: string;
  email?: string;
  ageGroup?: string;
  gender?: string;
  occupation?: string;
  householdSize?: number;
  incomeBracket?: string;
  consentGiven: boolean;
  consentTimestamp?: string;
  privacySettings: PrivacySettings;
  deviceInfo?: DeviceInfo;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface PrivacySettings {
  shareLocation: boolean;
  shareDemographics: boolean;
  allowDataExport: boolean;
  anonymousMode: boolean;
}

export interface DeviceInfo {
  platform: 'android' | 'ios';
  version: string;
  model: string;
  manufacturer?: string;
  deviceId?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
}

export interface LoginRequest {
  phoneNumber: string;
  deviceInfo: DeviceInfo;
}

export interface RegisterRequest {
  phoneNumber: string;
  email?: string;
  deviceInfo: DeviceInfo;
  consentGiven: boolean;
  consentTimestamp: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    userId: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: User;
  };
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}