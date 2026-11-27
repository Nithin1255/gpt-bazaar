# GPT Bazaar — Mobile App (React Native / Expo for Android & iOS)

Standalone Expo React Native mobile application built with **Expo SDK 52**, **Expo Router**, **TypeScript**, and **AsyncStorage**. Fetches products, categories, storefront configuration, coupons, notifications, and orders from **Supabase PostgreSQL & Storage** through the **Python FastAPI backend** (`gpt-bazaar/backend`).

It has **zero local dependencies** on `web/`, `backend/`, or any parent directory, and is ready for **Expo EAS** builds.

## 1. Local Development

```bash
cp .env.example .env
# Set EXPO_PUBLIC_API_BASE_URL (use your Render HTTPS URL or LAN IP e.g. http://192.168.1.10:8000 for physical devices)
npm install
npx expo start
```

## 2. Configure EAS Environment Variables (`production`)

EAS Project ID is configured in `app.json` (`68a18483-1fc5-43b8-8686-54d7e944d32e`). Inside `gpt-bazaar/mobile/`, set your Render FastAPI backend URL:

```bash
npm install -g eas-cli
eas login

eas env:create --environment production --name EXPO_PUBLIC_API_BASE_URL --value "https://your-render-backend.onrender.com" --visibility plaintext
eas env:create --environment production --name EXPO_PUBLIC_ALLOW_HTTP --value "false" --visibility plaintext
```

## 3. Build Production Android `.apk` / `.aab` & iOS `.ipa`

```bash
npm run build:android:prod-apk
npm run build:android:aab
npm run build:ios:ipa
```
