import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, SafeAreaView } from 'react-native';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { onNewRide } from '../lib/socket';
import COLORS from '../theme/colors';

// Constants and types
const NEW_RIDE_LABEL = 'NEW RIDE!';
const ACCEPT_LABEL = 'ACCEPT';
const DECLINE_LABEL = 'DECLINE';
const BEEP_URL = 'https://www.soundjay.com/buttons/beep-01a.mp3';

interface Ride {
  id: string;
  pickupName: string;
  destName: string;
  fare: number;
}

interface Props {
  navigation: any;
}

export default function DriverWaitingScreen({ navigation }: Props) {
  const [ride, setRide] = useState<Ride | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const unsubscribe = onNewRide((newRide) => {
      setRide(newRide as Ride);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (ride) {
      const setup = async () => {
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: false,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
            playThroughEarpieceAndroid: false,
          });

          const { sound } = await Audio.Sound.createAsync(
            { uri: BEEP_URL },
            { shouldPlay: true }
          );
          soundRef.current = sound;
        } catch (e: any) {
          console.warn('Audio init error:', e?.message || e);
        }
      };

      setup();
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => undefined);
        soundRef.current = null;
      }
    };
  }, [ride]);

  const onAccept = () => {
    navigation.navigate('ActiveRide', { ride });
  };

  const onDecline = () => {
    setRide(null);
    Alert.alert('Ride declined');
  };

  if (!ride) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.waitingText}>Waiting for rides...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.alert}>{NEW_RIDE_LABEL}</Text>
        <View style={styles.card}>
          <Text style={styles.w3w}>{ride.pickupName}</Text>
          <Text style={styles.dest}>→ {ride.destName}</Text>
          <Text style={styles.fare}>M {ride.fare}</Text>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.accept}
            onPress={onAccept}
            accessibilityRole="button"
            accessibilityLabel="Accept ride"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>{ACCEPT_LABEL}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.decline}
            onPress={onDecline}
            accessibilityRole="button"
            accessibilityLabel="Decline ride"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>{DECLINE_LABEL}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000000DD' },
  container: { flex: 1, backgroundColor: '#000000DD', justifyContent: 'center', padding: 20 },
  waitingText: { fontSize: 24, color: 'white', textAlign: 'center' },
  alert: { fontSize: 40, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 30 },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 20, marginBottom: 40 },
  w3w: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center' },
  dest: { fontSize: 22, textAlign: 'center', marginTop: 10 },
  fare: { fontSize: 36, fontWeight: 'bold', color: COLORS.success, textAlign: 'center', marginTop: 15 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between' },
  accept: { backgroundColor: COLORS.success, padding: 20, borderRadius: 12, flex: 0.6 },
  decline: { backgroundColor: COLORS.danger, padding: 20, borderRadius: 12, flex: 0.3 },
  btnText: { color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
});