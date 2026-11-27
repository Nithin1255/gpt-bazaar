# GPT Bazaar Backend — Python FastAPI Context

## Purpose
Authoritative REST + WebSocket API service for **GPT Bazaar**, bridging the React Native Expo mobile app, Next.js Admin console, and Firebase Firestore.

## Stack
- **Framework**: FastAPI (`0.115+`) + Uvicorn ASGI
- **Validation**: Pydantic v2 (strictly synced with `/firebase-blueprint.json`)
- **Real-Time**: Native FastAPI WebSockets (`/ws/orders`, `/ws/inventory`) via `ConnectionManager`
- **Database**: Firebase Admin SDK (Firestore) with clean repository abstraction (`app/services/firestore_repo.py`) and in-memory fallback for local dev without credentials.

## Local Setup
```bash
cd backend-python
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
uvicorn app.main:app --reload --port 8000
```

## Canonical WebSocket Events
- `order.created` — Broadcast to `admin` room whenever a customer places an order.
- `order.status_updated` — Broadcast to `order:{orderId}` and `admin` rooms when status advances.
- `inventory.updated` — Broadcast to `catalog` room when variant stock changes.
- `product.published` — Broadcast to `catalog` room when Admin uploads a new SKU.
