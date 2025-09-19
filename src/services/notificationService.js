import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

class NotificationService {
  constructor() {
    this.configure();
  }

  configure() {
    PushNotification.configure({
      onRegister: function(token) {
        console.log('TOKEN:', token);
      },
      onNotification: function(notification) {
        console.log('NOTIFICATION:', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    PushNotification.createChannel(
      {
        channelId: 'trip-notifications',
        channelName: 'Trip Notifications',
        channelDescription: 'Notifications about trip tracking',
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );
  }

  showTripConfirmationNudge(trip) {
    const duration = Math.floor((trip.endTime - trip.startTime) / 60000);
    const distance = trip.distance ? trip.distance.toFixed(1) : 'N/A';
    
    PushNotification.localNotification({
      channelId: 'trip-notifications',
      title: 'Trip Completed',
      message: `${duration} min trip (${distance} km) detected as ${trip.predictedMode}. Was this correct?`,
      data: { tripId: trip.id, type: 'trip_confirmation' },
      actions: ['Yes', 'No'],
    });
  }

  showLocationPermissionReminder() {
    PushNotification.localNotification({
      channelId: 'trip-notifications',
      title: 'Location Permission Needed',
      message: 'Please enable location services to track your trips',
    });
  }

  showDataExportReminder() {
    PushNotification.localNotification({
      channelId: 'trip-notifications',
      title: 'Data Export Available',
      message: 'You have trip data ready for export. Check your Profile.',
    });
  }

  cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }
}

export default new NotificationService();