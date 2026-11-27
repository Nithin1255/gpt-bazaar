import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, CheckCheck, Package, Sparkles, Tag } from 'lucide-react-native';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { useMobileStore } from '../src/context/MobileStoreContext';
import { GPTBazaarTheme } from '../src/theme/tokens';
import type { NotificationItem } from '../src/types/models';

type FilterTab = 'all' | 'orders' | 'offers' | 'updates';

const TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'orders', label: 'Orders' },
  { id: 'offers', label: 'Offers' },
  { id: 'updates', label: 'Updates' },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useMobileStore();
  const [filter, setFilter] = useState<FilterTab>('all');

  const visible = useMemo(() => {
    if (filter === 'all') return notifications;
    if (filter === 'updates') {
      return notifications.filter(
        (n) => n.category === 'updates' || n.category === 'account'
      );
    }
    return notifications.filter((n) => n.category === filter);
  }, [notifications, filter]);

  const handlePressNotif = (item: NotificationItem) => {
    if (!item.isRead) {
      void markNotificationRead(item.id);
    }
    if (item.orderId) {
      router.push(`/track/${item.orderId}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader
        title="Notifications"
        onBack={() => router.back()}
        rightSlot={
          unreadNotificationsCount > 0 ? (
            <Pressable
              onPress={() => void markAllNotificationsRead()}
              style={styles.markAllBtn}
              hitSlop={8}
            >
              <CheckCheck size={15} color={GPTBazaarTheme.colors.brandPrimary} />
              <Text style={styles.markAllText}>Mark all read</Text>
            </Pressable>
          ) : undefined
        }
      />

      <View style={styles.filterBar}>
        {TABS.map((t) => {
          const active = filter === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => setFilter(t.id)}
              style={[styles.filterTab, active && styles.filterTabActive]}
            >
              <Text
                style={[
                  styles.filterTabText,
                  active && styles.filterTabTextActive,
                ]}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {visible.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Bell size={30} color={GPTBazaarTheme.colors.brandPrimary} />
            </View>
            <Text style={styles.emptyTitle}>You&apos;re all caught up</Text>
            <Text style={styles.emptySub}>
              Order status updates, dispatch notifications, and local offers appear here in real time.
            </Text>
          </View>
        ) : (
          visible.map((item) => {
            const Icon =
              item.category === 'orders'
                ? Package
                : item.category === 'offers'
                  ? Tag
                  : Sparkles;
            return (
              <Pressable
                key={item.id}
                onPress={() => handlePressNotif(item)}
                style={[styles.notifCard, !item.isRead && styles.notifUnread]}
              >
                <View
                  style={[
                    styles.iconBox,
                    !item.isRead && styles.iconBoxUnread,
                  ]}
                >
                  <Icon
                    size={18}
                    color={
                      !item.isRead
                        ? '#FFFFFF'
                        : GPTBazaarTheme.colors.brandPrimary
                    }
                  />
                </View>

                <View style={styles.flex}>
                  <View style={styles.titleRow}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    {!item.isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifMessage}>{item.message}</Text>
                  {item.orderId && (
                    <Text style={styles.trackHint}>Tap to track live →</Text>
                  )}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: GPTBazaarTheme.colors.canvas },
  flex: { flex: 1 },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: GPTBazaarTheme.colors.borderSubtle,
  },
  filterTab: {
    flex: 1,
    height: 36,
    borderRadius: 9,
    backgroundColor: '#F3F6F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabActive: { backgroundColor: GPTBazaarTheme.colors.brandPrimary },
  filterTabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkMuted,
  },
  filterTabTextActive: { color: '#FFFFFF' },
  scrollContent: { padding: 14, paddingBottom: 28, gap: 10 },
  emptyCard: {
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    marginTop: 18,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  emptySub: {
    marginTop: 6,
    fontSize: 13,
    color: GPTBazaarTheme.colors.inkMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
  },
  notifUnread: {
    backgroundColor: '#F7FCF9',
    borderColor: '#CBE7D5',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxUnread: { backgroundColor: GPTBazaarTheme.colors.brandPrimary },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
  },
  notifMessage: {
    marginTop: 3,
    fontSize: 12.5,
    color: GPTBazaarTheme.colors.inkMuted,
    lineHeight: 18,
  },
  trackHint: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
});
