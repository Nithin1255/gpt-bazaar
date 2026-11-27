# GPT Bazaar — Backend API (FastAPI + SQLite)

Standalone Phase 1 REST & WebSocket API serving Product CRUD, Categories, and Orders for both **Web Admin** (`gpt-bazaar/web`) and **Mobile App** (`gpt-bazaar/mobile`).

> **Firebase Starter Tier Note:** AI Studio Starter Tier projects do not include Cloud Billing or IAM, so server-side `firebase-admin` Firestore access is not available unless you upgrade your project in Google Cloud Console (`https://console.cloud.google.com/welcome`). For Phase 1, this API persists all data in a durable local SQLite database (`./data/gpt_bazaar.db`) with zero billing or IAM setup required.

## Quick Start

```bash
cp .env.example .env
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive Swagger docs: `http://localhost:8000/docs`

## Phase 1 Endpoints

- `GET /health` — Service health check
- `GET /api/v1/categories` — List grocery categories
- `GET /api/v1/products` — List products (`?category_id=...&active_only=true`)
- `GET /api/v1/products/{id}` — Fetch single product
- `POST /api/v1/products` — Create product
- `PATCH /api/v1/products/{id}` — Update product name, price, variants, imageUrl, stock, or visibility
- `DELETE /api/v1/products/{id}` — Delete product
- `GET /api/v1/orders`, `POST /api/v1/orders`, `PATCH /api/v1/orders/{id}/status` — Order ledger
- `WS /ws/live/{room}` — Real-time catalog & order broadcasts
