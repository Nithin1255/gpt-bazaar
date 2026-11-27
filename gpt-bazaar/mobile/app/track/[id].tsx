import React, { useMemo } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  Clock,
  MapPin,
  PackageCheck,
  Phone,
  RotateCcw,
  Star,
  Truck,
  XCircle,
} from 'lucide-react-native';
import {
  DeliveryScooterIllustration,
  ProductMedia,
} from '../../src/components/GroceryArtwork';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { useMobileStore } from '../../src/context/MobileStoreContext';
import { GPTBazaarTheme } from '../../src/theme/tokens';
import type { OrderStatus } from '../../src/types/models';

const STAGES: { key: Exclude<OrderStatus, 'cancelled'>; label: string; sub: string }[] = [
  { key: 'placed', label: 'Order Placed', sub: 'Confirmed at Chittoor Hub' },
  { key: 'packed', label: 'Packed', sub: 'Fresh items handpicked & sealed' },
  { key: 'out_for_delivery', label: 'Out for Delivery', sub: 'Rider heading to your doorstep' },
  { key: 'delivered', label: 'Delivered', sub: 'Handed over fresh' },
];

const STAGE_INDEX: Record<OrderStatus, number> = {
  placed: 0,
  packed: 1,
  out_for_delivery: 2,
  delivered: 3,
  cancelled: -1,
};

