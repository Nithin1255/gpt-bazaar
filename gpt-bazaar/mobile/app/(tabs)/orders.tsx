import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  Clock,
  Package,
  RotateCcw,
  Star,
  Truck,
} from 'lucide-react-native';
import { ProductMedia } from '../../src/components/GroceryArtwork';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { useMobileStore } from '../../src/context/MobileStoreContext';
import { GPTBazaarTheme } from '../../src/theme/tokens';
import type { Order, OrderStatus } from '../../src/types/models';

const STATUS_META: Record<
  OrderStatus,
  { label: string; bg: string; fg: string }
> = {
  placed: { label: 'Order Placed', bg: '#EFF6FF', fg: '#1D4ED8' },
  packed: { label: 'Packed at Hub', bg: '#FEF3C7', fg: '#B45309' },
  out_for_delivery: { label: 'Out for Delivery', bg: '#EDF8F0', fg: '#0E6F2D' },
  delivered: { label: 'Delivered', bg: '#DCFCE7', fg: '#15803D' },
  cancelled: { label: 'Cancelled', bg: '#FEF2F2', fg: '#B91C1C' },
};

export default function OrdersScreen() {
  const router = useRouter();
  const { orders, reorderFromOrder, rateOrder, cartSummary } = useMobileStore();
  const [tab, setTab] = useState<'active' | 'past'>('active');

  const activeOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.status === 'placed' ||
          o.status === 'packed' ||
          o.status === 'out_for_delivery'
      ),
    [orders]
  );

  const pastOrders = useMemo(
    () =>
      orders.filter((o) => o.status === 'delivered' || o.status === 'cancelled'),
    [orders]
  );

  const visibleOrders = tab === 'active' ? activeOrders : pastOrders;

  const handleReorder = (order: Order) => {
    reorderFromOrder(order);
    router.push('/(tabs)/cart');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        title="My Orders"
        onCart={() => router.push('/(tabs)/cart')}
        cartCount={cartSummary.totalQty}
      />

      {/* Segmented Tabs */}
      <View style={styles.segmentWrap}>
        <Pressable
          onPress={() => setTab('active')}
          style={[styles.segmentBtn, tab === 'active' && styles.segmentBtnActive]}
        >
          <Text
            style={[
              styles.segmentText,
              tab === 'active' && styles.segmentTextActive,
            ]}
          >
            Active ({activeOrders.length})
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('past')}
          style={[styles.segmentBtn, tab === 'past' && styles.segmentBtnActive]}
        >
          <Text
            style={[
              styles.segmentText,
              tab === 'past' && styles.segmentTextActive,
            ]}
          >
            Past ({pastOrders.length})
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {visibleOrders.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Package size={32} color={GPTBazaarTheme.colors.brandPrimary} />
            </View>
            <Text style={styles.emptyTitle}>
              {tab === 'active' ? 'No active orders right now' : 'No past orders yet'}
            </Text>
            <Text style={styles.emptySub}>
              Orders placed here sync in real time with the GPT Bazaar Admin Console.
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)')}
              style={styles.shopBtn}
            >
              <Text style={styles.shopBtnText}>Start Shopping</Text>
            </Pressable>
          </View>
        ) : (
          visibleOrders.map((order) => {
            const meta = STATUS_META[order.status] || STATUS_META.placed;
            const isActiveOrder =
              order.status === 'placed' ||
              order.status === 'packed' ||
              order.status === 'out_for_delivery';

            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderTopRow}>
                  <View>
                    <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                    <Text style={styles.orderDate}>
                      {order.statusTimeline?.[0]?.timestamp || 'Today'} •{' '}
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                    {isActiveOrder ? (
                      <Clock size={12} color={meta.fg} />
                    ) : (
                      <CheckCircle2 size={12} color={meta.fg} />
                    )}
                    <Text style={[styles.statusText, { color: meta.fg }]}>
                      {meta.label}
                    </Text>
                  </View>
                </View>

                {/* Preview Thumbnails */}
                <View style={styles.previewRow}>
                  {order.items.slice(0, 4).map((item, idx) => (
                    <View
                      key={`${item.productId}-${item.variantId}-${idx}`}
                      style={styles.previewThumb}
                    >
                      <ProductMedia
                        imageUrl={item.imageUrl}
                        artworkKey={item.artworkKey}
                        size={36}
                        style={styles.previewThumbInner}
                      />
                    </View>
                  ))}
                  {order.items.length > 4 && (
                    <View style={styles.moreCountBox}>
                      <Text style={styles.moreCountText}>
                        +{order.items.length - 4}
                      </Text>
                    </View>
                  )}
                  <View style={styles.totalCol}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalAmount}>
                      ₹{order.pricing.grandTotal}
                    </Text>
                  </View>
                </View>

                {/* Star Rating for Delivered Orders */}
                {order.status === 'delivered' && (
                  <View style={styles.ratingBox}>
                    <Text style={styles.ratingLabel}>
                      {order.rating ? 'Your rating' : 'Rate this delivery'}
                    </Text>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((star) => {
                        const filled = (order.rating || 0) >= star;
                        return (
                          <Pressable
                            key={star}
                            onPress={() => void rateOrder(order.id, star)}
                            hitSlop={6}
                            style={styles.starBtn}
                          >
                            <Star
                              size={18}
                              color={filled ? '#F59E0B' : '#CBD5E1'}
                              fill={filled ? '#F59E0B' : 'none'}
                            />
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Actions */}
                <View style={styles.actionsRow}>
                  <Pressable
                    onPress={() => router.push(`/track/${order.id}`)}
                    style={styles.trackBtn}
                  >
                    <Truck size={15} color="#FFFFFF" />
                    <Text style={styles.trackBtnText}>
                      {isActiveOrder ? 'Track Live' : 'Order Details'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleReorder(order)}
                    style={styles.reorderBtn}
                  >
                    <RotateCcw size={15} color={GPTBazaarTheme.colors.brandPrimary} />
                    <Text style={styles.reorderBtnText}>Reorder</Text>
                  </Pressable>
                </View>
              </View>
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
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: GPTBazaarTheme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: GPTBazaarTheme.colors.borderSubtle,
  },
  segmentBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F6F4',
  },
  segmentBtnActive: {
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
  },
  segmentText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkMuted,
  },
  segmentTextActive: { color: '#FFFFFF' },
  scrollContent: { padding: 14, paddingBottom: 28, gap: 12 },
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
    width: 68,
    height: 68,
    borderRadius: 34,
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
  shopBtn: {
    marginTop: 18,
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    paddingHorizontal: 22,
    height: 44,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  orderCard: {
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
  },
  orderTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  orderDate: {
    marginTop: 2,
    fontSize: 12,
    color: GPTBazaarTheme.colors.inkMuted,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
  },
  statusText: { fontSize: 11.5, fontWeight: '800' },
  previewRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewThumb: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewThumbInner: { width: '100%', height: '100%' },
  moreCountBox: {
    width: 38,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkMuted,
  },
  totalCol: { marginLeft: 'auto', alignItems: 'flex-end' },
  totalLabel: { fontSize: 11, color: GPTBazaarTheme.colors.inkMuted },
  totalAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: GPTBazaarTheme.colors.inkPrimary,
    fontVariant: ['tabular-nums'],
  },
  ratingBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: GPTBazaarTheme.colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkMuted,
  },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  starBtn: { padding: 3 },
  actionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  trackBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  trackBtnText: { color: '#FFFFFF', fontSize: 13.5, fontWeight: '800' },
  reorderBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    borderWidth: 1,
    borderColor: '#CBE7D5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  reorderBtnText: {
    color: GPTBazaarTheme.colors.brandPrimary,
    fontSize: 13.5,
    fontWeight: '800',
  },
});
