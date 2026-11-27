# GPT Bazaar — Full Phased Engineering Roadmap

## Phase 1: Foundation, Design System & Real-Time Prototype (Completed)
**Goal**: Ship all 16 Customer Mobile screens, reusable modular component libraries, live Admin product upload & inventory management, generalized Firestore schema, and real-time order tracking—without hard auth/payment/map blockers.
- [x] Generalized Firestore blueprint (`firebase-blueprint.json`) & hardened schema rules (`firestore.rules`).
- [x] Customer Mobile 16 screens: Splash, Welcome/Login, Location Picker, Home, Search, Categories, Category Listing, Product Details, Cart, Checkout, Payment Methods, Track Order, My Orders, Wishlist, Addresses, Notifications (+ Profile hub).
- [x] Admin Console: Multi-variant SKU Upload/Editor, Variant Stock Ledger, Category Toggle/Creation, Real-Time Order Fulfillment Queue (`Placed → Packed → Out for Delivery → Delivered`).
- [x] Starter project scaffolds & AI `.md` context docs for `mobile-expo/`, `admin-nextjs/`, and `backend-python/`.

## Phase 2: Authentication, RBAC, Media Storage & Payments
**Goal**: Lock down production access and enable real monetary checkout.
- [ ] **Customer Auth**: Firebase Phone OTP (`+91`) with Expo native reCAPTCHA/Play Integrity + persistent `/users/{uid}/private/profile` PII isolation.
- [ ] **Admin RBAC**: Enforce `/admins/{uid}` + role tiers (`super_admin`, `store_manager`, `picker`) in `firestore.rules` and FastAPI JWT middleware.
- [ ] **Firebase Storage Media Pipeline**: Direct signed upload URLs from Admin Next.js + Cloud Function WebP resizing.
- [ ] **Payment Gateway**: Razorpay / Cashfree UPI Intent & Cards with FastAPI webhook signature verification and idempotent payment ledger.
- [ ] **Atomic Stock Reservation**: Firestore transactions in FastAPI when creating orders to prevent overselling during peak hours.

## Phase 3: Live Maps, Rider App & Push Notifications
**Goal**: Complete hyperlocal 10-minute logistics.
- [ ] **Google Maps Platform**: Places Autocomplete, Reverse Geocoding, and pincode/polygon dark-store auto-routing.
- [ ] **Delivery Partner App (Expo)**: Dedicated rider app to accept packed bags, scan order QR codes, and stream live GPS coordinates.
- [ ] **Live Map Tracking**: Animated delivery scooter polyline & real-time ETA recalculation on Customer `TrackOrderScreen`.
- [ ] **Push Notifications (FCM)**: Automated triggers via FastAPI/Cloud Functions for `Packed`, `Out for Delivery`, `Delivered`, and Wishlist `Price Drop Alerts`.

## Phase 4: Search Intelligence, Analytics, Crashlytics & Multi-Hub Scale
**Goal**: Optimize conversion, reliability, and multi-city operations.
- [ ] **Observability**: Firebase Crashlytics (`@react-native-firebase/crashlytics`) + Firebase Analytics funnel tracking.
- [ ] **Instant Typo-Tolerant Search**: Typesense / Meilisearch sync pipeline with synonyms (`aloo -> potato`, `doodh -> milk`, `naatu -> tomato`).
- [ ] **Personalization**: "Buy Again" reorder carousel, smart basket cross-sells, and dynamic delivery fee / rain surge rules.
- [ ] **Multi-Warehouse Analytics**: SKU turnover heatmaps, dark-store SLA dashboards, and automated low-stock purchase orders.
