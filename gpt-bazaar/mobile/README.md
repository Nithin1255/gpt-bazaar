# GPT Bazaar — Mobile App (React Native / Expo for Android & iOS)

Standalone 16-screen instant grocery delivery mobile app for **Android** and **iOS** built with **Expo**, **Expo Router**, **React Native**, **TypeScript**, **AsyncStorage**, and live **Firebase Firestore** sync. It has **zero dependencies** on any parent folder.

## Features Included

- **16 Complete Screens + Profile Hub**: Splash, Welcome/Quick Start, Location Picker, Home, Search, Categories Directory, Category Product Listing, Product Details (PDP), Cart with coupons (`GROCER10`), Checkout, Payment Methods, Live 4-Stage Order Tracker, My Orders with Reorder & Rating, Wishlist, Saved Addresses, Notifications, and Profile Hub.
- **Direct Real-Time Firestore Sync**: All 16 screens read and write directly to Firebase Firestore (`categories`, `products`, `orders`, `coupons`, `notifications`)—no separate hosted backend server is required to run the app.
- **Offline Device Persistence**: Cart, wishlist, saved delivery addresses, active hub, and recent searches persist locally via `AsyncStorage`.

## 1. Local Development

```bash
cp .env.example .env
# Paste your EXPO_PUBLIC_FIREBASE_* values into .env
npm install
npx expo start
```

## 2. Configure EAS Environment Variables (`production`)

EAS Project ID is already linked in `app.json` (`68a18483-1fc5-43b8-8686-54d7e944d32e`). Run these commands inside `gpt-bazaar/mobile/` before building:

```bash
npm install -g eas-cli
eas login

eas env:create --environment production --name EXPO_PUBLIC_FIREBASE_API_KEY --value "YOUR_KEY" --visibility plaintext
eas env:create --environment production --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value "YOUR_AUTH_DOMAIN" --visibility plaintext
eas env:create --environment production --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "YOUR_PROJECT_ID" --visibility plaintext
eas env:create --environment production --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value "YOUR_BUCKET" --visibility plaintext
eas env:create --environment production --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "YOUR_SENDER_ID" --visibility plaintext
eas env:create --environment production --name EXPO_PUBLIC_FIREBASE_APP_ID --value "YOUR_APP_ID" --visibility plaintext
eas env:create --environment production --name EXPO_PUBLIC_FIRESTORE_DATABASE_ID --value "YOUR_DB_ID" --visibility plaintext
eas env:create --environment production --name EXPO_PUBLIC_API_BASE_URL --value "http://localhost:8000" --visibility plaintext
eas env:create --environment production --name EXPO_PUBLIC_ALLOW_HTTP --value "true" --visibility plaintext
```

## 3. Build Production Android `.apk` & iOS `.ipa`

```bash
# Signed Production Android .apk (directly installable on any Android phone)
npm run build:android:prod-apk
# (or: eas build --platform android --profile production)

# Google Play Store Android .aab (for Play Console upload)
npm run build:android:aab

# iOS Production .ipa (requires Apple Developer account)
npm run build:ios:ipa
```
