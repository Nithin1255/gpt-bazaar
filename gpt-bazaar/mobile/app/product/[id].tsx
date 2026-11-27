import React, { useEffect, useMemo, useState } from 'react';
import {
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
  Heart,
  Leaf,
  ShieldCheck,
  Star,
  Truck,
} from 'lucide-react-native';
import { ProductMedia } from '../../src/components/GroceryArtwork';
import { ProductCard } from '../../src/components/ProductCard';
import { DietaryDot, ScreenHeader } from '../../src/components/ScreenHeader';
import { useMobileStore } from '../../src/context/MobileStoreContext';
import { GPTBazaarTheme } from '../../src/theme/tokens';

export default function ProductDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id || '';

  const {
    products,
    wishlistIds,
    cartSummary,
    getCartQty,
    addToCart,
    updateCartQty,
    toggleWishlist,
  } = useMobileStore();

  const product = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId]
  );

  const [selectedVariantId, setSelectedVariantId] = useState<string>('');

  useEffect(() => {
    if (product) {
      setSelectedVariantId(
        product.defaultVariantId || product.variants[0]?.id || ''
      );
    }
  }, [product?.id]);

  const activeVariant = useMemo(() => {
    if (!product) return null;
    return (
      product.variants.find((v) => v.id === selectedVariantId) ||
      product.variants[0] ||
      null
    );
  }, [product, selectedVariantId]);

  const similarProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(
        (p) =>
          p.isActive &&
          p.id !== product.id &&
          p.categoryId === product.categoryId
      )
      .slice(0, 6);
  }, [products, product]);

  if (!product || !activeVariant) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScreenHeader title="Product Details" onBack={() => router.back()} />
        <View style={styles.notFoundBox}>
          <Text style={styles.notFoundTitle}>Product not found</Text>
          <Text style={styles.notFoundSub}>
            This item may have been removed or updated in the catalog.
          </Text>
          <Pressable
            onPress={() => router.replace('/(tabs)')}
            style={styles.backHomeBtn}
          >
            <Text style={styles.backHomeBtnText}>Back to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isWishlisted = wishlistIds.includes(product.id);
  const qtyInCart = getCartQty(product.id, activeVariant.id);
  const isOutOfStock = activeVariant.stock <= 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader
        title={product.name}
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
        {/* Hero Media Card */}
        <View style={styles.mediaCard}>
          <View style={styles.mediaTopRow}>
            {activeVariant.discountPercent > 0 ? (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>
                  {activeVariant.discountPercent}% OFF
                </Text>
              </View>
            ) : (
              <View />
            )}

            <Pressable
              onPress={() => toggleWishlist(product.id)}
              style={styles.heartCircle}
              accessibilityLabel="Save to wishlist"
            >
              <Heart
                size={20}
                color={
                  isWishlisted ? GPTBazaarTheme.colors.offerCrimson : '#64748B'
                }
                fill={
                  isWishlisted ? GPTBazaarTheme.colors.offerCrimson : 'none'
                }
              />
            </Pressable>
          </View>

          <View style={styles.heroMediaFrame}>
            <ProductMedia
              imageUrl={product.imageUrl}
              artworkKey={product.artworkKey}
              size={140}
              style={styles.fullMedia}
            />
          </View>
        </View>

        {/* Core Product Details */}
        <View style={styles.card}>
          <View style={styles.brandMetaRow}>
            <DietaryDot type={product.dietaryType} />
            <Text style={styles.brandText}>
              {product.brand || 'GPT Bazaar Fresh'}
            </Text>
            <View style={styles.etaBadge}>
              <Clock size={12} color={GPTBazaarTheme.colors.brandPrimary} />
              <Text style={styles.etaBadgeText}>
                {product.deliveryEtaMins || 12} mins
              </Text>
            </View>
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          {product.tagline ? (
            <Text style={styles.tagline}>{product.tagline}</Text>
          ) : null}

          <View style={styles.ratingRow}>
            <View style={styles.ratingChip}>
              <Star size={12} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.ratingChipText}>
                {(product.rating || 4.7).toFixed(1)}
              </Text>
            </View>
            <Text style={styles.reviewCount}>
              ({product.reviewCount || 128} ratings)
            </Text>
            <Text
              style={[
                styles.stockLabel,
                isOutOfStock && styles.stockOutLabel,
              ]}
            >
              {isOutOfStock
                ? 'Out of stock'
                : `${activeVariant.stock} in stock`}
            </Text>
          </View>

          <View style={styles.priceBlock}>
            <Text style={styles.priceNow}>₹{activeVariant.price}</Text>
            {activeVariant.mrp > activeVariant.price && (
              <Text style={styles.priceMrp}>MRP ₹{activeVariant.mrp}</Text>
            )}
            <Text style={styles.taxNote}>(Incl. of all taxes)</Text>
          </View>

          {/* Pack Size Selector */}
          <Text style={styles.sectionSubLabel}>Select Pack Size</Text>
          <View style={styles.variantRow}>
            {product.variants.map((v) => {
              const selected = v.id === activeVariant.id;
              return (
                <Pressable
                  key={v.id}
                  onPress={() => setSelectedVariantId(v.id)}
                  style={[
                    styles.variantBox,
                    selected && styles.variantBoxSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.variantLabel,
                      selected && styles.variantLabelSelected,
                    ]}
                  >
                    {v.label}
                  </Text>
                  <Text style={styles.variantPrice}>₹{v.price}</Text>
                  {v.stock <= 0 && (
                    <Text style={styles.variantSoldOut}>Sold out</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Quality Assurance Grid */}
        <View style={styles.assuranceGrid}>
          <View style={styles.assuranceItem}>
            <Leaf size={18} color={GPTBazaarTheme.colors.brandPrimary} />
            <Text style={styles.assuranceText}>Farm Fresh</Text>
          </View>
          <View style={styles.assuranceItem}>
            <Truck size={18} color={GPTBazaarTheme.colors.brandPrimary} />
            <Text style={styles.assuranceText}>10–15 min Hub</Text>
          </View>
          <View style={styles.assuranceItem}>
            <ShieldCheck size={18} color={GPTBazaarTheme.colors.brandPrimary} />
            <Text style={styles.assuranceText}>Quality Checked</Text>
          </View>
          <View style={styles.assuranceItem}>
            <CheckCircle2 size={18} color={GPTBazaarTheme.colors.brandPrimary} />
            <Text style={styles.assuranceText}>Easy Replace</Text>
          </View>
        </View>

        {/* Description & Key Features */}
        {(product.description || (product.keyFeatures && product.keyFeatures.length > 0)) && (
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Product Details</Text>
            {product.description ? (
              <Text style={styles.descriptionText}>{product.description}</Text>
            ) : null}
            {product.keyFeatures && product.keyFeatures.length > 0 && (
              <View style={styles.featuresList}>
                {product.keyFeatures.map((feat, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>{feat}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <View style={styles.similarSection}>
            <Text style={styles.cardHeading}>Similar Products</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarScroll}
            >
              {similarProducts.map((sim) => {
                const defaultVarId =
                  sim.defaultVariantId || sim.variants[0]?.id || '';
                return (
                  <ProductCard
                    key={sim.id}
                    product={sim}
                    compactWidth={160}
                    qtyInCart={getCartQty(sim.id, defaultVarId)}
                    isWishlisted={wishlistIds.includes(sim.id)}
                    onPress={() => router.push(`/product/${sim.id}`)}
                    onAdd={() => addToCart(sim.id, defaultVarId, 1)}
                    onIncrement={() => updateCartQty(sim.id, defaultVarId, 1)}
                    onDecrement={() => updateCartQty(sim.id, defaultVarId, -1)}
                    onToggleWishlist={() => toggleWishlist(sim.id)}
                  />
                );
              })}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom CTA */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomVariantLabel}>{activeVariant.label}</Text>
          <Text style={styles.bottomPrice}>₹{activeVariant.price}</Text>
        </View>

        {isOutOfStock ? (
          <View style={styles.outOfStockBtn}>
            <Text style={styles.outOfStockBtnText}>Currently Out of Stock</Text>
          </View>
        ) : qtyInCart > 0 ? (
          <View style={styles.inCartActions}>
            <View style={styles.qtyStepper}>
              <Pressable
                onPress={() => updateCartQty(product.id, activeVariant.id, -1)}
                style={styles.qtyBtn}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </Pressable>
              <Text style={styles.qtyValue}>{qtyInCart}</Text>
              <Pressable
                onPress={() => updateCartQty(product.id, activeVariant.id, 1)}
                disabled={qtyInCart >= activeVariant.stock}
                style={[
                  styles.qtyBtn,
                  qtyInCart >= activeVariant.stock && styles.qtyBtnDisabled,
                ]}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={() => router.push('/(tabs)/cart')}
              style={styles.viewCartBtn}
            >
              <Text style={styles.viewCartBtnText}>View Cart →</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => addToCart(product.id, activeVariant.id, 1)}
            style={styles.addMainBtn}
          >
            <Text style={styles.addMainBtnText}>Add to Cart</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: GPTBazaarTheme.colors.canvas },
  flex: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 28, gap: 12 },
  notFoundBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  notFoundSub: {
    marginTop: 6,
    fontSize: 13.5,
    color: GPTBazaarTheme.colors.inkMuted,
    textAlign: 'center',
  },
  backHomeBtn: {
    marginTop: 18,
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    paddingHorizontal: 22,
    height: 44,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backHomeBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  mediaCard: {
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
  },
  mediaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  discountBadge: {
    backgroundColor: GPTBazaarTheme.colors.offerCrimson,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  heartCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroMediaFrame: {
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    padding: 10,
  },
  fullMedia: { width: '100%', height: '100%' },
  card: {
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
  },
  brandMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkMuted,
  },
  etaBadge: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
  },
  etaBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  productName: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
    lineHeight: 26,
  },
  tagline: {
    marginTop: 3,
    fontSize: 13,
    color: GPTBazaarTheme.colors.inkMuted,
  },
  ratingRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingChipText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  reviewCount: { fontSize: 12, color: GPTBazaarTheme.colors.inkMuted },
  stockLabel: {
    marginLeft: 'auto',
    fontSize: 12,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  stockOutLabel: { color: GPTBazaarTheme.colors.offerCrimson },
  priceBlock: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  priceNow: {
    fontSize: 24,
    fontWeight: '900',
    color: GPTBazaarTheme.colors.inkPrimary,
    fontVariant: ['tabular-nums'],
  },
  priceMrp: {
    fontSize: 14,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    fontVariant: ['tabular-nums'],
  },
  taxNote: { fontSize: 11.5, color: GPTBazaarTheme.colors.inkMuted },
  sectionSubLabel: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 13.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  variantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  variantBox: {
    minWidth: 92,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    backgroundColor: '#FAFCFA',
  },
  variantBoxSelected: {
    borderColor: GPTBazaarTheme.colors.brandPrimary,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
  },
  variantLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  variantLabelSelected: { color: GPTBazaarTheme.colors.brandPrimary },
  variantPrice: {
    marginTop: 2,
    fontSize: 13.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
    fontVariant: ['tabular-nums'],
  },
  variantSoldOut: {
    marginTop: 2,
    fontSize: 10.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.offerCrimson,
  },
  assuranceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  assuranceItem: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
  },
  assuranceText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  cardHeading: {
    fontSize: 15.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13.5,
    color: GPTBazaarTheme.colors.inkMuted,
    lineHeight: 20,
  },
  featuresList: { marginTop: 10, gap: 6 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
  },
  featureText: {
    fontSize: 13,
    color: GPTBazaarTheme.colors.inkPrimary,
    flex: 1,
  },
  similarSection: { marginTop: 4 },
  similarScroll: { paddingRight: 8 },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: GPTBazaarTheme.colors.borderSubtle,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bottomVariantLabel: {
    fontSize: 11.5,
    color: GPTBazaarTheme.colors.inkMuted,
    fontWeight: '600',
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: GPTBazaarTheme.colors.inkPrimary,
    fontVariant: ['tabular-nums'],
  },
  addMainBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMainBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  outOfStockBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockBtnText: { color: '#64748B', fontSize: 14, fontWeight: '800' },
  inCartActions: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    borderWidth: 1.5,
    borderColor: GPTBazaarTheme.colors.brandPrimary,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 4,
  },
  qtyBtn: { width: 32, height: 46, alignItems: 'center', justifyContent: 'center' },
  qtyBtnDisabled: { opacity: 0.4 },
  qtyBtnText: {
    fontSize: 20,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  qtyValue: {
    fontSize: 15,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.brandPrimary,
    marginHorizontal: 4,
    fontVariant: ['tabular-nums'],
  },
  viewCartBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewCartBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
