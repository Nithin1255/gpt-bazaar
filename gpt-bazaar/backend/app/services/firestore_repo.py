import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from app.schemas.models import (
    OrderCreate,
    OrderRecord,
    OrderStatus,
    OrderTimelineEvent,
    ProductCreate,
    ProductRecord,
    ProductUpdate,
)

DEFAULT_CATEGORIES: list[dict] = [
    {
        "id": "cat-fruits-veg",
        "name": "Fruits & Veg",
        "slug": "fruits-veg",
        "subtitle": "Farm-fresh daily produce",
        "artworkKey": "fruits_veg",
        "imageUrl": "",
        "bgTint": "#EEF9F0",
        "subcategories": ["Vegetables", "Fruits", "Leafy Greens"],
        "sortOrder": 1,
        "isActive": True,
        "schemaVersion": 1,
    },
    {
        "id": "cat-dairy-eggs",
        "name": "Dairy & Eggs",
        "slug": "dairy-eggs",
        "subtitle": "Fresh milk, curd, paneer & eggs",
        "artworkKey": "dairy_eggs",
        "imageUrl": "",
        "bgTint": "#EDF5FE",
        "subcategories": ["Milk", "Eggs", "Bread & Bakery"],
        "sortOrder": 2,
        "isActive": True,
        "schemaVersion": 1,
    },
    {
        "id": "cat-atta-rice",
        "name": "Atta & Rice",
        "slug": "atta-rice",
        "subtitle": "Sona Masoori, Basmati & whole wheat",
        "artworkKey": "atta_rice",
        "imageUrl": "",
        "bgTint": "#FEF8E8",
        "subcategories": ["Rice", "Atta & Flour", "Dals"],
        "sortOrder": 3,
        "isActive": True,
        "schemaVersion": 1,
    },
    {
        "id": "cat-oils-essentials",
        "name": "Oils & Spices",
        "slug": "oils-essentials",
        "subtitle": "Cold-pressed oils & kitchen staples",
        "artworkKey": "oils_essentials",
        "imageUrl": "",
        "bgTint": "#FDF0F3",
        "subcategories": ["Cooking Oil", "Spices", "Salt & Sugar"],
        "sortOrder": 4,
        "isActive": True,
        "schemaVersion": 1,
    },
]

