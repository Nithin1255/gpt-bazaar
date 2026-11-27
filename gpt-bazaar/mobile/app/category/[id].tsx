import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, SlidersHorizontal } from 'lucide-react-native';
import { ProductMedia } from '../../src/components/GroceryArtwork';
import { ProductCard } from '../../src/components/ProductCard';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { useMobileStore } from '../../src/context/MobileStoreContext';
import { GPTBazaarTheme } from '../../src/theme/tokens';

type SortOption = 'popular' | 'price_low' | 'price_high' | 'discount';

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'popular', label: 'Popular' },
  { id: 'price_low', label: 'Price: Low' },
  { id: 'price_high', label: 'Price: High' },
  { id: 'discount', label: 'Best Discount' },
];

export default function CategoryListingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const categoryId = Array.isArray(params.id) ? params.id[0] : params.id || '';

  const {
    categories,
    products,
    wishlistIds,
    cartSummary,
    getCartQty,
    addToCart,
    updateCartQty,
    toggleWishlist,
  } = useMobileStore();

  const [activeSub, setActiveSub] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  const category = useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categories, categoryId]
  );

  const subTabs = useMemo(() => {
    const subs = category?.subcategories || [];
    return ['All', ...subs];
  }, [category]);

  const filteredProducts = useMemo(() => {
    let list = products.filter(
      (p) => p.isActive && (!categoryId || p.categoryId === categoryId)
    );

    if (activeSub !== 'All') {
      list = list.filter(
        (p) => (p.subcategory || '').toLowerCase() === activeSub.toLowerCase()
      );
    }

    const getDefaultVar = (p: (typeof list)[number]) =>
      p.variants.find((v) => v.id === p.defaultVariantId) || p.variants[0];

    return [...list].sort((a, b) => {
      const va = getDefaultVar(a);
      const vb = getDefaultVar(b);
      if (sortBy === 'price_low') return (va?.price || 0) - (vb?.price || 0);
      if (sortBy === 'price_high') return (vb?.price || 0) - (va?.price || 0);
      if (sortBy === 'discount')
        return (vb?.discountPercent || 0) - (va?.discountPercent || 0);
      return Number(Boolean(b.isPopular)) - Number(Boolean(a.isPopular));
    });
  }, [products, categoryId, activeSub, sortBy]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader
        title={category?.name || 'Category'}
        onBack={() => router.back()}
        onSearch={() => router.push('/search')}
        onCart={() => router.push('/(tabs)/cart')}
        cartCount={cartSummary.totalQty}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Hero Strip */}
        {category && (
          <View
            style={[
              styles.heroStrip,
              { backgroundColor: category.bgTint || GPTBazaarTheme.colors.surfaceMint },
            ]}
          >
            <View style={styles.flex}>
              <Text style={styles.heroTitle}>{category.name}</Text>
              <Text style={styles.heroSub}>
                {category.subtitle || 'Farm-fresh picks stocked daily at your local hub'}
              </Text>
              <View style={styles.etaInline}>
                <Clock size={12} color={GPTBazaarTheme.colors.brandPrimary} />
                <Text style={styles.etaText}>Delivered in 10–15 mins</Text>
              </View>
            </View>
            <View style={styles.heroMediaBox}>
              <ProductMedia
                imageUrl={category.imageUrl}
                artworkKey={category.artworkKey}
                size={60}
                style={styles.fullMedia}
              />
            </View>
          </View>
        )}

        {/* Subcategory Filter Tabs */}
        {subTabs.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subTabsRow}
          >
            {subTabs.map((sub) => {
              const selected = activeSub === sub;
              return (
                <Pressable
                  key={sub}
                  onPress={() => setActiveSub(sub)}
                  style={[styles.subTabBtn, selected && styles.subTabBtnActive]}
                >
                  <Text
                    style={[
                      styles.subTabText,
                      selected && styles.subTabTextActive,
                    ]}
                  >
                    {sub}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* Sort Controls */}
        <View style={styles.sortBar}>
          <View style={styles.sortLabelRow}>
            <SlidersHorizontal size={14} color={GPTBazaarTheme.colors.inkMuted} />
            <Text style={styles.countText}>
              {filteredProducts.length} item{filteredProducts.length === 1 ? '' : 's'}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortScroll}
          >
            {SORT_OPTIONS.map((opt) => {
              const active = sortBy === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setSortBy(opt.id)}
                  style={[styles.sortBtn, active && styles.sortBtnActive]}
                >
                  <Text
                    style={[
                      styles.sortBtnText,
                      active && styles.sortBtnTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No products in this filter yet</Text>
            <Text style={styles.emptySub}>
              Try switching back to &ldquo;All&rdquo; or explore another category.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredProducts.map((product) => {
              const defaultVarId =
                product.defaultVariantId || product.variants[0]?.id || '';
              return (
                <View key={product.id} style={styles.gridItem}>
                  <ProductCard
                    product={product}
                    qtyInCart={getCartQty(product.id, defaultVarId)}
                    isWishlisted={wishlistIds.includes(product.id)}
                    onPress={() => router.push(`/product/${product.id}`)}
                    onAdd={() => addToCart(product.id, defaultVarId, 1)}
                    onIncrement={() => updateCartQty(product.id, defaultVarId, 1)}
                    onDecrement={() => updateCartQty(product.id, defaultVarId, -1)}
                    onToggleWishlist={() => toggleWishlist(product.id)}
                  />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: GPTBazaarTheme.colors.canvas },
  flex: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 28 },
  heroStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E2ECE5',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  heroSub: {
    marginTop: 3,
    fontSize: 12.5,
    color: GPTBazaarTheme.colors.inkMuted,
    lineHeight: 17,
  },
  etaInline: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  etaText: {
    fontSize: 12,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  heroMediaBox: {
    width: 74,
    height: 74,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.75)',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullMedia: { width: '100%', height: '100%' },
  subTabsRow: { gap: 8, paddingBottom: 12 },
  subTabBtn: {
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 10,
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTabBtnActive: {
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    borderColor: GPTBazaarTheme.colors.brandPrimary,
  },
  subTabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  subTabTextActive: { color: '#FFFFFF' },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  sortLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  countText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkMuted,
  },
  sortScroll: { gap: 6 },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
  },
  sortBtnActive: {
    borderColor: GPTBazaarTheme.colors.brandPrimary,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
  },
  sortBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkMuted,
  },
  sortBtnTextActive: { color: GPTBazaarTheme.colors.brandPrimary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  gridItem: { width: '50%', padding: 4 },
  emptyCard: {
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 16,
    padding: 26,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
  },
  emptyTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  emptySub: {
    marginTop: 6,
    fontSize: 13,
    color: GPTBazaarTheme.colors.inkMuted,
    textAlign: 'center',
  },
});
