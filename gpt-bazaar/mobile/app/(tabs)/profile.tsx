import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  ChevronRight,
  Heart,
  MapPin,
  Package,
  Phone,
  RotateCcw,
  ShieldCheck,
  User,
} from 'lucide-react-native';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { useMobileStore } from '../../src/context/MobileStoreContext';
import { GPTBazaarTheme } from '../../src/theme/tokens';

export default function ProfileHubScreen() {
  const router = useRouter();
  const {
    customerName,
    customerPhone,
    selectedAddress,
    orders,
    wishlistIds,
    addresses,
    unreadNotificationsCount,
  } = useMobileStore();

  const menuRows = [
    {
      label: 'My Orders',
      sub: `${orders.length} order${orders.length === 1 ? '' : 's'} synced live`,
      icon: Package,
      badge: orders.length > 0 ? String(orders.length) : undefined,
      onPress: () => router.push('/(tabs)/orders'),
    },
    {
      label: 'Saved Wishlist',
      sub: 'Quickly re-add your favourite groceries',
      icon: Heart,
      badge: wishlistIds.length > 0 ? String(wishlistIds.length) : undefined,
      onPress: () => router.push('/wishlist'),
    },
    {
      label: 'Saved Addresses',
      sub: `${addresses.length} delivery location${addresses.length === 1 ? '' : 's'}`,
      icon: MapPin,
      onPress: () => router.push('/addresses'),
    },
    {
      label: 'Notifications',
      sub: 'Order updates, dispatch alerts & offers',
      icon: Bell,
      badge:
        unreadNotificationsCount > 0 ? String(unreadNotificationsCount) : undefined,
      onPress: () => router.push('/notifications'),
    },
    {
      label: 'Change Delivery Hub',
      sub: `${selectedAddress.city} (${selectedAddress.pincode})`,
      icon: ShieldCheck,
      onPress: () => router.push('/location'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader showLogo />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Shopper Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBox}>
            <User size={28} color="#FFFFFF" />
          </View>
          <View style={styles.flex}>
            <Text style={styles.nameText}>{customerName}</Text>
            <View style={styles.phoneRow}>
              <Phone size={13} color="#A7F3D0" />
              <Text style={styles.phoneText}>{customerPhone}</Text>
            </View>
            <Text numberOfLines={1} style={styles.hubText}>
              {selectedAddress.label} • {selectedAddress.line1}
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Pressable
            onPress={() => router.push('/(tabs)/orders')}
            style={styles.statCard}
          >
            <Text style={styles.statNumber}>{orders.length}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/wishlist')}
            style={styles.statCard}
          >
            <Text style={styles.statNumber}>{wishlistIds.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/addresses')}
            style={styles.statCard}
          >
            <Text style={styles.statNumber}>{addresses.length}</Text>
            <Text style={styles.statLabel}>Addresses</Text>
          </Pressable>
        </View>

        {/* Navigation List */}
        <View style={styles.menuCard}>
          {menuRows.map((row, idx) => {
            const Icon = row.icon;
            return (
              <Pressable
                key={row.label}
                onPress={row.onPress}
                style={[
                  styles.menuRow,
                  idx === menuRows.length - 1 && styles.menuRowLast,
                ]}
              >
                <View style={styles.menuIconBox}>
                  <Icon size={19} color={GPTBazaarTheme.colors.brandPrimary} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.menuTitle}>{row.label}</Text>
                  <Text style={styles.menuSub}>{row.sub}</Text>
                </View>
                {row.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{row.badge}</Text>
                  </View>
                )}
                <ChevronRight size={18} color="#94A3B8" />
              </Pressable>
            );
          })}
        </View>

        {/* Onboarding Preview Link */}
        <Pressable
          onPress={() => router.push('/welcome')}
          style={styles.onboardingBtn}
        >
          <RotateCcw size={16} color={GPTBazaarTheme.colors.inkMuted} />
          <Text style={styles.onboardingBtnText}>View Welcome & Quick Start</Text>
        </Pressable>

        <Text style={styles.versionFoot}>
          GPT Bazaar Mobile • Chittoor Hyperlocal Hub • v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: GPTBazaarTheme.colors.canvas },
  flex: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 28, gap: 14 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: GPTBazaarTheme.colors.brandDeep,
    borderRadius: 20,
    padding: 18,
  },
  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    borderWidth: 2,
    borderColor: GPTBazaarTheme.colors.brandAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  phoneText: { fontSize: 13, fontWeight: '600', color: '#D1FAE5' },
  hubText: { fontSize: 12, color: '#A7F3D0', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
  },
  statNumber: {
    fontSize: 19,
    fontWeight: '900',
    color: GPTBazaarTheme.colors.brandPrimary,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: GPTBazaarTheme.colors.inkMuted,
  },
  menuCard: {
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: GPTBazaarTheme.colors.borderSubtle,
  },
  menuRowLast: { borderBottomWidth: 0 },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  menuSub: {
    marginTop: 2,
    fontSize: 12,
    color: GPTBazaarTheme.colors.inkMuted,
  },
  badge: {
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.brandPrimary,
    fontVariant: ['tabular-nums'],
  },
  onboardingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: 12,
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
  },
  onboardingBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkMuted,
  },
  versionFoot: {
    textAlign: 'center',
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 4,
  },
});
