import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { requestRide, estimateRideFare, setAuthToken } from '../../lib/api';
import COLORS from '../../theme/colors';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

// Types for route params
interface PickupData {
  latitude: number;
  longitude: number;
  address: string;
  w3wAddress?: string;
  photoUri?: string;
  [key: string]: any;
}

interface DestinationData {
  latitude: number;
  longitude: number;
  name: string;
  [key: string]: any;
}

interface ConfirmRideParams {
  pickupData: PickupData;
  destination: DestinationData;
}

interface EstimatedFare {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeMultiplier: number;
  totalFare: number;
}

export default function ConfirmRideScreen({ route, navigation }: { route: { params: ConfirmRideParams }; navigation: any }) {
  const { pickupData, destination } = route.params || ({} as ConfirmRideParams);
  const [loading, setLoading] = useState(false);
  const [mobileMoney, setMobileMoney] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [passengerId, setPassengerId] = useState<string | null>(null);
  const [estimatedFare, setEstimatedFare] = useState<EstimatedFare | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        setAuthToken(token); // Set auth token for API calls
        const decodedToken: { sub: string } = jwtDecode(token);
        setPassengerId(decodedToken.sub);
      }

      if (pickupData && destination) {
        try {
          const fare = await estimateRideFare({
            pickupLat: pickupData.latitude,
            pickupLng: pickupData.longitude,
            destLat: destination.latitude,
            destLng: destination.longitude,
            // durationMinutes is optional for estimation, will be more accurate during ride actualization
          });
          setEstimatedFare(fare);
        } catch (error) {
          console.error('Error estimating fare:', error);
          Alert.alert('Error', 'Could not estimate fare. Please try again later.');
        }
      }
    };
    loadData();
  }, [pickupData, destination]);

  const isValid = useMemo(() => Boolean(passengerId && pickupData && destination && destination.name && estimatedFare), [passengerId, pickupData, destination, estimatedFare]);

  const requestRideNow = useCallback(async () => {
    if (loading) return;
    if (!isValid) {
      Alert.alert('Missing details', 'Please provide a valid destination and ensure you are logged in, and fare is estimated.');
      return;
    }
    setLoading(true);
    try {
      await requestRide({
        pickupLat: pickupData.latitude,
        pickupLng: pickupData.longitude,
        pickupName: pickupData.address,
        destLat: destination.latitude,
        destLng: destination.longitude,
        destName: destination.name,
        passengerId: passengerId!,
      });
      Alert.alert('Ride Confirmed', 'Your driver is on the way', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (e: any) {
      const serverMsg =
        (e?.response?.data && (e.response.data.message || e.response.data.error || e.response.data.msg)) ||
        e?.message ||
        'Please try again';
      Alert.alert('Error', String(serverMsg));
    } finally {
      setLoading(false);
    }
  }, [destination, loading, mobileMoney, navigation, pickupData, isValid, passengerId]);

  const togglePayment = useCallback(() => setMobileMoney((v) => !v), []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Confirm Your Ride</Text>

        <View style={styles.card}>
          <Text style={styles.label}>PICKUP</Text>
          <Text style={styles.w3w}>{pickupData?.address || 'Selected pickup location'}</Text>
          {!!pickupData?.photoUri && !imageError && (
            <Image
              source={{ uri: pickupData.photoUri }}
              style={styles.photo}
              onError={() => setImageError(true)}
              accessibilityLabel="Pickup photo"
            />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>DROP-OFF</Text>
          <Text style={styles.dest}>{destination?.name || 'Destination not set'}</Text>
        </View>

        <TouchableOpacity
          style={[styles.paymentToggle, mobileMoney ? styles.paymentActiveBg : styles.paymentInactiveBg]}
          onPress={togglePayment}
          accessibilityRole="button"
          accessibilityLabel="Toggle payment method"
          accessibilityState={{ selected: mobileMoney }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.85}
        >
          <Text style={mobileMoney ? styles.activePayment : styles.inactivePayment}>
            {mobileMoney ? 'ECOCASH / M-Pesa' : 'Cash'}
          </Text>
        </TouchableOpacity>

        {estimatedFare && (
          <View style={styles.fare}>
            <Text style={styles.fareText}>Estimated Fare</Text>
            <Text style={styles.amount}>M {estimatedFare.totalFare.toFixed(2)}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.requestBtn, (!isValid || loading) && styles.requestBtnDisabled]}
          onPress={requestRideNow}
          disabled={loading || !isValid}
          accessibilityRole="button"
          accessibilityLabel={isValid ? 'Request taxi now' : 'Provide destination to request taxi'}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.85}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.requestText}>Request Taxi Now</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  container: { flex: 1, backgroundColor: COLORS.white, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginVertical: 20 },
  card: { backgroundColor: '#F8F9FF', padding: 18, borderRadius: 16, marginVertical: 10 },
  label: { fontSize: 14, color: COLORS.textLight },
  w3w: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  dest: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  photo: { width: '100%', height: 180, borderRadius: 12, marginTop: 10 },
  paymentToggle: { alignItems: 'center', marginVertical: 20, padding: 14, borderRadius: 12 },
  paymentActiveBg: { backgroundColor: '#E8F5E8' },
  paymentInactiveBg: { backgroundColor: '#F0F0F0' },
  activePayment: { fontSize: 20, fontWeight: 'bold', color: COLORS.success },
  inactivePayment: { fontSize: 18, color: COLORS.textLight },
  fare: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#E8F5E8', padding: 20, borderRadius: 16 },
  fareText: { fontSize: 18 },
  amount: { fontSize: 36, fontWeight: 'bold', color: COLORS.success },
  requestBtn: { backgroundColor: COLORS.primary, padding: 22, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  requestBtnDisabled: { backgroundColor: '#8FB2FF' },
  requestText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
});
