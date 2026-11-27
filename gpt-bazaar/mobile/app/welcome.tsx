import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheck, Tag, Zap } from 'lucide-react-native';
import { GPTBazaarLogo, HeroBasketIllustration } from '../src/components/GroceryArtwork';
import { useMobileStore } from '../src/context/MobileStoreContext';
import { GPTBazaarTheme } from '../src/theme/tokens';

export default function WelcomeScreen() {
  const router = useRouter();
  const { completeOnboarding } = useMobileStore();
  const [phoneInput, setPhoneInput] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleContinue = () => {
    const digits = phoneInput.replace(/\D/g, '');
    if (digits.length > 0 && digits.length < 10) {
      setErrorText('Please enter a valid 10-digit mobile number or continue as guest.');
      return;
    }
    setErrorText(null);
    completeOnboarding(digits.length >= 10 ? `+91 ${digits.slice(-10)}` : undefined);
    router.replace('/location');
  };

  const handleGuest = () => {
    completeOnboarding();
    router.replace('/location');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <GPTBazaarLogo variant="light" />
            <View style={styles.illustrationWrap}>
              <HeroBasketIllustration width={210} height={140} />
            </View>
            <Text style={styles.title}>Daily groceries at your doorstep in minutes</Text>
            <Text style={styles.subtitle}>
              Farm-fresh produce, dairy, staples, and pantry essentials from your local hub.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <View style={styles.phoneRow}>
              <View style={styles.countryCodeBox}>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <TextInput
                value={phoneInput}
                onChangeText={(val) => {
                  setPhoneInput(val.replace(/[^\d\s]/g, ''));
                  if (errorText) setErrorText(null);
                }}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={12}
                style={styles.phoneInput}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>

            {errorText && <Text style={styles.errorText}>{errorText}</Text>}

            <Pressable onPress={handleContinue} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Continue</Text>
            </Pressable>

            <Pressable onPress={handleGuest} style={styles.guestBtn}>
              <Text style={styles.guestBtnText}>Continue as Guest</Text>
            </Pressable>
          </View>

          <View style={styles.trustGrid}>
            <View style={styles.trustItem}>
              <View style={styles.trustIconBox}>
                <Zap size={18} color={GPTBazaarTheme.colors.brandPrimary} />
              </View>
              <Text style={styles.trustTitle}>10–15 min</Text>
              <Text style={styles.trustSub}>Express delivery</Text>
            </View>

            <View style={styles.trustItem}>
              <View style={styles.trustIconBox}>
                <Tag size={18} color={GPTBazaarTheme.colors.brandPrimary} />
              </View>
              <Text style={styles.trustTitle}>Best Offers</Text>
              <Text style={styles.trustSub}>Daily mandi deals</Text>
            </View>

            <View style={styles.trustItem}>
              <View style={styles.trustIconBox}>
                <ShieldCheck size={18} color={GPTBazaarTheme.colors.brandPrimary} />
              </View>
              <Text style={styles.trustTitle}>Safe & Secure</Text>
              <Text style={styles.trustSub}>Freshness assured</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: GPTBazaarTheme.colors.canvas },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    justifyContent: 'space-between',
    gap: 16,
  },
  heroCard: {
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D6EFE0',
  },
  illustrationWrap: {
    marginVertical: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13.5,
    color: GPTBazaarTheme.colors.inkMuted,
    textAlign: 'center',
    lineHeight: 19,
  },
  formCard: {
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkPrimary,
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    borderRadius: 12,
    backgroundColor: '#FAFCFA',
    overflow: 'hidden',
    height: 50,
  },
  countryCodeBox: {
    paddingHorizontal: 14,
    height: '100%',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: GPTBazaarTheme.colors.borderSubtle,
    backgroundColor: '#F1F5F2',
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: GPTBazaarTheme.colors.offerCrimson,
  },
  primaryBtn: {
    marginTop: 14,
    height: 50,
    borderRadius: 12,
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  guestBtn: {
    marginTop: 10,
    height: 46,
    borderRadius: 12,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    borderWidth: 1,
    borderColor: '#CBE7D5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  trustGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  trustItem: {
    flex: 1,
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
  },
  trustIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  trustTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
    textAlign: 'center',
  },
  trustSub: {
    fontSize: 10.5,
    color: GPTBazaarTheme.colors.inkMuted,
    textAlign: 'center',
    marginTop: 2,
  },
});
