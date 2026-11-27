# GPT Bazaar Mobile Client — React Native (Expo) Context

## Purpose
Standalone production mobile storefront for **GPT Bazaar ("Groceries in Minutes")** built with React Native, Expo SDK 52, Expo Router, and TypeScript. Displays products, categories, and storefront configuration managed by the Admin Web Console in Supabase, fetched via the Python FastAPI backend.

## Architecture & Modularity
- `src/theme/tokens.ts` — Design tokens (`#0E6F2D`, `#074220`, `#FFC800`, `#EDF8F0`).
- `src/services/api.ts` — FastAPI REST + WebSocket client (`EXPO_PUBLIC_API_BASE_URL`).
- `src/context/MobileStoreContext.tsx` — Fetches `/api/v1/storefront`, `/api/v1/orders`, `/api/v1/notifications`, listens for live WebSocket catalog updates, and persists offline cart/wishlist/addresses in `AsyncStorage`.
- `src/components/` — Reusable UI primitives (`ProductCard`, `ProductMedia`, `ScreenHeader`, `DietaryDot`).
