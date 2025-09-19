import { PermissionsAndroid, Platform, Alert } from 'react-native';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

export const requestLocationPermissions = async () => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);
      
      return (
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED ||
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      return result === RESULTS.GRANTED;
    }
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};

export const requestNotificationPermissions = async () => {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true; // Granted by default on Android < 33
    } else {
      const result = await request(PERMISSIONS.IOS.NOTIFICATION);
      return result === RESULTS.GRANTED;
    }
  } catch (error) {
    console.error('Notification permission request error:', error);
    return false;
  }
};