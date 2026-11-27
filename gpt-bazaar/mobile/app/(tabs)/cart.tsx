import React, { useState } from 'react';
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
  Check,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Truck,
} from 'lucide-react-native';
import { ProductMedia } from '../../src/components/GroceryArtwork';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import {
  FREE_DELIVERY_THRESHOLD,
  useMobileStore,
} from '../../src/context/MobileStoreContext';
import { GPTBazaarTheme } from '../../src/theme/tokens';

export default function CartScreen() {
  const router = useRouter();
  const {
    cartSummary,
    coupons,
    selectedCouponCode,
    setSelectedCouponCode,
    toggleCartSelected,
    updateCartQty,
    removeFromCart,
    clearCart,
  } = useMobileStore();
  const [showCoupons, setShowCoupons] = useState(false);

  const activeCoupons = coupons.filter((c) => c.isActive);
  const progressRatio = Math.min(
    1,
    cartSummary.itemTotal / FREE_DELIVERY_THRESHOLD
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        title={`My Cart${cartSummary.totalQty > 0 ? ` (${cartSummary.totalQty})` : ''}`}
        rightSlot={
          cartSummary.rows.length > 0 ? (
            <Pressable onPress={clearCart} style={styles.clearBtn} hitSlop={8}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </Pressable>
          ) : undefined
        }
      />

      {cartSummary.rows.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconCircle}>
            <ShoppingBag size={36} color={GPTBazaarTheme.colors.brandPrimary} />
          </View>
          <Text style={styles.emptyTitle}>Your grocery basket is empty</Text>
          <Text style={styles.emptySub}>
            Explore fresh vegetables, dairy, rice, and daily essentials delivered in 10–15 minutes.
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)')}
            style={styles.shopNowBtn}
          >
            <Text style={styles.shopNowText}>Browse Groceries</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Free Delivery Progress Bar */}
            <View style={styles.freeDeliveryCard}>
              <View style={styles.freeDeliveryRow}>
                <Truck size={18} color={GPTBazaarTheme.colors.brandPrimary} />
                {cartSummary.freeDeliveryRemaining > 0 ? (
                  <Text style={styles.freeDeliveryText}>
                    Add{' '}
                    <Text style={styles.freeDeliveryBold}>
                      ₹{cartSummary.freeDeliveryRemaining}
                    </Text>{' '}
                    more to unlock FREE delivery!
                  </Text>
                ) : (
                  <Text style={styles.freeDeliveryText}>
                    Yay! You unlocked <Text style={styles.freeDeliveryBold}>FREE Delivery</Text>
                  </Text>
                )}
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.round(progressRatio * 100)}%` },
                  ]}
                />
              </View>
            </View>

            {/* Cart Item Rows */}
            <View style={styles.card}>
              {cartSummary.rows.map(({ cartItem, product, variant }, idx) => (
                <View
                  key={`${cartItem.productId}-${cartItem.variantId}`}
                  style={[
                    styles.itemRow,
                    idx === cartSummary.rows.length - 1 && styles.itemRowLast,
                  ]}
                >
                  <Pressable
                    onPress={() => toggleCartSelected(cartItem.productId, cartItem.variantId)}
                    style={[
                      styles.checkbox,
                      cartItem.selected && styles.checkboxSelected,
                    ]}
                    hitSlop={8}
                  >
                    {cartItem.selected && (
                      <Check size={13} color="#FFFFFF" strokeWidth={3} />
                    )}
                  </Pressable>

                  <Pressable
                    onPress={() => router.push(`/product/${product.id}`)}
                    style={styles.thumbBox}
                  >
                    <ProductMedia
                      imageUrl={product.imageUrl}
                      artworkKey={product.artworkKey}
                      size={44}
                      style={styles.thumbInner}
                    />
                  </Pressable>

                  <View style={styles.itemMeta}>
                    <Text numberOfLines={2} style={styles.itemTitle}>
                      {product.name}
                    </Text>
                    <Text style={styles.itemVariant}>{variant.label}</Text>
                    <View style={styles.itemPriceRow}>
                      <Text style={styles.itemPrice}>
                        ₹{variant.price * cartItem.qty}
                      </Text>
                      {variant.mrp > variant.price && (
                        <Text style={styles.itemMrp}>
                          ₹{variant.mrp * cartItem.qty}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.itemControls}>
                    <View style={styles.stepper}>
                      <Pressable
                        onPress={() =>
                          updateCartQty(cartItem.productId, cartItem.variantId, -1)
                        }
                        style={styles.stepBtn}
                        hitSlop={6}
                      >
                        <Text style={styles.stepBtnText}>−</Text>
                      </Pressable>
                      <Text style={styles.stepQty}>{cartItem.qty}</Text>
                      <Pressable
                        onPress={() =>
                          updateCartQty(cartItem.productId, cartItem.variantId, 1)
                        }
                        disabled={cartItem.qty >= variant.stock}
                        style={[
                          styles.stepBtn,
                          cartItem.qty >= variant.stock && styles.stepDisabled,
                        ]}
                        hitSlop={6}
                      >
                        <Text style={styles.stepBtnText}>+</Text>
                      </Pressable>
                    </View>

                    <Pressable
                      onPress={() =>
                        removeFromCart(cartItem.productId, cartItem.variantId)
                      }
                      style={styles.removeBtn}
                      hitSlop={8}
                    >
                      <Trash2 size={14} color={GPTBazaarTheme.colors.inkMuted} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>

            {/* Coupons Accordion */}
            <View style={styles.card}>
              <Pressable
                onPress={() => setShowCoupons((prev) => !prev)}
                style={styles.couponHeader}
              >
                <View style={styles.couponHeaderLeft}>
                  <Tag size={18} color={GPTBazaarTheme.colors.brandPrimary} />
                  <View>
                    <Text style={styles.couponHeaderTitle}>
                      {cartSummary.appliedCoupon
                        ? `${cartSummary.appliedCoupon.code} applied (Saved ₹${cartSummary.discount})`
                        : 'Apply Coupon & Offers'}
                    </Text>
                    <Text style={styles.couponHeaderSub}>
                      {activeCoupons.length} available offer{activeCoupons.length === 1 ? '' : 's'}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={GPTBazaarTheme.colors.inkMuted} />
              </Pressable>

              {showCoupons && (
                <View style={styles.couponList}>
                  {activeCoupons.map((coupon) => {
                    const isApplied = selectedCouponCode === coupon.code;
                    const eligible = cartSummary.itemTotal >= coupon.minOrderAmount;
                    return (
                      <Pressable
                        key={coupon.id}
                        onPress={() =>
                          setSelectedCouponCode(isApplied ? null : coupon.code)
                        }
                        style={[
                          styles.couponRow,
                          isApplied && styles.couponRowApplied,
                        ]}
                      >
                        <View style={styles.flex}>
                          <Text style={styles.couponCode}>{coupon.code}</Text>
                          <Text style={styles.couponDesc}>{coupon.title}</Text>
                          <Text style={styles.couponMin}>
                            {eligible
                              ? 'Eligible on this order'
                              : `Min order ₹${coupon.minOrderAmount} required`}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.couponApplyBtn,
                            isApplied && styles.couponAppliedBtn,
                          ]}
                        >
                          <Text
                            style={[
                              styles.couponApplyText,
                              isApplied && styles.couponAppliedText,
                            ]}
                          >
                            {isApplied ? 'Remove' : 'Apply'}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Bill Summary */}
            <View style={styles.card}>
              <Text style={styles.billTitle}>Bill Details</Text>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Total</Text>
                <Text style={styles.billValue}>₹{cartSummary.itemTotal}</Text>
              </View>
              {cartSummary.discount > 0 && (
                <View style={styles.billRow}>
                  <Text style={styles.billLabelGreen}>
                    Coupon Discount ({cartSummary.appliedCoupon?.code})
                  </Text>
                  <Text style={styles.billValueGreen}>−₹{cartSummary.discount}</Text>
                </View>
              )}
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Fee</Text>
                <Text
                  style={
                    cartSummary.deliveryFee === 0
                      ? styles.billValueGreen
                      : styles.billValue
                  }
                >
                  {cartSummary.deliveryFee === 0 ? 'FREE' : `₹${cartSummary.deliveryFee}`}
                </Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Handling & Packaging</Text>
                <Text style={styles.billValue}>₹{cartSummary.packagingFee}</Text>
              </View>

              <View style={styles.billDivider} />

              <View style={styles.billRow}>
                <Text style={styles.grandLabel}>To Pay</Text>
                <Text style={styles.grandValue}>₹{cartSummary.grandTotal}</Text>
              </View>

              {cartSummary.totalSavings > 0 && (
                <View style={styles.savingsBanner}>
                  <Sparkles size={15} color={GPTBazaarTheme.colors.brandPrimary} />
                  <Text style={styles.savingsText}>
                    You are saving ₹{cartSummary.totalSavings} on this order!
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Sticky Checkout Bar */}
          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.bottomTotalLabel}>Grand Total</Text>
              <Text style={styles.bottomTotalValue}>₹{cartSummary.grandTotal}</Text>
            </View>
            <Pressable
              disabled={cartSummary.selectedCount === 0}
              onPress={() => router.push('/checkout')}
              style={[
                styles.checkoutBtn,
                cartSummary.selectedCount === 0 && styles.checkoutBtnDisabled,
              ]}
            >
              <Text style={styles.checkoutBtnText}>Proceed to Checkout →</Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: GPTBazaarTheme.colors.canvas },
  flex: { flex: 1 },
  clearBtn: { paddingHorizontal: 10, paddingVertical: 8 },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.offerCrimson,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
    textAlign: 'center',
  },
  emptySub: {
    marginTop: 8,
    fontSize: 13.5,
    color: GPTBazaarTheme.colors.inkMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  shopNowBtn: {
    marginTop: 20,
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    paddingHorizontal: 22,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopNowText: { color: '#FFFFFF', fontSize: 14.5, fontWeight: '800' },
  scrollContent: { padding: 14, paddingBottom: 28, gap: 12 },
  freeDeliveryCard: {
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: '#CBE7D5',
  },
  freeDeliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  freeDeliveryText: {
    fontSize: 13,
    color: GPTBazaarTheme.colors.inkPrimary,
    flex: 1,
  },
  freeDeliveryBold: {
    fontWeight: '800',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  progressTrack: {
    marginTop: 8,
    height: 6,
    borderRadius: 6,
    backgroundColor: '#D6EFE0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    borderRadius: 6,
  },
  card: {
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: GPTBazaarTheme.colors.borderSubtle,
  },
  itemRowLast: { borderBottomWidth: 0, paddingBottom: 2 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    borderColor: GPTBazaarTheme.colors.brandPrimary,
  },
  thumbBox: {
    width: 58,
    height: 58,
    borderRadius: 11,
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbInner: { width: '100%', height: '100%' },
  itemMeta: { flex: 1 },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkPrimary,
    lineHeight: 17,
  },
  itemVariant: {
    fontSize: 11.5,
    color: GPTBazaarTheme.colors.inkMuted,
    marginTop: 2,
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 14.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
    fontVariant: ['tabular-nums'],
  },
  itemMrp: {
    fontSize: 11.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontVariant: ['tabular-nums'],
  },
  itemControls: { alignItems: 'flex-end', gap: 6 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    borderRadius: 8,
    height: 32,
    paddingHorizontal: 3,
  },
  stepBtn: { width: 25, height: 32, alignItems: 'center', justifyContent: 'center' },
  stepDisabled: { opacity: 0.45 },
  stepBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  stepQty: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginHorizontal: 3,
    fontVariant: ['tabular-nums'],
  },
  removeBtn: { padding: 4 },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  couponHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  couponHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  couponHeaderSub: {
    fontSize: 11.5,
    color: GPTBazaarTheme.colors.inkMuted,
    marginTop: 1,
  },
  couponList: { marginTop: 12, gap: 8 },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    backgroundColor: '#FAFCFA',
  },
  couponRowApplied: {
    borderColor: GPTBazaarTheme.colors.brandPrimary,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
  },
  couponCode: {
    fontSize: 13,
    fontWeight: '900',
    color: GPTBazaarTheme.colors.brandDeep,
    letterSpacing: 0.4,
  },
  couponDesc: {
    fontSize: 12,
    fontWeight: '600',
    color: GPTBazaarTheme.colors.inkPrimary,
    marginTop: 2,
  },
  couponMin: {
    fontSize: 11,
    color: GPTBazaarTheme.colors.inkMuted,
    marginTop: 2,
  },
  couponApplyBtn: {
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.brandPrimary,
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  couponAppliedBtn: {
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
  },
  couponApplyText: {
    fontSize: 12,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  couponAppliedText: { color: '#FFFFFF' },
  billTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
    marginBottom: 10,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  billLabel: { fontSize: 13.5, color: GPTBazaarTheme.colors.inkMuted },
  billValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkPrimary,
    fontVariant: ['tabular-nums'],
  },
  billLabelGreen: {
    fontSize: 13.5,
    fontWeight: '600',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  billValueGreen: {
    fontSize: 13.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.brandPrimary,
    fontVariant: ['tabular-nums'],
  },
  billDivider: {
    height: 1,
    backgroundColor: GPTBazaarTheme.colors.borderSubtle,
    marginVertical: 8,
  },
  grandLabel: {
    fontSize: 15.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  grandValue: {
    fontSize: 17,
    fontWeight: '900',
    color: GPTBazaarTheme.colors.inkPrimary,
    fontVariant: ['tabular-nums'],
  },
  savingsBanner: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  savingsText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: GPTBazaarTheme.colors.borderSubtle,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  bottomTotalLabel: {
    fontSize: 11.5,
    color: GPTBazaarTheme.colors.inkMuted,
    fontWeight: '600',
  },
  bottomTotalValue: {
    fontSize: 19,
    fontWeight: '900',
    color: GPTBazaarTheme.colors.inkPrimary,
    fontVariant: ['tabular-nums'],
  },
  checkoutBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnDisabled: { opacity: 0.45 },
  checkoutBtnText: { color: '#FFFFFF', fontSize: 14.5, fontWeight: '800' },
});
