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
import { ArrowLeft, Clock, Search, TrendingUp, X } from 'lucide-react-native';
import { ProductMedia } from '../src/components/GroceryArtwork';
import { ProductCard } from '../src/components/ProductCard';
import { useMobileStore } from '../src/context/MobileStoreContext';
import { GPTBazaarTheme } from '../src/theme/tokens';

const POPULAR_TERMS = [
  { label: 'Fresh Tomato', artworkKey: 'tomato' },
  { label: 'Farm Milk', artworkKey: 'milk' },
  { label: 'Brown Eggs', artworkKey: 'eggs' },
  { label: 'Sona Masoori Rice', artworkKey: 'rice' },
];

export default function SearchScreen() {
  const router = useRouter();
  const {
    products,
    categories,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    wishlistIds,
    getCartQty,
    addToCart,
    updateCartQty,
    toggleWishlist,
  } = useMobileStore();

  const [queryText, setQueryText] = useState('');

  const trimmed = queryText.trim().toLowerCase();

  const results = useMemo(() => {
    if (!trimmed) return [];
    return products.filter((p) => {
      if (!p.isActive) return false;
      const inName = p.name.toLowerCase().includes(trimmed);
      const inBrand = (p.brand || '').toLowerCase().includes(trimmed);
      const inSub = (p.subcategory || '').toLowerCase().includes(trimmed);
      const inTags = (p.tags || []).some((t) => t.toLowerCase().includes(trimmed));
      return inName || inBrand || inSub || inTags;
    });
  }, [products, trimmed]);

  const activeCategories = useMemo(
    () => categories.filter((c) => c.isActive),
    [categories]
  );

  const handleSelectTerm = (term: string) => {
    setQueryText(term);
    addRecentSearch(term);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color={GPTBazaarTheme.colors.inkPrimary} />
        </Pressable>

        <View style={styles.inputBox}>
          <Search size={18} color={GPTBazaarTheme.colors.inkMuted} />
          <TextInput
            value={queryText}
            onChangeText={setQueryText}
            onSubmitEditing={() => {
              if (queryText.trim()) addRecentSearch(queryText.trim());
            }}
            placeholder="Search vegetables, dairy, rice, snacks..."
            placeholderTextColor="#94A3B8"
            autoFocus
            returnKeyType="search"
            style={styles.input}
          />
          {queryText.length > 0 && (
            <Pressable
              onPress={() => setQueryText('')}
              hitSlop={10}
              style={styles.clearIconBtn}
            >
              <X size={16} color={GPTBazaarTheme.colors.inkMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!trimmed ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                  <Pressable onPress={clearRecentSearches} hitSlop={8}>
                    <Text style={styles.clearAllText}>Clear All</Text>
                  </Pressable>
                </View>

                <View style={styles.chipWrap}>
                  {recentSearches.map((term) => (
                    <Pressable
                      key={term}
                      onPress={() => handleSelectTerm(term)}
                      style={styles.recentChip}
                    >
                      <Clock size={13} color={GPTBazaarTheme.colors.inkMuted} />
                      <Text style={styles.recentChipText}>{term}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Popular Searches */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.titleIconRow}>
                  <TrendingUp size={16} color={GPTBazaarTheme.colors.brandPrimary} />
                  <Text style={styles.sectionTitle}>Popular Searches</Text>
                </View>
              </View>

              <View style={styles.popularGrid}>
                {POPULAR_TERMS.map((item) => (
                  <Pressable
                    key={item.label}
                    onPress={() => handleSelectTerm(item.label.split(' ').pop() || item.label)}
                    style={styles.popularCard}
                  >
                    <ProductMedia artworkKey={item.artworkKey} size={42} />
                    <Text numberOfLines={1} style={styles.popularLabel}>
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Browse by Category */}
            {activeCategories.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Browse by Category</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.catScroll}
                >
                  {activeCategories.map((cat) => (
                    <Pressable
                      key={cat.id}
                      onPress={() => router.push(`/category/${cat.id}`)}
                      style={styles.catMiniCard}
                    >
                      <View
                        style={[
                          styles.catMiniThumb,
                          {
                            backgroundColor:
                              cat.bgTint || GPTBazaarTheme.colors.surfaceMint,
                          },
                        ]}
                      >
                        <ProductMedia
                          imageUrl={cat.imageUrl}
                          artworkKey={cat.artworkKey}
                          size={40}
                          style={styles.fullMedia}
                        />
                      </View>
                      <Text numberOfLines={2} style={styles.catMiniName}>
                        {cat.name}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.resultCountText}>
              {results.length} result{results.length === 1 ? '' : 's'} for &ldquo;
              {queryText.trim()}&rdquo;
            </Text>

            {results.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No matching items found</Text>
                <Text style={styles.emptySub}>
                  Try searching for milk, tomato, banana, rice, bread, or oil.
                </Text>
              </View>
            ) : (
              <View style={styles.grid}>
                {results.map((product) => {
                  const defaultVarId =
                    product.defaultVariantId || product.variants[0]?.id || '';
                  return (
                    <View key={product.id} style={styles.gridItem}>
                      <ProductCard
                        product={product}
                        qtyInCart={getCartQty(product.id, defaultVarId)}
                        isWishlisted={wishlistIds.includes(product.id)}
                        onPress={() => {
                          addRecentSearch(queryText.trim());
                          router.push(`/product/${product.id}`);
                        }}
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
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: GPTBazaarTheme.colors.canvas },
  flex: { flex: 1 },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: GPTBazaarTheme.colors.borderSubtle,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    backgroundColor: '#F3F6F4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  clearIconBtn: { padding: 4 },
  scrollContent: { padding: 14, paddingBottom: 28 },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  clearAllText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.offerCrimson,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  recentChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularCard: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
  },
  popularLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  catScroll: { paddingTop: 10, gap: 10 },
  catMiniCard: { width: 84, alignItems: 'center' },
  catMiniThumb: {
    width: 72,
    height: 72,
    borderRadius: 14,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8EFEA',
  },
  fullMedia: { width: '100%', height: '100%' },
  catMiniName: {
    marginTop: 5,
    fontSize: 11.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkPrimary,
    textAlign: 'center',
    lineHeight: 15,
  },
  resultCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkMuted,
    marginBottom: 10,
  },
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  gridItem: { width: '50%', padding: 4 },
});