DEFAULT_PRODUCTS: list[dict] = [
    {
        "id": "prod-fresh-tomato",
        "name": "Fresh Hybrid Tomato",
        "slug": "fresh-hybrid-tomato",
        "brand": "GPT Farm Direct",
        "tagline": "Handpicked daily from Chittoor farms",
        "categoryId": "cat-fruits-veg",
        "subcategory": "Vegetables",
        "description": "Juicy red farm-fresh tomatoes sorted and packed hygienically.",
        "keyFeatures": ["Harvested every morning", "Chemical-free wash"],
        "dietaryType": "veg",
        "artworkKey": "tomato",
        "imageUrl": "",
        "variants": [
            {
                "id": "v-500g",
                "label": "500 g",
                "unitValue": 500,
                "unit": "g",
                "price": 24,
                "mrp": 32,
                "discountPercent": 25,
                "stock": 80,
                "sku": "GBT-TOM-500",
            },
            {
                "id": "v-1kg",
                "label": "1 kg",
                "unitValue": 1,
                "unit": "kg",
                "price": 45,
                "mrp": 60,
                "discountPercent": 25,
                "stock": 50,
                "sku": "GBT-TOM-1K",
            },
        ],
        "defaultVariantId": "v-500g",
        "rating": 4.8,
        "reviewCount": 214,
        "deliveryEtaMins": 12,
        "isPopular": True,
        "isTrending": True,
        "isActive": True,
        "storeId": "store-chittoor-hub-1",
        "tags": ["tomato", "vegetables", "fresh"],
        "schemaVersion": 1,
    },
    {
        "id": "prod-farm-milk",
        "name": "Heritage Toned Fresh Milk",
        "slug": "heritage-toned-fresh-milk",
        "brand": "Heritage Dairy",
        "tagline": "Chilled cold-chain doorstep delivery",
        "categoryId": "cat-dairy-eggs",
        "subcategory": "Milk",
        "description": "Pasteurized toned milk delivered chilled within 10-15 minutes.",
        "keyFeatures": ["3% milk fat", "Cold-chain sealed pouch"],
        "dietaryType": "veg",
        "artworkKey": "milk",
        "imageUrl": "",
        "variants": [
            {
                "id": "v-500ml",
                "label": "500 ml",
                "unitValue": 500,
                "unit": "ml",
                "price": 29,
                "mrp": 30,
                "discountPercent": 3,
                "stock": 120,
                "sku": "GBT-MLK-500",
            },
            {
                "id": "v-1l",
                "label": "1 L",
                "unitValue": 1,
                "unit": "L",
                "price": 56,
                "mrp": 60,
                "discountPercent": 7,
                "stock": 90,
                "sku": "GBT-MLK-1L",
            },
        ],
        "defaultVariantId": "v-500ml",
        "rating": 4.9,
        "reviewCount": 412,
        "deliveryEtaMins": 10,
        "isPopular": True,
        "isTrending": False,
        "isActive": True,
        "storeId": "store-chittoor-hub-1",
        "tags": ["milk", "dairy", "breakfast"],
        "schemaVersion": 1,
    },
    {
        "id": "prod-sona-masoori-rice",
        "name": "Aged Sona Masoori Rice",
        "slug": "aged-sona-masoori-rice",
        "brand": "GPT Staples",
        "tagline": "12-month aged aromatic grains",
        "categoryId": "cat-atta-rice",
        "subcategory": "Rice",
        "description": "Lightweight, fluffy Sona Masoori rice ideal for everyday meals.",
        "keyFeatures": ["Sortex cleaned", "Zero polish"],
        "dietaryType": "veg",
        "artworkKey": "rice",
        "imageUrl": "",
        "variants": [
            {
                "id": "v-5kg",
                "label": "5 kg",
                "unitValue": 5,
                "unit": "kg",
                "price": 315,
                "mrp": 360,
                "discountPercent": 13,
                "stock": 40,
                "sku": "GBT-RIC-5K",
            }
        ],
        "defaultVariantId": "v-5kg",
        "rating": 4.7,
        "reviewCount": 165,
        "deliveryEtaMins": 14,
        "isPopular": True,
        "isTrending": False,
        "isActive": True,
        "storeId": "store-chittoor-hub-1",
        "tags": ["rice", "sona masoori", "staples"],
        "schemaVersion": 1,
    },
]


