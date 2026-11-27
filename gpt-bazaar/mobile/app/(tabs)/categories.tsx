import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  HeroBasketIllustration,
  ProductMedia,
} from '../../src/components/GroceryArtwork';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { useMobileStore } from '../../src/context/MobileStoreContext';
import { GPTBazaarTheme } from '../../src/theme/tokens';

export default function CategoriesDirectoryScreen() {
  const router = useRouter();
  const { categories, products, loading, cartSummary } = useMobileStore();

  const activeCategories = useMemo(
    () => categories.filter((c) => c.isActive),
    [categories]
  );

  const countByCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      if (p.isActive) {
        counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        title="Shop by Category"
        onSearch={() => router.push('/search')}
        onCart={() => router.push('/(tabs)/cart')}
        cartCount={cartSummary.totalQty}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bannerCard}>
          <View style={styles.flex}>
            <Text style={styles.bannerEyebrow}>CURATED AISLES</Text>
            <Text style={styles.bannerTitle}>Everything fresh for your kitchen</Text>
            <Text style={styles.bannerSub}>
              {activeCategories.length} categories synced live with our Chittoor hub.
            </Text>
          </View>
          <HeroBasketIllustration width={114} height={80} />
        </View>

        {loading && activeCategories.length === 0 ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="small" color={GPTBazaarTheme.colors.brandPrimary} />
            <Text style={styles.loaderText}>Loading categories…</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {activeCategories.map((cat) => {
              const itemCount = countByCategory[cat.id] || 0;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => router.push(`/category/${cat.id}`)}
                  style={styles.gridCell}
                >
                  <View style={styles.catCard}>
                    <View
                      style={[
                        styles.mediaFrame,
                        { backgroundColor: cat.bgTint || GPTBazaarTheme.colors.surfaceMint },
                      ]}
                    >
                      <ProductMedia
                        imageUrl={cat.imageUrl}
                        artworkKey={cat.artworkKey}
                        size={56}
                        style={styles.mediaInner}
                      />
                    </View>
                    <Text numberOfLines={2} style={styles.catTitle}>
                      {cat.name}
                    </Text>
                    <Text style={styles.catCount}>
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </Text>
                  </View>
                </Pressable>
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
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D6EFE0',
    marginBottom: 16,
  },
  bannerEyebrow: {
    fontSize: 10.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.brandPrimary,
    letterSpacing: 0.6,
  },
  bannerTitle: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
    lineHeight: 22,
  },
  bannerSub: {
    marginTop: 3,
    fontSize: 12,
    color: GPTBazaarTheme.colors.inkMuted,
  },
  loaderWrap: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  loaderText: {
    fontSize: 13,
    color: GPTBazaarTheme.colors.inkMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  gridCell: {
    width: '33.3333%',
    padding: 4,
  },
  catCard: {
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    alignItems: 'center',
  },
  mediaFrame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaInner: { width: '100%', height: '100%' },
  catTitle: {
    marginTop: 7,
    fontSize: 12,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkPrimary,
    textAlign: 'center',
    minHeight: 32,
    lineHeight: 15.5,
  },
  catCount: {
    marginTop: 2,
    fontSize: 10.5,
    fontWeight: '600',
    color: GPTBazaarTheme.colors.inkMuted,
  },
});
