import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, Text, Switch, Button, List, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { setTrackingEnabled, setPushNotifications, saveUserSettings } from '../redux/slices/userSlice';
import storageService from '../services/storageService';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);
  const trips = useSelector(state => state.trips.trips);
  const [dataExporting, setDataExporting] = useState(false);

  const handleTrackingToggle = async () => {
    const newValue = !user.trackingEnabled;
    dispatch(setTrackingEnabled(newValue));
    await dispatch(saveUserSettings({ ...user, trackingEnabled: newValue }));
  };

  const handleNotificationsToggle = async () => {
    const newValue = !user.pushNotifications;
    dispatch(setPushNotifications(newValue));
    await dispatch(saveUserSettings({ ...user, pushNotifications: newValue }));
  };

  const handleExportData = async () => {
    setDataExporting(true);
    try {
      const allTrips = await storageService.getTrips();
      const userData = await storageService.getUserSettings();
      
      const exportData = {
        trips: allTrips,
        settings: userData,
        exportDate: new Date().toISOString()
      };

      // In a real app, you'd implement actual export functionality
      Alert.alert(
        'Data Export',
        `Your data has been prepared for export.\n\nTrips: ${allTrips.length}\nExport Date: ${new Date().toLocaleDateString()}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
    setDataExporting(false);
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'Are you sure you want to delete all your trip data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearAllData();
              Alert.alert('Success', 'All data has been deleted.');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete data.');
            }
          }
        }
      ]
    );
  };

  const calculateTotalDistance = () => {
    return trips.reduce((total, trip) => total + (trip.distance || 0), 0);
  };

  const calculateTotalTrips = () => {
    return trips.length;
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Trip Statistics" />
        <Card.Content>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Trips:</Text>
            <Text style={styles.statValue}>{calculateTotalTrips()}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Distance:</Text>
            <Text style={styles.statValue}>{calculateTotalDistance().toFixed(2)} km</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Account Type:</Text>
            <Text style={styles.statValue}>Anonymous</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Privacy Settings" />
        <Card.Content>
          <List.Item
            title="Trip Tracking"
            description="Allow the app to track your trips"
            right={() => (
              <Switch
                value={user.trackingEnabled}
                onValueChange={handleTrackingToggle}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Push Notifications"
            description="Receive trip confirmation nudges"
            right={() => (
              <Switch
                value={user.pushNotifications}
                onValueChange={handleNotificationsToggle}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Data Consent Status"
            description={user.consentStatus ? "Consent given" : "Consent not given"}
            right={() => <Text>{user.consentStatus ? "✓" : "✗"}</Text>}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Data Management" />
        <Card.Content>
          <Button
            mode="outlined"
            onPress={handleExportData}
            loading={dataExporting}
            style={styles.button}
            icon="download"
          >
            Export My Data
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleDeleteAllData}
            style={[styles.button, styles.dangerButton]}
            icon="delete-forever"
          >
            Delete All Data
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="App Information" />
        <Card.Content>
          <Text style={styles.infoText}>Version: 1.0.0</Text>
          <Text style={styles.infoText}>
            This app collects travel data anonymously to help improve transportation systems.
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { margin: 16, marginBottom: 8 },
  statRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginVertical: 4 
  },
  statLabel: { fontSize: 16 },
  statValue: { fontSize: 16, fontWeight: 'bold' },
  button: { marginVertical: 8 },
  dangerButton: { borderColor: '#f44336' },
  infoText: { marginVertical: 4, color: '#666' }
});

export default ProfileScreen;