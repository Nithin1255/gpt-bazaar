import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, MapPin, Navigation, Plus, Search } from 'lucide-react-native';
import { DeliveryScooterIllustration } from '../src/components/GroceryArtwork';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { useMobileStore } from '../src/context/MobileStoreContext';
import { GPTBazaarTheme } from '../src/theme/tokens';

const QUICK_AREAS = [
  { area: 'Pudukpet Main Road', city: 'Chittoor', pincode: '517584' },
  { area: 'Tirupati Road Annex', city: 'Nagari', pincode: '517590' },
  { area: 'Gandhi Road Market', city: 'Chittoor', pincode: '517001' },
];

export default function LocationPickerScreen() {
  const router = useRouter();
  const { addresses, selectedAddress, selectAddress, addAddress, customerName, customerPhone } =
    useMobileStore();
  const [queryText, setQueryText] = useState('');

  const filteredAddresses = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    if (!q) return addresses;
    return addresses.filter(
      (a) =>
        a.label.toLowerCase().includes(q) ||
        a.line1.toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q) ||
        a.pincode.includes(q)
    );
  }, [addresses, queryText]);

  const handleUseCurrentHub = () => {
    const existing = addresses.find((a) => a.pincode === '517584');
    if (existing) {
      selectAddress(existing.id);
    } else {
      addAddress({
        label: 'Home',
        recipientName: customerName,
        phone: customerPhone,
        line1: '14-2-88, Pudukpet Main Road',
        landmark: 'Chittoor Hyperlocal Hub',
        city: 'Chittoor',
        pincode: '517584',
        isDefault: true,
      });
    }
  };

  const handleQuickAreaPick = (item: (typeof QUICK_AREAS)[number]) => {
    const existing = addresses.find(
      (a) => a.city === item.city && a.pincode === item.pincode
    );
    if (existing) {
      selectAddress(existing.id);
    } else {
      addAddress({
        label: 'Other',
        recipientName: customerName,
        phone: customerPhone,
        line1: item.area,
        city: item.city,
        pincode: item.pincode,
        isDefault: true,
      });
    }
  };

  const handleConfirm = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Select Delivery Location"
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hubHero}>
          <View style={styles.hubTextCol}>
            <Text style={styles.hubEyebrow}>FASTEST DELIVERY ZONE</Text>
            <Text style={styles.hubTitle}>10–15 min delivery across Chittoor Hub</Text>
            <Text style={styles.hubSubtitle}>
              Delivering to {selectedAddress.city} ({selectedAddress.pincode})
            </Text>
          </View>
          <DeliveryScooterIllustration width={116} height={70} />
        </View>

        <View style={styles.searchBar}>
          <Search size={18} color={GPTBazaarTheme.colors.inkMuted} />
          <TextInput
            value={queryText}
            onChangeText={setQueryText}
            placeholder="Search area, street name or pincode..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>

        <Pressable onPress={handleUseCurrentHub} style={styles.currentHubBtn}>
          <View style={styles.currentHubIcon}>
            <Navigation size={18} color={GPTBazaarTheme.colors.brandPrimary} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.currentHubTitle}>Use Current Hub Location</Text>
            <Text style={styles.currentHubSub}>Pudukpet, Chittoor • 517584</Text>
          </View>
        </Pressable>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Saved Addresses</Text>
          <Pressable onPress={() => router.push('/addresses')} style={styles.addLinkBtn}>
            <Plus size={15} color={GPTBazaarTheme.colors.brandPrimary} />
            <Text style={styles.addLinkText}>Add New</Text>
          </Pressable>
        </View>

        {filteredAddresses.map((addr) => {
          const isSelected = addr.id === selectedAddress.id;
          return (
            <Pressable
              key={addr.id}
              onPress={() => selectAddress(addr.id)}
              style={[styles.addrCard, isSelected && styles.addrCardSelected]}
            >
              <View style={[styles.pinBox, isSelected && styles.pinBoxSelected]}>
                <MapPin
                  size={18}
                  color={isSelected ? '#FFFFFF' : GPTBazaarTheme.colors.brandPrimary}
                />
              </View>
              <View style={styles.flex}>
                <View style={styles.addrTitleRow}>
                  <Text style={styles.addrLabel}>{addr.label}</Text>
                  {isSelected && (
                    <View style={styles.defaultTag}>
                      <Text style={styles.defaultTagText}>Selected</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.addrLine}>{addr.line1}</Text>
                <Text style={styles.addrCity}>
                  {addr.city} - {addr.pincode}
                </Text>
              </View>
              <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
              </View>
            </Pressable>
          );
        })}

        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Serviceable Nearby Hubs</Text>
        <View style={styles.quickList}>
          {QUICK_AREAS.map((area) => (
            <Pressable
              key={area.pincode}
              onPress={() => handleQuickAreaPick(area)}
              style={styles.quickRow}
            >
              <MapPin size={16} color={GPTBazaarTheme.colors.inkMuted} />
              <View style={styles.flex}>
                <Text style={styles.quickTitle}>{area.area}</Text>
                <Text style={styles.quickSub}>
                  {area.city} • {area.pincode}
                </Text>
              </View>
              <Text style={styles.quickUse}>Select</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomAddressPreview}>
          <Text style={styles.bottomLabel} numberOfLines={1}>
            Delivering to {selectedAddress.label} • {selectedAddress.pincode}
          </Text>
          <Text style={styles.bottomLine} numberOfLines={1}>
            {selectedAddress.line1}, {selectedAddress.city}
          </Text>
        </View>
        <Pressable onPress={handleConfirm} style={styles.confirmBtn}>
          <Text style={styles.confirmBtnText}>Confirm Location →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: GPTBazaarTheme.colors.canvas },
  flex: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 28 },
  hubHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D6EFE0',
    marginBottom: 14,
    gap: 10,
  },
  hubTextCol: { flex: 1 },
  hubEyebrow: {
    fontSize: 10.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.brandPrimary,
    letterSpacing: 0.6,
  },
  hubTitle: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
    lineHeight: 21,
  },
  hubSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '600',
    color: GPTBazaarTheme.colors.inkMuted,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  currentHubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CBE7D5',
    marginBottom: 18,
  },
  currentHubIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentHubTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  currentHubSub: {
    fontSize: 12,
    color: GPTBazaarTheme.colors.inkMuted,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  addLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  addrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    marginBottom: 10,
  },
  addrCardSelected: {
    borderColor: GPTBazaarTheme.colors.brandPrimary,
    backgroundColor: '#F7FCF9',
  },
  pinBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBoxSelected: {
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
  },
  addrTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addrLabel: {
    fontSize: 14.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  defaultTag: {
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  addrLine: {
    marginTop: 3,
    fontSize: 13,
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  addrCity: {
    marginTop: 2,
    fontSize: 12,
    color: GPTBazaarTheme.colors.inkMuted,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: GPTBazaarTheme.colors.brandPrimary,
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
  },
  quickList: {
    marginTop: 10,
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    overflow: 'hidden',
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: GPTBazaarTheme.colors.borderSubtle,
  },
  quickTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  quickSub: {
    fontSize: 11.5,
    color: GPTBazaarTheme.colors.inkMuted,
    marginTop: 1,
  },
  quickUse: {
    fontSize: 12.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  bottomBar: {
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: GPTBazaarTheme.colors.borderSubtle,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 10,
  },
  bottomAddressPreview: { gap: 2 },
  bottomLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  bottomLine: {
    fontSize: 13.5,
    fontWeight: '600',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  confirmBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: GPTBazaarTheme.colors.brandAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.brandDeep,
  },
});
