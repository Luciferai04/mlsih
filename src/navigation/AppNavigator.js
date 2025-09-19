import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import WelcomeScreen from '../screens/WelcomeScreen';
import TabNavigator from './TabNavigator';
import TripDetailScreen from '../screens/TripDetailScreen';
import { loadUserSettings } from '../redux/slices/userSlice';
import { loadTripsFromStorage } from '../redux/slices/tripSlice';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const dispatch = useDispatch();
  const hasCompletedWelcome = useSelector(state => state.user.hasCompletedWelcome);

  useEffect(() => {
    dispatch(loadUserSettings());
    dispatch(loadTripsFromStorage());
  }, [dispatch]);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasCompletedWelcome ? (
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen 
              name="TripDetail" 
              component={TripDetailScreen}
              options={{ headerShown: true, title: 'Trip Details' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;