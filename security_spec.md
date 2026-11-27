# GPT Bazaar — Firestore Security Specification (Phase 1 Prototype)

## 1. Data Invariants
1. **Default Deny Catch-All**: Any unmatched document path is denied for both read and write.
2. **Path ID Hardening**: Every single-document operation (`get`, `create`, `update`, `delete`) validates document IDs via `^[a-zA-Z0-9_\-]+$` and max length 128 chars.
3. **Strict Schema Blueprints (`isValid[Entity]`)**: Every `create` and `update` on `categories`, `products`, `orders`, `coupons`, `notifications`, and `stores` enforces exact key allowlists (`hasAll` / `hasOnly`), data types, enum allowlists, and strict string/list size limits matching `firebase-blueprint.json`.
4. **Immutable Creation Metadata**: `createdAt`, `schemaVersion`, and `orderNumber` cannot be mutated after creation.
5. **Terminal Order Locking**: Once an order reaches `delivered` or `cancelled`, non-admin transitions cannot regress or overwrite its status; only valid forward fulfillment transitions (`placed -> packed -> out_for_delivery -> delivered` or `-> cancelled`) or rating updates are permitted.
6. **Phase 1 Open Prototype Boundary**: Per Phase 1 scope (no mandatory login/OTP wall yet), prototype storefront reads and demo catalog/order operations are permitted strictly when passing full schema, size, key-whitelist, and state-transition invariants. Phase 2 switches writes on `categories`, `products`, `coupons`, `stores`, and order fulfillment strictly to verified `isAdmin()` RBAC + customer `uid` ownership.

## 2. The "Dirty Dozen" Adversarial Test Payloads
1. **Shadow Field Injection on Product**: Create product with extra field `isVerified: true` -> MUST be rejected by `hasOnly(...)`.
2. **Oversized Document ID**: Create product at `/products/<200-char-id>` -> MUST be rejected by `isValidId()`.
3. **Oversized Description (DoW)**: Create product with 10,000-character description -> MUST be rejected by `size() <= 1000`.
4. **Invalid Dietary Enum**: Create product with `dietaryType: "organic_magic"` -> MUST be rejected by enum allowlist.
5. **Unbounded Variant List**: Create product with 20 variants -> MUST be rejected by `variants.size() >= 1 && variants.size() <= 8`.
6. **Negative Price / Stock Poisoning**: Update product with `rating: 99` or negative price -> MUST be rejected by numeric range checks.
7. **Order Terminal State Regression**: Update an order whose existing `status == 'delivered'` back to `placed` -> MUST be rejected by terminal-state lock.
8. **Order Number Mutation**: Update `orderNumber` on an existing order -> MUST be rejected by immutability & `affectedKeys().hasOnly(...)`.
9. **Invalid Order Status Enum**: Update order `status` to `"free_items"` -> MUST be rejected by enum guard.
10. **Ghost Collection Access**: Read/write `/secret_keys/master` -> MUST be rejected by default-deny catch-all.
11. **Admin Spoofing with Unverified Email**: Attempt admin override with `email_verified: false` -> MUST be rejected by `email_verified == true`.
12. **Oversized Notification Message**: Create notification with 500-char message -> MUST be rejected by `message.size() <= 320`.
