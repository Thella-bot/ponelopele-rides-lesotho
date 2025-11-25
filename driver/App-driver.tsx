import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import DriverHomeScreen from './src/features/DriverHomeScreen';
import DriverWaitingScreen from './src/features/DriverWaitingScreen';
import ActiveRideScreen from './src/features/ActiveRideScreen';
import LoginScreen from './src/features/LoginScreen';
import RegisterScreen from './src/features/RegisterScreen';
import * as SecureStore from 'expo-secure-store';
import COLORS from './src/theme/colors';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  DriverHome: undefined;
  Waiting: { online?: boolean } | undefined;
  ActiveRide: { ride?: any } | undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: COLORS.primary },
  headerTintColor: COLORS.white,
  headerTitleStyle: { fontWeight: 'bold' as const },
};

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
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={screenOptions}>
        {token == null ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="DriverHome"
              component={DriverHomeScreen}
              options={{ title: 'Ponelopele Rides Driver' }}
            />
            <Stack.Screen name="Waiting" component={DriverWaitingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ActiveRide" component={ActiveRideScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
