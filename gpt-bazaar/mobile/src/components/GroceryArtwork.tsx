import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect, Text as SvgText } from 'react-native-svg';
import { GPTBazaarTheme } from '../theme/tokens';

export function GPTBazaarLogo({
  variant = 'light',
  compact = false,
}: {
  variant?: 'light' | 'dark';
  compact?: boolean;
}) {
  const isDark = variant === 'dark';
  return (
    <View style={styles.logoWrap}>
      <View
        style={[
          styles.logoIconBox,
          compact && styles.logoIconBoxCompact,
          { backgroundColor: isDark ? GPTBazaarTheme.colors.brandAccent : GPTBazaarTheme.colors.brandPrimary },
        ]}
      >
        <Svg width={compact ? 20 : 24} height={compact ? 20 : 24} viewBox="0 0 36 36" fill="none">
          <Path
            d="M11 12V9.5C11 6.74 13.24 4.5 16 4.5H20C22.76 4.5 25 6.74 25 9.5V12"
            stroke={isDark ? '#074220' : '#FFC800'}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <Rect
            x={6.5}
            y={11}
            width={23}
            height={19}
            rx={4.5}
            fill={isDark ? '#FFC800' : '#0E6F2D'}
            stroke={isDark ? '#074220' : '#FFFFFF'}
            strokeWidth={2}
          />
          <Path
            d="M11.5 16.5H14L15.8 23.5H23.2L25 18H15"
            stroke={isDark ? '#074220' : '#FFFFFF'}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx={16.8} cy={26.5} r={1.4} fill={isDark ? '#074220' : '#FFC800'} />
          <Circle cx={22.4} cy={26.5} r={1.4} fill={isDark ? '#074220' : '#FFC800'} />
        </Svg>
      </View>
      <View>
        <View style={styles.wordmarkRow}>
          <Text
            style={[
              styles.wordmark,
              compact && styles.wordmarkCompact,
              { color: isDark ? '#FFFFFF' : GPTBazaarTheme.colors.brandDeep },
            ]}
          >
            GPT{' '}
          </Text>
          <Text
            style={[
              styles.wordmark,
              compact && styles.wordmarkCompact,
              { color: isDark ? GPTBazaarTheme.colors.brandAccent : GPTBazaarTheme.colors.brandPrimary },
            ]}
          >
            Bazaar
          </Text>
        </View>
        {!compact && (
          <View style={styles.taglineRow}>
            <View style={styles.taglineBar} />
            <Text style={[styles.taglineText, { color: isDark ? '#D1FAE5' : GPTBazaarTheme.colors.inkMuted }]}>
              Groceries in Minutes
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export function HeroBasketIllustration({ width = 180, height = 124 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 220 150" fill="none">
      <Ellipse cx={70} cy={54} rx={34} ry={26} fill="#22C55E" />
      <Ellipse cx={95} cy={44} rx={28} ry={24} fill="#16A34A" />
      <Ellipse cx={132} cy={52} rx={26} ry={22} fill="#15803D" />
      <Rect x={116} y={20} width={24} height={56} rx={8} fill="#F8FAFC" stroke="#CBD5E1" strokeWidth={1.5} />
      <Rect x={120} y={14} width={16} height={8} rx={3} fill="#2563EB" />
      <Rect x={142} y={28} width={32} height={52} rx={12} fill="#D97706" />
      <Ellipse cx={102} cy={64} rx={18} ry={20} fill="#FACC15" />
      <Circle cx={72} cy={70} r={18} fill="#EF4444" />
      <Path d="M142 74L180 54L185 64L147 84Z" fill="#F97316" />
      <Path d="M168 78C188 74 198 56 192 40C188 54 176 66 160 69Z" fill="#FDE047" />
      <Path d="M40 76H172L160 132C158.8 137.5 154 141 148.4 141H63.6C58 141 53.2 137.5 52 132L40 76Z" fill="#FFC800" />
      <Rect x={34} y={68} width={144} height={12} rx={6} fill="#F59E0B" />
      <Rect x={78} y={88} width={56} height={34} rx={8} fill="#074220" />
      <SvgText x={106} y={103} textAnchor="middle" fill="#FFC800" fontSize="11" fontWeight="800">
        GPT
      </SvgText>
      <SvgText x={106} y={115} textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="700">
        Bazaar
      </SvgText>
      <Circle cx={176} cy={126} r={18} fill="#DC2626" />
    </Svg>
  );
}

export function DeliveryScooterIllustration({ width = 140, height = 82 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 180 104" fill="none">
      <Path d="M16 88H164" stroke="#BBF7D0" strokeWidth={3} strokeLinecap="round" />
      <Path d="M120 84C135 84 140 70 156 70" stroke="#0E6F2D" strokeWidth={2.5} strokeDasharray="5 5" strokeLinecap="round" />
      <Path d="M12 46H28M8 56H24M16 66H30" stroke="#16A34A" strokeWidth={3} strokeLinecap="round" />
      <Rect x={34} y={34} width={32} height={28} rx={6} fill="#0E6F2D" />
      <Rect x={39} y={40} width={22} height={16} rx={3} fill="#FFC800" />
      <Circle cx={88} cy={22} r={11} fill="#FDBA74" />
      <Path d="M77 20C77 12 83 8 90 8C96 8 101 12 101 18H77Z" fill="#0E6F2D" />
      <Path d="M76 34C76 30 80 28 86 28H92C97 28 101 32 102 38L108 50H94L88 42L84 56H72L76 34Z" fill="#16A34A" />
      <Path d="M40 66H118C123 66 127 70 127 75V78H40V66Z" fill="#22C55E" />
      <Path d="M104 42H116L122 68H108L104 42Z" fill="#0E6F2D" />
      <Circle cx={58} cy={80} r={12} fill="#0F172A" />
      <Circle cx={58} cy={80} r={5} fill="#E2E8F0" />
      <Circle cx={116} cy={80} r={12} fill="#0F172A" />
      <Circle cx={116} cy={80} r={5} fill="#E2E8F0" />
      <Path d="M158 34C151 34 146 39 146 46C146 55 158 66 158 66C158 66 170 55 170 46C170 39 165 34 158 34Z" fill="#EF4444" />
      <Circle cx={158} cy={46} r={4.5} fill="#FFFFFF" />
    </Svg>
  );
}

export function ArtworkGlyph({
  artworkKey = 'fruits_veg',
  size = 56,
}: {
  artworkKey?: string;
  size?: number;
}) {
  const height = Math.round(size * 0.8);
  switch (artworkKey) {
    case 'tomato':
      return (
        <Svg width={size} height={height} viewBox="0 0 96 76" fill="none">
          <Ellipse cx={48} cy={68} rx={30} ry={5} fill="#E2E8F0" />
          <Circle cx={56} cy={36} r={22} fill="#DC2626" />
          <Circle cx={34} cy={44} r={20} fill="#EF4444" />
          <Path d="M56 14L52 8M56 14L61 9M56 14L56 7M34 24L30 19M34 24L39 19" stroke="#15803D" strokeWidth={3} strokeLinecap="round" />
          <Ellipse cx={64} cy={52} rx={16} ry={13} fill="#B91C1C" />
          <Ellipse cx={64} cy={52} rx={12} ry={9} fill="#FCA5A5" />
        </Svg>
      );
    case 'onion':
      return (
        <Svg width={size} height={height} viewBox="0 0 96 76" fill="none">
          <Ellipse cx={48} cy={68} rx={30} ry={5} fill="#E2E8F0" />
          <Ellipse cx={38} cy={44} rx={20} ry={21} fill="#881337" />
          <Ellipse cx={58} cy={46} rx={20} ry={19} fill="#9D174D" />
          <Ellipse cx={58} cy={46} rx={14} ry={13} fill="#FCE7F3" />
          <Ellipse cx={58} cy={46} rx={8} ry={7.5} stroke="#BE185D" strokeWidth={2} />
        </Svg>
      );
    case 'potato':
      return (
        <Svg width={size} height={height} viewBox="0 0 96 76" fill="none">
          <Ellipse cx={48} cy={68} rx={32} ry={5} fill="#E2E8F0" />
          <Ellipse cx={36} cy={42} rx={22} ry={16} fill="#C69C6D" />
          <Ellipse cx={60} cy={36} rx={20} ry={15} fill="#B88956" />
          <Ellipse cx={56} cy={52} rx={18} ry={13} fill="#FDE68A" stroke="#C69C6D" strokeWidth={3} />
        </Svg>
      );
    case 'banana':
      return (
        <Svg width={size} height={height} viewBox="0 0 96 76" fill="none">
          <Ellipse cx={48} cy={68} rx={28} ry={5} fill="#E2E8F0" />
          <Path d="M22 46C34 58 60 56 74 28C72 48 54 64 26 56C21 54 19 50 22 46Z" fill="#EAB308" />
          <Path d="M18 36C32 48 58 46 72 18C70 38 52 54 24 46C18 44 15 40 18 36Z" fill="#FACC15" />
          <Path d="M24 28C38 38 58 34 70 14C66 30 50 42 28 36C23 34 21 30 24 28Z" fill="#FDE047" />
          <Rect x={66} y={10} width={9} height={8} rx={3} fill="#713F12" />
        </Svg>
      );
    case 'apple':
      return (
        <Svg width={size} height={height} viewBox="0 0 96 76" fill="none">
          <Ellipse cx={48} cy={68} rx={30} ry={5} fill="#E2E8F0" />
          <Circle cx={38} cy={44} r={21} fill="#DC2626" />
          <Path d="M38 23C38 17 42 13 46 12" stroke="#78350F" strokeWidth={3} strokeLinecap="round" />
          <Circle cx={62} cy={48} r={18} fill="#FEF9C3" stroke="#B91C1C" strokeWidth={3.5} />
        </Svg>
      );
    case 'grapes':
      return (
        <Svg width={size} height={height} viewBox="0 0 96 76" fill="none">
          <Ellipse cx={48} cy={68} rx={26} ry={4.5} fill="#E2E8F0" />
          <Path d="M50 12C54 12 60 15 64 20" stroke="#15803D" strokeWidth={3} strokeLinecap="round" />
          <Circle cx={38} cy={28} r={8} fill="#84CC16" />
          <Circle cx={52} cy={26} r={8} fill="#65A30D" />
          <Circle cx={34} cy={40} r={8} fill="#65A30D" />
          <Circle cx={48} cy={40} r={8} fill="#84CC16" />
          <Circle cx={60} cy={40} r={8} fill="#65A30D" />
          <Circle cx={42} cy={53} r={8} fill="#84CC16" />
          <Circle cx={54} cy={53} r={8} fill="#65A30D" />
        </Svg>
      );
    case 'carrot':
      return (
        <Svg width={size} height={height} viewBox="0 0 96 76" fill="none">
          <Ellipse cx={48} cy={68} rx={30} ry={5} fill="#E2E8F0" />
          <Path d="M62 20L76 12M65 24L80 22M62 28L74 32" stroke="#16A34A" strokeWidth={3.5} strokeLinecap="round" />
          <Path d="M20 56L58 20C63 17 69 23 66 28L28 62C23 65 17 60 20 56Z" fill="#F97316" />
          <Circle cx={64} cy={56} r={8} fill="#FB923C" />
        </Svg>
      );
    case 'cauliflower':
      return (
        <Svg width={size} height={height} viewBox="0 0 96 76" fill="none">
          <Ellipse cx={48} cy={68} rx={28} ry={5} fill="#E2E8F0" />
          <Path d="M22 46C18 60 32 66 48 66C64 66 78 60 74 46L66 32H30L22 46Z" fill="#16A34A" />
          <Circle cx={48} cy={36} r={18} fill="#F8FAFC" />
          <Circle cx={36} cy={40} r={12} fill="#F1F5F9" />
          <Circle cx={60} cy={40} r={12} fill="#F1F5F9" />
          <Circle cx={48} cy={26} r={12} fill="#FFFFFF" />
        </Svg>
      );
    case 'milk':
    case 'dairy_eggs':
      return (
        <Svg width={size} height={height} viewBox="0 0 96 76" fill="none">
          <Ellipse cx={48} cy={68} rx={30} ry={5} fill="#E2E8F0" />
          <Rect x={24} y={14} width={32} height={50} rx={6} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={2} />
          <Rect x={24} y={22} width={32} height={16} fill="#0E6F2D" />
          <SvgText x={40} y={33} textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="700">
            MILK
          </SvgText>
          <Path d="M60 34H78L75 64H63L60 34Z" fill="#EFF6FF" stroke="#93C5FD" strokeWidth={2} />
        </Svg>
      );
    case 'bread':
    case 'bakery_eggs':
      return (
        <Svg width={size} height={height} viewBox="0 0 96 76" fill="none">
          <Ellipse cx={48} cy={68} rx={32} ry={5} fill="#E2E8F0" />
          <Rect x={22} y={18} width={46} height={46} rx={12} fill="#92400E" />
          <Rect x={27} y={24} width={36} height={35} rx={8} fill="#FDE68A" />
          <Rect x={33} y={32} width={24} height={18} rx={4} fill="#B45309" />
        </Svg>
      );
    case 'eggs':
      return (
        <Svg width={size} height={height} viewBox="0 0 96 76" fill="none">
          <Rect x={14} y={38} width={68} height={24} rx={6} fill="#D6D3D1" />
          <Ellipse cx={28} cy={36} rx={10} ry={13} fill="#E6B89C" />
          <Ellipse cx={48} cy={36} rx={10} ry={13} fill="#DDA15E" />
          <Ellipse cx={68} cy={36} rx={10} ry={13} fill="#E6B89C" />
          <Rect x={14} y={44} width={68} height={18} rx={5} fill="#C7C2BE" />
        </Svg>
      );
    case 'rice':
    case 'atta_rice':
      return (
        <Svg width={size} height={height} viewBox="0 0 96 76" fill="none">
          <Ellipse cx={48} cy={68} rx={30} ry={5} fill="#E2E8F0" />
          <Path d="M20 42H76C74 58 62 65 48 65C34 65 22 58 20 42Z" fill="#78350F" />
          <Path d="M22 42C28 26 68 26 74 42H22Z" fill="#FEFCE8" stroke="#E5E7EB" strokeWidth={1.5} />
        </Svg>
      );
    case 'oil':
    case 'oils_essentials':
      return (
        <Svg width={size} height={height} viewBox="0 0 96 76" fill="none">
          <Ellipse cx={48} cy={68} rx={26} ry={5} fill="#E2E8F0" />
          <Rect x={40} y={10} width={16} height={10} rx={3} fill="#DC2626" />
          <Path d="M36 22H60L66 34V62C66 65 63 66 60 66H36C33 66 30 65 30 62V34L36 22Z" fill="#FACC15" stroke="#CA8A04" strokeWidth={2} />
          <Circle cx={48} cy={46} r={9} fill="#FEF08A" />
        </Svg>
      );
    case 'snacks_beverages':
      return (
        <Svg width={size} height={height} viewBox="0 0 96 76" fill="none">
          <Ellipse cx={48} cy={68} rx={30} ry={5} fill="#E2E8F0" />
          <Rect x={20} y={16} width={32} height={46} rx={6} fill="#FACC15" stroke="#CA8A04" strokeWidth={2} />
          <Circle cx={36} cy={38} r={10} fill="#DC2626" />
          <Rect x={56} y={22} width={20} height={40} rx={5} fill="#DC2626" />
          <Rect x={56} y={34} width={20} height={12} fill="#FFFFFF" />
        </Svg>
      );
    case 'dog_food':
    case 'pet_care':
      return (
        <Svg width={size} height={height} viewBox="0 0 96 76" fill="none">
          <Ellipse cx={48} cy={68} rx={30} ry={5} fill="#E2E8F0" />
          <Rect x={26} y={12} width={44} height={54} rx={8} fill="#FACC15" stroke="#CA8A04" strokeWidth={2} />
          <Rect x={31} y={18} width={34} height={14} rx={4} fill="#DC2626" />
          <Circle cx={48} cy={47} r={11} fill="#92400E" />
        </Svg>
      );
    default:
      return (
        <Svg width={size} height={height} viewBox="0 0 96 76" fill="none">
          <Ellipse cx={48} cy={68} rx={30} ry={5} fill="#E2E8F0" />
          <Ellipse cx={36} cy={34} rx={18} ry={14} fill="#16A34A" />
          <Circle cx={46} cy={40} r={14} fill="#EF4444" />
          <Circle cx={62} cy={40} r={12} fill="#FACC15" />
          <Path d="M22 44H74L68 62C67 64 65 65 62 65H34C31 65 29 64 28 62L22 44Z" fill="#B45309" />
        </Svg>
      );
  }
}

export function ProductMedia({
  imageUrl,
  artworkKey,
  size = 64,
  style,
}: {
  imageUrl?: string;
  artworkKey?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [imageUrl]);

  const trimmed = imageUrl?.trim();

  if (trimmed && !imgError) {
    return (
      <View style={[styles.mediaWrap, style]}>
        <Image
          source={{ uri: trimmed }}
          style={styles.remoteImage}
          resizeMode="contain"
          onError={() => setImgError(true)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.mediaWrap, style]}>
      <ArtworkGlyph artworkKey={artworkKey} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIconBoxCompact: { width: 32, height: 32, borderRadius: 9 },
  wordmarkRow: { flexDirection: 'row', alignItems: 'baseline' },
  wordmark: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  wordmarkCompact: { fontSize: 16 },
  taglineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  taglineBar: { width: 12, height: 2, borderRadius: 2, backgroundColor: '#FFC800' },
  taglineText: { fontSize: 10, fontWeight: '600' },
  mediaWrap: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  remoteImage: { width: '100%', height: '100%' },
});
