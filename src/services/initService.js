import locationService from './locationService';
import notificationService from './notificationService';
import storageService from './storageService';

export const initializeServices = async () => {
  try {
    console.log('Initializing app services...');
    
    // Initialize notification service
    notificationService.configure();
    
    // Check storage size and cleanup if needed
    const storageSize = await storageService.getStorageSize();
    console.log(`Current storage usage: ${storageSize} bytes`);
    
    // Cleanup old trips if storage is getting full (> 5MB)
    if (storageSize > 5 * 1024 * 1024) {
      console.log('Storage cleanup needed');
      await cleanupOldTrips();
    }
    
    console.log('App services initialized successfully');
    
  } catch (error) {
    console.error('Error initializing services:', error);
  }
};

const cleanupOldTrips = async () => {
  try {
    const trips = await storageService.getTrips();
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    // Keep only trips from last 30 days
    const recentTrips = trips.filter(trip => trip.startTime > thirtyDaysAgo);
    
    if (recentTrips.length < trips.length) {
      await AsyncStorage.setItem('trips', JSON.stringify(recentTrips));
      console.log(`Cleaned up ${trips.length - recentTrips.length} old trips`);
    }
  } catch (error) {
    console.error('Error cleaning up old trips:', error);
  }
};