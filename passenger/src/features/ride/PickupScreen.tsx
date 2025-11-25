import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import COLORS from '../../theme/colors';

// Env-configured tokens
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN as string | undefined;
const W3W_API_KEY = process.env.EXPO_PUBLIC_W3W_API_KEY as string | undefined;

if (MAPBOX_TOKEN) {
  MapboxGL.setAccessToken(MAPBOX_TOKEN);
}

// Strings
const SATELLITE_ON = '✓ Roof tapped!';
const SATELLITE_OFF = '🛰️ Tap your roof for perfect accuracy';
const BTN_ADD_PHOTO = '📸 Add photo (optional)';
const BTN_CONTINUE = 'Continue →';
const PERMISSION_NEEDED = 'Permission needed';
const LOCATION_REQUIRED = 'Location required';
const AUDIO_PERMISSION = 'Microphone permission is required to record audio.';
const CAMERA_PERMISSION = 'Camera permission is required to take a photo.';
const MAPBOX_MISSING = 'Map unavailable. Set EXPO_PUBLIC_MAPBOX_TOKEN.';
const W3W_MISSING = 'What3Words unavailable. Set EXPO_PUBLIC_W3W_API_KEY.';

interface Coords {
  latitude: number;
  longitude: number;
}

interface PickupData {
  location: { coords: Coords } | null;
  w3wAddress: string;
  photoUri: string | null;
  voiceUri: string | null;
}

