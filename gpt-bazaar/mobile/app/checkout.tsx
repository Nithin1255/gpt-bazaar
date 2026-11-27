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
import { Clock, MapPin, ShieldCheck, Sparkles, User } from 'lucide-react-native';
import { ProductMedia } from '../src/components/GroceryArtwork';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { useMobileStore } from '../src/context/MobileStoreContext';
import { GPTBazaarTheme } from '../src/theme/tokens';

export default function CheckoutScreen() {
  const router = useRouter();
  const {
    cartSummary,
    selectedAddress,
    customerName,
    customerPhone,
    updateCustomerInfo,
  } = useMobileStore();

  const [nameInput, setNameInput] = useState(customerName);
  const [phoneInput, setPhoneInput] = useState(customerPhone);
  const [errorText, setErrorText] = useState<string | null>(null);

  const selectedRows = cartSummary.rows.filter((r) => r.cartItem.selected);

  const handleContinueToPayment = () => {
    const cleanName = nameInput.trim();
    const cleanPhone = phoneInput.trim();
    if (cleanName.length < 2) {
      setErrorText('Please enter the recipient name.');
      return;
    }
    if (cleanPhone.replace(/\D/g, '').length < 10) {
      setErrorText('Please enter a valid 10-digit phone number.');
      return;
    }
    setErrorText(null);
    updateCustomerInfo(cleanName, cleanPhone);
    router.push('/payment');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScreenHeader title="Checkout" onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Delivery Address Card */}
          <View style={styles.card}>
            <View style={styles.cardTopRow}>
              <View style={styles.iconTitleRow}>
                <MapPin size={18} color={GPTBazaarTheme.colors.brandPrimary} />
                <Text style={styles.cardTitle}>Delivery Address</Text>
              </View>
              <Pressable onPress={() => router.push('/addresses')} hitSlop={8}>
                <Text style={styles.changeLink}>Change</Text>
              </Pressable>
            </View>

            <View style={styles.addrBody}>
              <View style={styles.addrTag}>
                <Text style={styles.addrTagText}>{selectedAddress.label}</Text>
              </View>
              <Text style={styles.addrLine}>{selectedAddress.line1}</Text>
              {selectedAddress.landmark ? (
                <Text style={styles.addrSub}>{selectedAddress.landmark}</Text>
              ) : null}
              <Text style={styles.addrSub}>
                {selectedAddress.city} - {selectedAddress.pincode}
              </Text>
            </View>

            <View style={styles.etaStrip}>
              <Clock size={14} color={GPTBazaarTheme.colors.brandPrimary} />
              <Text style={styles.etaStripText}>
                Express delivery in 10–15 mins from Chittoor Hub
              </Text>
            </View>
          </View>

          {/* Recipient Details */}
          <View style={styles.card}>
            <View style={styles.iconTitleRow}>
              <User size={18} color={GPTBazaarTheme.colors.brandPrimary} />
              <Text style={styles.cardTitle}>Recipient Details</Text>
            </View>

            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              value={nameInput}
              onChangeText={(v) => {
                setNameInput(v);
                if (errorText) setErrorText(null);
              }}
              placeholder="Recipient name"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>Contact Phone</Text>
            <TextInput
              value={phoneInput}
              onChangeText={(v) => {
                setPhoneInput(v);
                if (errorText) setErrorText(null);
              }}
              placeholder="+91 98480 12345"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              style={styles.input}
            />

            {errorText && <Text style={styles.errorText}>{errorText}</Text>}
          </View>

          {/* Itemized Recap */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Order Summary ({cartSummary.selectedCount} item
              {cartSummary.selectedCount === 1 ? '' : 's'})
            </Text>

            <View style={styles.itemsList}>
              {selectedRows.map(({ cartItem, product, variant }) => (
                <View
                  key={`${cartItem.productId}-${cartItem.variantId}`}
                  style={styles.recapRow}
                >
                  <View style={styles.recapThumb}>
                    <ProductMedia
                      imageUrl={product.imageUrl}
                      artworkKey={product.artworkKey}
                      size={32}
                      style={styles.fullMedia}
                    />
                  </View>
                  <View style={styles.flex}>
                    <Text numberOfLines={1} style={styles.recapName}>
                      {product.name}
                    </Text>
                    <Text style={styles.recapSub}>
                      {variant.label} × {cartItem.qty}
                    </Text>
                  </View>
                  <Text style={styles.recapPrice}>
                    ₹{variant.price * cartItem.qty}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Bill Breakdown */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bill Summary</Text>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Item Total</Text>
              <Text style={styles.billVal}>₹{cartSummary.itemTotal}</Text>
            </View>
            {cartSummary.discount > 0 && (
              <View style={styles.billRow}>
                <Text style={styles.billGreen}>
                  Coupon ({cartSummary.appliedCoupon?.code})
                </Text>
                <Text style={styles.billGreenVal}>−₹{cartSummary.discount}</Text>
              </View>
            )}
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery Fee</Text>
              <Text
                style={
                  cartSummary.deliveryFee === 0 ? styles.billGreenVal : styles.billVal
                }
              >
                {cartSummary.deliveryFee === 0 ? 'FREE' : `₹${cartSummary.deliveryFee}`}
              </Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Handling & Packaging</Text>
              <Text style={styles.billVal}>₹{cartSummary.packagingFee}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.billRow}>
              <Text style={styles.grandLabel}>Total Payable</Text>
              <Text style={styles.grandVal}>₹{cartSummary.grandTotal}</Text>
            </View>

            {cartSummary.totalSavings > 0 && (
              <View style={styles.savingsRow}>
                <Sparkles size={15} color={GPTBazaarTheme.colors.brandPrimary} />
                <Text style={styles.savingsText}>
                  Total savings of ₹{cartSummary.totalSavings} applied
                </Text>
              </View>
            )}
          </View>

          <View style={styles.trustRow}>
            <ShieldCheck size={15} color={GPTBazaarTheme.colors.brandPrimary} />
            <Text style={styles.trustText}>
              100% freshness guarantee • Instant hub dispatch
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sticky Footer CTA */}
      <View style={styles.bottomBar}>
        <Pressable
          disabled={selectedRows.length === 0}
          onPress={handleContinueToPayment}
          style={[
            styles.continueBtn,
            selectedRows.length === 0 && styles.btnDisabled,
          ]}
        >
          <Text style={styles.continueBtnText}>
            Continue to Payment · ₹{cartSummary.grandTotal}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: GPTBazaarTheme.colors.canvas },
  flex: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 28, gap: 12 },
  card: {
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  changeLink: {
    fontSize: 13,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  addrBody: { gap: 3 },
  addrTag: {
    alignSelf: 'flex-start',
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 2,
  },
  addrTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  addrLine: {
    fontSize: 14,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  addrSub: { fontSize: 12.5, color: GPTBazaarTheme.colors.inkMuted },
  etaStrip: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  etaStripText: {
    fontSize: 12,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  fieldLabel: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 12.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkMuted,
  },
  input: {
    height: 46,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    backgroundColor: '#FAFCFA',
    paddingHorizontal: 12,
    fontSize: 14.5,
    fontWeight: '600',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.offerCrimson,
  },
  itemsList: { marginTop: 10, gap: 10 },
  recapRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  recapThumb: {
    width: 42,
    height: 42,
    borderRadius: 9,
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: GPTBazaarTheme.colors.borderSubtle,
    padding: 4,
  },
  fullMedia: { width: '100%', height: '100%' },
  recapName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  recapSub: { fontSize: 11.5, color: GPTBazaarTheme.colors.inkMuted, marginTop: 1 },
  recapPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
    fontVariant: ['tabular-nums'],
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  billLabel: { fontSize: 13.5, color: GPTBazaarTheme.colors.inkMuted },
  billVal: {
    fontSize: 13.5,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.inkPrimary,
    fontVariant: ['tabular-nums'],
  },
  billGreen: {
    fontSize: 13.5,
    fontWeight: '600',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  billGreenVal: {
    fontSize: 13.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.brandPrimary,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: GPTBazaarTheme.colors.borderSubtle,
    marginTop: 10,
  },
  grandLabel: {
    fontSize: 15.5,
    fontWeight: '800',
    color: GPTBazaarTheme.colors.inkPrimary,
  },
  grandVal: {
    fontSize: 17.5,
    fontWeight: '900',
    color: GPTBazaarTheme.colors.inkPrimary,
    fontVariant: ['tabular-nums'],
  },
  savingsRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GPTBazaarTheme.colors.surfaceMint,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '700',
    color: GPTBazaarTheme.colors.brandPrimary,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  trustText: {
    fontSize: 12,
    fontWeight: '600',
    color: GPTBazaarTheme.colors.inkMuted,
  },
  bottomBar: {
    backgroundColor: GPTBazaarTheme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: GPTBazaarTheme.colors.borderSubtle,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  continueBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: GPTBazaarTheme.colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.45 },
  continueBtnText: { color: '#FFFFFF', fontSize: 15.5, fontWeight: '800' },
});
