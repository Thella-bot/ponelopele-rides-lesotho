import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, SafeAreaView } from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import COLORS from '../theme/colors';

// Read Mapbox token from environment (Expo public runtime var)
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN as string | undefined;
if (MAPBOX_TOKEN) {
  MapboxGL.setAccessToken(MAPBOX_TOKEN);
}

// Constants and types
const DEFAULT_CENTER: [number, number] = [27.4969, -29.3098]; // [lng, lat]
const DRIVE_INSTRUCTION = 'Drive to passenger';
const ARRIVED_INSTRUCTION = 'Waiting for pickup confirmation';
const ARRIVED_LABEL = 'ARRIVED';
const START_TRIP_LABEL = 'START TRIP';

interface Ride {
  w3w?: string;
  destination?: string;
  fare?: number;
  photo?: string;
  pickupCoords?: [number, number]; // [lng, lat]
  stage?: 'enroute' | 'arrived' | 'in_progress' | 'completed';
}

interface Props {
  navigation: any;
  route?: { params?: { ride?: Ride } };
}

export default function ActiveRideScreen({ navigation, route }: Props) {
  const ride: Ride = useMemo(
    () =>
      route?.params?.ride || {
        w3w: '///filled.counts.roofs',
        destination: 'Passenger location',
        fare: 0,
        pickupCoords: DEFAULT_CENTER,
        stage: 'enroute',
      },
    [route?.params?.ride]
  );

  const [arrived, setArrived] = useState(ride.stage === 'arrived');

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await MapboxGL.requestAndroidLocationPermissions();
          if (!granted) {
            console.warn('Location permission denied');
          }
        }
      } catch (e) {
        console.warn('Location permission error', e);
      }
    };

    requestLocationPermission();
  }, []);

  const onArrivedPress = async () => {
    if (arrived) return;
    try {
      setArrived(true);
      // Placeholder: call backend to mark arrived, e.g., await api.post('/rides/arrived', { rideId })
      Alert.alert('Arrival confirmed', 'Passenger has been notified.');
      navigation.setParams?.({ ride: { ...ride, stage: 'arrived' as const } });
    } catch (e) {
      setArrived(false);
      Alert.alert('Error', 'Failed to mark as arrived. Please try again.');
    }
  };

  if (!MAPBOX_TOKEN) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.danger, textAlign: 'center', padding: 20 }}>
          Map is unavailable. Set EXPO_PUBLIC_MAPBOX_TOKEN in your environment to enable maps.
        </Text>
      </SafeAreaView>
    );
  }

  const center = ride.pickupCoords || DEFAULT_CENTER;

  return (
    <SafeAreaView style={styles.container}>
      <MapboxGL.MapView style={styles.map} styleURL={MapboxGL.StyleURL.Street}>
        <MapboxGL.Camera
          centerCoordinate={center}
          zoomLevel={16}
          followUserLocation={!arrived}
          followZoomLevel={16}
        />
        <MapboxGL.UserLocation visible={true} showsUserHeadingIndicator={true} />
      </MapboxGL.MapView>

      <View style={styles.bottom}>
        {!!ride.w3w && <Text style={styles.w3w}>{ride.w3w}</Text>}
        <Text style={styles.info}>{arrived ? ARRIVED_INSTRUCTION : DRIVE_INSTRUCTION}</Text>
        <TouchableOpacity
          style={[styles.btn, arrived && styles.btnDisabled]}
          onPress={onArrivedPress}
          disabled={arrived}
          accessibilityRole="button"
          accessibilityLabel={arrived ? 'Waiting for pickup confirmation' : 'Mark as arrived'}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          testID="arrivedButton"
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>{arrived ? START_TRIP_LABEL : ARRIVED_LABEL}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  map: { flex: 1 },
  bottom: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  w3w: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center' },
  info: { textAlign: 'center', marginVertical: 15 },
  btn: { backgroundColor: COLORS.primary, padding: 20, borderRadius: 12 },
  btnDisabled: { backgroundColor: '#8FB2FF' },
  btnText: { color: 'white', textAlign: 'center', fontSize: 20, fontWeight: 'bold' },
});
