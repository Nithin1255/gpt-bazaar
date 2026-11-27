# GPT Bazaar — Master Project Context (AI & Engineering Handbook)

## 1. Product Summary
**GPT Bazaar ("Groceries in Minutes")** is a hyperlocal quick-commerce grocery delivery platform inspired by Blinkit, Zepto, and BigBasket, delivering daily essentials in 10–15 minutes.

## 2. Ecosystem Architecture
| Sub-Project | Directory | Tech Stack | Responsibility |
| :--- | :--- | :--- | :--- |
| **Live Dual Preview (AI Studio)** | `/src/` | React 19, Vite, Tailwind CSS v4, Firebase JS SDK | Interactive 16-screen Customer Mobile preview + Admin Operations Console synced live to Firestore |
| **Customer Mobile App** | `/mobile-expo/` | React Native, Expo SDK 52, Expo Router, TypeScript, Firebase JS SDK | Production iOS/Android customer app with modular reusable UI primitives |
| **Admin Web Console** | `/admin-nextjs/` | Next.js 15 App Router, TanStack React Query, Socket.IO Client, Firebase | Store catalog publishing, variant inventory control, live order dispatch |
| **Core Backend API** | `/backend-python/` | Python 3.11+, FastAPI, Pydantic v2, WebSockets, Firebase Admin SDK | Authoritative REST API, real-time WebSocket event hub, Phase 2+ payment & dispatch webhooks |
| **Cloud Data & Infra** | `/firebase-blueprint.json`, `/firestore.rules` | Firebase Firestore, Auth, Storage (Phase 2), FCM (Phase 3), Crashlytics (Phase 4) | Generalized, versioned NoSQL schema and real-time persistence |

## 3. Brand & Visual Design System
- **Brand Name**: `GPT Bazaar` — *Groceries in Minutes*
- **Primary Brand Green**: `#0E6F2D` (Deep Splash `#074220`, Hover `#0A5823`)
- **Accent Citrus Yellow**: `#FFC800` (Brand mark accent, savings badge, location CTA)
- **Mint Surface Tint**: `#EDF8F0` | **Neutral Canvas**: `#F6F8F7` | **Card Surface**: `#FFFFFF`
- **Typography**: `Plus Jakarta Sans` (Display/Headings), `DM Sans` (Body/UI), `JetBrains Mono` (`tabular-nums` for `₹` prices, order IDs `#GBT...`, SKUs, stock)
- **Default Market**: India (`₹ INR`), initial dark-store hub in Chittoor / Pudukpet (`517584`).

## 4. Coding & Modularity Rules for Future AI Agents
1. **Schema Synchronicity**: Every database mutation across Mobile, Admin, and FastAPI must conform to `firebase-blueprint.json` (`schemaVersion: 1`) and `docs/DATABASE_SCHEMA.md`.
2. **Reusable Primitives First**: Never duplicate product card, quantity stepper, dietary dot, or order timeline markup—extend shared components.
3. **Real-Time Contract**: All live events use the canonical event names: `order.created`, `order.status_updated`, `inventory.updated`, `product.published`.
4. **No Hardcoded Secrets**: Keep Firebase credentials, payment keys, and Maps API keys strictly in environment variables (`.env` / `.env.local`).
