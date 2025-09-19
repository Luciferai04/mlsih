import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  RefreshControl
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  ProgressBar,
  Chip,
  DataTable,
  List,
  Divider,
  IconButton,
  Surface,
  useTheme
} from 'react-native-paper';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from 'react-native-chart-kit';
import MapView, { Polyline, Heatmap, Marker, Circle } from 'react-native-maps';
import { useSelector } from 'react-redux';
import gpsAnalyticsService from '../services/gpsAnalyticsService';

const screenWidth = Dimensions.get('window').width;

const GPSAnalyticsScreen = ({ navigation }) => {
  const theme = useTheme();
  const currentTrip = useSelector(state => state.trips.currentTrip);
  
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGraph, setSelectedGraph] = useState('speed');
  const [realTimeData, setRealTimeData] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 9.9312,
    longitude: 76.2673,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1
  });

  useEffect(() => {
    initializeAnalytics();
    
    // Set up real-time listener
    gpsAnalyticsService.addListener(handleGPSEvent);
    
    return () => {
      gpsAnalyticsService.removeListener(handleGPSEvent);
    };
  }, []);

  const initializeAnalytics = async () => {
    try {
      setLoading(true);
      await gpsAnalyticsService.initialize();
      
      // Generate analytics for current trip if available
      if (currentTrip && currentTrip.locations) {
        const tripAnalytics = await gpsAnalyticsService.generateTravelAnalytics(
          currentTrip.locations
        );
        setAnalytics(tripAnalytics);
        
        // Update map region to show trip
        if (currentTrip.locations.length > 0) {
          const firstLocation = currentTrip.locations[0];
          setMapRegion({
            latitude: firstLocation.latitude,
            longitude: firstLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05
          });
        }
      }
    } catch (error) {
      console.error('Failed to initialize GPS analytics:', error);
      Alert.alert('Error', 'Failed to load GPS analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleGPSEvent = (event, data) => {
    if (event === 'analytics_updated') {
      setRealTimeData(data);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeAnalytics();
    setRefreshing(false);
  };

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.primary,
    backgroundGradientTo: theme.colors.primaryContainer,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary
    }
  };

  const renderSpeedGraph = () => {
    if (!analytics?.graphs?.speedGraph?.data || analytics.graphs.speedGraph.data.length === 0) {
      return <Text style={styles.noDataText}>No speed data available</Text>;
    }

    const data = analytics.graphs.speedGraph.data.slice(-20); // Last 20 points
    const chartData = {
      labels: data.map((_, i) => i % 5 === 0 ? `${i}` : ''),
      datasets: [{
        data: data.map(d => d.y),
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2
      }]
    };

    return (
      <View>
        <Title style={styles.graphTitle}>Speed Profile</Title>
        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          yAxisSuffix=" km/h"
          withInnerLines={false}
          withOuterLines={true}
          withHorizontalLabels={true}
          withVerticalLabels={true}
        />
      </View>
    );
  };

  const renderDistanceGraph = () => {
    if (!analytics?.graphs?.distanceGraph?.data || analytics.graphs.distanceGraph.data.length === 0) {
      return <Text style={styles.noDataText}>No distance data available</Text>;
    }

    const data = analytics.graphs.distanceGraph.data.slice(-20);
    const chartData = {
      labels: data.map((_, i) => i % 5 === 0 ? `${i}` : ''),
      datasets: [{
        data: data.map(d => d.y),
        color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
        strokeWidth: 2
      }]
    };

    return (
      <View>
        <Title style={styles.graphTitle}>Distance Accumulation</Title>
        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            ...chartConfig,
            backgroundGradientFrom: '#2e7d32',
            backgroundGradientTo: '#66bb6a'
          }}
          style={styles.chart}
          yAxisSuffix=" km"
          withInnerLines={false}
        />
      </View>
    );
  };

  const renderSpeedZonesChart = () => {
    if (!analytics?.graphs?.speedZonesChart?.data) {
      return <Text style={styles.noDataText}>No speed zone data available</Text>;
    }

    const data = analytics.graphs.speedZonesChart.data.filter(d => d.value > 0);
    
    return (
      <View>
        <Title style={styles.graphTitle}>Speed Distribution</Title>
        <PieChart
          data={data}
          width={screenWidth - 32}
          height={220}
          chartConfig={chartConfig}
          accessor="value"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
        <View style={styles.legendContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.name}: {item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderElevationGraph = () => {
    if (!analytics?.graphs?.elevationGraph?.data || analytics.graphs.elevationGraph.data.length === 0) {
      return <Text style={styles.noDataText}>No elevation data available</Text>;
    }

    const data = analytics.graphs.elevationGraph.data.slice(-30);
    const chartData = {
      labels: data.map((_, i) => i % 10 === 0 ? `${(i * 0.5).toFixed(1)}` : ''),
      datasets: [{
        data: data.map(d => d.y),
        color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
        strokeWidth: 2
      }]
    };

    return (
      <View>
        <Title style={styles.graphTitle}>Elevation Profile</Title>
        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          chartConfig={{
            ...chartConfig,
            backgroundGradientFrom: '#ff6f00',
            backgroundGradientTo: '#ffab00'
          }}
          style={styles.chart}
          yAxisSuffix=" m"
          withInnerLines={false}
          bezier
        />
      </View>
    );
  };

  const renderEfficiencyMetrics = () => {
    if (!analytics?.efficiency) return null;

    const efficiencyData = {
      labels: ['Route', 'Speed', 'Eco'],
      data: [
        analytics.efficiency.routeOptimality / 100,
        analytics.efficiency.speedEfficiency / 100,
        analytics.efficiency.ecoScore / 100
      ]
    };

    return (
      <Card style={styles.metricsCard}>
        <Card.Title title="Efficiency Metrics" />
        <Card.Content>
          <ProgressChart
            data={efficiencyData}
            width={screenWidth - 64}
            height={180}
            strokeWidth={16}
            radius={32}
            chartConfig={{
              ...chartConfig,
              backgroundGradientFrom: '#1976d2',
              backgroundGradientTo: '#42a5f5'
            }}
            hideLegend={false}
          />
          <View style={styles.efficiencyDetails}>
            {analytics.efficiency.suggestions.map((suggestion, index) => (
              <Chip
                key={index}
                icon="lightbulb"
                style={styles.suggestionChip}
              >
                {suggestion}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderStatsTable = () => {
    if (!analytics) return null;

    return (
      <Card style={styles.statsCard}>
        <Card.Title title="Trip Statistics" />
        <Card.Content>
          <DataTable>
            <DataTable.Row>
              <DataTable.Cell>Total Distance</DataTable.Cell>
              <DataTable.Cell numeric>
                {analytics.distance.total.toFixed(2)} km
              </DataTable.Cell>
            </DataTable.Row>
            
            <DataTable.Row>
              <DataTable.Cell>Average Speed</DataTable.Cell>
              <DataTable.Cell numeric>
                {analytics.speed.average.toFixed(1)} km/h
              </DataTable.Cell>
            </DataTable.Row>
            
            <DataTable.Row>
              <DataTable.Cell>Max Speed</DataTable.Cell>
              <DataTable.Cell numeric>
                {analytics.speed.maximum.toFixed(1)} km/h
              </DataTable.Cell>
            </DataTable.Row>
            
            <DataTable.Row>
              <DataTable.Cell>Duration</DataTable.Cell>
              <DataTable.Cell numeric>
                {Math.floor(analytics.time.totalDuration / 60000)} min
              </DataTable.Cell>
            </DataTable.Row>
            
            <DataTable.Row>
              <DataTable.Cell>Stops</DataTable.Cell>
              <DataTable.Cell numeric>
                {analytics.stops.count}
              </DataTable.Cell>
            </DataTable.Row>
            
            <DataTable.Row>
              <DataTable.Cell>Moving Time</DataTable.Cell>
              <DataTable.Cell numeric>
                {analytics.time.movingPercentage.toFixed(1)}%
              </DataTable.Cell>
            </DataTable.Row>
          </DataTable>
        </Card.Content>
      </Card>
    );
  };

  const renderAdvancedMetrics = () => {
    if (!analytics?.advanced) return null;

    return (
      <Card style={styles.advancedCard}>
        <Card.Title 
          title="Advanced Metrics" 
          subtitle="Route complexity and patterns"
        />
        <Card.Content>
          <List.Section>
            <List.Item
              title="Route Sinuosity"
              description="Measure of route curviness"
              right={() => <Text style={styles.metricValue}>
                {analytics.advanced.sinuosity.toFixed(2)}
              </Text>}
            />
            <List.Item
              title="Movement Entropy"
              description="Randomness in movement"
              right={() => <Text style={styles.metricValue}>
                {analytics.advanced.movementEntropy.toFixed(2)}
              </Text>}
            />
            <List.Item
              title="Route Predictability"
              description="Pattern consistency"
              right={() => <Text style={styles.metricValue}>
                {(analytics.advanced.predictability * 100).toFixed(0)}%
              </Text>}
            />
            <List.Item
              title="GPS Accuracy"
              description="Average positioning accuracy"
              right={() => <Text style={styles.metricValue}>
                ±{analytics.advanced.averageAccuracy.toFixed(1)}m
              </Text>}
            />
          </List.Section>
        </Card.Content>
      </Card>
    );
  };

  const renderRealTimeCard = () => {
    if (!realTimeData) return null;

    return (
      <Card style={styles.realTimeCard}>
        <Card.Title 
          title="Real-Time GPS Data" 
          left={() => <IconButton icon="satellite-variant" size={24} />}
        />
        <Card.Content>
          <View style={styles.realTimeGrid}>
            <Surface style={styles.realTimeItem}>
              <Text style={styles.realTimeLabel}>Speed</Text>
              <Text style={styles.realTimeValue}>
                {realTimeData.currentSpeed.toFixed(1)} km/h
              </Text>
            </Surface>
            
            <Surface style={styles.realTimeItem}>
              <Text style={styles.realTimeLabel}>Altitude</Text>
              <Text style={styles.realTimeValue}>
                {realTimeData.currentAltitude?.toFixed(0) || '---'} m
              </Text>
            </Surface>
            
            <Surface style={styles.realTimeItem}>
              <Text style={styles.realTimeLabel}>Accuracy</Text>
              <Text style={styles.realTimeValue}>
                ±{realTimeData.currentAccuracy?.toFixed(0) || '---'} m
              </Text>
            </Surface>
            
            <Surface style={styles.realTimeItem}>
              <Text style={styles.realTimeLabel}>Satellites</Text>
              <Text style={styles.realTimeValue}>
                {realTimeData.satellites || '---'}
              </Text>
            </Surface>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderMap = () => {
    if (!currentTrip?.locations || currentTrip.locations.length === 0) return null;

    const coordinates = currentTrip.locations.map(loc => ({
      latitude: loc.latitude,
      longitude: loc.longitude
    }));

    return (
      <Card style={styles.mapCard}>
        <Card.Title title="Route Map" />
        <Card.Content>
          <MapView
            style={styles.map}
            region={mapRegion}
            onRegionChangeComplete={setMapRegion}
          >
            <Polyline
              coordinates={coordinates}
              strokeColor={theme.colors.primary}
              strokeWidth={3}
            />
            
            {/* Start marker */}
            <Marker
              coordinate={coordinates[0]}
              title="Start"
              pinColor="green"
            />
            
            {/* End marker */}
            <Marker
              coordinate={coordinates[coordinates.length - 1]}
              title="End"
              pinColor="red"
            />
            
            {/* Stop markers */}
            {analytics?.stops?.stops.map((stop, index) => (
              <Circle
                key={index}
                center={stop.location}
                radius={50}
                fillColor="rgba(255, 152, 0, 0.3)"
                strokeColor="rgba(255, 152, 0, 0.8)"
              />
            ))}
          </MapView>
        </Card.Content>
      </Card>
    );
  };

  const renderGraphSelector = () => {
    return (
      <View style={styles.graphSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip
            selected={selectedGraph === 'speed'}
            onPress={() => setSelectedGraph('speed')}
            style={styles.selectorChip}
          >
            Speed
          </Chip>
          <Chip
            selected={selectedGraph === 'distance'}
            onPress={() => setSelectedGraph('distance')}
            style={styles.selectorChip}
          >
            Distance
          </Chip>
          <Chip
            selected={selectedGraph === 'zones'}
            onPress={() => setSelectedGraph('zones')}
            style={styles.selectorChip}
          >
            Speed Zones
          </Chip>
          <Chip
            selected={selectedGraph === 'elevation'}
            onPress={() => setSelectedGraph('elevation')}
            style={styles.selectorChip}
          >
            Elevation
          </Chip>
        </ScrollView>
      </View>
    );
  };

  const renderSelectedGraph = () => {
    switch (selectedGraph) {
      case 'speed':
        return renderSpeedGraph();
      case 'distance':
        return renderDistanceGraph();
      case 'zones':
        return renderSpeedZonesChart();
      case 'elevation':
        return renderElevationGraph();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ProgressBar indeterminate />
        <Text style={styles.loadingText}>Loading GPS analytics...</Text>
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
      {/* Real-time GPS data */}
      {renderRealTimeCard()}
      
      {/* Graph selector and display */}
      <Card style={styles.graphCard}>
        <Card.Content>
          {renderGraphSelector()}
          {renderSelectedGraph()}
        </Card.Content>
      </Card>
      
      {/* Statistics table */}
      {renderStatsTable()}
      
      {/* Efficiency metrics */}
      {renderEfficiencyMetrics()}
      
      {/* Advanced metrics */}
      {renderAdvancedMetrics()}
      
      {/* Route map */}
      {renderMap()}
      
      {/* Export button */}
      <Button
        mode="contained"
        onPress={() => {
          const report = gpsAnalyticsService.generateAnalyticsReport(analytics);
          Alert.alert('Analytics Report', JSON.stringify(report.summary, null, 2));
        }}
        style={styles.exportButton}
        icon="export"
      >
        Export Analytics Report
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16
  },
  realTimeCard: {
    margin: 16,
    elevation: 4
  },
  realTimeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  realTimeItem: {
    width: '48%',
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    alignItems: 'center'
  },
  realTimeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  realTimeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  graphCard: {
    margin: 16,
    elevation: 4
  },
  graphSelector: {
    marginBottom: 16
  },
  selectorChip: {
    marginRight: 8
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center'
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  noDataText: {
    textAlign: 'center',
    padding: 20,
    color: '#666'
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4
  },
  legendText: {
    fontSize: 12,
    color: '#666'
  },
  statsCard: {
    margin: 16,
    elevation: 4
  },
  metricsCard: {
    margin: 16,
    elevation: 4
  },
  efficiencyDetails: {
    marginTop: 16
  },
  suggestionChip: {
    marginTop: 8,
    alignSelf: 'flex-start'
  },
  advancedCard: {
    margin: 16,
    elevation: 4
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2'
  },
  mapCard: {
    margin: 16,
    elevation: 4
  },
  map: {
    height: 300,
    borderRadius: 8
  },
  exportButton: {
    margin: 16,
    marginBottom: 32
  }
});

export default GPSAnalyticsScreen;