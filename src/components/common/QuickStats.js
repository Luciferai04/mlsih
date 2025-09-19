import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

const QuickStats = () => {
  const trips = useSelector(state => state.trips.trips);

  const getTodayTrips = () => {
    const today = new Date().toDateString();
    return trips.filter(trip => 
      new Date(trip.startTime).toDateString() === today
    ).length;
  };

  const getThisWeekDistance = () => {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return trips
      .filter(trip => trip.startTime >= oneWeekAgo)
      .reduce((total, trip) => total + (trip.distance || 0), 0)
      .toFixed(1);
  };

  const getMostUsedMode = () => {
    const modes = {};
    trips.forEach(trip => {
      const mode = trip.predictedMode || 'unknown';
      modes[mode] = (modes[mode] || 0) + 1;
    });
    
    let maxMode = 'None';
    let maxCount = 0;
    Object.entries(modes).forEach(([mode, count]) => {
      if (count > maxCount) {
        maxMode = mode;
        maxCount = count;
      }
    });
    
    return maxMode;
  };

  return (
    <Card style={styles.card}>
      <Card.Title title="Quick Stats" />
      <Card.Content>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getTodayTrips()}</Text>
            <Text style={styles.statLabel}>Today's Trips</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getThisWeekDistance()}</Text>
            <Text style={styles.statLabel}>Week Distance (km)</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{getMostUsedMode()}</Text>
            <Text style={styles.statLabel}>Favorite Mode</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { marginBottom: 16 },
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around',
    paddingVertical: 8 
  },
  statItem: { alignItems: 'center' },
  statValue: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#2196F3' 
  },
  statLabel: { 
    fontSize: 12, 
    color: '#666', 
    textAlign: 'center',
    marginTop: 4 
  }
});

export default QuickStats;