export default function TrackOrderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id || '';

  const { orders, reorderFromOrder } = useMobileStore();

  const order = useMemo(
    () => orders.find((o) => o.id === orderId) || orders[0] || null,
    [orders, orderId]
  );

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScreenHeader
          title="Track Order"
          onBack={() =>
            router.canGoBack() ? router.back() : router.replace('/(tabs)/orders')
          }
        />
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Order not found</Text>
          <Text style={styles.emptySub}>
            Wait a moment for Firestore sync or check your Orders list.
          </Text>
          <Pressable
            onPress={() => router.replace('/(tabs)/orders')}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>Go to My Orders</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const currentStageIdx = STAGE_INDEX[order.status] ?? 0;
  const isCancelled = order.status === 'cancelled';

  const heroHeadline = isCancelled
    ? 'Order Cancelled'
    : order.status === 'delivered'
      ? 'Order Delivered!'
      : order.status === 'out_for_delivery'
        ? 'Arriving in 5–8 mins'
        : order.status === 'packed'
          ? 'Packed & assigning rider'
          : `Arriving in ${order.etaText || '10–15 mins'}`;

  const handleCallRider = () => {
    const phone = order.deliveryPartner?.phone;
    if (phone) {
      void Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch(() => {});
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader
        title={`Track ${order.orderNumber}`}
        onBack={() =>
          router.canGoBack() ? router.back() : router.replace('/(tabs)/orders')
        }
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ETA / Status Hero Card */}
        <View
          style={[
            styles.heroCard,
            isCancelled && styles.heroCardCancelled,
          ]}
        >
          <View style={styles.flex}>
            <View style={styles.liveTag}>
              <View style={styles.livePulseDot} />
              <Text style={styles.liveTagText}>LIVE SYNC</Text>
            </View>
            <Text style={styles.heroHeadline}>{heroHeadline}</Text>
            <Text style={styles.heroSub}>
              {order.orderNumber} • {order.items.length} item
              {order.items.length > 1 ? 's' : ''} • ₹{order.pricing.grandTotal}
            </Text>
          </View>
          {isCancelled ? (
            <XCircle size={56} color="#FECACA" />
          ) : (
            <DeliveryScooterIllustration width={116} height={70} />
          )}
        </View>

        {/* 4-Stage Fulfillment Progress */}
        {!isCancelled && (
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Live Fulfillment Status</Text>
            <View style={styles.stepperList}>
              {STAGES.map((stage, idx) => {
                const completed = idx <= currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                const isLast = idx === STAGES.length - 1;
                return (
                  <View key={stage.key} style={styles.stageRow}>
                    <View style={styles.stageRailCol}>
                      <View
                        style={[
                          styles.stageDot,
                          completed && styles.stageDotDone,
                          isCurrent && styles.stageDotCurrent,
                        ]}
                      >
                        {completed ? (
                          <CheckCircle2 size={14} color="#FFFFFF" />
                        ) : (
                          <Clock size={12} color="#94A3B8" />
                        )}
                      </View>
                      {!isLast && (
                        <View
                          style={[
                            styles.stageLine,
                            idx < currentStageIdx && styles.stageLineDone,
                          ]}
                        />
                      )}
                    </View>
                    <View style={styles.stageContent}>
                      <Text
                        style={[
                          styles.stageTitle,
                          completed && styles.stageTitleDone,
                        ]}
                      >
                        {stage.label}
                      </Text>
                      <Text style={styles.stageSub}>{stage.sub}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Delivery Partner Card */}
        {order.deliveryPartner && !isCancelled && (
          <View style={styles.card}>
            <View style={styles.partnerRow}>
              <View style={styles.partnerAvatar}>
                <Truck size={22} color={GPTBazaarTheme.colors.brandPrimary} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.partnerRole}>Delivery Partner</Text>
                <Text style={styles.partnerName}>{order.deliveryPartner.name}</Text>
                <View style={styles.partnerRatingRow}>
                  <Star size={12} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.partnerMeta}>
                    {order.deliveryPartner.rating} •{' '}
                    {order.deliveryPartner.deliveriesCount}+ deliveries
                  </Text>
                </View>
              </View>
              <Pressable onPress={handleCallRider} style={styles.callBtn}>
                <Phone size={17} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        )}

        {/* Timestamped Timeline Log */}
        {order.statusTimeline && order.statusTimeline.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardTitleIconRow}>
              <PackageCheck size={17} color={GPTBazaarTheme.colors.brandPrimary} />
              <Text style={styles.cardHeadingInline}>Hub Activity Updates</Text>
            </View>

            {order.statusTimeline.map((evt, idx) => (
              <View
                key={`${evt.status}-${idx}`}
                style={[
                  styles.logRow,
                  idx === order.statusTimeline.length - 1 && styles.logRowLast,
                ]}
              >
                <View style={styles.flex}>
                  <Text style={styles.logLabel}>{evt.label}</Text>
                  <Text style={styles.logNote}>{evt.note}</Text>
                </View>
                <Text style={styles.logTime}>{evt.timestamp}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Delivery Address */}
        <View style={styles.card}>
          <View style={styles.cardTitleIconRow}>
            <MapPin size={17} color={GPTBazaarTheme.colors.brandPrimary} />
            <Text style={styles.cardHeadingInline}>Delivering To</Text>
          </View>
          <Text style={styles.addrName}>
            {order.customerName} • {order.deliveryAddress.label}
          </Text>
          <Text style={styles.addrText}>
            {order.deliveryAddress.line1}, {order.deliveryAddress.city} -{' '}
            {order.deliveryAddress.pincode}
          </Text>
        </View>

        {/* Itemized Receipt */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Items Ordered ({order.items.length})</Text>
          {order.items.map((item, idx) => (
            <View
              key={`${item.productId}-${item.variantId}-${idx}`}
              style={styles.itemRow}
            >
              <View style={styles.itemThumb}>
                <ProductMedia
                  imageUrl={item.imageUrl}
                  artworkKey={item.artworkKey}
                  size={34}
                  style={styles.fullMedia}
                />
              </View>
              <View style={styles.flex}>
                <Text numberOfLines={1} style={styles.itemName}>
                  {item.name}
                </Text>
                <Text style={styles.itemSub}>
                  {item.variantLabel} × {item.qty}
                </Text>
              </View>
              <Text style={styles.itemPrice}>₹{item.unitPrice * item.qty}</Text>
            </View>
          ))}

          <View style={styles.receiptDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Paid ({order.paymentMethod.toUpperCase()})
            </Text>
            <Text style={styles.totalVal}>₹{order.pricing.grandTotal}</Text>
          </View>
        </View>

        {/* Reorder Action */}
        <Pressable
          onPress={() => {
            reorderFromOrder(order);
            router.push('/(tabs)/cart');
          }}
          style={styles.reorderFullBtn}
        >
          <RotateCcw size={16} color={GPTBazaarTheme.colors.brandPrimary} />
          <Text style={styles.reorderFullText}>Reorder All Items</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: GPTBazaarTheme.colors.canvas },
  flex: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 30, gap: 12 },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  emptySub: {
    marginTop: 6,
    fontSize: 13.5,
    color: GPTBazaarTheme.colors.inkMuted,
    textAlign: 'center',
  },
  primaryBtn: {
    marginTop: 18,
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    paddingHorizontal: 22,
    height: 44,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  heroCard: {
    backgroundColor: GPTBazaarTheme.colors.brandDeep,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroCardCancelled: { backgroundColor: '#991B1B' },
  liveTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: GPTBazaarTheme.colors.brandAccent,
  },
  liveTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroHeadline: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroSub: {
    marginTop: 4,
    fontSize: 12.5,
    color: '#D1FAE5',
    fontWeight: '600',
  },
  card: {
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
    marginBottom: 12,
  },
  cardTitleIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 10,
  },
  cardHeadingInline: {
    fontSize: 15,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  stepperList: { gap: 2 },
  stageRow: { flexDirection: 'row', gap: 12 },
  stageRailCol: { alignItems: 'center', width: 26 },
  stageDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageDotDone: { backgroundColor: GPTBazaarTheme.colors.brandPrimary },
  stageDotCurrent: {
    borderWidth: 3,
    borderColor: '#BBF7D0',
  },
  stageLine: {
    width: 2,
    flex: 1,
    minHeight: 24,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  stageLineDone: { backgroundColor: GPTBazaarTheme.colors.brandPrimary },
  stageContent: { flex: 1, paddingBottom: 14 },
  stageTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkMuted,
  },
  stageTitleDone: { color: GPTBazaarTheme.colors.inkPrimary, fontWeight: '800' },
  stageSub: { fontSize: 12, color: GPTBazaarTheme.colors.inkMuted, marginTop: 2 },
  partnerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  partnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerRole: { fontSize: 11, fontWeight: '700', color: GPTBazaarTheme.colors.inkMuted },
  partnerName: {
    fontSize: 15,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
    marginTop: 1,
  },
  partnerRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  partnerMeta: { fontSize: 12, color: GPTBazaarTheme.colors.inkMuted },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: GPTBazaarTheme.colors.borderSubtle,
  },
  logRowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  logLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  logNote: {
    fontSize: 12,
    color: GPTBazaarTheme.colors.inkMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  logTime: {
    fontSize: 11,
    fontWeight: '600',
    color: GPTBazaarTheme.colors.inkMuted,
  },
  addrName: {
    fontSize: 14,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  addrText: {
    marginTop: 3,
    fontSize: 13,
    color: GPTBazaarTheme.colors.inkMuted,
    lineHeight: 18,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  itemThumb: {
    width: 42,
    height: 42,
    borderRadius: 9,
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    padding: 4,
  },
  fullMedia: { width: '100%', height: '100%' },
  itemName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  itemSub: { fontSize: 11.5, color: GPTBazaarTheme.colors.inkMuted, marginTop: 1 },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
    fontVariant: ['tabular-nums'],
  },
  receiptDivider: {
    height: 1,
    backgroundColor: GPTBazaarTheme.colors.borderSubtle,
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 14.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  totalVal: {
    fontSize: 17,
    fontWeight: '900',
    color: GPTBazaarTheme.colors.brandPrimary,
    fontVariant: ['tabular-nums'],
  },
  reorderFullBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    borderWidth: 1,
    borderColor: '#CBE7D5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  reorderFullText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
});
