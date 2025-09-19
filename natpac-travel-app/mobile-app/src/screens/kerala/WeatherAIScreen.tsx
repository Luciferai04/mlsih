import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Surface,
  Text,
  Card,
  Chip,
  Button,
  ActivityIndicator,
  Divider,
  List,
  Badge,
  useTheme,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  uvIndex: number;
  rainfall: number;
}

interface Forecast {
  day: string;
  high: number;
  low: number;
  condition: string;
  rainChance: number;
}

interface AIRecommendation {
  id: number;
  type: 'travel' | 'activity' | 'transport' | 'cultural';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  validUntil: string;
  confidence: number;
}

const WeatherAIScreen: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<Forecast[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('Kochi');

  useEffect(() => {
    fetchWeatherData();
  }, [selectedLocation]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      setWeatherData({
        location: `${selectedLocation}, Kerala`,
        temperature: 31,
        condition: 'Partly Cloudy',
        humidity: 78,
        windSpeed: 12,
        visibility: 8,
        uvIndex: 7,
        rainfall: 0,
      });

      setForecast([
        { day: 'Today', high: 31, low: 24, condition: 'Partly Cloudy', rainChance: 20 },
        { day: 'Tomorrow', high: 29, low: 23, condition: 'Light Rain', rainChance: 80 },
        { day: 'Wed', high: 28, low: 22, condition: 'Heavy Rain', rainChance: 95 },
        { day: 'Thu', high: 30, low: 24, condition: 'Cloudy', rainChance: 40 },
        { day: 'Fri', high: 32, low: 25, condition: 'Sunny', rainChance: 10 },
        { day: 'Sat', high: 33, low: 26, condition: 'Sunny', rainChance: 5 },
        { day: 'Sun', high: 31, low: 25, condition: 'Partly Cloudy', rainChance: 30 },
      ]);

      setRecommendations([
        {
          id: 1,
          type: 'travel',
          priority: 'high',
          title: 'Perfect Beach Weather This Weekend',
          description: 'Sunny conditions with low humidity make it ideal for visiting Kovalam and Varkala beaches.',
          action: 'Plan Beach Trip',
          validUntil: 'This Weekend',
          confidence: 92,
        },
        {
          id: 2,
          type: 'activity',
          priority: 'medium',
          title: 'Monsoon Photography Opportunity',
          description: 'Heavy rains expected in Idukki - perfect for capturing dramatic waterfall shots at Athirapally.',
          action: 'Photography Tour',
          validUntil: 'Next 3 Days',
          confidence: 88,
        },
        {
          id: 3,
          type: 'transport',
          priority: 'high',
          title: 'Avoid Hill Stations Tomorrow',
          description: 'Heavy rainfall predicted in Munnar and Wayanad. Consider postponing hill station visits.',
          action: 'Reschedule Trip',
          validUntil: 'Tomorrow',
          confidence: 95,
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch weather data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWeatherData();
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return 'weather-sunny';
      case 'partly cloudy':
        return 'weather-partly-cloudy';
      case 'cloudy':
        return 'weather-cloudy';
      case 'light rain':
        return 'weather-rainy';
      case 'heavy rain':
        return 'weather-pouring';
      default:
        return 'weather-partly-cloudy';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning || '#FFA500';
      case 'low':
        return theme.colors.success || '#4CAF50';
      default:
        return theme.colors.outline;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'travel':
        return 'airplane';
      case 'activity':
        return 'camera';
      case 'transport':
        return 'bus';
      case 'cultural':
        return 'temple-buddhist';
      default:
        return 'information';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading weather data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {weatherData && (
        <>
          {/* Current Weather Card */}
          <Card style={styles.weatherCard}>
            <Card.Title
              title="Current Weather"
              subtitle={weatherData.location}
              left={(props) => <Icon {...props} name="thermometer" />}
            />
            <Card.Content>
              <View style={styles.currentWeather}>
                <Icon 
                  name={getWeatherIcon(weatherData.condition)} 
                  size={64} 
                  color={theme.colors.primary} 
                />
                <View style={styles.tempContainer}>
                  <Text style={styles.temperature}>{weatherData.temperature}°C</Text>
                  <Text style={styles.condition}>{weatherData.condition}</Text>
                </View>
              </View>
              
              <View style={styles.weatherDetails}>
                <View style={styles.detailItem}>
                  <Icon name="water-percent" size={20} color={theme.colors.primary} />
                  <Text style={styles.detailText}>Humidity: {weatherData.humidity}%</Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="weather-windy" size={20} color={theme.colors.primary} />
                  <Text style={styles.detailText}>Wind: {weatherData.windSpeed} km/h</Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="eye" size={20} color={theme.colors.primary} />
                  <Text style={styles.detailText}>Visibility: {weatherData.visibility} km</Text>
                </View>
                <View style={styles.detailItem}>
                  <Icon name="weather-sunny-alert" size={20} color={theme.colors.primary} />
                  <Text style={styles.detailText}>UV Index: {weatherData.uvIndex}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* 7-Day Forecast */}
          <Card style={styles.forecastCard}>
            <Card.Title
              title="7-Day Forecast"
              left={(props) => <Icon {...props} name="calendar-week" />}
            />
            <Card.Content>
              {forecast.map((day, index) => (
                <View key={index}>
                  <View style={styles.forecastItem}>
                    <Text style={styles.forecastDay}>{day.day}</Text>
                    <View style={styles.forecastWeather}>
                      <Icon 
                        name={getWeatherIcon(day.condition)} 
                        size={24} 
                        color={theme.colors.primary} 
                      />
                      <View style={styles.tempRange}>
                        <Text style={styles.highTemp}>{day.high}°</Text>
                        <Text style={styles.lowTemp}>{day.low}°</Text>
                      </View>
                      <Chip 
                        icon="water" 
                        style={styles.rainChip}
                        textStyle={styles.rainChipText}
                      >
                        {day.rainChance}%
                      </Chip>
                    </View>
                  </View>
                  {index < forecast.length - 1 && <Divider />}
                </View>
              ))}
            </Card.Content>
          </Card>

          {/* AI Recommendations */}
          <Card style={styles.recommendationsCard}>
            <Card.Title
              title="AI Travel Recommendations"
              subtitle="Smart insights based on weather patterns"
              left={(props) => <Icon {...props} name="robot" />}
            />
            <Card.Content>
              {recommendations.map((rec) => (
                <Surface key={rec.id} style={styles.recommendationItem}>
                  <View style={styles.recommendationHeader}>
                    <View style={styles.recommendationTitle}>
                      <Icon 
                        name={getTypeIcon(rec.type)} 
                        size={20} 
                        color={theme.colors.primary} 
                      />
                      <Text style={styles.recommendationTitleText}>{rec.title}</Text>
                    </View>
                    <Badge 
                      style={[
                        styles.priorityBadge, 
                        { backgroundColor: getPriorityColor(rec.priority) }
                      ]}
                    >
                      {rec.priority.toUpperCase()}
                    </Badge>
                  </View>
                  
                  <Text style={styles.recommendationDescription}>{rec.description}</Text>
                  
                  <View style={styles.recommendationFooter}>
                    <Chip icon="clock-outline" style={styles.validityChip}>
                      {rec.validUntil}
                    </Chip>
                    <Text style={styles.confidenceText}>
                      {rec.confidence}% confidence
                    </Text>
                  </View>
                  
                  <Button 
                    mode="contained" 
                    style={styles.actionButton}
                    onPress={() => Alert.alert('Action', `${rec.action} clicked`)}
                  >
                    {rec.action}
                  </Button>
                </Surface>
              ))}
            </Card.Content>
          </Card>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  weatherCard: {
    margin: 16,
    marginBottom: 8,
  },
  currentWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  tempContainer: {
    marginLeft: 20,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  condition: {
    fontSize: 18,
    color: '#666',
  },
  weatherDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginVertical: 5,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
  },
  forecastCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  forecastItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  forecastDay: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  forecastWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tempRange: {
    flexDirection: 'row',
    gap: 5,
  },
  highTemp: {
    fontSize: 16,
    fontWeight: '600',
  },
  lowTemp: {
    fontSize: 16,
    color: '#666',
  },
  rainChip: {
    backgroundColor: '#E3F2FD',
  },
  rainChipText: {
    fontSize: 12,
  },
  recommendationsCard: {
    margin: 16,
    marginTop: 8,
  },
  recommendationItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recommendationTitleText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  recommendationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  validityChip: {
    backgroundColor: '#F5F5F5',
  },
  confidenceText: {
    fontSize: 12,
    color: '#666',
  },
  actionButton: {
    marginTop: 4,
  },
});

export default WeatherAIScreen;