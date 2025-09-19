import React, { useState, useContext } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Surface,
  Text,
  Checkbox,
  Button,
  useTheme,
  List,
  Divider,
  Card,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';

const ConsentScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { acceptConsent } = useContext(AuthContext);
  
  const [consents, setConsents] = useState({
    dataCollection: false,
    locationTracking: false,
    dataSharing: false,
    termsAccepted: false,
  });
  
  const [loading, setLoading] = useState(false);

  const allConsentsGiven = Object.values(consents).every(consent => consent === true);

  const handleAcceptAll = () => {
    setConsents({
      dataCollection: true,
      locationTracking: true,
      dataSharing: true,
      termsAccepted: true,
    });
  };

  const handleContinue = async () => {
    if (!allConsentsGiven) {
      Alert.alert(
        'Consent Required',
        'Please accept all terms to continue using the app.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      await acceptConsent();
      navigation.navigate('MainTabs' as never);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to save consent preferences. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Surface style={styles.surface} elevation={0}>
        <Text variant="headlineMedium" style={styles.title}>
          Privacy & Consent
        </Text>
        
        <Text variant="bodyLarge" style={styles.subtitle}>
          NATPAC Travel App needs your consent to collect and process travel data
          for transportation planning research.
        </Text>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.infoTitle}>
              Why we collect data:
            </Text>
            <Text variant="bodyMedium" style={styles.infoText}>
              • Improve public transportation planning{'\n'}
              • Understand travel patterns in Kerala{'\n'}
              • Support evidence-based policy making{'\n'}
              • Enhance infrastructure development
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.consentList}>
          <List.Item
            title="Data Collection"
            description="Allow collection of trip origin, destination, time, and mode of transport"
            left={() => (
              <Checkbox
                status={consents.dataCollection ? 'checked' : 'unchecked'}
                onPress={() => setConsents(prev => ({ ...prev, dataCollection: !prev.dataCollection }))}
              />
            )}
            style={styles.consentItem}
          />
          
          <Divider />
          
          <List.Item
            title="Location Tracking"
            description="Allow GPS tracking to automatically detect trips and routes"
            left={() => (
              <Checkbox
                status={consents.locationTracking ? 'checked' : 'unchecked'}
                onPress={() => setConsents(prev => ({ ...prev, locationTracking: !prev.locationTracking }))}
              />
            )}
            style={styles.consentItem}
          />
          
          <Divider />
          
          <List.Item
            title="Research Data Sharing"
            description="Allow NATPAC scientists to use anonymized data for research"
            left={() => (
              <Checkbox
                status={consents.dataSharing ? 'checked' : 'unchecked'}
                onPress={() => setConsents(prev => ({ ...prev, dataSharing: !prev.dataSharing }))}
              />
            )}
            style={styles.consentItem}
          />
          
          <Divider />
          
          <List.Item
            title="Terms & Conditions"
            description="I have read and accept the terms and privacy policy"
            left={() => (
              <Checkbox
                status={consents.termsAccepted ? 'checked' : 'unchecked'}
                onPress={() => setConsents(prev => ({ ...prev, termsAccepted: !prev.termsAccepted }))}
              />
            )}
            style={styles.consentItem}
          />
        </View>

        <Card style={styles.privacyCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.privacyTitle}>
              Your Privacy Matters
            </Text>
            <Text variant="bodySmall" style={styles.privacyText}>
              • You can withdraw consent anytime{'\n'}
              • Data is encrypted and secure{'\n'}
              • You control what data is shared{'\n'}
              • Option for anonymous contribution
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleAcceptAll}
            style={styles.acceptAllButton}
            disabled={loading}
          >
            Accept All
          </Button>
          
          <Button
            mode="contained"
            onPress={handleContinue}
            loading={loading}
            disabled={!allConsentsGiven || loading}
            style={styles.continueButton}
          >
            Continue
          </Button>
        </View>

        <Text variant="bodySmall" style={styles.footer}>
          By continuing, you agree to help improve transportation
          planning in Kerala through your valuable travel data.
        </Text>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  surface: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    marginBottom: 20,
    opacity: 0.8,
  },
  infoCard: {
    marginBottom: 20,
    backgroundColor: '#E3F2FD',
  },
  infoTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    lineHeight: 22,
  },
  consentList: {
    marginBottom: 20,
  },
  consentItem: {
    paddingVertical: 8,
  },
  privacyCard: {
    marginBottom: 20,
    backgroundColor: '#F3E5F5',
  },
  privacyTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  privacyText: {
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  acceptAllButton: {
    flex: 1,
  },
  continueButton: {
    flex: 1,
  },
  footer: {
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 10,
  },
});

export default ConsentScreen;