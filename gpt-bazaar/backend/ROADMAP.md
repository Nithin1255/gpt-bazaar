# Backend Python (FastAPI) — Phased Roadmap

## Phase 1 (Scaffolded)
- Pydantic v2 schemas matching generalized Firestore blueprint (`Product`, `ProductVariant`, `Category`, `Order`, `OrderTimelineEvent`).
- REST endpoints for `/api/v1/categories`, `/api/v1/products`, `/api/v1/orders`, and `/api/v1/orders/{order_id}/status`.
- WebSocket broadcast manager (`/ws/live/{room}`) pushing instant order and inventory events.
- Pluggable Firestore repository adapter with local memory fallback for zero-config testing.

## Phase 2
- Firebase Auth ID Token verification dependency (`firebase_admin.auth.verify_id_token`) + Admin RBAC guard.
- Razorpay order creation & HMAC-SHA256 webhook handler (`/api/v1/webhooks/razorpay`).
- Firestore atomic transaction for stock deduction on order placement.

## Phase 3
- Rider GPS ingestion endpoint + Redis Pub/Sub fan-out for multi-worker horizontal WebSocket scaling.
- FCM push notification dispatch service (`firebase_admin.messaging`).

## Phase 4
- Celery/Cloud Tasks async workers for inventory low-stock alerts, invoice PDF generation, and Typesense search indexing.
