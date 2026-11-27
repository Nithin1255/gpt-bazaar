import React, { useEffect, useState } from 'react';

export function GPTBazaarLogo({
  variant = 'light',
  compact = false,
}: {
  variant?: 'light' | 'dark';
  compact?: boolean;
}) {
  const isDark = variant === 'dark';
  return (
    <div className="inline-flex items-center gap-2 shrink-0 select-none">
      <div
        className={`relative flex items-center justify-center rounded-xl ${
          compact ? 'w-8 h-8' : 'w-9 h-9'
        } ${isDark ? 'bg-[#FFC800]' : 'bg-[#0E6F2D]'}`}
      >
        <svg viewBox="0 0 36 36" className="w-6 h-6" fill="none" aria-hidden="true">
          <path
            d="M11 12V9.5C11 6.74 13.24 4.5 16 4.5H20C22.76 4.5 25 6.74 25 9.5V12"
            stroke={isDark ? '#074220' : '#FFC800'}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <rect
            x="6.5"
            y="11"
            width="23"
            height="19"
            rx="4.5"
            fill={isDark ? '#FFC800' : '#0E6F2D'}
            stroke={isDark ? '#074220' : '#FFFFFF'}
            strokeWidth="2"
          />
          <path
            d="M11.5 16.5H14L15.8 23.5H23.2L25 18H15"
            stroke={isDark ? '#074220' : '#FFFFFF'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="16.8" cy="26.5" r="1.4" fill={isDark ? '#074220' : '#FFC800'} />
          <circle cx="22.4" cy="26.5" r="1.4" fill={isDark ? '#074220' : '#FFC800'} />
        </svg>
      </div>
      <div className="leading-none">
        <div className="flex items-baseline gap-1 font-display font-extrabold tracking-tight">
          <span className={`${compact ? 'text-base' : 'text-lg'} ${isDark ? 'text-white' : 'text-[#074220]'}`}>
            GPT
          </span>
          <span className={`${compact ? 'text-base' : 'text-lg'} ${isDark ? 'text-[#FFC800]' : 'text-[#128036]'}`}>
            Bazaar
          </span>
        </div>
        {!compact && (
          <div className="mt-0.5 flex items-center gap-1">
            <span className="h-[2px] w-3 rounded-full bg-[#FFC800]" />
            <span className={`text-[10px] font-medium tracking-tight ${isDark ? 'text-emerald-100/90' : 'text-slate-500'}`}>
              Groceries in Minutes
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function HeroBasketIllustration({ className = 'w-40 h-28' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 150" className={className} fill="none" aria-hidden="true">
      {/* Leafy Greens */}
      <ellipse cx="70" cy="54" rx="34" ry="26" fill="#22C55E" />
      <ellipse cx="95" cy="44" rx="28" ry="24" fill="#16A34A" />
      <ellipse cx="132" cy="52" rx="26" ry="22" fill="#15803D" />
      {/* Milk Bottle */}
      <rect x="116" y="20" width="24" height="56" rx="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
      <rect x="120" y="14" width="16" height="8" rx="3" fill="#2563EB" />
      {/* Bread Loaf */}
      <rect x="142" y="28" width="32" height="52" rx="12" fill="#D97706" />
      <path d="M148 40H168M148 50H168M148 60H168" stroke="#FEF3C7" strokeWidth="2.5" strokeLinecap="round" />
      {/* Yellow Bell Pepper */}
      <ellipse cx="102" cy="64" rx="18" ry="20" fill="#FACC15" />
      <path d="M102 44C102 39 106 37 108 39" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
      {/* Red Tomatoes */}
      <circle cx="72" cy="70" r="18" fill="#EF4444" />
      <circle cx="66" cy="64" r="5" fill="#FCA5A5" opacity="0.45" />
      <path d="M72 52L69 47M72 52L76 48M72 52L72 45" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />
      {/* Carrots */}
      <path d="M142 74L180 54L185 64L147 84Z" fill="#F97316" />
      {/* Bananas */}
      <path d="M168 78C188 74 198 56 192 40C188 54 176 66 160 69Z" fill="#FDE047" />
      <path d="M174 84C194 80 204 62 198 46C194 60 182 72 166 75Z" fill="#FACC15" />
      {/* Yellow Basket */}
      <path d="M40 76H172L160 132C158.8 137.5 154 141 148.4 141H63.6C58 141 53.2 137.5 52 132L40 76Z" fill="#FFC800" />
      <rect x="34" y="68" width="144" height="12" rx="6" fill="#F59E0B" />
      <rect x="78" y="88" width="56" height="34" rx="8" fill="#074220" />
      <text x="106" y="103" textAnchor="middle" fill="#FFC800" fontSize="11" fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">GPT</text>
      <text x="106" y="115" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">Bazaar</text>
      {/* Apple front right */}
      <circle cx="176" cy="126" r="18" fill="#DC2626" />
      <circle cx="170" cy="120" r="4.5" fill="#FCA5A5" opacity="0.45" />
      <path d="M176 108C178 103 183 102 186 104" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function DeliveryScooterIllustration({ className = 'w-32 h-20' }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 104" className={className} fill="none" aria-hidden="true">
      {/* Ground line & route */}
      <path d="M16 88H164" stroke="#BBF7D0" strokeWidth="3" strokeLinecap="round" />
      <path d="M120 84C135 84 140 70 156 70" stroke="#0E6F2D" strokeWidth="2.5" strokeDasharray="5 5" strokeLinecap="round" />
      {/* Speed streaks */}
      <path d="M12 46H28M8 56H24M16 66H30" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
      {/* Delivery Box */}
      <rect x="34" y="34" width="32" height="28" rx="6" fill="#0E6F2D" />
      <rect x="39" y="40" width="22" height="16" rx="3" fill="#FFC800" />
      {/* Rider */}
      <circle cx="88" cy="22" r="11" fill="#FDBA74" />
      <path d="M77 20C77 12 83 8 90 8C96 8 101 12 101 18H77Z" fill="#0E6F2D" />
      <path d="M76 34C76 30 80 28 86 28H92C97 28 101 32 102 38L108 50H94L88 42L84 56H72L76 34Z" fill="#16A34A" />
      {/* Scooter body */}
      <path d="M40 66H118C123 66 127 70 127 75V78H40V66Z" fill="#22C55E" />
      <path d="M104 42H116L122 68H108L104 42Z" fill="#0E6F2D" />
      <circle cx="58" cy="80" r="12" fill="#0F172A" />
      <circle cx="58" cy="80" r="5" fill="#E2E8F0" />
      <circle cx="116" cy="80" r="12" fill="#0F172A" />
      <circle cx="116" cy="80" r="5" fill="#E2E8F0" />
      {/* Pin */}
      <path d="M158 34C151 34 146 39 146 46C146 55 158 66 158 66C158 66 170 55 170 46C170 39 165 34 158 34Z" fill="#EF4444" />
      <circle cx="158" cy="46" r="4.5" fill="#FFFFFF" />
    </svg>
  );
}

export function ArtworkGlyph({
  artworkKey = 'fruits_veg',
  className = 'w-16 h-16',
}: {
  artworkKey?: string;
  className?: string;
}) {
  switch (artworkKey) {
    case 'tomato':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <ellipse cx="48" cy="68" rx="30" ry="5" fill="#E2E8F0" />
          <circle cx="56" cy="36" r="22" fill="#DC2626" />
          <circle cx="49" cy="29" r="6" fill="#FCA5A5" opacity="0.4" />
          <circle cx="34" cy="44" r="20" fill="#EF4444" />
          <circle cx="28" cy="37" r="5" fill="#FECACA" opacity="0.45" />
          <path d="M56 14L52 8M56 14L61 9M56 14L56 7M34 24L30 19M34 24L39 19" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="64" cy="52" rx="16" ry="13" fill="#B91C1C" />
          <ellipse cx="64" cy="52" rx="12" ry="9" fill="#FCA5A5" />
          <circle cx="60" cy="51" r="2" fill="#FEF08A" />
          <circle cx="68" cy="51" r="2" fill="#FEF08A" />
          <circle cx="64" cy="55" r="2" fill="#FEF08A" />
        </svg>
      );
    case 'onion':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <ellipse cx="48" cy="68" rx="30" ry="5" fill="#E2E8F0" />
          <ellipse cx="38" cy="44" rx="20" ry="21" fill="#881337" />
          <path d="M38 23C36 16 38 12 40 10" stroke="#A21CAF" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="58" cy="46" rx="20" ry="19" fill="#9D174D" />
          <ellipse cx="58" cy="46" rx="15" ry="14" fill="#FCE7F3" />
          <ellipse cx="58" cy="46" rx="10" ry="9" stroke="#BE185D" strokeWidth="2" />
          <ellipse cx="58" cy="46" rx="5" ry="4.5" stroke="#BE185D" strokeWidth="1.8" />
        </svg>
      );
    case 'potato':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <ellipse cx="48" cy="68" rx="32" ry="5" fill="#E2E8F0" />
          <ellipse cx="36" cy="42" rx="22" ry="16" transform="rotate(-12 36 42)" fill="#C69C6D" />
          <ellipse cx="60" cy="36" rx="20" ry="15" transform="rotate(14 60 36)" fill="#B88956" />
          <ellipse cx="56" cy="52" rx="18" ry="13" fill="#FDE68A" stroke="#C69C6D" strokeWidth="3" />
          <circle cx="28" cy="40" r="1.5" fill="#78350F" opacity="0.5" />
          <circle cx="42" cy="46" r="1.5" fill="#78350F" opacity="0.5" />
          <circle cx="64" cy="33" r="1.5" fill="#78350F" opacity="0.5" />
        </svg>
      );
    case 'banana':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <ellipse cx="48" cy="68" rx="28" ry="5" fill="#E2E8F0" />
          <path d="M22 46C34 58 60 56 74 28C72 48 54 64 26 56C21 54 19 50 22 46Z" fill="#EAB308" />
          <path d="M18 36C32 48 58 46 72 18C70 38 52 54 24 46C18 44 15 40 18 36Z" fill="#FACC15" />
          <path d="M24 28C38 38 58 34 70 14C66 30 50 42 28 36C23 34 21 30 24 28Z" fill="#FDE047" />
          <rect x="66" y="10" width="9" height="8" rx="3" fill="#713F12" />
        </svg>
      );
    case 'apple':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <ellipse cx="48" cy="68" rx="30" ry="5" fill="#E2E8F0" />
          <circle cx="38" cy="44" r="21" fill="#DC2626" />
          <circle cx="31" cy="36" r="5" fill="#FCA5A5" opacity="0.45" />
          <path d="M38 23C38 17 42 13 46 12" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="47" cy="17" rx="8" ry="4" transform="rotate(-24 47 17)" fill="#16A34A" />
          <circle cx="62" cy="48" r="18" fill="#FEF9C3" stroke="#B91C1C" strokeWidth="3.5" />
          <ellipse cx="59" cy="48" rx="1.8" ry="3.2" fill="#78350F" />
          <ellipse cx="65" cy="48" rx="1.8" ry="3.2" fill="#78350F" />
        </svg>
      );
    case 'grapes':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <ellipse cx="48" cy="68" rx="26" ry="4.5" fill="#E2E8F0" />
          <path d="M50 12C54 12 60 15 64 20" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
          {[
            [36, 26], [48, 24], [60, 27],
            [30, 36], [42, 36], [54, 36], [64, 38],
            [36, 47], [48, 47], [58, 48],
            [42, 57], [52, 57],
          ].map(([cx, cy], idx) => (
            <circle key={idx} cx={cx} cy={cy} r="7.5" fill={idx % 2 === 0 ? '#84CC16' : '#65A30D'} />
          ))}
        </svg>
      );
    case 'carrot':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <ellipse cx="48" cy="68" rx="30" ry="5" fill="#E2E8F0" />
          <path d="M62 20L76 12M65 24L80 22M62 28L74 32" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M20 56L58 20C63 17 69 23 66 28L28 62C23 65 17 60 20 56Z" fill="#F97316" />
          <path d="M36 42L42 48M46 32L52 38" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="64" cy="56" r="8" fill="#FB923C" />
          <circle cx="64" cy="56" r="4" fill="#FED7AA" />
        </svg>
      );
    case 'cauliflower':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <ellipse cx="48" cy="68" rx="28" ry="5" fill="#E2E8F0" />
          <path d="M22 46C18 60 32 66 48 66C64 66 78 60 74 46L66 32H30L22 46Z" fill="#16A34A" />
          <circle cx="48" cy="36" r="18" fill="#F8FAFC" />
          <circle cx="36" cy="40" r="12" fill="#F1F5F9" />
          <circle cx="60" cy="40" r="12" fill="#F1F5F9" />
          <circle cx="48" cy="26" r="12" fill="#FFFFFF" />
          <circle cx="42" cy="34" r="6" fill="#E2E8F0" opacity="0.5" />
          <circle cx="55" cy="38" r="5" fill="#E2E8F0" opacity="0.5" />
        </svg>
      );
    case 'milk':
    case 'dairy_eggs':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <ellipse cx="48" cy="68" rx="30" ry="5" fill="#E2E8F0" />
          <rect x="24" y="14" width="32" height="50" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
          <rect x="24" y="22" width="32" height="16" fill="#0E6F2D" />
          <text x="40" y="33" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="700">MILK</text>
          <path d="M60 34H78L75 64H63L60 34Z" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="2" />
          <path d="M62 42H76L74 62H64L62 42Z" fill="#FFFFFF" />
        </svg>
      );
    case 'bread':
    case 'bakery_eggs':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <ellipse cx="48" cy="68" rx="32" ry="5" fill="#E2E8F0" />
          <rect x="22" y="18" width="46" height="46" rx="12" fill="#92400E" />
          <rect x="27" y="24" width="36" height="35" rx="8" fill="#FDE68A" />
          <rect x="33" y="32" width="24" height="18" rx="4" fill="#B45309" />
          <text x="45" y="44" textAnchor="middle" fill="#FFFFFF" fontSize="7.5" fontWeight="700">BROWN</text>
        </svg>
      );
    case 'eggs':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <rect x="14" y="38" width="68" height="24" rx="6" fill="#D6D3D1" />
          <ellipse cx="28" cy="36" rx="10" ry="13" fill="#E6B89C" />
          <ellipse cx="48" cy="36" rx="10" ry="13" fill="#DDA15E" />
          <ellipse cx="68" cy="36" rx="10" ry="13" fill="#E6B89C" />
          <rect x="14" y="44" width="68" height="18" rx="5" fill="#C7C2BE" />
        </svg>
      );
    case 'rice':
    case 'atta_rice':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <ellipse cx="48" cy="68" rx="30" ry="5" fill="#E2E8F0" />
          <path d="M20 42H76C74 58 62 65 48 65C34 65 22 58 20 42Z" fill="#78350F" />
          <path d="M22 42C28 26 68 26 74 42H22Z" fill="#FEFCE8" stroke="#E5E7EB" strokeWidth="1.5" />
          <circle cx="38" cy="36" r="1.5" fill="#D4D4D8" />
          <circle cx="50" cy="33" r="1.5" fill="#D4D4D8" />
          <circle cx="58" cy="37" r="1.5" fill="#D4D4D8" />
        </svg>
      );
    case 'oil':
    case 'oils_essentials':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <ellipse cx="48" cy="68" rx="26" ry="5" fill="#E2E8F0" />
          <rect x="40" y="10" width="16" height="10" rx="3" fill="#DC2626" />
          <path d="M36 22H60L66 34V62C66 65 63 66 60 66H36C33 66 30 65 30 62V34L36 22Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
          <circle cx="48" cy="46" r="10" fill="#FEF08A" />
          <circle cx="48" cy="46" r="5" fill="#854D0E" />
        </svg>
      );
    case 'almonds':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <ellipse cx="48" cy="68" rx="30" ry="5" fill="#E2E8F0" />
          <path d="M20 42H76C74 58 62 65 48 65C34 65 22 58 20 42Z" fill="#B45309" />
          <ellipse cx="34" cy="36" rx="10" ry="6" transform="rotate(-20 34 36)" fill="#92400E" />
          <ellipse cx="48" cy="32" rx="11" ry="6.5" fill="#78350F" />
          <ellipse cx="62" cy="36" rx="10" ry="6" transform="rotate(20 62 36)" fill="#92400E" />
          <ellipse cx="42" cy="40" rx="9" ry="5.5" fill="#A16207" />
          <ellipse cx="55" cy="40" rx="9" ry="5.5" fill="#A16207" />
        </svg>
      );
    case 'dog_food':
    case 'pet_care':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <ellipse cx="48" cy="68" rx="30" ry="5" fill="#E2E8F0" />
          <rect x="26" y="12" width="44" height="54" rx="8" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
          <rect x="31" y="18" width="34" height="14" rx="4" fill="#DC2626" />
          <text x="48" y="28" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="800">PET</text>
          <circle cx="48" cy="47" r="11" fill="#92400E" />
          <circle cx="44" cy="45" r="2" fill="#FFFFFF" />
          <circle cx="52" cy="45" r="2" fill="#FFFFFF" />
          <ellipse cx="48" cy="50" rx="3.5" ry="2.5" fill="#1E293B" />
        </svg>
      );
    case 'lunchbox':
    case 'kitchen_appliances':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <ellipse cx="48" cy="68" rx="30" ry="5" fill="#E2E8F0" />
          <rect x="20" y="28" width="56" height="34" rx="8" fill="#CBD5E1" stroke="#64748B" strokeWidth="2" />
          <rect x="18" y="22" width="60" height="12" rx="6" fill="#E2E8F0" stroke="#475569" strokeWidth="2" />
          <rect x="32" y="24" width="12" height="8" rx="3" fill="#16A34A" />
          <rect x="52" y="24" width="12" height="8" rx="3" fill="#16A34A" />
        </svg>
      );
    case 'toys_games':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <ellipse cx="48" cy="68" rx="30" ry="5" fill="#E2E8F0" />
          <rect x="22" y="40" width="26" height="22" rx="4" fill="#EF4444" />
          <rect x="48" y="40" width="26" height="22" rx="4" fill="#2563EB" />
          <rect x="34" y="20" width="28" height="22" rx="4" fill="#FACC15" />
          <rect x="39" y="15" width="7" height="5" rx="1.5" fill="#EAB308" />
          <rect x="50" y="15" width="7" height="5" rx="1.5" fill="#EAB308" />
        </svg>
      );
    case 'trimmer':
    case 'personal_care':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <ellipse cx="48" cy="68" rx="24" ry="5" fill="#E2E8F0" />
          <rect x="38" y="18" width="20" height="46" rx="8" fill="#1E293B" />
          <rect x="40" y="10" width="16" height="10" rx="2" fill="#94A3B8" />
          <rect x="44" y="32" width="8" height="14" rx="4" fill="#16A34A" />
          <circle cx="48" cy="54" r="3" fill="#64748B" />
        </svg>
      );
    case 'snacks_beverages':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <ellipse cx="48" cy="68" rx="30" ry="5" fill="#E2E8F0" />
          <rect x="20" y="16" width="32" height="46" rx="6" fill="#FACC15" stroke="#CA8A04" strokeWidth="2" />
          <circle cx="36" cy="38" r="10" fill="#DC2626" />
          <rect x="56" y="22" width="20" height="40" rx="5" fill="#DC2626" />
          <rect x="56" y="34" width="20" height="12" fill="#FFFFFF" />
        </svg>
      );
    case 'instant_food':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <ellipse cx="48" cy="68" rx="30" ry="5" fill="#E2E8F0" />
          <rect x="20" y="18" width="36" height="44" rx="6" fill="#FACC15" stroke="#EAB308" strokeWidth="2" />
          <rect x="25" y="25" width="26" height="12" rx="3" fill="#DC2626" />
          <path d="M52 46H80C78 58 72 64 66 64C60 64 54 58 52 46Z" fill="#7C2D12" />
          <path d="M55 46C58 38 74 38 77 46H55Z" fill="#FDE047" />
        </svg>
      );
    case 'sweets_chocolates':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <rect x="18" y="20" width="60" height="38" rx="8" fill="#5B21B6" />
          <rect x="24" y="26" width="48" height="26" rx="4" fill="#7C3AED" />
          <circle cx="48" cy="39" r="9" fill="#FACC15" />
        </svg>
      );
    case 'baby_care':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <rect x="20" y="18" width="56" height="44" rx="10" fill="#0D9488" />
          <rect x="26" y="24" width="44" height="18" rx="5" fill="#CCFBF1" />
          <circle cx="48" cy="50" r="7" fill="#FACC15" />
        </svg>
      );
    case 'home_cleaning':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <rect x="22" y="18" width="32" height="46" rx="8" fill="#2563EB" />
          <rect x="58" y="28" width="18" height="36" rx="5" fill="#16A34A" />
          <path d="M62 28V18H74" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'stationery':
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <rect x="22" y="16" width="34" height="48" rx="5" fill="#EC4899" />
          <rect x="62" y="28" width="16" height="36" rx="4" fill="#F59E0B" />
          <rect x="64" y="14" width="4" height="16" fill="#2563EB" />
          <rect x="70" y="12" width="4" height="18" fill="#16A34A" />
        </svg>
      );
    case 'fruits_veg':
    default:
      return (
        <svg viewBox="0 0 96 76" className={className} fill="none" aria-hidden="true">
          <ellipse cx="48" cy="68" rx="30" ry="5" fill="#E2E8F0" />
          <ellipse cx="36" cy="34" rx="18" ry="14" fill="#16A34A" />
          <circle cx="46" cy="40" r="14" fill="#EF4444" />
          <circle cx="62" cy="40" r="12" fill="#FACC15" />
          <path d="M22 44H74L68 62C67 64 65 65 62 65H34C31 65 29 64 28 62L22 44Z" fill="#B45309" />
        </svg>
      );
  }
}

export function ProductMedia({
  imageUrl,
  artworkKey,
  alt,
  className = 'w-full h-24',
}: {
  imageUrl?: string;
  artworkKey?: string;
  alt: string;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [imageUrl]);

  if (imageUrl && imageUrl.trim().length > 0 && !imgError) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
        <img
          src={imageUrl}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <ArtworkGlyph artworkKey={artworkKey} className="w-[82%] h-[82%] drop-shadow-[0_4px_6px_rgba(15,23,42,0.06)]" />
    </div>
  );
}
