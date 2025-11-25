import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/features/ride/HomeScreen';
import PickupScreen from './src/features/ride/PickupScreen';
import DestinationScreen from './src/features/ride/DestinationScreen';
import ConfirmRideScreen from './src/features/ride/ConfirmRideScreen';
import LoginScreen from './src/features/auth/LoginScreen';
import RegisterScreen from './src/features/auth/RegisterScreen';
import * as SecureStore from 'expo-secure-store';
import COLORS from './src/theme/colors';

// Typed stack params
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Pickup: undefined;
  Destination: { pickupData?: unknown } | undefined;
  ConfirmRide: { pickupData: unknown; destination: unknown } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Extracted screen options
const screenOptions = {
  headerStyle: { backgroundColor: COLORS.primary },
  headerTintColor: COLORS.white,
  headerTitleStyle: { fontWeight: 'bold' as const },
};

// Navigation theme aligned with app colors
const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    background: COLORS.white,
    card: COLORS.primary,
    text: COLORS.white,
    border: '#E0E0E0',
    notification: COLORS.primary,
  },
};

// Optional deep linking configuration
const linking = {
  prefixes: ['ponelopelerides://', 'https://ponelopelerides.example.com'],
  config: {
    screens: {
      Home: 'home',
      Pickup: 'pickup',
      Destination: 'destination',
      ConfirmRide: 'confirm',
    },
  },
};

// Titles centralized for i18n readiness
const TITLES = {
  app: 'Urban Taxis',
  pickup: 'Set Pickup',
  destination: 'Where to?',
  confirm: 'Confirm Ride',
};

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken;
      try {
        userToken = await SecureStore.getItemAsync('token');
      } catch (e) {
        // Restoring token failed
      }
      setToken(userToken);
      setLoading(false);
    };

    bootstrapAsync();
  }, []);

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      <Stack.Navigator screenOptions={screenOptions}>
        {token == null ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: TITLES.app }} />
            <Stack.Screen name="Pickup" component={PickupScreen} options={{ title: TITLES.pickup }} />
            <Stack.Screen
              name="Destination"
              component={DestinationScreen}
              options={{ title: TITLES.destination }}
            />
            <Stack.Screen
              name="ConfirmRide"
              component={ConfirmRideScreen}
              options={{ title: TITLES.confirm }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
