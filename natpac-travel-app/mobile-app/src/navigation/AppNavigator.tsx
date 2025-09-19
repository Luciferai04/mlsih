import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';

import { AuthContext } from '../context/AuthContext';

// Auth Screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ConsentScreen from '../screens/auth/ConsentScreen';
import PermissionsScreen from '../screens/auth/PermissionsScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import TripListScreen from '../screens/main/TripListScreen';
import AddTripScreen from '../screens/main/AddTripScreen';
import MapScreen from '../screens/main/MapScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import AnalyticsScreen from '../screens/main/AnalyticsScreen';
import TripDetailsScreen from '../screens/main/TripDetailsScreen';

// Trip Tracking
import TripTrackingScreen from '../screens/tracking/TripTrackingScreen';
import TripReviewScreen from '../screens/tracking/TripReviewScreen';

// Kerala Specific Features
import WeatherAIScreen from '../screens/kerala/WeatherAIScreen';
import SOSEmergencyScreen from '../screens/kerala/SOSEmergencyScreen';
import LocalBusinessScreen from '../screens/kerala/LocalBusinessScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

interface AppNavigatorProps {
  permissionsGranted: boolean;
}

// Auth Stack Navigator
const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Welcome"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Consent" component={ConsentScreen} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const MainTabNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Trips':
              iconName = focused ? 'map-marker-path' : 'map-marker-path';
              break;
            case 'Tracking':
              iconName = focused ? 'crosshairs-gps' : 'crosshairs-gps';
              break;
            case 'Map':
              iconName = focused ? 'map' : 'map-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Trips" 
        component={TripListScreen} 
        options={{ title: 'My Trips' }}
      />
      <Tab.Screen 
        name="Tracking" 
        component={TripTrackingScreen} 
        options={{ title: 'Track Trip' }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen} 
        options={{ title: 'Map View' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Main Stack Navigator (contains tabs and modal screens)
const MainStack: React.FC = () => {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddTrip" 
        component={AddTripScreen} 
        options={{ 
          title: 'Add New Trip',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="TripDetails" 
        component={TripDetailsScreen} 
        options={{ title: 'Trip Details' }}
      />
      <Stack.Screen 
        name="TripReview" 
        component={TripReviewScreen} 
        options={{ title: 'Review Trip' }}
      />
      <Stack.Screen 
        name="Analytics" 
        component={AnalyticsScreen} 
        options={{ title: 'Travel Analytics' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }}
      />
      <Stack.Screen 
        name="WeatherAI" 
        component={WeatherAIScreen} 
        options={{ title: 'Weather & AI Insights' }}
      />
      <Stack.Screen 
        name="SOSEmergency" 
        component={SOSEmergencyScreen} 
        options={{ title: 'Emergency Services' }}
      />
      <Stack.Screen 
        name="LocalBusiness" 
        component={LocalBusinessScreen} 
        options={{ title: 'Local Businesses' }}
      />
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator: React.FC<AppNavigatorProps> = ({ permissionsGranted }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return null; // or a loading screen
  }

  if (!permissionsGranted) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Permissions" component={PermissionsScreen} />
      </Stack.Navigator>
    );
  }

  return isAuthenticated ? <MainStack /> : <AuthStack />;
};

export default AppNavigator;