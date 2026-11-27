import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  DeliveryScooterIllustration,
  GPTBazaarLogo,
  HeroBasketIllustration,
} from '../src/components/GroceryArtwork';
import { useMobileStore } from '../src/context/MobileStoreContext';
import { GPTBazaarTheme } from '../src/theme/tokens';

export default function SplashScreen() {
  const router = useRouter();
  const { hydrated, hasCompletedOnboarding } = useMobileStore();

  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      if (hasCompletedOnboarding) {
        router.replace('/(tabs)');
      } else {
        router.replace('/welcome');
      }
    }, 1400);
    return () => clearTimeout(timer);
  }, [hydrated, hasCompletedOnboarding, router]);

  const handleProceedNow = () => {
    if (hasCompletedOnboarding) {
      router.replace('/(tabs)');
    } else {
      router.replace('/welcome');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor={GPTBazaarTheme.colors.brandDeep} />
      <Pressable onPress={handleProceedNow} style={styles.content}>
        <View style={styles.brandBlock}>
          <GPTBazaarLogo variant="dark" />
          <Text style={styles.headline}>Fresh groceries in 10–15 mins</Text>
          <Text style={styles.subline}>Pudukpet • Chittoor • Nagari Hyperlocal Hub</Text>
        </View>

        <View style={styles.illustrationStage}>
          <View style={styles.basketGlow}>
            <HeroBasketIllustration width={210} height={144} />
          </View>
          <View style={styles.scooterRow}>
            <DeliveryScooterIllustration width={150} height={88} />
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.tapHint}>Loading fresh inventory…</Text>
        </View>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GPTBazaarTheme.colors.brandDeep,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandBlock: {
    alignItems: 'center',
    marginTop: 24,
  },
  headline: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subline: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#A7F3D0',
    textAlign: 'center',
  },
  illustrationStage: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  basketGlow: {
    width: 240,
    height: 175,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scooterRow: {
    marginTop: 18,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTrack: {
    width: 160,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    overflow: 'hidden',
  },
  progressFill: {
    width: '68%',
    height: '100%',
    backgroundColor: GPTBazaarTheme.colors.brandAccent,
    borderRadius: 4,
  },
  tapHint: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
    color: '#D1FAE5',
  },
});
