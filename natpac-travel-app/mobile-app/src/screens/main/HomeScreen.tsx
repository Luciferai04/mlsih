import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Surface,
  Text,
  Card,
  Button,
  Badge,
  useTheme,
  IconButton,
  Chip,
  ProgressBar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../../context/AuthContext';
import { TripContext } from '../../context/TripContext';

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  route?: string;
  onPress?: () => void;
}

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);
  const { activeTrip, trips } = useContext(TripContext);
  const [refreshing, setRefreshing] = useState(false);
  const [weatherData, setWeatherData] = useState({
    temp: 31,
    condition: 'Partly Cloudy',
    location: 'Kochi',
  });

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Start Trip',
      icon: 'play-circle',
      color: theme.colors.primary,
      route: 'Tracking',
    },
    {
      id: '2',
      title: 'Weather',
      icon: 'weather-partly-cloudy',
      color: '#FF9800',
      route: 'WeatherAI',
    },
    {
      id: '3',
      title: 'Emergency',
      icon: 'shield-alert',
      color: theme.colors.error,
      route: 'SOSEmergency',
    },
    {
      id: '4',
      title: 'Local Spots',
      icon: 'store-marker',
      color: '#4CAF50',
      route: 'LocalBusiness',
    },
  ];

  const keralaFeatures = [
    {
      id: '1',
      title: 'Monsoon Alert',
      description: 'Heavy rainfall expected in Idukki district',
      icon: 'weather-pouring',
      color: '#2196F3',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Festival Season',
      description: 'Onam celebrations across Kerala',
      icon: 'party-popper',
      color: '#FFC107',
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Tourist Advisory',
      description: 'Best time to visit hill stations',
      icon: 'information',
      color: '#4CAF50',
      priority: 'low',
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh data here
    setTimeout(() => setRefreshing(false), 1500);
  };

  const getTotalDistance = () => {
    // Calculate total distance from trips
    return '1,234';
  };

  const getTotalTrips = () => {
    return trips?.length || 0;
  };

  const getThisMonthTrips = () => {
    // Calculate trips this month
    return 12;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Header */}
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Namaskaram!</Text>
            <Text style={styles.userName}>{user?.name || 'Traveler'}</Text>
            <Text style={styles.subtitle}>Welcome to God's Own Country</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Surface style={styles.avatarContainer} elevation={2}>
              <Icon name="account" size={32} color={theme.colors.primary} />
            </Surface>
          </TouchableOpacity>
        </View>

        {/* Weather Widget */}
        <TouchableOpacity onPress={() => navigation.navigate('WeatherAI')}>
          <Card style={styles.weatherWidget}>
            <Card.Content style={styles.weatherContent}>
              <Icon name="weather-partly-cloudy" size={32} color="#FF9800" />
              <View style={styles.weatherInfo}>
                <Text style={styles.weatherTemp}>{weatherData.temp}°C</Text>
                <Text style={styles.weatherCondition}>{weatherData.condition}</Text>
              </View>
              <Text style={styles.weatherLocation}>{weatherData.location}</Text>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Surface>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              onPress={() => action.route && navigation.navigate(action.route)}
              style={styles.quickActionWrapper}
            >
              <Surface style={styles.quickAction} elevation={1}>
                <Icon name={action.icon} size={32} color={action.color} />
                <Text style={styles.quickActionText}>{action.title}</Text>
              </Surface>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Active Trip Card */}
      {activeTrip && (
        <Card style={styles.activeTripCard}>
          <Card.Content>
            <View style={styles.activeTripHeader}>
              <Text style={styles.activeTripTitle}>Active Trip</Text>
              <Badge style={styles.activeBadge}>LIVE</Badge>
            </View>
            <View style={styles.activeTripInfo}>
              <View style={styles.activeTripItem}>
                <Icon name="clock-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.activeTripText}>2h 15m</Text>
              </View>
              <View style={styles.activeTripItem}>
                <Icon name="map-marker-distance" size={20} color={theme.colors.primary} />
                <Text style={styles.activeTripText}>45.2 km</Text>
              </View>
              <View style={styles.activeTripItem}>
                <Icon name="car" size={20} color={theme.colors.primary} />
                <Text style={styles.activeTripText}>Car</Text>
              </View>
            </View>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('Tracking')}
              style={styles.viewTripButton}
            >
              View Trip
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Travel Stats</Text>
        <View style={styles.statsGrid}>
          <Surface style={styles.statCard} elevation={1}>
            <Icon name="map-marker-path" size={24} color={theme.colors.primary} />
            <Text style={styles.statValue}>{getTotalTrips()}</Text>
            <Text style={styles.statLabel}>Total Trips</Text>
          </Surface>
          <Surface style={styles.statCard} elevation={1}>
            <Icon name="road-variant" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{getTotalDistance()}</Text>
            <Text style={styles.statLabel}>Kilometers</Text>
          </Surface>
          <Surface style={styles.statCard} elevation={1}>
            <Icon name="calendar-check" size={24} color="#FF9800" />
            <Text style={styles.statValue}>{getThisMonthTrips()}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </Surface>
        </View>
      </View>

      {/* Kerala Insights */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kerala Insights</Text>
          <IconButton 
            icon="arrow-right" 
            size={20} 
            onPress={() => navigation.navigate('WeatherAI')}
          />
        </View>
        {keralaFeatures.map((feature) => (
          <Card key={feature.id} style={styles.insightCard}>
            <Card.Content style={styles.insightContent}>
              <View style={styles.insightIcon}>
                <Icon name={feature.icon} size={24} color={feature.color} />
              </View>
              <View style={styles.insightInfo}>
                <Text style={styles.insightTitle}>{feature.title}</Text>
                <Text style={styles.insightDescription}>{feature.description}</Text>
              </View>
              <Chip 
                style={[
                  styles.priorityChip,
                  { backgroundColor: feature.color + '20' }
                ]}
                textStyle={{ color: feature.color, fontSize: 10 }}
              >
                {feature.priority.toUpperCase()}
              </Chip>
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* Emergency Button */}
      <TouchableOpacity
        style={styles.emergencyButton}
        onPress={() => navigation.navigate('SOSEmergency')}
      >
        <Surface style={styles.emergencyButtonSurface} elevation={3}>
          <Icon name="shield-alert" size={24} color="white" />
          <Text style={styles.emergencyButtonText}>Emergency Services</Text>
        </Surface>
      </TouchableOpacity>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1976d2',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weatherWidget: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginTop: 10,
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weatherInfo: {
    flex: 1,
    marginLeft: 12,
  },
  weatherTemp: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  weatherCondition: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  weatherLocation: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  quickActionWrapper: {
    width: '25%',
    padding: 5,
  },
  quickAction: {
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  quickActionText: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  activeTripCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#E3F2FD',
  },
  activeTripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeTripTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
  },
  activeTripInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  activeTripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeTripText: {
    fontSize: 14,
  },
  viewTripButton: {
    borderRadius: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    marginHorizontal: -5,
  },
  statCard: {
    flex: 1,
    margin: 5,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  insightCard: {
    marginBottom: 8,
    backgroundColor: 'white',
  },
  insightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightInfo: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  insightDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  priorityChip: {
    height: 20,
  },
  emergencyButton: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  emergencyButtonSurface: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default HomeScreen;