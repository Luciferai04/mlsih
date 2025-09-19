import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text, Button, Chip } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { deleteTrip } from '../redux/slices/tripSlice';

const TripDetailScreen = ({ route, navigation }) => {
  const { trip } = route.params;
  const dispatch = useDispatch();

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (startTime, endTime) => {
    const duration = Math.floor((endTime - startTime) / 60000);
    return `${duration} minutes`;
  };

  const handleDeleteTrip = () => {
    dispatch(deleteTrip(trip.id));
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Trip Overview" />
        <Card.Content>
          <View style={styles.row}>
            <Text style={styles.label}>Duration:</Text>
            <Text>{formatDuration(trip.startTime, trip.endTime)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Distance:</Text>
            <Text>{trip.distance ? `${trip.distance.toFixed(2)} km` : 'N/A'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Locations Captured:</Text>
            <Text>{trip.locations?.length || 0}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Location Details" />
        <Card.Content>
          <View style={styles.locationContainer}>
            <Text style={styles.locationTitle}>Start Location</Text>
            <Text>Lat: {trip.startLocation?.latitude?.toFixed(6)}</Text>
            <Text>Lng: {trip.startLocation?.longitude?.toFixed(6)}</Text>
          </View>

          <View style={styles.locationContainer}>
            <Text style={styles.locationTitle}>End Location</Text>
            <Text>Lat: {trip.endLocation?.latitude?.toFixed(6)}</Text>
            <Text>Lng: {trip.endLocation?.longitude?.toFixed(6)}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Actions" />
        <Card.Content>
          <Button
            mode="contained"
            onPress={handleDeleteTrip}
            style={styles.deleteButton}
            icon="delete"
          >
            Delete Trip
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { margin: 16, marginBottom: 8 },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginVertical: 8 
  },
  label: { fontWeight: 'bold', flex: 1 },
  locationContainer: { marginVertical: 12 },
  locationTitle: { fontWeight: 'bold', marginBottom: 4 },
  deleteButton: { backgroundColor: '#f44336' }
});

export default TripDetailScreen;