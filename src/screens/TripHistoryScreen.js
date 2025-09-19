import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Text, FAB, Searchbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import TripCard from '../components/trip/TripCard';
import { loadTripsFromStorage } from '../redux/slices/tripSlice';
import { useFocusEffect } from '@react-navigation/native';

const TripHistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { trips } = useSelector(state => state.trips);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadTrips();
    }, [])
  );

  useEffect(() => {
    filterTrips();
  }, [trips, searchQuery]);

  const loadTrips = async () => {
    await dispatch(loadTripsFromStorage());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  };

  const filterTrips = () => {
    if (!searchQuery.trim()) {
      setFilteredTrips(trips);
      return;
    }

    const filtered = trips.filter(trip => 
      trip.predictedMode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      new Date(trip.startTime).toDateString().toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTrips(filtered);
  };

  const renderTripItem = ({ item }) => (
    <TripCard 
      trip={item} 
      onPress={() => navigation.navigate('TripDetail', { trip: item })}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No trips recorded yet</Text>
      <Text style={styles.emptySubtitle}>
        Start tracking your trips from the Home screen
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search trips..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      {filteredTrips.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredTrips}
          renderItem={renderTripItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <Text style={styles.statsText}>
        Total trips: {trips.length}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchbar: { margin: 16, marginBottom: 8 },
  list: { flex: 1, paddingHorizontal: 16 },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 32
  },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 8,
    textAlign: 'center'
  },
  emptySubtitle: { 
    fontSize: 14, 
    color: '#666',
    textAlign: 'center'
  },
  statsText: {
    padding: 16,
    textAlign: 'center',
    color: '#666',
    backgroundColor: '#fff'
  }
});

export default TripHistoryScreen;