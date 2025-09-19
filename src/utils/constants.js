// App Constants for NATPAC Travel Survey
// Smart India Hackathon 2025

export const APP_CONFIG = {
  name: 'NATPAC Travel Survey',
  version: '1.0.0',
  environment: 'development'
};

export const API_CONFIG = {
  backend: 'http://localhost:4001',
  mlService: 'http://localhost:8001',
  timeout: 10000 // 10 seconds
};

export const TRACKING_CONFIG = {
  locationInterval: 30000, // 30 seconds
  fastestInterval: 15000, // 15 seconds
  distanceFilter: 10, // meters
  enableHighAccuracy: true
};

export const STORAGE_CONFIG = {
  maxStorageSize: 5 * 1024 * 1024, // 5MB
  maxTripAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  autoCleanup: true
};

export const TRANSPORT_MODES = {
  walking: { color: '#4CAF50', icon: 'walk' },
  cycling: { color: '#FF9800', icon: 'bike' },
  driving: { color: '#2196F3', icon: 'car' },
  public_transport: { color: '#9C27B0', icon: 'bus' },
  train: { color: '#607D8B', icon: 'train' },
  ferry: { color: '#00BCD4', icon: 'boat' },
  auto_rickshaw: { color: '#FFC107', icon: 'rickshaw' }
};

export const KERALA_LOCATIONS = {
  kochi: { latitude: 9.9312, longitude: 76.2673, name: 'Kochi' },
  trivandrum: { latitude: 8.5241, longitude: 76.9366, name: 'Thiruvananthapuram' },
  kozhikode: { latitude: 11.2588, longitude: 75.7804, name: 'Kozhikode' },
  thrissur: { latitude: 10.5276, longitude: 76.2144, name: 'Thrissur' }
};

// No external API keys required for core functionality
// All processing happens locally or through our own backend services
export const DEMO_MODE = true;
export const USE_MOCK_DATA = false;