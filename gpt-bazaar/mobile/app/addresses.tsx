import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Building2,
  Check,
  Home,
  MapPin,
  Plus,
  Trash2,
} from 'lucide-react-native';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { useMobileStore } from '../src/context/MobileStoreContext';
import { GPTBazaarTheme } from '../src/theme/tokens';
import type { DeliveryAddress } from '../src/types/models';

const LABEL_OPTIONS: DeliveryAddress['label'][] = ['Home', 'Work', 'Other'];

export default function SavedAddressesScreen() {
  const router = useRouter();
  const {
    addresses,
    selectedAddress,
    selectAddress,
    addAddress,
    deleteAddress,
    customerName,
    customerPhone,
  } = useMobileStore();

  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState<DeliveryAddress['label']>('Home');
  const [recipientName, setRecipientName] = useState(customerName);
  const [phone, setPhone] = useState(customerPhone);
  const [line1, setLine1] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Chittoor');
  const [pincode, setPincode] = useState('517584');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSaveNew = () => {
    if (line1.trim().length < 5) {
      setFormError('Please enter your street / house address.');
      return;
    }
    if (pincode.trim().length !== 6) {
      setFormError('Please enter a valid 6-digit pincode.');
      return;
    }
    setFormError(null);
    addAddress({
      label,
      recipientName: recipientName.trim() || customerName,
      phone: phone.trim() || customerPhone,
      line1: line1.trim(),
      landmark: landmark.trim() || undefined,
      city: city.trim() || 'Chittoor',
      pincode: pincode.trim(),
      isDefault: true,
    });
    setLine1('');
    setLandmark('');
    setShowForm(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Saved Addresses"
        onBack={() => router.back()}
        rightSlot={
          <Pressable
            onPress={() => setShowForm((v) => !v)}
            style={styles.headerAddBtn}
            hitSlop={8}
          >
            <Plus size={16} color={GPTBazaarTheme.colors.brandPrimary} />
            <Text style={styles.headerAddText}>
              {showForm ? 'Close' : 'Add'}
            </Text>
          </Pressable>
        }
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {showForm && (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Add New Delivery Address</Text>

              <View style={styles.labelRow}>
                {LABEL_OPTIONS.map((opt) => {
                  const active = label === opt;
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => setLabel(opt)}
                      style={[
                        styles.labelChip,
                        active && styles.labelChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.labelChipText,
                          active && styles.labelChipTextActive,
                        ]}
                      >
                        {opt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.fieldLabel}>Recipient Name</Text>
              <TextInput
                value={recipientName}
                onChangeText={setRecipientName}
                placeholder="Full Name"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />

              <Text style={styles.fieldLabel}>Contact Phone</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 98480 12345"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                style={styles.input}
              />

              <Text style={styles.fieldLabel}>House / Flat / Street Address</Text>
              <TextInput
                value={line1}
                onChangeText={(v) => {
                  setLine1(v);
                  if (formError) setFormError(null);
                }}
                placeholder="Door No, Street, Area"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />

              <Text style={styles.fieldLabel}>Landmark (Optional)</Text>
              <TextInput
                value={landmark}
                onChangeText={setLandmark}
                placeholder="Near temple, school, bus stop..."
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />

              <View style={styles.twoCol}>
                <View style={styles.flex}>
                  <Text style={styles.fieldLabel}>City</Text>
                  <TextInput
                    value={city}
                    onChangeText={setCity}
                    placeholder="Chittoor"
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                  />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.fieldLabel}>Pincode</Text>
                  <TextInput
                    value={pincode}
                    onChangeText={(v) => {
                      setPincode(v.replace(/\D/g, '').slice(0, 6));
                      if (formError) setFormError(null);
                    }}
                    placeholder="517584"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    maxLength={6}
                    style={styles.input}
                  />
                </View>
              </View>

              {formError && <Text style={styles.errorText}>{formError}</Text>}

              <Pressable onPress={handleSaveNew} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Save & Set Default</Text>
              </Pressable>
            </View>
          )}

          {addresses.map((addr) => {
            const isSelected = addr.id === selectedAddress.id;
            const Icon =
              addr.label === 'Home'
                ? Home
                : addr.label === 'Work'
                  ? Building2
                  : MapPin;

            return (
              <Pressable
                key={addr.id}
                onPress={() => selectAddress(addr.id)}
                style={[styles.addrCard, isSelected && styles.addrCardSelected]}
              >
                <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                  <Icon
                    size={18}
                    color={
                      isSelected ? '#FFFFFF' : GPTBazaarTheme.colors.brandPrimary
                    }
                  />
                </View>
                <View style={styles.flex}>
                  <View style={styles.titleRow}>
                    <Text style={styles.addrLabel}>{addr.label}</Text>
                    {isSelected && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.recipientText}>
                    {addr.recipientName} • {addr.phone}
                  </Text>
                  <Text style={styles.lineText}>{addr.line1}</Text>
                  {addr.landmark ? (
                    <Text style={styles.subText}>{addr.landmark}</Text>
                  ) : null}
                  <Text style={styles.subText}>
                    {addr.city} - {addr.pincode}
                  </Text>
                </View>

                <View style={styles.rightCol}>
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterSelected,
                    ]}
                  >
                    {isSelected && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                  {addresses.length > 1 && (
                    <Pressable
                      onPress={() => deleteAddress(addr.id)}
                      style={styles.deleteBtn}
                      hitSlop={8}
                      accessibilityLabel="Delete address"
                    >
                      <Trash2 size={15} color={GPTBazaarTheme.colors.inkMuted} />
                    </Pressable>
                  )}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: GPTBazaarTheme.colors.canvas },
  flex: { flex: 1 },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
  },
  headerAddText: {
    fontSize: 13,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  scrollContent: { padding: 14, paddingBottom: 28, gap: 12 },
  formCard: {
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CBE7D5',
  },
  formTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
    marginBottom: 12,
  },
  labelRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  labelChip: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFCFA',
  },
  labelChipActive: {
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    borderColor: GPTBazaarTheme.colors.brandPrimary,
  },
  labelChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  labelChipTextActive: { color: '#FFFFFF' },
  fieldLabel: {
    marginTop: 10,
    marginBottom: 5,
    fontSize: 12,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkMuted,
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    backgroundColor: '#FAFCFA',
    paddingHorizontal: 12,
    fontSize: 14,
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  twoCol: { flexDirection: 'row', gap: 10 },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.offerCrimson,
  },
  saveBtn: {
    marginTop: 14,
    height: 46,
    borderRadius: 11,
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 14.5, fontWeight: '800' },
  addrCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
  },
  addrCardSelected: {
    borderColor: GPTBazaarTheme.colors.brandPrimary,
    backgroundColor: '#F7FCF9',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxSelected: { backgroundColor: GPTBazaarTheme.colors.brandPrimary },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addrLabel: {
    fontSize: 14.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  defaultBadge: {
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  recipientText: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '600',
    color: GPTBazaarTheme.colors.inkMuted,
  },
  lineText: {
    marginTop: 4,
    fontSize: 13.5,
    fontWeight: '600',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  subText: { marginTop: 2, fontSize: 12, color: GPTBazaarTheme.colors.inkMuted },
  rightCol: { alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: GPTBazaarTheme.colors.brandPrimary,
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
  },
  deleteBtn: { padding: 4 },
});
