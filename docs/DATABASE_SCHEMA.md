# GPT Bazaar — Generalized Database Schema Specification (v1)

Designed for **Firebase Firestore** with forward compatibility across Phases 1–4 (multi-city dark stores, multi-weight pack variants, rider telemetry, RBAC, and analytics). Every document includes `schemaVersion: 1`.

## Collections Overview

### 1. `/stores/{storeId}` (Dark-Store Fulfillment Hubs)
| Field | Type | Notes |
| :--- | :--- | :--- |
| `name` | string (1–120) | Hub display name (e.g. `GPT Bazaar Chittoor Hub`) |
| `city` | string (1–80) | City name |
| `pincode` | string (4–12) | Primary hub pincode |
| `serviceablePincodes` | string[] (max 50) | Hyperlocal delivery pincodes |
| `avgDeliveryMins` | integer (5–120) | Rolling ETA baseline |
| `isOpen` | boolean | Hub accepting orders |
| `schemaVersion` | integer (`1`) | Version guard |

### 2. `/categories/{categoryId}`
| Field | Type | Notes |
| :--- | :--- | :--- |
| `name` | string (1–80) | Category display title |
| `slug` | string (`^[a-z0-9-]+$`) | URL-safe slug |
| `subtitle` | string (max 160) | Banner subtitle |
| `artworkKey` | string (max 60) | Fallback vector illustration key |
| `imageUrl` | string (max 1000) | Optional Firebase Storage / CDN image URL |
| `bgTint` | string (max 32) | Pastel wash hex token (e.g. `#EEF9F0`) |
| `subcategories` | string[] (max 12) | Filter chip labels (`['All', 'Fruits', ...]`) |
| `sortOrder` | integer (0–1000) | Grid sort position |
| `isActive` | boolean | Toggle visibility without deleting |

### 3. `/products/{productId}`
| Field | Type | Notes |
| :--- | :--- | :--- |
| `name` | string (1–140) | Product title |
| `slug` | string (`^[a-z0-9-]+$`) | Unique slug |
| `brand` / `tagline` | string | Brand & quality subtitle |
| `categoryId` | string | Foreign reference to `/categories/{categoryId}` |
| `subcategory` | string | Matches parent category's `subcategories[]` |
| `dietaryType` | enum | `veg` \| `non_veg` \| `none` |
| `variants` | ProductVariant[] (1–8) | `{ id, label, unitValue, unit, price, mrp, discountPercent, stock, sku }` |
| `defaultVariantId` | string | Default card pack variant |
| `storeId` | string | Dark-store hub ID (extensible to per-hub inventory subcollection in Phase 3) |
| `isPopular` / `isTrending` / `isActive` | boolean | Merchandising & visibility flags |

### 4. `/orders/{orderId}`
| Field | Type | Notes |
| :--- | :--- | :--- |
| `orderNumber` | string | Human-readable code (`#GBT78596324`), immutable |
| `storeId` | string | Fulfillment dark store |
| `customerName` / `customerPhone` | string | Recipient contact (migrated to `userId` + private profile in Phase 2) |
| `deliveryAddress` | map | Snapshot of `{ id, label, line1, city, pincode, state }` |
| `items` | OrderItem[] (1–50) | Immutable price/qty snapshot at purchase |
| `pricing` | map | `{ itemTotal, discount, couponCode, deliveryFee, packagingFee, grandTotal, totalSavings }` |
| `paymentMethod` | enum | `upi` \| `card` \| `netbanking` \| `wallet` \| `cod` |
| `paymentStatus` | enum | `pending` \| `paid` \| `cod_due` \| `refunded` |
| `status` | enum | `placed` → `packed` → `out_for_delivery` → `delivered` \| `cancelled` |
| `statusTimeline` | Event[] (1–10) | Append-only audit trail `{ status, label, note, timestamp }` |
| `deliveryPartner` | map | `{ name, rating, deliveriesCount, phone }` |

### 5. `/coupons/{couponId}` & `/notifications/{notificationId}`
- `coupons`: `code`, `title`, `description`, `discountType` (`flat` \| `percent`), `discountValue`, `minOrderAmount`, `maxDiscount`, `isActive`.
- `notifications`: `category` (`orders` \| `offers` \| `account` \| `updates`), `title`, `message`, `orderId`, `isRead`, `createdAt`.
