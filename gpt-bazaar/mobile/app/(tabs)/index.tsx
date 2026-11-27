import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Clock,
  MapPin,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import {
  HeroBasketIllustration,
  ProductMedia,
} from '../../src/components/GroceryArtwork';
import { ProductCard } from '../../src/components/ProductCard';
import { useMobileStore } from '../../src/context/MobileStoreContext';
import { GPTBazaarTheme } from '../../src/theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const {
    appConfig,
    categories,
    products,
    loading,
    refreshing,
    refreshCatalog,
    syncError,
    selectedAddress,
    unreadNotificationsCount,
    wishlistIds,
    getCartQty,
    addToCart,
    updateCartQty,
    toggleWishlist,
    cartSummary,
  } = useMobileStore();

  const activeCategories = useMemo(
    () => categories.filter((c) => c.isActive).slice(0, 8),
    [categories]
  );

  const activeProducts = useMemo(
    () => products.filter((p) => p.isActive),
    [products]
  );

  const popularProducts = useMemo(() => {
    const flagged = activeProducts.filter((p) => p.isPopular || p.isTrending);
    return (flagged.length > 0 ? flagged : activeProducts).slice(0, 8);
  }, [activeProducts]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top App Brand, Location & Notification Header */}
      <View style={styles.topHeader}>
        <View style={styles.brandHeaderRow}>
          <View style={styles.brandLeft}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.appIcon}
              resizeMode="cover"
            />
            <View>
              <View style={styles.brandNameRow}>
                <Text style={styles.brandTextDark}>GPT </Text>
                <Text style={styles.brandTextGreen}>Bazaar</Text>
              </View>
              <View style={styles.etaInlineRow}>
                <Text style={styles.deliverInText}>
                  {appConfig.deliveryEtaText || '10–15 mins'}
                </Text>
                <View style={styles.expressTag}>
                  <Zap size={10} color={GPTBazaarTheme.colors.brandDeep} />
                  <Text style={styles.expressTagText}>
                    {appConfig.isStoreOpen ? 'EXPRESS' : 'CLOSED'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push('/search')}
              style={styles.notifBtn}
              accessibilityLabel="Search products"
            >
              <Search size={19} color={GPTBazaarTheme.colors.inkPrimary} />
            </Pressable>

            <Pressable
              onPress={() => router.push('/notifications')}
              style={styles.notifBtn}
              accessibilityLabel="Notifications"
            >
              <Bell size={20} color={GPTBazaarTheme.colors.inkPrimary} />
              {unreadNotificationsCount > 0 && <View style={styles.unreadDot} />}
            </Pressable>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/location')}
          style={styles.locationBtn}
        >
          <MapPin size={14} color={GPTBazaarTheme.colors.brandPrimary} />
          <Text numberOfLines={1} style={styles.addressText}>
            {selectedAddress.label} • {selectedAddress.line1}, {selectedAddress.city}
          </Text>
          <ChevronDown size={14} color={GPTBazaarTheme.colors.inkPrimary} />
        </Pressable>
      </View>

      {/* Search Trigger */}
      <View style={styles.searchOuter}>
        <Pressable onPress={() => router.push('/search')} style={styles.searchTrigger}>
          <Search size={18} color={GPTBazaarTheme.colors.inkMuted} />
          <Text style={styles.searchPlaceholder}>
            Search milk, tomato, atta, snacks...
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refreshCatalog()}
            tintColor={GPTBazaarTheme.colors.brandPrimary}
            colors={[GPTBazaarTheme.colors.brandPrimary]}
          />
        }
      >
        {syncError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerTitle}>Backend Sync Notice</Text>
            <Text style={styles.errorBannerText}>{syncError}</Text>
          </View>
        )}

        {!appConfig.isStoreOpen && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerTitle}>{appConfig.storeName} is currently closed</Text>
            <Text style={styles.errorBannerText}>
              You can browse products now; ordering will resume once the admin opens the store.
            </Text>
          </View>
        )}

        {/* Hero Promo Banner */}
        <Pressable
          onPress={() => {
            if (activeCategories[0]) {
              router.push(`/category/${activeCategories[0].id}`);
            } else {
              router.push('/(tabs)/categories');
            }
          }}
          style={styles.heroBanner}
        >
          <View style={styles.heroLeft}>
            <View style={styles.heroOfferBadge}>
              <Text style={styles.heroOfferText}>{appConfig.heroBadge || 'UP TO 40% OFF'}</Text>
            </View>
            <Text style={styles.heroHeadline}>{appConfig.heroTitle || 'Fresh picks, better prices'}</Text>
            <Text style={styles.heroSub}>
              {appConfig.heroSubtitle || 'Handpicked farm produce & daily essentials delivered in minutes.'}
            </Text>
            <View style={styles.heroCtaBtn}>
              <Text style={styles.heroCtaText}>Shop Fresh →</Text>
            </View>
          </View>
          <View style={styles.heroRight}>
            <HeroBasketIllustration width={132} height={96} />
          </View>
        </Pressable>

        {/* Shop by Category (4-column Grid) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by category</Text>
          <Pressable
            onPress={() => router.push('/(tabs)/categories')}
            style={styles.seeAllBtn}
          >
            <Text style={styles.seeAllText}>See all</Text>
            <ChevronRight size={15} color={GPTBazaarTheme.colors.brandPrimary} />
          </Pressable>
        </View>

        {loading && activeCategories.length === 0 ? (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="small" color={GPTBazaarTheme.colors.brandPrimary} />
            <Text style={styles.loaderText}>Syncing live catalog from backend…</Text>
          </View>
        ) : (
          <View style={styles.catGrid}>
            {activeCategories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => router.push(`/category/${cat.id}`)}
                style={styles.catCell}
              >
                <View
                  style={[
                    styles.catThumb,
                    { backgroundColor: cat.bgTint || GPTBazaarTheme.colors.surfaceMint },
                  ]}
                >
                  <ProductMedia
                    imageUrl={cat.imageUrl}
                    artworkKey={cat.artworkKey}
                    size={48}
                    resizeMode="cover"
                    style={styles.catMediaInner}
                  />
                </View>
                <Text numberOfLines={2} style={styles.catName}>
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Popular Near You Horizontal Carousel */}
        {popularProducts.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular near you</Text>
              <Pressable onPress={() => router.push('/search')} style={styles.seeAllBtn}>
                <Text style={styles.seeAllText}>Explore</Text>
                <ChevronRight size={15} color={GPTBazaarTheme.colors.brandPrimary} />
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
              contentContainerStyle={styles.horizontalCarousel}
            >
              {popularProducts.map((product) => {
                const defaultVarId = product.defaultVariantId || product.variants[0]?.id || '';
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    compactWidth={146}
                    qtyInCart={getCartQty(product.id, defaultVarId)}
                    isWishlisted={wishlistIds.includes(product.id)}
                    onPress={() => router.push(`/product/${product.id}`)}
                    onAdd={() => addToCart(product.id, defaultVarId, 1)}
                    onIncrement={() => updateCartQty(product.id, defaultVarId, 1)}
                    onDecrement={() => updateCartQty(product.id, defaultVarId, -1)}
                    onToggleWishlist={() => toggleWishlist(product.id)}
                  />
                );
              })}
            </ScrollView>
          </>
        )}

        {/* Fresh Deals Promo Strip */}
        <Pressable
          onPress={() => router.push('/(tabs)/cart')}
          style={styles.dealStrip}
        >
          <View style={styles.dealIconBox}>
            <Sparkles size={20} color={GPTBazaarTheme.colors.brandDeep} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.dealTitle}>
              {appConfig.dealBannerTitle || 'Free delivery on orders above ₹149'}
            </Text>
            <Text style={styles.dealSub}>
              {appConfig.dealBannerSubtitle ||
                'Use code GROCER10 in cart for instant savings on daily essentials.'}
            </Text>
          </View>
          <ChevronRight size={18} color={GPTBazaarTheme.colors.brandPrimary} />
        </Pressable>

        {/* All Daily Essentials (2-column Live Product Grid) */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Daily Essentials</Text>
          <View style={styles.etaChip}>
            <Clock size={12} color={GPTBazaarTheme.colors.brandPrimary} />
            <Text style={styles.etaChipText}>Live stock</Text>
          </View>
        </View>

        {!loading && activeProducts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No products synced yet</Text>
            <Text style={styles.emptySub}>
              Add items in the GPT Bazaar Admin Console and they will appear here instantly.
            </Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {activeProducts.map((product) => {
              const defaultVarId = product.defaultVariantId || product.variants[0]?.id || '';
              return (
                <View key={product.id} style={styles.productGridItem}>
                  <ProductCard
                    product={product}
                    dense
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

      {/* Floating Mini Cart Bar when items exist */}
      {cartSummary.totalQty > 0 && (
        <View style={styles.floatingCartWrap}>
          <Pressable
            onPress={() => router.push('/(tabs)/cart')}
            style={styles.floatingCartBar}
          >
            <View>
              <Text style={styles.floatingCartCount}>
                {cartSummary.totalQty} item{cartSummary.totalQty > 1 ? 's' : ''} • ₹
                {cartSummary.grandTotal}
              </Text>
              {cartSummary.totalSavings > 0 && (
                <Text style={styles.floatingCartSub}>
                  Saving ₹{cartSummary.totalSavings} on this order
                </Text>
              )}
            </View>
            <View style={styles.floatingCartAction}>
              <Text style={styles.floatingCartActionText}>View Cart →</Text>
            </View>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: GPTBazaarTheme.colors.canvas },
  flex: { flex: 1 },
  topHeader: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: GPTBazaarTheme.colors.surface,
    gap: 6,
  },
  brandHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
  },
  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandTextDark: {
    fontSize: 15,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.brandDeep,
    letterSpacing: -0.2,
  },
  brandTextGreen: {
    fontSize: 15,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.brandPrimary,
    letterSpacing: -0.2,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 2,
  },
  etaInlineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1 },
  deliverInText: {
    fontSize: 12,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  expressTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: GPTBazaarTheme.colors.brandAccent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  expressTagText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: GPTBazaarTheme.colors.brandDeep,
    letterSpacing: 0.3,
  },
  addressText: {
    fontSize: 12,
    color: GPTBazaarTheme.colors.inkMuted,
    flexShrink: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: GPTBazaarTheme.colors.canvas,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GPTBazaarTheme.colors.offerCrimson,
  },
  searchOuter: {
    backgroundColor: GPTBazaarTheme.colors.surface,
    paddingHorizontal: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: GPTBazaarTheme.colors.borderSubtle,
  },
  searchTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F6F4',
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    paddingHorizontal: 14,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: GPTBazaarTheme.colors.inkMuted,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 92,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorBannerTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#B91C1C',
  },
  errorBannerText: {
    marginTop: 2,
    fontSize: 11.5,
    color: '#991B1B',
    lineHeight: 16,
  },
  heroBanner: {
    backgroundColor: GPTBazaarTheme.colors.brandDeep,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    overflow: 'hidden',
  },
  heroLeft: { flex: 1, paddingRight: 8 },
  heroOfferBadge: {
    alignSelf: 'flex-start',
    backgroundColor: GPTBazaarTheme.colors.brandAccent,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  heroOfferText: {
    fontSize: 10,
    fontWeight: '900',
    color: GPTBazaarTheme.colors.brandDeep,
    letterSpacing: 0.4,
  },
  heroHeadline: {
    marginTop: 8,
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 23,
  },
  heroSub: {
    marginTop: 4,
    fontSize: 12,
    color: '#D1FAE5',
    lineHeight: 16,
  },
  heroCtaBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroCtaText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.brandDeep,
  },
  heroRight: { alignItems: 'center', justifyContent: 'center' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
    letterSpacing: -0.2,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  loaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 24,
  },
  loaderText: {
    fontSize: 13,
    color: GPTBazaarTheme.colors.inkMuted,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 12,
  },
  catCell: {
    width: '25%',
    padding: 4,
    alignItems: 'center',
  },
  catThumb: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8EFEA',
  },
  catMediaInner: { width: '100%', height: '100%' },
  catName: {
    marginTop: 5,
    fontSize: 11.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkPrimary,
    textAlign: 'center',
    lineHeight: 14,
  },
  horizontalScroll: {
    marginBottom: 14,
  },
  horizontalCarousel: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 4,
    paddingVertical: 2,
  },
  dealStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF9E7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  dealIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: GPTBazaarTheme.colors.brandAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  dealSub: {
    marginTop: 2,
    fontSize: 11.5,
    color: GPTBazaarTheme.colors.inkMuted,
    lineHeight: 16,
  },
  etaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  etaChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -3,
  },
  productGridItem: {
    width: '33.3333%',
    padding: 3,
  },
  emptyCard: {
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  emptySub: {
    marginTop: 6,
    fontSize: 13,
    color: GPTBazaarTheme.colors.inkMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  floatingCartWrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 10,
  },
  floatingCartBar: {
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#074220',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  floatingCartCount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  floatingCartSub: {
    color: '#D1FAE5',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  floatingCartAction: {
    backgroundColor: GPTBazaarTheme.colors.brandAccent,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  floatingCartActionText: {
    color: GPTBazaarTheme.colors.brandDeep,
    fontSize: 12.5,
    fontWeight: '800',
  },
});
