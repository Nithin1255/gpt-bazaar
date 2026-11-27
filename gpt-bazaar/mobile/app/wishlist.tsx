import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, ShoppingCart } from 'lucide-react-native';
import { ProductCard } from '../src/components/ProductCard';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { useMobileStore } from '../src/context/MobileStoreContext';
import { GPTBazaarTheme } from '../src/theme/tokens';

export default function WishlistScreen() {
  const router = useRouter();
  const {
    products,
    wishlistIds,
    cartSummary,
    getCartQty,
    addToCart,
    updateCartQty,
    toggleWishlist,
    addAllWishlistToCart,
  } = useMobileStore();

  const savedProducts = useMemo(
    () => products.filter((p) => wishlistIds.includes(p.id) && p.isActive),
    [products, wishlistIds]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader
        title={`Wishlist (${savedProducts.length})`}
        onBack={() => router.back()}
        onCart={() => router.push('/(tabs)/cart')}
        cartCount={cartSummary.totalQty}
      />

      {savedProducts.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <Heart size={34} color={GPTBazaarTheme.colors.offerCrimson} />
          </View>
          <Text style={styles.emptyTitle}>No saved groceries yet</Text>
          <Text style={styles.emptySub}>
            Tap the heart icon on any product to keep your regular buys one tap away.
          </Text>
          <Pressable
            onPress={() => router.replace('/(tabs)')}
            style={styles.browseBtn}
          >
            <Text style={styles.browseBtnText}>Explore Catalog</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topActionBar}>
            <Text style={styles.savedCount}>
              {savedProducts.length} saved item
              {savedProducts.length === 1 ? '' : 's'}
            </Text>
            <Pressable
              onPress={() => {
                addAllWishlistToCart();
                router.push('/(tabs)/cart');
              }}
              style={styles.addAllBtn}
            >
              <ShoppingCart size={14} color="#FFFFFF" />
              <Text style={styles.addAllText}>Add All to Cart</Text>
            </Pressable>
          </View>

          <View style={styles.grid}>
            {savedProducts.map((product) => {
              const defaultVarId =
                product.defaultVariantId || product.variants[0]?.id || '';
              return (
                <View key={product.id} style={styles.gridItem}>
                  <ProductCard
                    product={product}
                    qtyInCart={getCartQty(product.id, defaultVarId)}
                    isWishlisted
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
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: GPTBazaarTheme.colors.canvas },
  flex: { flex: 1 },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  emptySub: {
    marginTop: 8,
    fontSize: 13.5,
    color: GPTBazaarTheme.colors.inkMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  browseBtn: {
    marginTop: 20,
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    paddingHorizontal: 22,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseBtnText: { color: '#FFFFFF', fontSize: 14.5, fontWeight: '800' },
  scrollContent: { padding: 14, paddingBottom: 28 },
  topActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  savedCount: {
    fontSize: 14,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkMuted,
  },
  addAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    paddingHorizontal: 13,
    height: 36,
    borderRadius: 9,
  },
  addAllText: { color: '#FFFFFF', fontSize: 12.5, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  gridItem: { width: '50%' },
});