export default function PickupScreen({ navigation }: { navigation: any }) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [w3wAddress, setW3wAddress] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [voiceUri, setVoiceUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [satelliteMode, setSatelliteMode] = useState(false);
  const [userPinned, setUserPinned] = useState(false);
  const cameraRef = useRef<MapboxGL.Camera | null>(null);

  // Permissions and initial location
  useEffect(() => {
    const init = async () => {
      try {
        if (Platform.OS === 'android') {
          await MapboxGL.requestAndroidLocationPermissions();
        }
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(PERMISSION_NEEDED, LOCATION_REQUIRED);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        const c = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
        setCoords(c);
        await updateW3W(c);
      } catch (e: any) {
        Alert.alert('Error', e?.message || 'Unable to get location');
      }
    };
    init();
  }, []);

  const updateW3W = useCallback(async (c: Coords) => {
    if (!W3W_API_KEY) {
      console.warn(W3W_MISSING);
      setW3wAddress('');
      return;
    }
    try {
      const url = `https://api.what3words.com/v3/convert-to-3wa?coordinates=${c.latitude},${c.longitude}&key=${W3W_API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`W3W error ${res.status}`);
      const data = await res.json();
      if (data?.words) setW3wAddress(`///${data.words}`);
    } catch (e: any) {
      console.warn('W3W fetch failed', e?.message || e);
      setW3wAddress('');
    }
  }, []);

  const toggleSatellite = useCallback(() => {
    setSatelliteMode((prev) => {
      const next = !prev;
      if (!next) return next; // turning off satellite, no zoom change
      // when enabling satellite, zoom in
      const cam = cameraRef.current as any;
      if (cam?.setCamera) {
        try {
          cam.setCamera({ zoomLevel: 19, animationDuration: 1000 });
        } catch {}
      }
      return next;
    });
  }, []);

  const onMapPress = useCallback(async (e: MapboxGL.OnPressEvent) => {
    if (!satelliteMode) return;
    try {
      const [lng, lat] = (e?.geometry as any)?.coordinates || [];
      if (typeof lat !== 'number' || typeof lng !== 'number') return;
      const c = { latitude: lat, longitude: lng };
      setCoords(c);
      setUserPinned(true);
      await updateW3W(c);
    } catch (err) {
      console.warn('Map press handling failed', err);
    }
  }, [satelliteMode, updateW3W]);

  const takePhoto = useCallback(async () => {
    try {
      const camPerm = await ImagePicker.requestCameraPermissionsAsync();
      if (camPerm.status !== 'granted') {
        Alert.alert(PERMISSION_NEEDED, CAMERA_PERMISSION);
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
      if (!result.canceled) setPhotoUri(result.assets[0].uri);
    } catch (e: any) {
      Alert.alert('Photo error', e?.message || 'Unable to take photo');
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(PERMISSION_NEEDED, AUDIO_PERMISSION);
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: 0,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
      setIsRecording(true);
    } catch (e: any) {
      Alert.alert('Audio error', e?.message || 'Failed to start recording');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setVoiceUri(uri || null);
    } catch (e: any) {
      Alert.alert('Audio error', e?.message || 'Failed to stop recording');
    } finally {
      setIsRecording(false);
      setRecording(null);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    }
  }, [recording]);

  const goNext = useCallback(() => {
    const pickup: PickupData = {
      location: coords ? { coords } : null,
      w3wAddress,
      photoUri,
      voiceUri,
    };
    navigation.navigate('Destination', { pickupData: pickup });
  }, [coords, navigation, photoUri, voiceUri, w3wAddress]);

  if (!MAPBOX_TOKEN) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.danger, textAlign: 'center', padding: 20 }}>{MAPBOX_MISSING}</Text>
      </SafeAreaView>
    );
  }

  if (!coords) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color={COLORS.primary} />;
  }

  const center: [number, number] = useMemo(() => [coords.longitude, coords.latitude], [coords]);

  return (
    <SafeAreaView style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={satelliteMode ? MapboxGL.StyleURL.Satellite : MapboxGL.StyleURL.Street}
        onPress={onMapPress}
      >
        <MapboxGL.Camera ref={cameraRef} centerCoordinate={center} zoomLevel={satelliteMode ? 19 : 17} />
        <MapboxGL.UserLocation visible={true} showsUserHeadingIndicator={true} />
        <MapboxGL.PointAnnotation id="pin" coordinate={center}>
          <View style={styles.pin} />
        </MapboxGL.PointAnnotation>
      </MapboxGL.MapView>

      <TouchableOpacity
        style={[styles.satelliteBtn, satelliteMode && { backgroundColor: COLORS.success }]}
        onPress={toggleSatellite}
        accessibilityRole="button"
        accessibilityLabel={satelliteMode ? 'Roof tapped. Disable satellite mode' : 'Enable satellite mode to tap your roof'}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.85}
      >
        <Text style={styles.satelliteText}>{satelliteMode ? SATELLITE_ON : SATELLITE_OFF}</Text>
      </TouchableOpacity>

      <View style={styles.bottomCard}>
        <Text style={styles.w3w}>{w3wAddress || 'Locating What3Words...'}</Text>
        {userPinned && (
          <Text style={{ color: COLORS.success, fontWeight: 'bold' }}>Driver will see your exact roof!</Text>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity
            style={[styles.optionBtn, { flex: 1, marginRight: 8 }]}
            onPress={takePhoto}
            accessibilityRole="button"
            accessibilityLabel="Add a photo"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            activeOpacity={0.85}
          >
            <Text>{BTN_ADD_PHOTO}</Text>
          </TouchableOpacity>

          {!isRecording ? (
            <TouchableOpacity
              style={[styles.optionBtn, { flex: 1, marginLeft: 8 }]}
              onPress={startRecording}
              accessibilityRole="button"
              accessibilityLabel="Start voice recording"
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              activeOpacity={0.85}
            >
              <Text>🎤 Add voice note (optional)</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.optionBtn, { flex: 1, marginLeft: 8, backgroundColor: '#FFE6E6' }]}
              onPress={stopRecording}
              accessibilityRole="button"
              accessibilityLabel="Stop voice recording"
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              activeOpacity={0.85}
            >
              <Text>⏹ Stop recording</Text>
            </TouchableOpacity>
          )}
        </View>

        {!!photoUri && (
          <Image source={{ uri: photoUri }} style={{ width: '100%', height: 140, marginTop: 8, borderRadius: 8 }} />
        )}

        <TouchableOpacity
          style={styles.continueBtn}
          onPress={goNext}
          accessibilityRole="button"
          accessibilityLabel="Continue to choose destination"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.85}
        >
          <Text style={styles.continueText}>{BTN_CONTINUE}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  pin: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.primary, borderWidth: 4, borderColor: COLORS.white },
  satelliteBtn: { position: 'absolute', top: 50, left: 20, right: 20, backgroundColor: COLORS.primary, padding: 14, borderRadius: 12 },
  satelliteText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  bottomCard: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  w3w: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center' },
  optionBtn: { backgroundColor: '#F0F5FF', padding: 16, borderRadius: 12, marginVertical: 8 },
  continueBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 12, marginTop: 15 },
  continueText: { color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 18 },
});
