import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

class LocationService {
  constructor() {
    this.watchId = null;
    this.isTracking = false;
    this.locationCallback = null;
  }

  async requestPermissions() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This app needs to access your location to track trips',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  startTracking(callback) {
    if (this.isTracking || !callback) return;
    
    this.isTracking = true;
    this.locationCallback = callback;
    
    this.watchId = Geolocation.watchPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading,
        };
        callback(locationData);
      },
      (error) => {
        console.error('Location tracking error:', error);
        Alert.alert('Location Error', 'Unable to get location. Please check your GPS settings.');
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 30000,
        fastestInterval: 15000,
        forceRequestLocation: true,
        showLocationDialog: true,
      }
    );
  }

  stopTracking() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
      this.locationCallback = null;
    }
  }

  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          console.error('Get current position error:', error);
          reject(error);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 10000,
          forceRequestLocation: true,
          showLocationDialog: true,
        }
      );
    });
  }

  isCurrentlyTracking() {
    return this.isTracking;
  }
}

export default new LocationService();