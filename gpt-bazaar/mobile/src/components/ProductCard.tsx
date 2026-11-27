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
        compactWidth ? { width: compactWidth, flex: 0 } : { flex: 1 },
      ]}
    >
      <View style={styles.topRow}>
        {variant.discountPercent > 0 ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{variant.discountPercent}% OFF</Text>
          </View>
        ) : (
          <View />
        )}
        <Pressable
          onPress={onToggleWishlist}
          hitSlop={10}
          accessibilityLabel="Toggle wishlist"
          style={styles.heartBtn}
        >
          <Heart
            size={17}
            color={isWishlisted ? GPTBazaarTheme.colors.offerCrimson : '#94A3B8'}
            fill={isWishlisted ? GPTBazaarTheme.colors.offerCrimson : 'none'}
          />
        </Pressable>
      </View>

      <View style={styles.mediaBox}>
        <ProductMedia
          imageUrl={product.imageUrl}
          artworkKey={product.artworkKey}
          size={68}
          style={styles.mediaInner}
        />
      </View>

      <View style={styles.metaRow}>
        <DietaryDot type={product.dietaryType} />
        <Text numberOfLines={1} style={styles.weight}>
          {variant.label}
        </Text>
      </View>

      <Text numberOfLines={2} style={styles.title}>
        {product.name}
      </Text>

      <View style={styles.footer}>
        <View>
          <Text style={styles.price}>₹{variant.price}</Text>
          {variant.mrp > variant.price && <Text style={styles.mrp}>₹{variant.mrp}</Text>}
        </View>

        {isOutOfStock ? (
          <View style={styles.soldOutPill}>
            <Text style={styles.soldOutText}>Sold out</Text>
          </View>
        ) : qtyInCart > 0 ? (
          <View style={styles.stepper}>
            <Pressable onPress={onDecrement} hitSlop={8} style={styles.stepBtn}>
              <Text style={styles.stepBtnText}>−</Text>
            </Pressable>
            <Text style={styles.stepQty}>{qtyInCart}</Text>
            <Pressable
              onPress={onIncrement}
              disabled={qtyInCart >= variant.stock}
              hitSlop={8}
              style={[styles.stepBtn, qtyInCart >= variant.stock && styles.stepBtnDisabled]}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={onAdd} style={styles.addBtn}>
            <Text style={styles.addBtnText}>Add +</Text>
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
    padding: 10,
    margin: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 24,
  },
  discountBadge: {
    backgroundColor: GPTBazaarTheme.colors.offerCrimson,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  heartBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaBox: {
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAF8',
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 8,
    padding: 6,
  },
  mediaInner: { width: '100%', height: '100%' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  weight: { fontSize: 11, color: GPTBazaarTheme.colors.inkMuted, flexShrink: 1 },
  title: {
    fontSize: 13.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkPrimary,
    marginTop: 3,
    minHeight: 36,
    lineHeight: 18,
  },
  footer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
    fontVariant: ['tabular-nums'],
  },
  mrp: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontVariant: ['tabular-nums'],
  },
  addBtn: {
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#FFFFFF', fontSize: 12.5, fontWeight: '700' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    borderRadius: 8,
    paddingHorizontal: 4,
    height: 34,
  },
  stepBtn: { width: 26, height: 34, alignItems: 'center', justifyContent: 'center' },
  stepBtnDisabled: { opacity: 0.45 },
  stepBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  stepQty: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginHorizontal: 3,
    fontVariant: ['tabular-nums'],
  },
  soldOutPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
});
