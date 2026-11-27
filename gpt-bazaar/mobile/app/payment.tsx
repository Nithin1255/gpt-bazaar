import React, { useState } from 'react';
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
  Banknote,
  Check,
  CreditCard,
  Landmark,
  ShieldCheck,
  Smartphone,
  Wallet,
} from 'lucide-react-native';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { useMobileStore } from '../src/context/MobileStoreContext';
import { GPTBazaarTheme } from '../src/theme/tokens';
import type { PaymentMethod } from '../src/types/models';

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  title: string;
  subtitle: string;
  tag?: string;
  icon: typeof Smartphone;
}[] = [
  {
    id: 'upi',
    title: 'UPI (GPay, PhonePe, Paytm)',
    subtitle: 'Instant zero-fee UPI payment',
    tag: 'Recommended',
    icon: Smartphone,
  },
  {
    id: 'card',
    title: 'Credit / Debit Card',
    subtitle: 'Visa, Mastercard, RuPay supported',
    icon: CreditCard,
  },
  {
    id: 'wallet',
    title: 'Wallets',
    subtitle: 'Amazon Pay, Paytm Wallet, PhonePe',
    icon: Wallet,
  },
  {
    id: 'netbanking',
    title: 'Net Banking',
    subtitle: 'All major Indian banks',
    icon: Landmark,
  },
  {
    id: 'cod',
    title: 'Cash on Delivery',
    subtitle: 'Pay cash or UPI QR at your doorstep',
    icon: Banknote,
  },
];

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { cartSummary, customerName, customerPhone, placeOrder } = useMobileStore();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (submitting) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const created = await placeOrder({
        customerName,
        customerPhone,
        paymentMethod: selectedMethod,
      });
      router.replace(`/track/${created.id}`);
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Could not place order. Please check your connection and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader title="Payment Methods" onBack={() => router.back()} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.amountHero}>
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <Text style={styles.amountValue}>₹{cartSummary.grandTotal}</Text>
          <Text style={styles.amountSub}>
            {cartSummary.selectedCount} item
            {cartSummary.selectedCount === 1 ? '' : 's'} • Express 10–15 min delivery
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Choose Payment Mode</Text>

        {PAYMENT_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = selectedMethod === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => setSelectedMethod(opt.id)}
              style={[styles.methodCard, active && styles.methodCardActive]}
            >
              <View style={[styles.iconBox, active && styles.iconBoxActive]}>
                <Icon
                  size={20}
                  color={active ? '#FFFFFF' : GPTBazaarTheme.colors.brandPrimary}
                />
              </View>
              <View style={styles.flex}>
                <View style={styles.titleRow}>
                  <Text style={styles.methodTitle}>{opt.title}</Text>
                  {opt.tag && (
                    <View style={styles.recTag}>
                      <Text style={styles.recTagText}>{opt.tag}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.methodSub}>{opt.subtitle}</Text>
              </View>
              <View style={[styles.radioOuter, active && styles.radioActive]}>
                {active && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
              </View>
            </Pressable>
          );
        })}

        {errorMsg && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        <View style={styles.securityNote}>
          <ShieldCheck size={16} color={GPTBazaarTheme.colors.brandPrimary} />
          <Text style={styles.securityText}>
            Orders sync directly to GPT Bazaar Hub Firestore with live stock reservation.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          disabled={submitting || cartSummary.selectedCount === 0}
          onPress={() => void handlePlaceOrder()}
          style={[
            styles.placeBtn,
            (submitting || cartSummary.selectedCount === 0) && styles.btnDisabled,
          ]}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.placeBtnText}>
              {selectedMethod === 'cod'
                ? `Place Order (COD) · ₹${cartSummary.grandTotal}`
                : `Pay & Place Order · ₹${cartSummary.grandTotal}`}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: GPTBazaarTheme.colors.canvas },
  flex: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 28 },
  amountHero: {
    backgroundColor: GPTBazaarTheme.colors.brandDeep,
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },
  amountLabel: { fontSize: 12, fontWeight: '700', color: '#A7F3D0' },
  amountValue: {
    marginTop: 4,
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  amountSub: { marginTop: 4, fontSize: 12.5, color: '#D1FAE5' },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
    marginBottom: 10,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    marginBottom: 10,
  },
  methodCardActive: {
    borderColor: GPTBazaarTheme.colors.brandPrimary,
    backgroundColor: '#F7FCF9',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: {
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  methodTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  recTag: {
    backgroundColor: GPTBazaarTheme.colors.brandAccent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  recTagText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: GPTBazaarTheme.colors.brandDeep,
  },
  methodSub: {
    marginTop: 2,
    fontSize: 12,
    color: GPTBazaarTheme.colors.inkMuted,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: GPTBazaarTheme.colors.brandPrimary,
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
  },
  errorText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#B91C1C',
  },
  securityNote: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: GPTBazaarTheme.colors.inkMuted,
    lineHeight: 17,
  },
  bottomBar: {
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: GPTBazaarTheme.colors.borderSubtle,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  placeBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  placeBtnText: { color: '#FFFFFF', fontSize: 15.5, fontWeight: '800' },
});
