import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, BackHandler } from 'react-native';
import { Button, Card, Text, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { startTripTracking, stopTripTracking, clearError } from '../redux/slices/tripSlice';
import TripStatusIndicator from '../components/trip/TripStatusIndicator';
import TripTimer from '../components/trip/TripTimer';
import QuickStats from '../components/common/QuickStats';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const { isTracking, currentTrip, loading, error } = useSelector(state => state.trips);
  const [showStopConfirmation, setShowStopConfirmation] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error, dispatch]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isTracking) {
        Alert.alert(
          'Trip in Progress',
          'A trip is currently being tracked. Stop tracking before exiting?',
          [
            { text: 'Continue Tracking', style: 'cancel' },
            { text: 'Stop & Exit', onPress: () => handleStopTrip() }
          ]
        );
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [isTracking]);

  const handleStartTrip = () => {
    dispatch(startTripTracking());
  };

  const handleStopTrip = () => {
    if (showStopConfirmation) {
      dispatch(stopTripTracking());
      setShowStopConfirmation(false);
    } else {
      setShowStopConfirmation(true);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.statusCard}>
        <Card.Title title="Trip Tracking" />
        <Card.Content>
          <TripStatusIndicator isTracking={isTracking} />
          {isTracking && currentTrip && (
            <TripTimer startTime={currentTriip.startTime} />
          )}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>
                {isTracking ? 'Starting trip tracking...' : 'Processing trip data...'}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <QuickStats />

      <View style={styles.buttonContainer}>
        {!isTracking ? (
          <Button 
            mode="contained" 
            onPress={handleStartTrip}
            style={[styles.button, styles.startButton]}
            disabled={loading}
            icon="play"
          >
            Start Trip
          </Button>
        ) : (
          <View>
            <Button 
              mode={showStopConfirmation ? "contained" : "contained"}
              onPress={handleStopTrip}
              style={[
                styles.button, 
                showStopConfirmation ? styles.confirmButton : styles.stopButton
              ]}
              disabled={loading}
              icon={showStopConfirmation ? "check" : "stop"}
            >
              {showStopConfirmation ? 'Confirm Stop' : 'Stop Trip'}
            </Button>
            {showStopConfirmation && (
              <Button
                mode="text"
                onPress={() => setShowStopConfirmation(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
            )}
          </View>
        )}
      </View>

      {isTracking && currentTrip && (
        <Card style={styles.liveStatsCard}>
          <Card.Title title="Live Trip Data" />
          <Card.Content>
            <Text>Locations captured: {currentTrip.locations?.length || 0}</Text>
            <Text>Duration: {Math.floor((Date.now() - currentTrip.startTime) / 60000)} minutes</Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  statusCard: { marginBottom: 16 },
  liveStatsCard: { marginTop: 16 },
  buttonContainer: { alignItems: 'center', marginVertical: 20 },
  button: { minWidth: 200, marginVertical: 8 },
  startButton: { backgroundColor: '#4CAF50' },
  stopButton: { backgroundColor: '#f44336' },
  confirmButton: { backgroundColor: '#FF5722' },
  cancelButton: { marginTop: 8 },
  loadingContainer: { alignItems: 'center', marginVertical: 20 },
  loadingText: { marginTop: 12, textAlign: 'center' }
});

export default HomeScreen;