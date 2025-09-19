import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, BackHandler, ScrollView, Switch } from 'react-native';
import { Button, Card, Text, ActivityIndicator, Chip, List, Divider, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { startTripTracking, stopTripTracking, clearError } from '../redux/slices/tripSlice';
import TripStatusIndicator from '../components/trip/TripStatusIndicator';
import TripTimer from '../components/trip/TripTimer';
import QuickStats from '../components/common/QuickStats';

// Import new AI services
import tripDetectionService from '../services/tripDetectionService';
import companionDetectionService from '../services/companionDetectionService';
import tripPurposeClassifier from '../services/tripPurposeClassifier';
import predictiveAnalyticsService from '../services/predictiveAnalyticsService';
import keralaMobilityClassifier from '../services/keralaMobilityClassifier';

const HomeScreenEnhanced = () => {
  const dispatch = useDispatch();
  const { isTracking, currentTrip, loading, error } = useSelector(state => state.trips);
  
  // Original states
  const [showStopConfirmation, setShowStopConfirmation] = useState(false);
  
  // New AI feature states
  const [autoDetectionEnabled, setAutoDetectionEnabled] = useState(false);
  const [companions, setCompanions] = useState([]);
  const [tripPurpose, setTripPurpose] = useState(null);
  const [nextTripPrediction, setNextTripPrediction] = useState(null);
  const [transportMode, setTransportMode] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [aiInsights, setAiInsights] = useState({});

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error, dispatch]);

  useEffect(() => {
    // Initialize AI services
    initializeAIServices();
    
    // Set up service listeners
    setupServiceListeners();
    
    return () => {
      // Cleanup
      cleanupServiceListeners();
    };
  }, []);

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

  const initializeAIServices = async () => {
    try {
      // Initialize companion detection
      await companionDetectionService.initialize();
      
      // Initialize predictive analytics
      await predictiveAnalyticsService.initialize();
      
      // Get next trip prediction
      const nextTrip = await predictiveAnalyticsService.predictNextTrip();
      if (nextTrip && nextTrip.confidence > 0.6) {
        setNextTripPrediction(nextTrip);
      }
    } catch (error) {
      console.error('Error initializing AI services:', error);
    }
  };

  const setupServiceListeners = () => {
    // Listen to trip detection events
    tripDetectionService.addListener(handleTripDetectionEvent);
    
    // Listen to companion detection events
    companionDetectionService.addListener(handleCompanionEvent);
    
    // Listen to predictive analytics events
    predictiveAnalyticsService.addListener(handlePredictiveEvent);
  };

  const cleanupServiceListeners = () => {
    tripDetectionService.removeListener(handleTripDetectionEvent);
    companionDetectionService.removeListener(handleCompanionEvent);
    predictiveAnalyticsService.removeListener(handlePredictiveEvent);
  };

  const handleTripDetectionEvent = (event, data) => {
    switch (event) {
      case 'trip_started':
        Alert.alert('🚀 Trip Started', 'Automatic trip detection has started a new trip');
        break;
      case 'trip_completed':
        handleTripCompletion(data);
        break;
    }
  };

  const handleCompanionEvent = (event, data) => {
    switch (event) {
      case 'companion_detected':
        setCompanions(prev => [...prev.filter(c => c.id !== data.id), data]);
        break;
      case 'companion_departed':
        setCompanions(prev => prev.filter(c => c.id !== data.id));
        break;
    }
  };

  const handlePredictiveEvent = (event, data) => {
    switch (event) {
      case 'next_trip_predicted':
        setNextTripPrediction(data);
        break;
      case 'anomalies_detected':
        setAnomalies(data);
        if (data.length > 0) {
          Alert.alert('🔍 Unusual Pattern', data[0]?.message || 'Please verify your trip data');
        }
        break;
      case 'mode_recommended':
        setAiInsights(prev => ({ ...prev, recommendedMode: data }));
        break;
    }
  };

  const handleStartTrip = async () => {
    try {
      if (autoDetectionEnabled) {
        // Start automatic trip detection
        await tripDetectionService.startTripDetection();
        await companionDetectionService.startDetection();
        Alert.alert('✅ Auto-Detection Started', 'Trip will be detected and classified automatically');
      } else {
        // Manual trip start
        dispatch(startTripTracking());
        
        // Start companion detection
        await companionDetectionService.startDetection();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start trip tracking');
      console.error(error);
    }
  };

  const handleStopTrip = async () => {
    try {
      if (autoDetectionEnabled) {
        // Stop automatic detection
        await tripDetectionService.stopTripDetection();
        await companionDetectionService.stopDetection();
        setAutoDetectionEnabled(false);
        Alert.alert('✅ Stopped', 'Automatic trip detection has been disabled');
      } else {
        if (showStopConfirmation) {
          // Process trip completion with AI features
          await processAITripCompletion();
          
          dispatch(stopTripTracking());
          await companionDetectionService.stopDetection();
          setShowStopConfirmation(false);
        } else {
          setShowStopConfirmation(true);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to stop trip');
      console.error(error);
    }
  };

  const processAITripCompletion = async () => {
    if (!currentTrip) return;
    
    try {
      // Prepare trip data
      const tripData = {
        startLocation: currentTrip.startLocation,
        endLocation: currentTrip.endLocation || currentTrip.startLocation,
        startTime: currentTrip.startTime,
        endTime: Date.now(),
        duration: Date.now() - currentTrip.startTime,
        locations: currentTrip.locations || [],
        metadata: {
          companions: companions,
          isKeralaRoute: true
        }
      };
      
      // Classify transport mode using Kerala classifier
      const modeClassification = await keralaMobilityClassifier.classifyKeralaTransportMode(tripData);
      setTransportMode(modeClassification);
      
      // Classify trip purpose
      const purpose = await tripPurposeClassifier.classifyTripPurpose(tripData);
      setTripPurpose(purpose);
      
      // Detect anomalies
      const detectedAnomalies = await predictiveAnalyticsService.detectAnomalies(tripData);
      setAnomalies(detectedAnomalies);
      
      // Get recommendations for next trip
      const recommendation = await predictiveAnalyticsService.recommendTransportMode({
        origin: tripData.endLocation,
        destination: nextTripPrediction?.destination
      });
      
      if (recommendation) {
        setAiInsights(prev => ({ ...prev, recommendedMode: recommendation }));
      }
    } catch (error) {
      console.error('Error processing AI trip completion:', error);
    }
  };

  const handleTripCompletion = (tripData) => {
    const summary = `
🎯 Mode: ${tripData.predictedMode || transportMode?.mode || 'Unknown'}
📍 Purpose: ${tripData.purpose || tripPurpose?.purpose || 'Unknown'}
👥 Companions: ${companions.length > 0 ? companions.map(c => c.name).join(', ') : 'Solo'}
🎮 Confidence: ${Math.round((tripData.confidence || transportMode?.confidence || 0) * 100)}%
${tripData.predictedMode?.includes('ksrtc') || tripData.predictedMode?.includes('ferry') ? '🌴 Kerala Special Mode!' : ''}`;
    
    Alert.alert('✅ Trip Completed', summary);
    
    // Reset states
    setCompanions([]);
    setTripPurpose(null);
    setTransportMode(null);
    setAnomalies([]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Main Status Card */}
      <Card style={styles.statusCard}>
        <Card.Title 
          title="AI-Powered Trip Tracking" 
          subtitle="Kerala Mobility Intelligence"
        />
        <Card.Content>
          <TripStatusIndicator isTracking={isTracking || autoDetectionEnabled} />
          {isTracking && currentTrip && (
            <TripTimer startTime={currentTrip.startTime} />
          )}
          
          {/* Auto Detection Toggle */}
          <View style={styles.autoDetectionContainer}>
            <Text style={styles.autoDetectionLabel}>Automatic Trip Detection</Text>
            <Switch
              value={autoDetectionEnabled}
              onValueChange={setAutoDetectionEnabled}
              disabled={isTracking}
            />
          </View>
          
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>
                {isTracking ? 'AI analyzing your trip...' : 'Processing trip data...'}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* AI Insights Card */}
      {(nextTripPrediction || companions.length > 0 || tripPurpose) && (
        <Card style={styles.insightsCard}>
          <Card.Title title="🤖 AI Insights" />
          <Card.Content>
            {nextTripPrediction && (
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>Next Trip Prediction:</Text>
                <Text style={styles.insightValue}>
                  Likely departure in {Math.round((nextTripPrediction.departureTime - Date.now()) / 60000)} min
                </Text>
                <Text style={styles.insightConfidence}>
                  Confidence: {Math.round(nextTripPrediction.confidence * 100)}%
                </Text>
              </View>
            )}
            
            {companions.length > 0 && (
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>Travel Companions:</Text>
                <View style={styles.chipContainer}>
                  {companions.map(companion => (
                    <Chip key={companion.id} style={styles.companionChip}>
                      {companion.name}
                    </Chip>
                  ))}
                </View>
              </View>
            )}
            
            {tripPurpose && (
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>Trip Purpose:</Text>
                <Text style={styles.insightValue}>
                  {tripPurpose.purpose} ({Math.round(tripPurpose.confidence * 100)}%)
                </Text>
              </View>
            )}
            
            {transportMode && transportMode.keralaSpecific && (
              <Chip icon="star" style={styles.keralaChip}>
                Kerala Special: {transportMode.mode}
              </Chip>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Quick Stats */}
      <QuickStats />

      {/* Control Buttons */}
      <View style={styles.buttonContainer}>
        {!isTracking && !autoDetectionEnabled ? (
          <Button 
            mode="contained" 
            onPress={handleStartTrip}
            style={[styles.button, styles.startButton]}
            disabled={loading}
            icon="play"
          >
            {autoDetectionEnabled ? 'Enable Auto-Detection' : 'Start Trip'}
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

      {/* Live Trip Data */}
      {isTracking && currentTrip && (
        <Card style={styles.liveStatsCard}>
          <Card.Title title="📊 Live Trip Intelligence" />
          <Card.Content>
            <List.Item
              title="Locations Captured"
              description={`${currentTrip.locations?.length || 0} points`}
              left={props => <List.Icon {...props} icon="map-marker" />}
            />
            <List.Item
              title="Trip Duration"
              description={`${Math.floor((Date.now() - currentTrip.startTime) / 60000)} minutes`}
              left={props => <List.Icon {...props} icon="clock" />}
            />
            {companions.length > 0 && (
              <List.Item
                title="Companions Detected"
                description={`${companions.length} ${companions.length === 1 ? 'person' : 'people'}`}
                left={props => <List.Icon {...props} icon="account-group" />}
              />
            )}
            {anomalies.length > 0 && (
              <List.Item
                title="Anomalies"
                description={anomalies[0]?.message}
                left={props => <List.Icon {...props} icon="alert" color="#ff9800" />}
              />
            )}
          </Card.Content>
        </Card>
      )}

      {/* Kerala Features Badge */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>🌴 Kerala-Optimized Features</Text>
        <View style={styles.featuresList}>
          <Chip icon="bus" style={styles.featureChip}>KSRTC Detection</Chip>
          <Chip icon="ferry" style={styles.featureChip}>Water Transport</Chip>
          <Chip icon="car" style={styles.featureChip}>Auto-Rickshaw</Chip>
          <Chip icon="train" style={styles.featureChip}>Kochi Metro</Chip>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  statusCard: { 
    margin: 16,
    elevation: 4
  },
  insightsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 3,
    backgroundColor: '#f8f9fa'
  },
  liveStatsCard: { 
    margin: 16,
    elevation: 3
  },
  buttonContainer: { 
    alignItems: 'center', 
    marginVertical: 20 
  },
  button: { 
    minWidth: 200, 
    marginVertical: 8 
  },
  startButton: { 
    backgroundColor: '#4CAF50' 
  },
  stopButton: { 
    backgroundColor: '#f44336' 
  },
  confirmButton: { 
    backgroundColor: '#FF5722' 
  },
  cancelButton: { 
    marginTop: 8 
  },
  loadingContainer: { 
    alignItems: 'center', 
    marginVertical: 20 
  },
  loadingText: { 
    marginTop: 12, 
    textAlign: 'center',
    color: '#666'
  },
  autoDetectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8
  },
  autoDetectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1976d2'
  },
  insightItem: {
    marginVertical: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8
  },
  insightLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  insightValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  insightConfidence: {
    fontSize: 12,
    color: '#888',
    marginTop: 2
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4
  },
  companionChip: {
    marginRight: 8,
    marginTop: 4,
    backgroundColor: '#e1f5fe'
  },
  keralaChip: {
    marginTop: 8,
    backgroundColor: '#c8e6c9'
  },
  featuresContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 12
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  featureChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f1f8e9'
  }
});

export default HomeScreenEnhanced;