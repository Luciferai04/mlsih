import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Surface,
  Text,
  Button,
  FAB,
  useTheme,
  Card,
  Chip,
  IconButton,
  Portal,
  Modal,
  TextInput,
  SegmentedButtons,
  List,
  ActivityIndicator,
} from 'react-native-paper';
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import OlaMapView from '../../components/OlaMapView';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LocationContext } from '../../context/LocationContext';
import { TripContext } from '../../context/TripContext';
import { AuthContext } from '../../context/AuthContext';
import { KERALA_TRANSPORT_MODES, isWithinKerala, OLA_MAPS_CONFIG } from '../../config/olaMapConfig';
import { olaMapsService } from '../../services/olaMapsService';

// Using Kerala-specific transport modes from Ola Maps config
const TRANSPORT_MODES = KERALA_TRANSPORT_MODES;

const TRIP_PURPOSES = [
  { value: 'work', label: 'Work' },
  { value: 'education', label: 'Education' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'leisure', label: 'Leisure' },
  { value: 'medical', label: 'Medical' },
  { value: 'social', label: 'Social' },
  { value: 'business', label: 'Business' },
  { value: 'other', label: 'Other' },
];

const TripTrackingScreen: React.FC = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const { 
    currentLocation, 
    isTracking: isLocationTracking, 
    startTracking, 
    stopTracking,
    locationHistory,
  } = useContext(LocationContext);
  const {
    activeTrip,
    isTracking,
    isPaused,
    startTrip,
    endTrip,
    pauseTrip,
    resumeTrip,
    cancelTrip,
    updateCurrentTrip,
    companions,
    addCompanion,
    removeCompanion,
  } = useContext(TripContext);

  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [tripNotes, setTripNotes] = useState('');
  const [showCompanionModal, setShowCompanionModal] = useState(false);
  const [companionData, setCompanionData] = useState({
    ageGroup: '',
    gender: '',
    relationship: '',
  });

  // Kerala region defaults
  const [mapRegion, setMapRegion] = useState({
    latitude: currentLocation?.latitude || OLA_MAPS_CONFIG.defaultCenter.latitude,
    longitude: currentLocation?.longitude || OLA_MAPS_CONFIG.defaultCenter.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    if (currentLocation) {
      setMapRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [currentLocation]);

  const handleStartTrip = async () => {
    if (!currentLocation) {
      Alert.alert('Location Error', 'Unable to get current location');
      return;
    }

    if (!selectedMode || !selectedPurpose) {
      Alert.alert('Required Fields', 'Please select transport mode and trip purpose');
      return;
    }

    try {
      await startTrip(currentLocation, selectedPurpose, selectedMode);
      setShowStartModal(false);
      setSelectedMode('');
      setSelectedPurpose('');
    } catch (error) {
      Alert.alert('Error', 'Failed to start trip');
    }
  };

  const handleEndTrip = async () => {
    if (!currentLocation) {
      Alert.alert('Location Error', 'Unable to get current location');
      return;
    }

    try {
      await endTrip(currentLocation);
      setShowEndModal(false);
      Alert.alert('Success', 'Trip saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to end trip');
    }
  };

  const handleCancelTrip = () => {
    Alert.alert(
      'Cancel Trip',
      'Are you sure you want to cancel this trip? All data will be lost.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: () => {
            cancelTrip();
            Alert.alert('Trip Cancelled', 'The trip has been cancelled.');
          }
        },
      ]
    );
  };

  const handleAddCompanion = () => {
    if (!companionData.ageGroup || !companionData.gender || !companionData.relationship) {
      Alert.alert('Required Fields', 'Please fill all companion details');
      return;
    }

    addCompanion(companionData);
    setCompanionData({ ageGroup: '', gender: '', relationship: '' });
    setShowCompanionModal(false);
  };

  const formatDuration = (startTime?: string) => {
    if (!startTime) return '00:00';
    
    const start = new Date(startTime).getTime();
    const now = Date.now();
    const diff = Math.floor((now - start) / 1000); // seconds
    
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDistance = () => {
    if (!locationHistory || locationHistory.length < 2) return '0.0';
    // Calculate distance from location history
    return '0.0'; // Placeholder
  };

  return (
    <View style={styles.container}>
      {/* Map View - Ola Maps (Kerala Only) */}
      <OlaMapView
        style={styles.map}
        currentLocation={currentLocation}
        tripRoute={locationHistory}
        markers={
          activeTrip?.origin
            ? [
                {
                  id: 'origin',
                  latitude: activeTrip.origin.coordinates.latitude,
                  longitude: activeTrip.origin.coordinates.longitude,
                  title: 'Trip Start',
                  type: 'origin',
                },
              ]
            : []
        }
        showUserLocation
        followUserLocation={isTracking}
        onMapReady={() => console.log('Ola Map loaded')}
      />

      {/* Trip Status Card */}
      {isTracking && activeTrip && (
        <Card style={styles.statusCard}>
          <Card.Content>
            <View style={styles.statusHeader}>
              <Text variant="titleMedium">Active Trip</Text>
              {isPaused && (
                <Chip icon="pause" style={styles.pauseChip}>Paused</Chip>
              )}
            </View>
            
            <View style={styles.statusInfo}>
              <View style={styles.statusItem}>
                <Icon name="clock-outline" size={20} color={theme.colors.primary} />
                <Text variant="bodyMedium">{formatDuration(activeTrip.startTime)}</Text>
              </View>
              
              <View style={styles.statusItem}>
                <Icon name="map-marker-distance" size={20} color={theme.colors.primary} />
                <Text variant="bodyMedium">{formatDistance()} km</Text>
              </View>
              
              <View style={styles.statusItem}>
                <Icon name={TRANSPORT_MODES.find(m => m.value === activeTrip.transportMode)?.icon || 'help'} 
                      size={20} 
                      color={theme.colors.primary} />
                <Text variant="bodyMedium">{activeTrip.transportMode}</Text>
              </View>
            </View>

            {companions.length > 0 && (
              <View style={styles.companionInfo}>
                <Text variant="bodySmall">
                  Traveling with {companions.length} companion{companions.length > 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </Card.Content>

          <Card.Actions>
            {!isPaused ? (
              <>
                <Button onPress={pauseTrip} mode="outlined" compact>
                  Pause
                </Button>
                <Button onPress={() => setShowEndModal(true)} mode="contained" compact>
                  End Trip
                </Button>
              </>
            ) : (
              <>
                <Button onPress={resumeTrip} mode="outlined" compact>
                  Resume
                </Button>
                <Button onPress={handleCancelTrip} mode="outlined" compact textColor="error">
                  Cancel
                </Button>
              </>
            )}
          </Card.Actions>
        </Card>
      )}

      {/* Floating Action Button */}
      {!isTracking && (
        <FAB
          style={styles.fab}
          icon="plus"
          label="Start Trip"
          onPress={() => setShowStartModal(true)}
        />
      )}

      {/* Start Trip Modal */}
      <Portal>
        <Modal 
          visible={showStartModal} 
          onDismiss={() => setShowStartModal(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Start New Trip
            </Text>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Transport Mode
            </Text>
            <View style={styles.modeGrid}>
              {TRANSPORT_MODES.map(mode => (
                <Chip
                  key={mode.value}
                  icon={mode.icon}
                  selected={selectedMode === mode.value}
                  onPress={() => setSelectedMode(mode.value)}
                  style={styles.modeChip}
                >
                  {mode.label}
                </Chip>
              ))}
            </View>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Trip Purpose
            </Text>
            <SegmentedButtons
              value={selectedPurpose}
              onValueChange={setSelectedPurpose}
              buttons={TRIP_PURPOSES.slice(0, 3).map(purpose => ({
                value: purpose.value,
                label: purpose.label,
              }))}
              style={styles.segmentedButtons}
            />
            <SegmentedButtons
              value={selectedPurpose}
              onValueChange={setSelectedPurpose}
              buttons={TRIP_PURPOSES.slice(3, 6).map(purpose => ({
                value: purpose.value,
                label: purpose.label,
              }))}
              style={styles.segmentedButtons}
            />

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Companions
            </Text>
            {companions.map((companion, index) => (
              <List.Item
                key={index}
                title={`${companion.relationship} - ${companion.gender}`}
                description={`Age: ${companion.ageGroup}`}
                right={() => (
                  <IconButton
                    icon="close"
                    onPress={() => removeCompanion(index)}
                  />
                )}
              />
            ))}
            <Button 
              mode="outlined" 
              onPress={() => setShowCompanionModal(true)}
              style={styles.addButton}
            >
              Add Companion
            </Button>

            <View style={styles.modalActions}>
              <Button onPress={() => setShowStartModal(false)} mode="outlined">
                Cancel
              </Button>
              <Button onPress={handleStartTrip} mode="contained">
                Start Trip
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Companion Modal */}
      <Portal>
        <Modal
          visible={showCompanionModal}
          onDismiss={() => setShowCompanionModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>
            Add Companion
          </Text>

          <SegmentedButtons
            value={companionData.relationship}
            onValueChange={(value) => setCompanionData(prev => ({ ...prev, relationship: value }))}
            buttons={[
              { value: 'family', label: 'Family' },
              { value: 'friend', label: 'Friend' },
              { value: 'colleague', label: 'Colleague' },
            ]}
            style={styles.segmentedButtons}
          />

          <SegmentedButtons
            value={companionData.gender}
            onValueChange={(value) => setCompanionData(prev => ({ ...prev, gender: value }))}
            buttons={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
            ]}
            style={styles.segmentedButtons}
          />

          <TextInput
            label="Age Group"
            value={companionData.ageGroup}
            onChangeText={(value) => setCompanionData(prev => ({ ...prev, ageGroup: value }))}
            placeholder="e.g., 20-30"
            style={styles.input}
          />

          <View style={styles.modalActions}>
            <Button onPress={() => setShowCompanionModal(false)} mode="outlined">
              Cancel
            </Button>
            <Button onPress={handleAddCompanion} mode="contained">
              Add
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  statusCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pauseChip: {
    backgroundColor: '#FFF3E0',
  },
  statusInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  statusItem: {
    alignItems: 'center',
    gap: 5,
  },
  companionInfo: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontWeight: '600',
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  modeChip: {
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 10,
  },
  input: {
    marginBottom: 16,
  },
  addButton: {
    marginTop: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
});

export default TripTrackingScreen;