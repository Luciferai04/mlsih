import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Surface,
  Text,
  FAB,
  Portal,
  Modal,
  List,
  Divider,
  Chip,
  Button,
  useTheme,
  SegmentedButtons,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LocationContext } from '../../context/LocationContext';
import { TripContext } from '../../context/TripContext';
import OlaMapView from '../../components/OlaMapView';
import { keralaService } from '../../services/keralaService';

interface MapLayer {
  id: string;
  name: string;
  icon: string;
  type: 'trips' | 'traffic' | 'businesses' | 'emergency';
}

const MapScreen: React.FC = () => {
  const theme = useTheme();
  const { currentLocation } = useContext(LocationContext);
  const { trips, activeTrip } = useContext(TripContext);
  const [selectedLayer, setSelectedLayer] = useState('trips');
  const [showLayerModal, setShowLayerModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [nearbyBusinesses, setNearbyBusinesses] = useState([]);
  const [emergencyServices, setEmergencyServices] = useState([]);
  const [mapType, setMapType] = useState('standard');

  const layers: MapLayer[] = [
    { id: 'trips', name: 'My Trips', icon: 'map-marker-path', type: 'trips' },
    { id: 'traffic', name: 'Traffic', icon: 'traffic-light', type: 'traffic' },
    { id: 'businesses', name: 'Local Businesses', icon: 'store', type: 'businesses' },
    { id: 'emergency', name: 'Emergency Services', icon: 'hospital-box', type: 'emergency' },
  ];

  useEffect(() => {
    if (selectedLayer === 'businesses') {
      fetchNearbyBusinesses();
    } else if (selectedLayer === 'emergency') {
      fetchEmergencyServices();
    }
  }, [selectedLayer, currentLocation]);

  const fetchNearbyBusinesses = async () => {
    try {
      const response = await keralaService.getBusinesses({
        verified: true,
        limit: 20,
      });
      setNearbyBusinesses(response.data);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  };

  const fetchEmergencyServices = async () => {
    try {
      const services = await keralaService.getEmergencyServices({
        available24x7: true,
      });
      setEmergencyServices(services);
    } catch (error) {
      console.error('Error fetching emergency services:', error);
    }
  };

  const getMarkersForLayer = () => {
    const markers = [];

    switch (selectedLayer) {
      case 'trips':
        // Add markers for trip origins and destinations
        trips?.forEach((trip, index) => {
          if (trip.origin) {
            markers.push({
              id: `origin-${trip.id}`,
              latitude: trip.origin.coordinates.latitude,
              longitude: trip.origin.coordinates.longitude,
              title: `Trip ${index + 1} Start`,
              description: trip.origin.name,
              type: 'origin',
            });
          }
          if (trip.destination) {
            markers.push({
              id: `destination-${trip.id}`,
              latitude: trip.destination.coordinates.latitude,
              longitude: trip.destination.coordinates.longitude,
              title: `Trip ${index + 1} End`,
              description: trip.destination.name,
              type: 'destination',
            });
          }
        });
        break;

      case 'businesses':
        nearbyBusinesses.forEach((business: any) => {
          if (business.location?.coordinates) {
            markers.push({
              id: business.id,
              latitude: business.location.coordinates[1],
              longitude: business.location.coordinates[0],
              title: business.name,
              description: `${business.type} - ${business.rating}★`,
              type: 'business',
            });
          }
        });
        break;

      case 'emergency':
        emergencyServices.forEach((service: any) => {
          if (service.location?.coordinates) {
            markers.push({
              id: service.id,
              latitude: service.location.coordinates[1],
              longitude: service.location.coordinates[0],
              title: service.name,
              description: service.type,
              type: 'emergency',
            });
          }
        });
        break;
    }

    return markers;
  };

  const handleRecenter = () => {
    // This would trigger map recentering
    Alert.alert('Map', 'Recentering to current location');
  };

  const MapLegend = () => {
    const getLegendItems = () => {
      switch (selectedLayer) {
        case 'trips':
          return [
            { icon: 'map-marker', color: '#4CAF50', label: 'Trip Start' },
            { icon: 'map-marker-check', color: '#F44336', label: 'Trip End' },
          ];
        case 'traffic':
          return [
            { icon: 'circle', color: '#4CAF50', label: 'Normal' },
            { icon: 'circle', color: '#FFC107', label: 'Moderate' },
            { icon: 'circle', color: '#F44336', label: 'Heavy' },
          ];
        case 'businesses':
          return [
            { icon: 'food', color: '#FF5722', label: 'Restaurant' },
            { icon: 'bed', color: '#2196F3', label: 'Hotel' },
            { icon: 'shopping', color: '#9C27B0', label: 'Shop' },
          ];
        case 'emergency':
          return [
            { icon: 'hospital-building', color: '#F44336', label: 'Hospital' },
            { icon: 'police-badge', color: '#3F51B5', label: 'Police' },
            { icon: 'fire-truck', color: '#FF9800', label: 'Fire Station' },
          ];
        default:
          return [];
      }
    };

    return (
      <Surface style={styles.legendCard}>
        <Text style={styles.legendTitle}>Map Legend</Text>
        <View style={styles.legendItems}>
          {getLegendItems().map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <Icon name={item.icon} size={16} color={item.color} />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      {/* Map View */}
      <OlaMapView
        style={styles.map}
        currentLocation={currentLocation}
        markers={getMarkersForLayer()}
        showUserLocation
        followUserLocation={false}
        mapType={mapType}
        showTraffic={selectedLayer === 'traffic'}
        onMapReady={() => console.log('Map loaded')}
      />

      {/* Map Controls */}
      <View style={styles.mapControls}>
        <Surface style={styles.controlsCard}>
          <TouchableOpacity
            onPress={() => setShowLayerModal(true)}
            style={styles.layerButton}
          >
            <Icon 
              name={layers.find(l => l.id === selectedLayer)?.icon || 'layers'} 
              size={24} 
              color={theme.colors.primary} 
            />
            <Text style={styles.layerButtonText}>
              {layers.find(l => l.id === selectedLayer)?.name || 'Layers'}
            </Text>
          </TouchableOpacity>

          <Divider style={styles.controlDivider} />

          <View style={styles.mapTypeButtons}>
            <TouchableOpacity
              onPress={() => setMapType('standard')}
              style={[
                styles.mapTypeButton,
                mapType === 'standard' && styles.mapTypeButtonActive,
              ]}
            >
              <Icon name="map" size={20} color={mapType === 'standard' ? theme.colors.primary : theme.colors.outline} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMapType('satellite')}
              style={[
                styles.mapTypeButton,
                mapType === 'satellite' && styles.mapTypeButtonActive,
              ]}
            >
              <Icon name="satellite" size={20} color={mapType === 'satellite' ? theme.colors.primary : theme.colors.outline} />
            </TouchableOpacity>
          </View>
        </Surface>

        <MapLegend />
      </View>

      {/* Active Trip Indicator */}
      {activeTrip && (
        <Surface style={styles.activeTripIndicator}>
          <Icon name="navigation" size={20} color={theme.colors.primary} />
          <Text style={styles.activeTripText}>Trip in Progress</Text>
        </Surface>
      )}

      {/* Floating Action Buttons */}
      <FAB
        style={styles.recenterFab}
        icon="crosshairs-gps"
        onPress={handleRecenter}
        small
      />

      <FAB
        style={styles.infoFab}
        icon="information"
        onPress={() => setShowInfoModal(true)}
        small
      />

      {/* Layer Selection Modal */}
      <Portal>
        <Modal
          visible={showLayerModal}
          onDismiss={() => setShowLayerModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Map Layers</Text>
          <List.Section>
            {layers.map((layer) => (
              <TouchableOpacity
                key={layer.id}
                onPress={() => {
                  setSelectedLayer(layer.id);
                  setShowLayerModal(false);
                }}
              >
                <List.Item
                  title={layer.name}
                  left={(props) => <Icon {...props} name={layer.icon} size={24} />}
                  right={(props) => selectedLayer === layer.id ? 
                    <Icon {...props} name="check" size={24} color={theme.colors.primary} /> : null
                  }
                />
              </TouchableOpacity>
            ))}
          </List.Section>
        </Modal>
      </Portal>

      {/* Info Modal */}
      <Portal>
        <Modal
          visible={showInfoModal}
          onDismiss={() => setShowInfoModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Map Information</Text>
          <Text style={styles.infoText}>
            This map shows various data layers for Kerala:
          </Text>
          <List.Section>
            <List.Item
              title="My Trips"
              description="View your trip routes and locations"
              left={(props) => <Icon {...props} name="map-marker-path" />}
            />
            <List.Item
              title="Traffic"
              description="Real-time traffic conditions"
              left={(props) => <Icon {...props} name="traffic-light" />}
            />
            <List.Item
              title="Local Businesses"
              description="Discover nearby shops, restaurants, and hotels"
              left={(props) => <Icon {...props} name="store" />}
            />
            <List.Item
              title="Emergency Services"
              description="Locate hospitals, police stations, and fire stations"
              left={(props) => <Icon {...props} name="hospital-box" />}
            />
          </List.Section>
          <Button onPress={() => setShowInfoModal(false)} mode="contained" style={styles.modalButton}>
            Got it
          </Button>
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
  mapControls: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
  },
  controlsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    elevation: 4,
  },
  layerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  layerButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  controlDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 8,
  },
  mapTypeButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  mapTypeButton: {
    padding: 8,
    borderRadius: 4,
  },
  mapTypeButtonActive: {
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
  },
  legendCard: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
  },
  activeTripIndicator: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 4,
    gap: 8,
  },
  activeTripText: {
    fontSize: 14,
    fontWeight: '500',
  },
  recenterFab: {
    position: 'absolute',
    right: 16,
    bottom: 150,
    backgroundColor: 'white',
  },
  infoFab: {
    position: 'absolute',
    right: 16,
    bottom: 90,
    backgroundColor: 'white',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  modalButton: {
    marginTop: 16,
  },
});

export default MapScreen;