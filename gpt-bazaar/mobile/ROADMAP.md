# Mobile Expo App — Phased Roadmap

## Phase 1 (Initialized)
- Expo TypeScript workspace + GPT Bazaar design tokens (`src/theme/tokens.ts`).
- Reusable `ProductCard` with variant pricing, discount badges, and inline quantity controls.
- Firestore real-time catalog & category listeners (`HomeScreen.tsx`).

## Phase 2
- Firebase Phone OTP (`+91`) authentication flow (`WelcomeLoginScreen`).
- Razorpay / UPI deep-link checkout integration via FastAPI `/api/v1/orders`.
- Persistent offline cart & wishlist sync via AsyncStorage + Firestore user subcollections.

## Phase 3
- `expo-location` + Google Maps live rider polyline tracking in `TrackOrderScreen`.
- Expo Notifications + Firebase Cloud Messaging (FCM) push tokens.

## Phase 4
- `@react-native-firebase/crashlytics` + `@react-native-firebase/analytics`.
- Skeleton loading shimmer, haptics (`expo-haptics`), and deep links (`gptbazaar://product/:slug`).
