# GPT Bazaar Mobile Client — React Native (Expo) Context

## Purpose
Production mobile storefront for **GPT Bazaar ("Groceries in Minutes")** built with React Native, Expo SDK 52, and TypeScript. Mirrors all 16 reference screens verified in the live web prototype.

## Architecture & Modularity
- `src/theme/tokens.ts` — Single source of truth for GPT Bazaar colors (`#0E6F2D`, `#074220`, `#FFC800`, `#EDF8F0`), spacing, radii, and typography.
- `src/services/firebase.ts` — Firebase JS SDK initialization connecting to the exact Firestore database defined in `/firebase-blueprint.json`.
- `src/components/` — Reusable UI primitives (`ProductCard`, `QuantityStepper`, `DietaryDot`, `OrderProgressStepper`, `BottomTabBar`).
- `src/screens/` — Modular screen containers (Splash, Welcome, Location, Home, Search, Categories, CategoryListing, ProductDetail, Cart, Checkout, Payment, TrackOrder, MyOrders, Wishlist, Addresses, Notifications).

## Quick Start
```bash
cd mobile-expo
npm install
npx expo start
```
Set `EXPO_PUBLIC_FIREBASE_*` environment variables matching your Firebase web app config before launching.
