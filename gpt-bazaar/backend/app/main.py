import os
from contextlib import asynccontextmanager
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.schemas.models import (
    AppConfigUpdate,
    CategoryCreate,
    CategoryUpdate,
    OrderCreate,
    OrderRatingUpdate,
    OrderStatusUpdate,
    ProductCreate,
    ProductUpdate,
    UploadImageResponse,
)
from app.services.migrator import run_migrations
from app.services.supabase_client import init_supabase
from app.services.supabase_repo import repo
from app.services.ws_manager import ws_manager

load_dotenv()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Strict Supabase + PostgreSQL check: fails fast on startup if credentials are missing/invalid.
    init_supabase()
    run_migrations()
    repo.ensure_seed_data()
    yield


app = FastAPI(
    title="GPT Bazaar Core API",
    version="2.0.0",
    description="Authoritative Python FastAPI + Supabase PostgreSQL/Storage backend for Next.js Admin and Expo Mobile.",
    lifespan=lifespan,
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
    init_supabase()
    return {"status": "ok", "service": "gpt-bazaar-api", "database": "supabase-postgres"}


@app.get("/api/v1/storefront")
async def get_mobile_storefront():
    """Single bootstrap endpoint for the Expo mobile app (config, categories, active products, coupons)."""
    return {
        "appConfig": repo.get_app_config(),
        "categories": repo.list_categories(active_only=True),
        "products": repo.list_products(active_only=True),
        "coupons": repo.list_coupons(active_only=True),
    }


@app.get("/api/v1/app-config")
async def get_app_config():
    return repo.get_app_config()


@app.patch("/api/v1/app-config")
async def update_app_config(payload: AppConfigUpdate):
    updated = repo.update_app_config(payload)
    await ws_manager.broadcast("catalog", "app_config.updated", updated)
    return updated


@app.post("/api/v1/uploads/image", response_model=UploadImageResponse, status_code=201)
async def upload_image(
    file: UploadFile = File(...),
    folder: str = Form("products"),
    slug: str = Form("item"),
):
    content = await file.read()
    content_type = (file.content_type or "").lower()
    try:
        return repo.upload_image(
            content=content,
            content_type=content_type,
            folder=folder,
            slug_hint=slug,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/v1/categories")
async def list_categories(active_only: bool = False):
    return {"items": repo.list_categories(active_only=active_only)}


@app.get("/api/v1/categories/{category_id}")
async def get_category(category_id: str):
    item = repo.get_category(category_id)
    if not item:
        raise HTTPException(status_code=404, detail="Category not found")
    return item


@app.post("/api/v1/categories", status_code=201)
async def create_category(payload: CategoryCreate):
    try:
        created = repo.create_category(payload)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    await ws_manager.broadcast("catalog", "category.published", created)
    return created


@app.patch("/api/v1/categories/{category_id}")
async def update_category(category_id: str, payload: CategoryUpdate):
    try:
        updated = repo.update_category(category_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    if not updated:
        raise HTTPException(status_code=404, detail="Category not found")
    await ws_manager.broadcast("catalog", "category.updated", updated)
    return updated


@app.delete("/api/v1/categories/{category_id}")
async def delete_category(category_id: str):
    try:
        deleted = repo.delete_category(category_id)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    if not deleted:
        raise HTTPException(status_code=404, detail="Category not found")
    await ws_manager.broadcast("catalog", "category.deleted", {"id": category_id})
    return {"deleted": True, "id": category_id}


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


@app.get("/api/v1/coupons")
async def list_coupons(active_only: bool = True):
    return {"items": repo.list_coupons(active_only=active_only)}


@app.get("/api/v1/notifications")
async def list_notifications():
    return {"items": repo.list_notifications()}


@app.patch("/api/v1/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str):
    updated = repo.mark_notification_read(notification_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Notification not found")
    return updated


@app.post("/api/v1/notifications/read-all")
async def mark_all_notifications_read():
    updated_count = repo.mark_all_notifications_read()
    return {"updated": updated_count}


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


@app.patch("/api/v1/orders/{order_id}/rating")
async def rate_order(order_id: str, body: OrderRatingUpdate):
    updated = repo.rate_order(order_id, body.rating)
    if not updated:
        raise HTTPException(status_code=404, detail="Order not found")
    return updated


@app.websocket("/ws/live/{room}")
async def websocket_endpoint(websocket: WebSocket, room: str):
    await ws_manager.connect(room, websocket)
    try:
        while True:
            _ = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(room, websocket)
