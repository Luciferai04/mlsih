import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TripCard = ({ trip, onPress }) => {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (startTime, endTime) => {
    const duration = Math.floor((endTime - startTime) / 60000);
    if (duration < 60) return `${duration}m`;
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    return `${hours}h ${mins}m`;
  };

  const getModeIcon = (mode) => {
    switch (mode) {
      case 'walking': return 'directions-walk';
      case 'cycling': return 'directions-bike';
      case 'driving': return 'directions-car';
      case 'public_transport': return 'directions-bus';
      default: return 'help-outline';
    }
  };

  const getModeColor = (mode) => {
    switch (mode) {
      case 'walking': return '#4CAF50';
      case 'cycling': return '#2196F3';
      case 'driving': return '#FF9800';
      case 'public_transport': return '#9C27B0';
      default: return '#757575';
    }
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.modeContainer}>
              <Icon 
                name={getModeIcon(trip.predictedMode)} 
                size={20} 
                color={getModeColor(trip.predictedMode)} 
              />
              <Chip 
                mode="outlined" 
                style={[styles.modeChip, { borderColor: getModeColor(trip.predictedMode) }]}
                textStyle={{ color: getModeColor(trip.predictedMode) }}
              >
                {trip.predictedMode || 'Unknown'}
              </Chip>
            </View>
            <Text style={styles.duration}>
              {formatDuration(trip.startTime, trip.endTime)}
            </Text>
          </View>
          
          <Text style={styles.date}>{formatDate(trip.startTime)}</Text>
          
          <View style={styles.details}>
            <Text style={styles.detailItem}>
              Distance: {trip.distance ? `${trip.distance.toFixed(2)} km` : 'N/A'}
            </Text>
            <Text style={styles.detailItem}>
              Points: {trip.locations?.length || 0}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { marginVertical: 4, elevation: 2 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 8 
  },
  modeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  modeChip: { marginLeft: 8 },
  duration: { fontWeight: 'bold', fontSize: 16 },
  date: { color: '#666', marginBottom: 8 },
  details: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { fontSize: 12, color: '#888' }
});

export default TripCard;