class CatalogRepository:
    """Durable SQLite-backed Phase 1 repository (zero cloud billing or IAM required)."""

    def __init__(self) -> None:
        db_path = Path(os.getenv("SQLITE_DB_PATH", "./data/gpt_bazaar.db"))
        db_path.parent.mkdir(parents=True, exist_ok=True)
        self._db_path = str(db_path)
        self._init_schema()
        self._seed_if_empty()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self._db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_schema(self) -> None:
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS categories (
                    id TEXT PRIMARY KEY,
                    sort_order INTEGER NOT NULL DEFAULT 0,
                    payload TEXT NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS products (
                    id TEXT PRIMARY KEY,
                    category_id TEXT NOT NULL,
                    is_active INTEGER NOT NULL DEFAULT 1,
                    created_at TEXT NOT NULL,
                    payload TEXT NOT NULL
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS orders (
                    id TEXT PRIMARY KEY,
                    created_at TEXT NOT NULL,
                    payload TEXT NOT NULL
                )
                """
            )

    def _seed_if_empty(self) -> None:
        now_iso = datetime.now(timezone.utc).isoformat()
        with self._connect() as conn:
            cat_count = conn.execute("SELECT COUNT(*) FROM categories").fetchone()[0]
            if cat_count == 0:
                for cat in DEFAULT_CATEGORIES:
                    doc = {**cat, "createdAt": now_iso, "updatedAt": now_iso}
                    conn.execute(
                        "INSERT INTO categories (id, sort_order, payload) VALUES (?, ?, ?)",
                        (doc["id"], doc["sortOrder"], json.dumps(doc)),
                    )

            prod_count = conn.execute("SELECT COUNT(*) FROM products").fetchone()[0]
            if prod_count == 0:
                for prod in DEFAULT_PRODUCTS:
                    doc = {**prod, "createdAt": now_iso, "updatedAt": now_iso}
                    conn.execute(
                        "INSERT INTO products (id, category_id, is_active, created_at, payload) VALUES (?, ?, ?, ?, ?)",
                        (
                            doc["id"],
                            doc["categoryId"],
                            1 if doc["isActive"] else 0,
                            now_iso,
                            json.dumps(doc),
                        ),
                    )

    def list_categories(self) -> list[dict]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT payload FROM categories ORDER BY sort_order ASC"
            ).fetchall()
        return [json.loads(r["payload"]) for r in rows]

    def list_products(
        self, category_id: Optional[str] = None, active_only: bool = False
    ) -> list[dict]:
        clauses: list[str] = []
        params: list[object] = []
        if category_id:
            clauses.append("category_id = ?")
            params.append(category_id)
        if active_only:
            clauses.append("is_active = 1")
        where_sql = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        with self._connect() as conn:
            rows = conn.execute(
                f"SELECT payload FROM products {where_sql} ORDER BY created_at DESC",
                params,
            ).fetchall()
        return [json.loads(r["payload"]) for r in rows]

    def get_product(self, product_id: str) -> Optional[dict]:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT payload FROM products WHERE id = ?", (product_id,)
            ).fetchone()
        return json.loads(row["payload"]) if row else None

    def create_product(self, payload: ProductCreate) -> dict:
        suffix = int(datetime.now(timezone.utc).timestamp() * 1000) % 100000
        prod_id = f"prod-{payload.slug}-{suffix}"
        record = ProductRecord(id=prod_id, **payload.model_dump())
        data = record.model_dump()
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO products (id, category_id, is_active, created_at, payload) VALUES (?, ?, ?, ?, ?)",
                (
                    prod_id,
                    data["categoryId"],
                    1 if data["isActive"] else 0,
                    data["createdAt"],
                    json.dumps(data),
                ),
            )
        return data

    def update_product(self, product_id: str, payload: ProductUpdate) -> Optional[dict]:
        existing = self.get_product(product_id)
        if not existing:
            return None
        patch = payload.model_dump(exclude_none=True)
        patch["updatedAt"] = datetime.now(timezone.utc).isoformat()
        merged = {**existing, **patch}
        with self._connect() as conn:
            conn.execute(
                "UPDATE products SET category_id = ?, is_active = ?, payload = ? WHERE id = ?",
                (
                    merged["categoryId"],
                    1 if merged.get("isActive", True) else 0,
                    json.dumps(merged),
                    product_id,
                ),
            )
        return merged

    def delete_product(self, product_id: str) -> bool:
        with self._connect() as conn:
            cur = conn.execute("DELETE FROM products WHERE id = ?", (product_id,))
            return cur.rowcount > 0

    def list_orders(self) -> list[dict]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT payload FROM orders ORDER BY created_at DESC"
            ).fetchall()
        return [json.loads(r["payload"]) for r in rows]

    def create_order(self, payload: OrderCreate) -> dict:
        ts = int(datetime.now(timezone.utc).timestamp())
        order_id = f"ord-gbt{ts}"
        order_num = f"#GBT{str(ts)[-8:]}"
        now_label = datetime.now(timezone.utc).strftime("%I:%M %p UTC")
        record = OrderRecord(
            id=order_id,
            orderNumber=order_num,
            paymentStatus="cod_due" if payload.paymentMethod == "cod" else "paid",
            status="placed",
            statusTimeline=[
                OrderTimelineEvent(
                    status="placed",
                    label="Order Placed",
                    note="Order received at dark store hub.",
                    timestamp=now_label,
                )
            ],
            **payload.model_dump(),
        )
        data = record.model_dump()
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO orders (id, created_at, payload) VALUES (?, ?, ?)",
                (order_id, data["createdAt"], json.dumps(data)),
            )
        return data

    def update_order_status(
        self, order_id: str, status: OrderStatus, note: Optional[str]
    ) -> Optional[dict]:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT payload FROM orders WHERE id = ?", (order_id,)
            ).fetchone()
            if not row:
                return None
            existing = json.loads(row["payload"])
            now_iso = datetime.now(timezone.utc).isoformat()
            event = {
                "status": status,
                "label": status.replace("_", " ").title(),
                "note": note or f"Order moved to {status}.",
                "timestamp": datetime.now(timezone.utc).strftime("%I:%M %p UTC"),
            }
            timeline = [
                e for e in existing.get("statusTimeline", []) if e.get("status") != status
            ]
            timeline.append(event)
            updated = {
                **existing,
                "status": status,
                "statusTimeline": timeline,
                "updatedAt": now_iso,
            }
            conn.execute(
                "UPDATE orders SET payload = ? WHERE id = ?",
                (json.dumps(updated), order_id),
            )
            return updated


repo = CatalogRepository()
