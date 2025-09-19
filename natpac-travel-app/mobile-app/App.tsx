import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { StatusBar, useColorScheme, PermissionsAndroid, Platform } from 'react-native';
import SplashScreen from 'react-native-splash-screen';

import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';
import { TripProvider } from './src/context/TripContext';
import { theme } from './src/config/theme';
import { requestLocationPermission } from './src/utils/permissions';
import ErrorBoundary from './src/components/ErrorBoundary';
import LoadingScreen from './src/screens/LoadingScreen';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';

  const paperTheme = {
    ...isDarkMode ? MD3DarkTheme : MD3LightTheme,
    colors: {
      ...isDarkMode ? MD3DarkTheme.colors : MD3LightTheme.colors,
      ...theme.colors,
    },
  };

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Request necessary permissions
      const locationPermission = await requestLocationPermission();
      
      // Request other permissions
      if (Platform.OS === 'android') {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ];

        const granted = await PermissionsAndroid.requestMultiple(permissions);
        const allGranted = Object.values(granted).every(
          (permission) => permission === PermissionsAndroid.RESULTS.GRANTED
        );
        
        setPermissionsGranted(allGranted && locationPermission);
      } else {
        setPermissionsGranted(locationPermission);
      }

      // Simulate initialization time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsLoading(false);
      SplashScreen.hide();
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setIsLoading(false);
      SplashScreen.hide();
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <PaperProvider theme={paperTheme}>
        <AuthProvider>
          <LocationProvider>
            <TripProvider>
              <NavigationContainer>
                <StatusBar
                  barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                  backgroundColor={paperTheme.colors.surface}
                />
                <AppNavigator permissionsGranted={permissionsGranted} />
              </NavigationContainer>
            </TripProvider>
          </LocationProvider>
        </AuthProvider>
      </PaperProvider>
    </ErrorBoundary>
  );
};

export default App;