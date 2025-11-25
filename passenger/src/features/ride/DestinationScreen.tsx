import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import COLORS from '../../theme/colors';

interface Landmark {
  id: string;
  name: string;
  w3w: string;
}

interface PickupData {
  // Extend as needed
  [key: string]: any;
}

interface DestinationParams {
  pickupData?: PickupData;
}

const LANDMARKS: Landmark[] = [
  { id: '1', name: 'Pioneer Mall', w3w: '///filled.counts.roofs' },
  { id: '2', name: 'Maseru Mall', w3w: '///palace.rainy.curve' },
  { id: '3', name: 'Sefika Shopping Complex', w3w: '///cattle.shade.welcome' },
  { id: '4', name: 'LNDC Centre', w3w: '///dusty.lamps.vague' },
  { id: '5', name: 'Setsoto Stadium', w3w: '///bats.rainy.pens' },
  { id: '6', name: 'Ha Thetsane Pick n Pay', w3w: '///rocks.silver.bread' },
  { id: '7', name: 'Pitso Ground', w3w: '///chiefs.meat.drum' },
  { id: '8', name: 'Maseru Border Post', w3w: '///border.flags.cross' },
  { id: '9', name: 'Kingsway', w3w: '///kings.way.shop' },
  { id: '10', name: 'State Library', w3w: '///books.quiet.study' },
];

export default function DestinationScreen({ route, navigation }: { route: { params?: DestinationParams }; navigation: any }) {
  const pickupData = route?.params?.pickupData;
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Landmark | null>(null);

  const trimmed = useMemo(() => search.trim(), [search]);

  const filtered = useMemo(
    () => LANDMARKS.filter((item) => item.name.toLowerCase().includes(trimmed.toLowerCase())),
    [trimmed]
  );

  const choose = useCallback((item: Landmark) => {
    setSelected(item);
    setSearch(item.name);
    Keyboard.dismiss();
  }, []);

  const canContinue = useMemo(() => Boolean(selected || trimmed.length > 0), [selected, trimmed]);

  const goConfirm = useCallback(() => {
    if (!canContinue) return;
    const destination = selected || { name: trimmed, w3w: trimmed };
    navigation.navigate('ConfirmRide', { pickupData, destination });
  }, [canContinue, navigation, pickupData, selected, trimmed]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Where are you going?</Text>

          <TextInput
            style={styles.input}
            placeholder="Search landmarks or type anything..."
            value={search}
            onChangeText={(t) => {
              setSearch(t);
              if (selected && t !== selected.name) setSelected(null);
            }}
            autoFocus
            returnKeyType="search"
            accessibilityLabel="Search destination input"
          />

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = selected?.id === item.id;
              return (
                <TouchableOpacity
                  style={[styles.item, isSelected && styles.itemSelected]}
                  onPress={() => choose(item)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select destination ${item.name}`}
                  accessibilityState={{ selected: isSelected }}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.w3w}>{item.w3w}</Text>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              trimmed.length > 0 ? (
                <Text style={styles.empty}>No results. You can continue with your typed destination.</Text>
              ) : (
                <Text style={styles.empty}>Start typing to search landmarks…</Text>
              )
            }
          />

          <TouchableOpacity
            style={[styles.btn, !canContinue && styles.btnDisabled]}
            onPress={goConfirm}
            disabled={!canContinue}
            accessibilityRole="button"
            accessibilityLabel={canContinue ? 'Continue to confirm ride' : 'Enter or select a destination to continue'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.85}
            testID="continueButton"
          >
            <Text style={styles.btnText}>Continue →</Text>
          </TouchableOpacity>

          {!pickupData && (
            <Text style={styles.warning}>Missing pickup details. Your ride may not be bookable.</Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  container: { flex: 1, backgroundColor: COLORS.white, padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary, marginBottom: 20 },
  input: { backgroundColor: '#F0F5FF', padding: 18, borderRadius: 12, fontSize: 18, marginBottom: 15 },
  item: { padding: 16, backgroundColor: '#F0F5FF', borderRadius: 12, marginVertical: 5 },
  itemSelected: { borderWidth: 2, borderColor: COLORS.primary },
  name: { fontSize: 18, fontWeight: '600', color: COLORS.primary },
  w3w: { fontSize: 14, color: COLORS.textLight },
  empty: { textAlign: 'center', color: COLORS.textLight, marginTop: 8 },
  btn: { backgroundColor: COLORS.primary, padding: 20, borderRadius: 12, marginTop: 30 },
  btnDisabled: { backgroundColor: '#8FB2FF' },
  btnText: { color: 'white', textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  warning: { marginTop: 10, color: '#A23', textAlign: 'center' },
});
