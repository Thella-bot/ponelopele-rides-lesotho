import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView, Platform } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import COLORS from '../../theme/colors';

// Navigation types (adjust as your app's navigator grows)
export type RootStackParamList = {
  Home: undefined;
  Pickup: undefined;
};

type HomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// UI strings (extractable to i18n)
const BANNER_TEXT = 'PONELOPELE RIDES IS LIVE! First 50 rides 50% OFF';
const WELCOME_TITLE = 'Welcome to';
const APP_NAME = 'Ponelopele Rides';
const SUBTITLE = 'Not sure about house numbers? No problem. Just tap your roof!';
const CTA_TEXT = 'Request a Ride';

export default function HomeScreen({ navigation }: { navigation: HomeNav }) {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor={Platform.OS === 'android' ? COLORS.primary : undefined}
        barStyle="light-content"
      />

      {/* LAUNCH BANNER */}
      {showBanner && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>🎉 {BANNER_TEXT} 🎉</Text>
          <TouchableOpacity
            onPress={() => setShowBanner(false)}
            accessibilityRole="button"
            accessibilityLabel="Dismiss promotion banner"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.bannerDismiss}
          >
            <Text style={styles.bannerDismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{WELCOME_TITLE}</Text>
        <Text style={styles.logo}>{APP_NAME}</Text>
        <Text style={styles.subtitle}>{SUBTITLE}</Text>

        <TouchableOpacity
          style={styles.bigButton}
          onPress={() => navigation.navigate('Pickup')}
          accessibilityRole="button"
          accessibilityLabel="Request a ride by selecting your pickup location"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.85}
          testID="requestRideButton"
        >
          <Text style={styles.buttonText}>{CTA_TEXT}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  container: { flex: 1, backgroundColor: COLORS.white },
  banner: {
    backgroundColor: COLORS.launchBanner,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bannerText: { color: 'white', fontWeight: 'bold', fontSize: 16, flex: 1, textAlign: 'center' },
  bannerDismiss: { paddingHorizontal: 8, paddingVertical: 4 },
  bannerDismissText: { color: 'white', fontWeight: '600' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, color: COLORS.textLight },
  logo: { fontSize: 48, fontWeight: 'bold', color: COLORS.primary, marginVertical: 10 },
  subtitle: { fontSize: 18, color: COLORS.textLight, marginBottom: 60, textAlign: 'center' },
  bigButton: { backgroundColor: COLORS.primary, paddingVertical: 18, paddingHorizontal: 60, borderRadius: 30 },
  buttonText: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },
});
