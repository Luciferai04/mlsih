import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TripStatusIndicator = ({ isTracking }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.indicator, isTracking ? styles.active : styles.inactive]}>
        <Icon 
          name={isTracking ? 'location-on' : 'location-off'} 
          size={24} 
          color={isTracking ? '#4CAF50' : '#757575'} 
        />
      </View>
      <Text style={styles.text}>
        {isTracking ? 'Trip in progress...' : 'Ready to track'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 16 },
  indicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  active: {
    backgroundColor: '#E8F5E8',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  inactive: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  text: { fontSize: 16, fontWeight: '500' }
});

export default TripStatusIndicator;