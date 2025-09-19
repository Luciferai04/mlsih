import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Surface,
  Text,
  Card,
  Chip,
  FAB,
  useTheme,
  SegmentedButtons,
  IconButton,
  Menu,
  Divider,
  Badge,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { TripContext } from '../../context/TripContext';

interface Trip {
  id: string;
  origin: {
    name: string;
    coordinates: { latitude: number; longitude: number };
  };
  destination?: {
    name: string;
    coordinates: { latitude: number; longitude: number };
  };
  transportMode: string;
  purpose: string;
  startTime: string;
  endTime?: string;
  distance: number;
  duration: number;
  status: 'completed' | 'active' | 'paused' | 'cancelled';
  companions?: any[];
}

const TripListScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { trips, activeTrip } = useContext(TripContext);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);

  useEffect(() => {
    filterAndSortTrips();
  }, [trips, filter, sortBy]);

  const filterAndSortTrips = () => {
    let filtered = [...(trips || [])];

    // Apply filter
    switch (filter) {
      case 'completed':
        filtered = filtered.filter(trip => trip.status === 'completed');
        break;
      case 'active':
        filtered = filtered.filter(trip => trip.status === 'active' || trip.status === 'paused');
        break;
      case 'today':
        const today = new Date().toDateString();
        filtered = filtered.filter(trip => 
          new Date(trip.startTime).toDateString() === today
        );
        break;
    }

    // Apply sort
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        break;
      case 'distance':
        filtered.sort((a, b) => b.distance - a.distance);
        break;
      case 'duration':
        filtered.sort((a, b) => b.duration - a.duration);
        break;
    }

    setFilteredTrips(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Refresh trips from API
    setTimeout(() => setRefreshing(false), 1500);
  };

  const getTransportIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'car':
        return 'car';
      case 'bus':
        return 'bus';
      case 'train':
        return 'train';
      case 'auto':
        return 'rickshaw';
      case 'bike':
        return 'bike';
      case 'walk':
        return 'walk';
      default:
        return 'car';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.colors.success || '#4CAF50';
      case 'active':
        return theme.colors.primary;
      case 'paused':
        return theme.colors.warning || '#FFA500';
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const renderTripCard = ({ item }: { item: Trip }) => (
    <Card 
      style={styles.tripCard}
      onPress={() => navigation.navigate('TripDetails', { tripId: item.id })}
    >
      <Card.Content>
        <View style={styles.tripHeader}>
          <View style={styles.tripRoute}>
            <Icon 
              name={getTransportIcon(item.transportMode)} 
              size={24} 
              color={theme.colors.primary} 
            />
            <View style={styles.routeDetails}>
              <Text style={styles.routeText}>{item.origin.name}</Text>
              <Icon name="arrow-down" size={16} color={theme.colors.outline} />
              <Text style={styles.routeText}>
                {item.destination?.name || 'In Progress'}
              </Text>
            </View>
          </View>
          <Chip 
            style={[
              styles.statusChip,
              { backgroundColor: getStatusColor(item.status) + '20' }
            ]}
            textStyle={{ color: getStatusColor(item.status), fontSize: 10 }}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>

        <View style={styles.tripInfo}>
          <View style={styles.infoItem}>
            <Icon name="calendar" size={16} color={theme.colors.outline} />
            <Text style={styles.infoText}>
              {format(new Date(item.startTime), 'dd MMM yyyy')}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="clock-outline" size={16} color={theme.colors.outline} />
            <Text style={styles.infoText}>
              {formatDuration(item.duration)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="map-marker-distance" size={16} color={theme.colors.outline} />
            <Text style={styles.infoText}>
              {item.distance.toFixed(1)} km
            </Text>
          </View>
        </View>

        <View style={styles.tripFooter}>
          <Chip style={styles.purposeChip} textStyle={styles.purposeChipText}>
            {item.purpose}
          </Chip>
          {item.companions && item.companions.length > 0 && (
            <View style={styles.companionsInfo}>
              <Icon name="account-multiple" size={16} color={theme.colors.outline} />
              <Text style={styles.companionsText}>+{item.companions.length}</Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const ListHeader = () => (
    <>
      {/* Active Trip Banner */}
      {activeTrip && (
        <TouchableOpacity 
          onPress={() => navigation.navigate('Tracking')}
          style={styles.activeTripBanner}
        >
          <Card style={styles.activeTripCard}>
            <Card.Content style={styles.activeTripContent}>
              <Icon name="navigation" size={24} color="white" />
              <Text style={styles.activeTripText}>Active trip in progress</Text>
              <Icon name="chevron-right" size={24} color="white" />
            </Card.Content>
          </Card>
        </TouchableOpacity>
      )}

      {/* Filters */}
      <View style={styles.filters}>
        <SegmentedButtons
          value={filter}
          onValueChange={setFilter}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'today', label: 'Today' },
            { value: 'completed', label: 'Completed' },
            { value: 'active', label: 'Active' },
          ]}
          style={styles.filterButtons}
        />

        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity 
                onPress={() => setMenuVisible(true)}
                style={styles.sortButton}
              >
                <Text style={styles.sortText}>
                  {sortBy === 'recent' ? 'Recent' : sortBy === 'distance' ? 'Distance' : 'Duration'}
                </Text>
                <Icon name="menu-down" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            }
          >
            <Menu.Item 
              onPress={() => { setSortBy('recent'); setMenuVisible(false); }} 
              title="Recent" 
            />
            <Menu.Item 
              onPress={() => { setSortBy('distance'); setMenuVisible(false); }} 
              title="Distance" 
            />
            <Menu.Item 
              onPress={() => { setSortBy('duration'); setMenuVisible(false); }} 
              title="Duration" 
            />
          </Menu>
        </View>
      </View>

      {/* Summary Stats */}
      <Surface style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{filteredTrips.length}</Text>
          <Text style={styles.summaryLabel}>Trips</Text>
        </View>
        <Divider style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {filteredTrips.reduce((sum, trip) => sum + trip.distance, 0).toFixed(0)}
          </Text>
          <Text style={styles.summaryLabel}>Kilometers</Text>
        </View>
        <Divider style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {Math.floor(filteredTrips.reduce((sum, trip) => sum + trip.duration, 0) / 60)}
          </Text>
          <Text style={styles.summaryLabel}>Hours</Text>
        </View>
      </Surface>
    </>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="map-marker-path" size={64} color={theme.colors.outline} />
      <Text style={styles.emptyTitle}>No trips found</Text>
      <Text style={styles.emptyText}>
        {filter === 'all' 
          ? 'Start tracking your trips to see them here' 
          : `No ${filter} trips to display`}
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Tracking')}
        style={styles.emptyButton}
      >
        Start New Trip
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredTrips}
        renderItem={renderTripCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
      />
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('Tracking')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingBottom: 80,
  },
  activeTripBanner: {
    margin: 16,
    marginBottom: 8,
  },
  activeTripCard: {
    backgroundColor: '#4CAF50',
  },
  activeTripContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeTripText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 12,
  },
  filters: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterButtons: {
    marginBottom: 12,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sortLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  sortText: {
    fontSize: 14,
    color: '#1976d2',
    marginRight: 4,
  },
  summaryCard: {
    flexDirection: 'row',
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: '100%',
    marginHorizontal: 16,
  },
  tripCard: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tripRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  routeDetails: {
    marginLeft: 12,
    flex: 1,
  },
  routeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusChip: {
    height: 24,
  },
  tripInfo: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  purposeChip: {
    backgroundColor: '#E3F2FD',
    height: 24,
  },
  purposeChipText: {
    fontSize: 11,
    color: '#1976d2',
  },
  companionsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  companionsText: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

export default TripListScreen;