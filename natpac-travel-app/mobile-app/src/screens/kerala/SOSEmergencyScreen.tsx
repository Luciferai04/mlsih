import React, { useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Surface,
  Text,
  Card,
  Button,
  List,
  Divider,
  useTheme,
  FAB,
  Portal,
  Modal,
  TextInput,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LocationContext } from '../../context/LocationContext';

interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  type: 'police' | 'medical' | 'fire' | 'tourist' | 'disaster';
  description: string;
  isNational?: boolean;
}

interface EmergencyService {
  id: string;
  name: string;
  type: 'hospital' | 'police' | 'fire' | 'pharmacy';
  distance: string;
  address: string;
  phone: string;
  isOpen?: boolean;
}

const SOSEmergencyScreen: React.FC = () => {
  const theme = useTheme();
  const { currentLocation } = useContext(LocationContext);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('');

  const emergencyContacts: EmergencyContact[] = [
    {
      id: '1',
      name: 'National Emergency',
      number: '112',
      type: 'police',
      description: 'All India Emergency Response',
      isNational: true,
    },
    {
      id: '2',
      name: 'Kerala Police',
      number: '100',
      type: 'police',
      description: 'Kerala State Police Control Room',
    },
    {
      id: '3',
      name: 'Medical Emergency',
      number: '108',
      type: 'medical',
      description: 'Ambulance Service',
      isNational: true,
    },
    {
      id: '4',
      name: 'Fire Service',
      number: '101',
      type: 'fire',
      description: 'Fire and Rescue Services',
      isNational: true,
    },
    {
      id: '5',
      name: 'Tourist Helpline',
      number: '1363',
      type: 'tourist',
      description: 'Kerala Tourism 24x7 Helpline',
    },
    {
      id: '6',
      name: 'Women Safety',
      number: '1091',
      type: 'police',
      description: 'Women Safety Helpline',
    },
    {
      id: '7',
      name: 'Disaster Management',
      number: '1077',
      type: 'disaster',
      description: 'Kerala State Disaster Management',
    },
  ];

  const nearbyServices: EmergencyService[] = [
    {
      id: '1',
      name: 'General Hospital Ernakulam',
      type: 'hospital',
      distance: '2.3 km',
      address: 'Hospital Road, Ernakulam',
      phone: '0484-2358001',
      isOpen: true,
    },
    {
      id: '2',
      name: 'Ernakulam Central Police Station',
      type: 'police',
      distance: '1.8 km',
      address: 'MG Road, Ernakulam',
      phone: '0484-2353100',
      isOpen: true,
    },
    {
      id: '3',
      name: '24x7 Pharmacy',
      type: 'pharmacy',
      distance: '0.5 km',
      address: 'Near Marine Drive, Kochi',
      phone: '0484-2371234',
      isOpen: true,
    },
    {
      id: '4',
      name: 'Fire Station Kochi',
      type: 'fire',
      distance: '3.1 km',
      address: 'Shanmugham Road, Kochi',
      phone: '0484-2666101',
      isOpen: true,
    },
  ];

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'police':
        return 'shield-account';
      case 'medical':
        return 'hospital-box';
      case 'fire':
        return 'fire-truck';
      case 'tourist':
        return 'information';
      case 'disaster':
        return 'alert-octagon';
      default:
        return 'phone';
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return 'hospital-building';
      case 'police':
        return 'police-badge';
      case 'fire':
        return 'fire-station';
      case 'pharmacy':
        return 'pharmacy';
      default:
        return 'map-marker';
    }
  };

  const makeCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  const sendSOS = async () => {
    if (!currentLocation) {
      Alert.alert('Location Error', 'Unable to get your current location');
      return;
    }

    const message = emergencyMessage || 
      `EMERGENCY! I need help. My location: https://maps.google.com/?q=${currentLocation.latitude},${currentLocation.longitude}`;

    // In a real app, this would send to emergency contacts via SMS/API
    Alert.alert(
      'SOS Sent',
      `Emergency message sent to your emergency contacts:\n\n"${message}"`,
      [{ text: 'OK' }]
    );
    
    setShowEmergencyModal(false);
    setEmergencyMessage('');
  };

  const openMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.google.com/?q=${encodedAddress}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Emergency SOS Button */}
        <Card style={[styles.sosCard, { backgroundColor: theme.colors.error }]}>
          <Card.Content>
            <View style={styles.sosContent}>
              <Icon name="alert-octagon" size={48} color="white" />
              <View style={styles.sosText}>
                <Text style={styles.sosTitle}>Emergency SOS</Text>
                <Text style={styles.sosSubtitle}>
                  Tap to send your location to emergency contacts
                </Text>
              </View>
            </View>
            <Button
              mode="contained"
              buttonColor="white"
              textColor={theme.colors.error}
              onPress={() => setShowEmergencyModal(true)}
              style={styles.sosButton}
              labelStyle={styles.sosButtonLabel}
            >
              Send SOS Alert
            </Button>
          </Card.Content>
        </Card>

        {/* Emergency Contacts */}
        <Card style={styles.contactsCard}>
          <Card.Title
            title="Emergency Contacts"
            subtitle="Tap to call directly"
            left={(props) => <Icon {...props} name="phone-alert" />}
          />
          <Card.Content>
            {emergencyContacts.map((contact, index) => (
              <TouchableOpacity
                key={contact.id}
                onPress={() => makeCall(contact.number)}
                activeOpacity={0.7}
              >
                <List.Item
                  title={contact.name}
                  description={contact.description}
                  left={(props) => (
                    <Icon 
                      {...props} 
                      name={getContactIcon(contact.type)} 
                      color={theme.colors.primary}
                    />
                  )}
                  right={() => (
                    <View style={styles.contactRight}>
                      <Text style={styles.phoneNumber}>{contact.number}</Text>
                      {contact.isNational && (
                        <Text style={styles.nationalBadge}>National</Text>
                      )}
                    </View>
                  )}
                />
                {index < emergencyContacts.length - 1 && <Divider />}
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>

        {/* Nearby Emergency Services */}
        <Card style={styles.servicesCard}>
          <Card.Title
            title="Nearby Emergency Services"
            subtitle="Based on your current location"
            left={(props) => <Icon {...props} name="map-marker-radius" />}
          />
          <Card.Content>
            {nearbyServices.map((service, index) => (
              <Surface key={service.id} style={styles.serviceItem}>
                <View style={styles.serviceHeader}>
                  <Icon 
                    name={getServiceIcon(service.type)} 
                    size={32} 
                    color={theme.colors.primary} 
                  />
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceDistance}>{service.distance}</Text>
                  </View>
                  {service.isOpen && (
                    <Text style={styles.openBadge}>OPEN</Text>
                  )}
                </View>
                <Text style={styles.serviceAddress}>{service.address}</Text>
                <View style={styles.serviceActions}>
                  <Button
                    mode="outlined"
                    onPress={() => makeCall(service.phone)}
                    icon="phone"
                    compact
                  >
                    Call
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => openMaps(service.address)}
                    icon="directions"
                    compact
                  >
                    Directions
                  </Button>
                </View>
              </Surface>
            ))}
          </Card.Content>
        </Card>

        {/* Safety Tips */}
        <Card style={styles.tipsCard}>
          <Card.Title
            title="Emergency Safety Tips"
            left={(props) => <Icon {...props} name="lightbulb-outline" />}
          />
          <Card.Content>
            <View style={styles.tipItem}>
              <Icon name="check-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.tipText}>
                Always share your live location with trusted contacts when traveling
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="check-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.tipText}>
                Keep emergency numbers saved in your phone for quick access
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="check-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.tipText}>
                In medical emergencies, note down symptoms and medicines taken
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Icon name="check-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.tipText}>
                For accidents, take photos of the scene if safe to do so
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Emergency Modal */}
      <Portal>
        <Modal
          visible={showEmergencyModal}
          onDismiss={() => setShowEmergencyModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Send Emergency Alert</Text>
          <Text style={styles.modalSubtitle}>
            Your current location will be shared with emergency contacts
          </Text>
          
          <TextInput
            mode="outlined"
            label="Emergency Message (Optional)"
            value={emergencyMessage}
            onChangeText={setEmergencyMessage}
            multiline
            numberOfLines={4}
            style={styles.messageInput}
            placeholder="Describe your emergency..."
          />

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowEmergencyModal(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={sendSOS}
              style={styles.modalButton}
              buttonColor={theme.colors.error}
            >
              Send SOS
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
    backgroundColor: '#f5f5f5',
  },
  sosCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  sosContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sosText: {
    alignItems: 'center',
    marginTop: 12,
  },
  sosTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  sosSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
  },
  sosButton: {
    elevation: 2,
  },
  sosButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  contactRight: {
    alignItems: 'flex-end',
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  nationalBadge: {
    fontSize: 10,
    color: '#666',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  servicesCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  serviceItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  serviceDistance: {
    fontSize: 14,
    color: '#666',
  },
  openBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  serviceAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    marginLeft: 44,
  },
  serviceActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  tipsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    lineHeight: 20,
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
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  messageInput: {
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    minWidth: 100,
  },
});

export default SOSEmergencyScreen;