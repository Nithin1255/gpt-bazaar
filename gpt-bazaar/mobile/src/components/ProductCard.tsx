import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Heart } from 'lucide-react-native';
import { GPTBazaarTheme } from '../theme/tokens';
import type { Product } from '../types/models';
import { ProductMedia } from './GroceryArtwork';
import { DietaryDot } from './ScreenHeader';

export function ProductCard({
  product,
  qtyInCart,
  isWishlisted,
  onPress,
  onAdd,
  onIncrement,
  onDecrement,
  onToggleWishlist,
  compactWidth,
  dense = false,
}: {
  product: Product;
  qtyInCart: number;
  isWishlisted: boolean;
  onPress: () => void;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onToggleWishlist: () => void;
  compactWidth?: number;
  dense?: boolean;
}) {
  const variant =
    product.variants.find((v) => v.id === product.defaultVariantId) || product.variants[0];
  if (!variant) return null;

  const isOutOfStock = variant.stock <= 0;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        dense && styles.cardDense,
        compactWidth ? { width: compactWidth, flexShrink: 0, flexGrow: 0 } : styles.gridCard,
      ]}
    >
      <View style={[styles.mediaBox, dense && styles.mediaBoxDense]}>
        <ProductMedia
          imageUrl={product.imageUrl}
          artworkKey={product.artworkKey}
          size={dense ? 46 : 58}
          style={styles.mediaInner}
        />

        {variant.discountPercent > 0 && (
          <View style={[styles.discountBadge, dense && styles.discountBadgeDense]}>
            <Text style={[styles.discountText, dense && styles.discountTextDense]}>
              {variant.discountPercent}% OFF
            </Text>
          </View>
        )}

        <Pressable
          onPress={onToggleWishlist}
          hitSlop={8}
          accessibilityLabel="Toggle wishlist"
          style={[styles.heartBtn, dense && styles.heartBtnDense]}
        >
          <Heart
            size={dense ? 13 : 15}
            color={isWishlisted ? GPTBazaarTheme.colors.offerCrimson : '#64748B'}
            fill={isWishlisted ? GPTBazaarTheme.colors.offerCrimson : 'none'}
          />
        </Pressable>
      </View>

      <View style={[styles.metaRow, dense && styles.metaRowDense]}>
        <DietaryDot type={product.dietaryType} />
        <Text numberOfLines={1} style={[styles.weight, dense && styles.weightDense]}>
          {variant.label}
        </Text>
      </View>

      <Text numberOfLines={2} style={[styles.title, dense && styles.titleDense]}>
        {product.name}
      </Text>

      <View style={[styles.footer, dense && styles.footerDense]}>
        <View style={styles.priceWrap}>
          <Text style={[styles.price, dense && styles.priceDense]}>₹{variant.price}</Text>
          {variant.mrp > variant.price && (
            <Text style={[styles.mrp, dense && styles.mrpDense]}>₹{variant.mrp}</Text>
          )}
        </View>

        {isOutOfStock ? (
          <View style={[styles.soldOutPill, dense && styles.soldOutPillDense]}>
            <Text style={[styles.soldOutText, dense && styles.soldOutTextDense]}>Sold out</Text>
          </View>
        ) : qtyInCart > 0 ? (
          <View style={[styles.stepper, dense && styles.stepperDense]}>
            <Pressable
              onPress={onDecrement}
              hitSlop={8}
              style={[styles.stepBtn, dense && styles.stepBtnDense]}
            >
              <Text style={[styles.stepBtnText, dense && styles.stepBtnTextDense]}>−</Text>
            </Pressable>
            <Text style={[styles.stepQty, dense && styles.stepQtyDense]}>{qtyInCart}</Text>
            <Pressable
              onPress={onIncrement}
              disabled={qtyInCart >= variant.stock}
              hitSlop={8}
              style={[
                styles.stepBtn,
                dense && styles.stepBtnDense,
                qtyInCart >= variant.stock && styles.stepBtnDisabled,
              ]}
            >
              <Text style={[styles.stepBtnText, dense && styles.stepBtnTextDense]}>+</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={onAdd} style={[styles.addBtn, dense && styles.addBtnDense]}>
            <Text style={[styles.addBtnText, dense && styles.addBtnTextDense]}>
              {dense ? 'Add' : 'Add +'}
            </Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    borderWidth: 1,
    borderRadius: GPTBazaarTheme.radii.lg,
    padding: 8,
  },
  cardDense: {
    borderRadius: 12,
    padding: 6,
  },
  gridCard: {
    width: '100%',
  },
  mediaBox: {
    position: 'relative',
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAF8',
    borderRadius: 10,
    padding: 6,
    overflow: 'hidden',
  },
  mediaBoxDense: {
    height: 68,
    borderRadius: 8,
    padding: 4,
  },
  mediaInner: { width: '100%', height: '100%' },
  discountBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: GPTBazaarTheme.colors.offerCrimson,
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  discountBadgeDense: {
    top: 4,
    left: 4,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  discountTextDense: {
    fontSize: 8.5,
  },
  heartBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtnDense: {
    top: 3,
    right: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  metaRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaRowDense: {
    marginTop: 4,
    gap: 4,
  },
  weight: { fontSize: 10.5, color: GPTBazaarTheme.colors.inkMuted, flexShrink: 1 },
  weightDense: { fontSize: 9.5 },
  title: {
    fontSize: 12.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkPrimary,
    marginTop: 3,
    minHeight: 32,
    lineHeight: 16,
  },
  titleDense: {
    fontSize: 11.5,
    minHeight: 28,
    lineHeight: 14,
  },
  footer: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  footerDense: {
    marginTop: 5,
    gap: 2,
  },
  priceWrap: {
    flexShrink: 1,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
    fontVariant: ['tabular-nums'],
    lineHeight: 17,
  },
  priceDense: {
    fontSize: 12.5,
    lineHeight: 15,
  },
  mrp: {
    fontSize: 10.5,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontVariant: ['tabular-nums'],
    lineHeight: 13,
  },
  mrpDense: {
    fontSize: 9.5,
    lineHeight: 11,
  },
  addBtn: {
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDense: {
    paddingHorizontal: 8,
    height: 26,
    borderRadius: 6,
  },
  addBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  addBtnTextDense: { fontSize: 11 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    borderRadius: 8,
    paddingHorizontal: 3,
    height: 30,
  },
  stepperDense: {
    borderRadius: 6,
    paddingHorizontal: 2,
    height: 26,
  },
  stepBtn: { width: 24, height: 30, alignItems: 'center', justifyContent: 'center' },
  stepBtnDense: { width: 19, height: 26 },
  stepBtnDisabled: { opacity: 0.45 },
  stepBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  stepBtnTextDense: { fontSize: 13 },
  stepQty: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    marginHorizontal: 2,
    fontVariant: ['tabular-nums'],
  },
  stepQtyDense: {
    fontSize: 11,
    marginHorizontal: 1,
  },
  soldOutPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutPillDense: {
    paddingHorizontal: 5,
    height: 24,
    borderRadius: 6,
  },
  soldOutText: { fontSize: 10.5, fontWeight: '700', color: '#64748B' },
  soldOutTextDense: { fontSize: 9.5 },
});
