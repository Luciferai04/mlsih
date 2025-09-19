import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  constructor() {
    this.TRIPS_KEY = 'trips';
    this.USER_SETTINGS_KEY = 'userSettings';
    this.APP_DATA_KEY = 'appData';
  }

  async saveTrip(trip) {
    try {
      const existingTrips = await this.getTrips();
      const updatedTrips = [trip, ...existingTrips];
      await AsyncStorage.setItem(this.TRIPS_KEY, JSON.stringify(updatedTrips));
      return true;
    } catch (error) {
      console.error('Error saving trip:', error);
      return false;
    }
  }

  async getTrips() {
    try {
      const tripsJson = await AsyncStorage.getItem(this.TRIPS_KEY);
      return tripsJson ? JSON.parse(tripsJson) : [];
    } catch (error) {
      console.error('Error getting trips:', error);
      return [];
    }
  }

  async updateTrip(tripId, updatedData) {
    try {
      const trips = await this.getTrips();
      const tripIndex = trips.findIndex(trip => trip.id === tripId);
      if (tripIndex !== -1) {
        trips[tripIndex] = { ...trips[tripIndex], ...updatedData };
        await AsyncStorage.setItem(this.TRIPS_KEY, JSON.stringify(trips));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating trip:', error);
      return false;
    }
  }

  async deleteTrip(tripId) {
    try {
      const trips = await this.getTrips();
      const filteredTrips = trips.filter(trip => trip.id !== tripId);
      await AsyncStorage.setItem(this.TRIPS_KEY, JSON.stringify(filteredTrips));
      return true;
    } catch (error) {
      console.error('Error deleting trip:', error);
      return false;
    }
  }

  async saveUserSettings(settings) {
    try {
      const currentSettings = await this.getUserSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      await AsyncStorage.setItem(this.USER_SETTINGS_KEY, JSON.stringify(updatedSettings));
      return true;
    } catch (error) {
      console.error('Error saving user settings:', error);
      return false;
    }
  }

  async getUserSettings() {
    try {
      const settingsJson = await AsyncStorage.getItem(this.USER_SETTINGS_KEY);
      return settingsJson ? JSON.parse(settingsJson) : {
        hasCompletedWelcome: false,
        consentStatus: false,
        trackingEnabled: false,
        pushNotifications: true,
        dataRetentionDays: 30,
      };
    } catch (error) {
      console.error('Error getting user settings:', error);
      return {};
    }
  }

  async clearAllData() {
    try {
      await AsyncStorage.multiRemove([
        this.TRIPS_KEY,
        this.USER_SETTINGS_KEY,
        this.APP_DATA_KEY
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  async getStorageSize() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }

  async exportAllData() {
    try {
      const trips = await this.getTrips();
      const settings = await this.getUserSettings();
      
      return {
        trips,
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }
}

export default new StorageService();