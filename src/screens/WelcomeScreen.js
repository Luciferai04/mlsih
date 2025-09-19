import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { Button, Checkbox, Card, Title, Paragraph } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { setWelcomeCompleted, setConsentStatus, saveUserSettings } from '../redux/slices/userSlice';
import { requestLocationPermissions } from '../utils/permissions';

const WelcomeScreen = () => {
  const [consentGiven, setConsentGiven] = useState(false);
  const [dataUsageConsent, setDataUsageConsent] = useState(false);
  const dispatch = useDispatch();

  const handleContinue = async () => {
    if (!consentGiven || !dataUsageConsent) {
      Alert.alert('Consent Required', 'Please accept both consent options to continue.');
      return;
    }

    try {
      const hasLocationPermission = await requestLocationPermissions();
      if (!hasLocationPermission) {
        Alert.alert('Permission Required', 'Location permission is required for trip tracking.');
        return;
      }

      await dispatch(saveUserSettings({
        hasCompletedWelcome: true,
        consentStatus: true,
        trackingEnabled: true,
      }));

      dispatch(setConsentStatus(true));
      dispatch(setWelcomeCompleted(true));
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize app. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Welcome to Travel Data Collector</Title>
          <Paragraph style={styles.description}>
            Help improve transportation systems by sharing your travel patterns anonymously. 
            Your data will contribute to better urban planning and sustainable transport solutions.
          </Paragraph>
          
          <View style={styles.featureList}>
            <Text style={styles.featureTitle}>What we collect:</Text>
            <Text style={styles.feature}>• Trip start and end locations</Text>
            <Text style={styles.feature}>• Travel mode detection</Text>
            <Text style={styles.feature}>• Trip duration and distance</Text>
            <Text style={styles.feature}>• Anonymous usage patterns</Text>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox
              status={consentGiven ? 'checked' : 'unchecked'}
              onPress={() => setConsentGiven(!consentGiven)}
            />
            <Text style={styles.checkboxText}>
              I consent to sharing my travel data for research purposes
            </Text>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox
              status={dataUsageConsent ? 'checked' : 'unchecked'}
              onPress={() => setDataUsageConsent(!dataUsageConsent)}
            />
            <Text style={styles.checkboxText}>
              I understand how my data will be used and stored securely
            </Text>
          </View>
        </Card.Content>
        
        <Card.Actions style={styles.actions}>
          <Button 
            mode="contained" 
            onPress={handleContinue}
            disabled={!consentGiven || !dataUsageConsent}
            style={styles.button}
          >
            Get Started
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  card: { marginVertical: 8 },
  title: { textAlign: 'center', marginBottom: 16, color: '#2196F3' },
  description: { marginBottom: 20, lineHeight: 22 },
  featureList: { marginBottom: 24, padding: 16, backgroundColor: '#f8f9fa', borderRadius: 8 },
  featureTitle: { fontWeight: 'bold', marginBottom: 8, color: '#333' },
  feature: { marginBottom: 4, color: '#666' },
  checkboxContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginVertical: 10,
    paddingHorizontal: 8
  },
  checkboxText: { flex: 1, marginLeft: 8, lineHeight: 20 },
  actions: { justifyContent: 'center' },
  button: { minWidth: 200 }
});

export default WelcomeScreen;
