import os
from typing import Optional
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.models import OrderCreate, OrderStatusUpdate, ProductCreate, ProductUpdate
from app.services.firestore_repo import repo
from app.services.ws_manager import ws_manager

app = FastAPI(
    title="GPT Bazaar Core API",
    version="1.0.0",
    description="Instant grocery delivery REST + WebSocket API for Expo Mobile and Next.js Admin.",
)

raw_origins = os.getenv("ALLOWED_ORIGINS", "*").strip()
allow_origins = (
    ["*"]
    if raw_origins == "*" or not raw_origins
    else [o.strip() for o in raw_origins.split(",") if o.strip()]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=False if allow_origins == ["*"] else True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "gpt-bazaar-api", "phase": 1}


@app.get("/api/v1/categories")
async def list_categories():
    return {"items": repo.list_categories()}


@app.get("/api/v1/products")
async def list_products(
    category_id: Optional[str] = None, active_only: bool = False
):
    return {
        "items": repo.list_products(
            category_id=category_id, active_only=active_only
        )
    }


@app.get("/api/v1/products/{product_id}")
async def get_product(product_id: str):
    item = repo.get_product(product_id)
    if not item:
        raise HTTPException(status_code=404, detail="Product not found")
    return item


@app.post("/api/v1/products", status_code=201)
async def create_product(payload: ProductCreate):
    created = repo.create_product(payload)
    await ws_manager.broadcast("catalog", "product.published", created)
    return created


@app.patch("/api/v1/products/{product_id}")
async def update_product(product_id: str, payload: ProductUpdate):
    updated = repo.update_product(product_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    await ws_manager.broadcast("catalog", "product.updated", updated)
    return updated


@app.delete("/api/v1/products/{product_id}")
async def delete_product(product_id: str):
    deleted = repo.delete_product(product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    await ws_manager.broadcast("catalog", "product.deleted", {"id": product_id})
    return {"deleted": True, "id": product_id}


@app.get("/api/v1/orders")
async def list_orders():
    return {"items": repo.list_orders()}


@app.post("/api/v1/orders", status_code=201)
async def create_order(payload: OrderCreate):
    created = repo.create_order(payload)
    await ws_manager.broadcast("admin", "order.created", created)
    return created


@app.patch("/api/v1/orders/{order_id}/status")
async def update_order_status(order_id: str, body: OrderStatusUpdate):
    updated = repo.update_order_status(order_id, body.status, body.note)
    if not updated:
        raise HTTPException(status_code=404, detail="Order not found")
    await ws_manager.broadcast("admin", "order.status_updated", updated)
    await ws_manager.broadcast(f"order:{order_id}", "order.status_updated", updated)
    return updated


@app.websocket("/ws/live/{room}")
async def websocket_endpoint(websocket: WebSocket, room: str):
    await ws_manager.connect(room, websocket)
    try:
        while True:
            _ = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(room, websocket)
