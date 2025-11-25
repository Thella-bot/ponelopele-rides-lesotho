import React, { useCallback, useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import * as Location from 'expo-location';
import { getSocket, initSocket } from '../lib/socket';
import COLORS from '../theme/colors';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

const APP_TITLE = 'Ponelopele Rides';
const ROLE_LABEL = 'Driver';
const STATUS_ONLINE = 'ONLINE';
const STATUS_OFFLINE = 'OFFLINE';
const BTN_LABEL_GO_ONLINE = 'Go Online – Start Earning';
const BTN_LABEL_GOING_OFFLINE = 'Go Offline';

export default function DriverHomeScreen({ navigation }: { navigation: any }) {
  const [online, setOnline] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const locationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      const token = await SecureStore.getItemAsync('token');
      if (token) {
        const decodedToken: { sub: string } = jwtDecode(token);
        setDriverId(decodedToken.sub);
      }
    })();
  }, []);

  const goOnline = useCallback(() => {
    if (online) {
      setOnline(false);
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
      }
      return;
    }

    if (!driverId) {
      Alert.alert('Error', 'Driver ID not found. Please log in again.');
      return;
    }

    setOnline(true);
    initSocket({ driverId: driverId });
    const socket = getSocket();

    if (socket) {
      locationInterval.current = setInterval(async () => {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        socket.emit('driverOnline', {
          driverId: driverId,
          lat: currentLocation.coords.latitude,
          lng: currentLocation.coords.longitude,
          heading: currentLocation.coords.heading,
        });
      }, 5000);
    }
  }, [online, driverId, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{APP_TITLE}</Text>
        <Text style={styles.subtitle}>{ROLE_LABEL}</Text>
        <Text style={[styles.status, online && styles.online]}>
          {online ? STATUS_ONLINE : STATUS_OFFLINE}
        </Text>
        <TouchableOpacity
          style={[styles.btn, online && styles.btnOnline]}
          onPress={goOnline}
          accessibilityRole="button"
          accessibilityLabel={online ? 'Go offline' : 'Go online and start receiving ride requests'}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          testID="goOnlineButton"
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>
            {online ? BTN_LABEL_GOING_OFFLINE : BTN_LABEL_GO_ONLINE}
          </Text>
        </TouchableOpacity>
        {location && (
          <Text>
            Lat: {location.coords.latitude}, Lng: {location.coords.longitude}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  container: { flex: 1, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 48, fontWeight: 'bold', color: COLORS.primary },
  subtitle: { fontSize: 28, marginBottom: 50, color: COLORS.textLight },
  status: { fontSize: 36, fontWeight: 'bold', marginBottom: 80 },
  online: { color: COLORS.success },
  btn: { backgroundColor: COLORS.primary, paddingVertical: 24, paddingHorizontal: 60, borderRadius: 16 },
  btnOnline: { backgroundColor: COLORS.danger },
  btnText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
});
