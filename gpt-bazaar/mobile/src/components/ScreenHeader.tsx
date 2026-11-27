import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Search, ShoppingCart } from 'lucide-react-native';
import { GPTBazaarTheme } from '../theme/tokens';
import type { DietaryType } from '../types/models';
import { GPTBazaarLogo } from './GroceryArtwork';

export function DietaryDot({ type }: { type: DietaryType }) {
  if (type === 'none') return null;
  const color = type === 'veg' ? '#16A34A' : '#DC2626';
  return (
    <View style={[styles.dietBox, { borderColor: color }]}>
      <View style={[styles.dietDot, { backgroundColor: color }]} />
    </View>
  );
}

export function ScreenHeader({
  title,
  showLogo = false,
  onBack,
  onSearch,
  onCart,
  cartCount = 0,
  rightSlot,
}: {
  title?: string;
  showLogo?: boolean;
  onBack?: () => void;
  onSearch?: () => void;
  onCart?: () => void;
  cartCount?: number;
  rightSlot?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {onBack && (
          <Pressable
            onPress={onBack}
            accessibilityLabel="Go back"
            style={styles.iconBtn}
            hitSlop={8}
          >
            <ArrowLeft size={22} color={GPTBazaarTheme.colors.inkPrimary} />
          </Pressable>
        )}
        {showLogo ? (
          <GPTBazaarLogo compact />
        ) : (
          <Text numberOfLines={1} style={styles.title}>
            {title || ''}
          </Text>
        )}
      </View>

      <View style={styles.right}>
        {rightSlot}
        {onSearch && (
          <Pressable
            onPress={onSearch}
            accessibilityLabel="Search products"
            style={styles.iconBtn}
            hitSlop={8}
          >
            <Search size={21} color={GPTBazaarTheme.colors.inkPrimary} />
          </Pressable>
        )}
        {onCart && (
          <Pressable
            onPress={onCart}
            accessibilityLabel="Open cart"
            style={styles.iconBtn}
            hitSlop={8}
          >
            <ShoppingCart size={21} color={GPTBazaarTheme.colors.inkPrimary} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: 12,
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: GPTBazaarTheme.colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkPrimary,
    flexShrink: 1,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 6,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: GPTBazaarTheme.colors.offerCrimson,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  dietBox: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  dietDot: { width: 6, height: 6, borderRadius: 3 },
});
