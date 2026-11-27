import json
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from app.schemas.models import (
    AppConfigRecord,
    AppConfigUpdate,
    CategoryCreate,
    CategoryRecord,
    CategoryUpdate,
    OrderCreate,
    OrderRecord,
    OrderStatus,
    OrderTimelineEvent,
    ProductCreate,
    ProductRecord,
    ProductUpdate,
)
from app.services.supabase_client import (
    get_db_connection,
    get_storage_bucket_name,
    get_supabase_client,
)

ALLOWED_IMAGE_MIME_TYPES = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
}
MIN_IMAGE_BYTES = 1024
MAX_IMAGE_BYTES = 5 * 1024 * 1024

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

DEFAULT_COUPONS: list[dict] = [
    {
        "id": "coupon-grocer10",
        "code": "GROCER10",
        "title": "Flat 10% OFF on Fresh Essentials",
        "description": "Valid on orders ₹149 and above (max discount ₹50).",
        "discountType": "percent",
        "discountValue": 10,
        "minOrderAmount": 149,
        "maxDiscount": 50,
        "isActive": True,
        "schemaVersion": 1,
    }
]


def _iso(val: Any) -> str:
    if isinstance(val, datetime):
        return val.astimezone(timezone.utc).isoformat()
    return str(val) if val is not None else datetime.now(timezone.utc).isoformat()


def _row_to_category(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row["id"],
        "name": row["name"],
        "slug": row["slug"],
        "subtitle": row.get("subtitle") or "",
        "artworkKey": row.get("artwork_key") or "fruits_veg",
        "imageUrl": row.get("image_url") or "",
        "bgTint": row.get("bg_tint") or "#EEF9F0",
        "subcategories": row.get("subcategories") or [],
        "sortOrder": int(row.get("sort_order") or 0),
        "isActive": bool(row.get("is_active", True)),
        "schemaVersion": int(row.get("schema_version") or 1),
        "createdAt": _iso(row.get("created_at")),
        "updatedAt": _iso(row.get("updated_at")),
    }


def _row_to_product(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row["id"],
        "name": row["name"],
        "slug": row["slug"],
        "brand": row.get("brand"),
        "tagline": row.get("tagline"),
        "categoryId": row["category_id"],
        "subcategory": row.get("subcategory"),
        "description": row.get("description"),
        "keyFeatures": row.get("key_features") or [],
        "dietaryType": row.get("dietary_type") or "veg",
        "artworkKey": row.get("artwork_key") or "fruits_veg",
        "imageUrl": row.get("image_url") or "",
        "variants": row.get("variants") or [],
        "defaultVariantId": row["default_variant_id"],
        "rating": float(row.get("rating") or 4.6),
        "reviewCount": int(row.get("review_count") or 0),
        "deliveryEtaMins": int(row.get("delivery_eta_mins") or 12),
        "isPopular": bool(row.get("is_popular", False)),
        "isTrending": bool(row.get("is_trending", False)),
        "isActive": bool(row.get("is_active", True)),
        "storeId": row.get("store_id") or "store-chittoor-hub-1",
        "tags": row.get("tags") or [],
        "schemaVersion": int(row.get("schema_version") or 1),
        "createdAt": _iso(row.get("created_at")),
        "updatedAt": _iso(row.get("updated_at")),
    }


def _row_to_order(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row["id"],
        "orderNumber": row["order_number"],
        "storeId": row.get("store_id") or "store-chittoor-hub-1",
        "customerName": row["customer_name"],
        "customerPhone": row.get("customer_phone"),
        "deliveryAddress": row.get("delivery_address") or {},
        "items": row.get("items") or [],
        "pricing": row.get("pricing") or {},
        "paymentMethod": row.get("payment_method") or "upi",
        "paymentStatus": row.get("payment_status") or "paid",
        "status": row.get("status") or "placed",
        "statusTimeline": row.get("status_timeline") or [],
        "deliveryPartner": row.get("delivery_partner"),
        "etaText": row.get("eta_text") or "10–15 mins",
        "rating": row.get("rating"),
        "schemaVersion": int(row.get("schema_version") or 1),
        "createdAt": _iso(row.get("created_at")),
        "updatedAt": _iso(row.get("updated_at")),
    }


def _row_to_coupon(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row["id"],
        "code": row["code"],
        "title": row["title"],
        "description": row.get("description") or "",
        "discountType": row.get("discount_type") or "percent",
        "discountValue": float(row.get("discount_value") or 0),
        "minOrderAmount": float(row.get("min_order_amount") or 0),
        "maxDiscount": float(row["max_discount"]) if row.get("max_discount") is not None else None,
        "isActive": bool(row.get("is_active", True)),
        "schemaVersion": int(row.get("schema_version") or 1),
        "createdAt": _iso(row.get("created_at")),
    }


def _row_to_notification(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row["id"],
        "category": row.get("category") or "orders",
        "title": row["title"],
        "message": row["message"],
        "orderId": row.get("order_id"),
        "artworkKey": row.get("artwork_key") or "box",
        "isRead": bool(row.get("is_read", False)),
        "schemaVersion": int(row.get("schema_version") or 1),
        "createdAt": _iso(row.get("created_at")),
    }


def _row_to_app_config(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row["id"],
        "storeName": row["store_name"],
        "hubCity": row["hub_city"],
        "pincode": row["pincode"],
        "deliveryEtaText": row["delivery_eta_text"],
        "isStoreOpen": bool(row.get("is_store_open", True)),
        "heroBadge": row.get("hero_badge") or "",
        "heroTitle": row.get("hero_title") or "",
        "heroSubtitle": row.get("hero_subtitle") or "",
        "dealBannerTitle": row.get("deal_banner_title") or "",
        "dealBannerSubtitle": row.get("deal_banner_subtitle") or "",
        "freeDeliveryThreshold": float(row.get("free_delivery_threshold") or 149),
        "deliveryFee": float(row.get("delivery_fee") or 25),
        "packagingFee": float(row.get("packaging_fee") or 5),
        "schemaVersion": int(row.get("schema_version") or 1),
        "updatedAt": _iso(row.get("updated_at")),
    }


class SupabaseCatalogRepository:
    """PostgreSQL + Supabase Storage repository backing Admin Web and Expo Mobile."""

    def ensure_seed_data(self) -> None:
        """Seed initial categories, products, coupons, and mobile app config if empty."""
        with get_db_connection() as conn:
            with conn.transaction():
                with conn.cursor() as cur:
                    cur.execute("SELECT COUNT(*) AS cnt FROM categories")
                    if cur.fetchone()["cnt"] == 0:
                        for cat in DEFAULT_CATEGORIES:
                            cur.execute(
                                """
                                INSERT INTO categories
                                  (id, name, slug, subtitle, artwork_key, image_url, bg_tint, subcategories, sort_order, is_active, schema_version)
                                VALUES
                                  (%s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s, %s)
                                """,
                                (
                                    cat["id"],
                                    cat["name"],
                                    cat["slug"],
                                    cat["subtitle"],
                                    cat["artworkKey"],
                                    cat["imageUrl"],
                                    cat["bgTint"],
                                    json.dumps(cat["subcategories"]),
                                    cat["sortOrder"],
                                    cat["isActive"],
                                    cat["schemaVersion"],
                                ),
                            )

                    cur.execute("SELECT COUNT(*) AS cnt FROM products")
                    if cur.fetchone()["cnt"] == 0:
                        for prod in DEFAULT_PRODUCTS:
                            cur.execute(
                                """
                                INSERT INTO products
                                  (id, name, slug, brand, tagline, category_id, subcategory, description,
                                   key_features, dietary_type, artwork_key, image_url, variants, default_variant_id,
                                   rating, review_count, delivery_eta_mins, is_popular, is_trending, is_active,
                                   store_id, tags, schema_version)
                                VALUES
                                  (%s, %s, %s, %s, %s, %s, %s, %s,
                                   %s::jsonb, %s, %s, %s, %s::jsonb, %s,
                                   %s, %s, %s, %s, %s, %s,
                                   %s, %s::jsonb, %s)
                                """,
                                (
                                    prod["id"],
                                    prod["name"],
                                    prod["slug"],
                                    prod["brand"],
                                    prod["tagline"],
                                    prod["categoryId"],
                                    prod["subcategory"],
                                    prod["description"],
                                    json.dumps(prod["keyFeatures"]),
                                    prod["dietaryType"],
                                    prod["artworkKey"],
                                    prod["imageUrl"],
                                    json.dumps(prod["variants"]),
                                    prod["defaultVariantId"],
                                    prod["rating"],
                                    prod["reviewCount"],
                                    prod["deliveryEtaMins"],
                                    prod["isPopular"],
                                    prod["isTrending"],
                                    prod["isActive"],
                                    prod["storeId"],
                                    json.dumps(prod["tags"]),
                                    prod["schemaVersion"],
                                ),
                            )

                    cur.execute("SELECT COUNT(*) AS cnt FROM coupons")
                    if cur.fetchone()["cnt"] == 0:
                        for cpn in DEFAULT_COUPONS:
                            cur.execute(
                                """
                                INSERT INTO coupons
                                  (id, code, title, description, discount_type, discount_value, min_order_amount, max_discount, is_active, schema_version)
                                VALUES
                                  (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                                """,
                                (
                                    cpn["id"],
                                    cpn["code"],
                                    cpn["title"],
                                    cpn["description"],
                                    cpn["discountType"],
                                    cpn["discountValue"],
                                    cpn["minOrderAmount"],
                                    cpn["maxDiscount"],
                                    cpn["isActive"],
                                    cpn["schemaVersion"],
                                ),
                            )

                    cur.execute("SELECT id FROM app_config WHERE id = 'mobile'")
                    if cur.fetchone() is None:
                        cfg = AppConfigRecord().model_dump()
                        cur.execute(
                            """
                            INSERT INTO app_config
                              (id, store_name, hub_city, pincode, delivery_eta_text, is_store_open,
                               hero_badge, hero_title, hero_subtitle, deal_banner_title, deal_banner_subtitle,
                               free_delivery_threshold, delivery_fee, packaging_fee, schema_version)
                            VALUES
                              ('mobile', %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            """,
                            (
                                cfg["storeName"],
                                cfg["hubCity"],
                                cfg["pincode"],
                                cfg["deliveryEtaText"],
                                cfg["isStoreOpen"],
                                cfg["heroBadge"],
                                cfg["heroTitle"],
                                cfg["heroSubtitle"],
                                cfg["dealBannerTitle"],
                                cfg["dealBannerSubtitle"],
                                cfg["freeDeliveryThreshold"],
                                cfg["deliveryFee"],
                                cfg["packagingFee"],
                                cfg["schemaVersion"],
                            ),
                        )

    # ==================== CATEGORIES ====================

    def list_categories(self, active_only: bool = False) -> list[dict]:
        sql = "SELECT * FROM categories"
        if active_only:
            sql += " WHERE is_active = TRUE"
        sql += " ORDER BY sort_order ASC, name ASC"
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(sql)
                return [_row_to_category(r) for r in cur.fetchall()]

    def get_category(self, category_id: str) -> Optional[dict]:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM categories WHERE id = %s", (category_id,))
                row = cur.fetchone()
                return _row_to_category(row) if row else None

    def create_category(self, payload: CategoryCreate) -> dict:
        clean_name = payload.name.strip()
        clean_slug = payload.slug.strip().lower()
        cat_id = f"cat-{clean_slug}"
        record = CategoryRecord(
            id=cat_id,
            **{**payload.model_dump(), "name": clean_name, "slug": clean_slug},
        )
        with get_db_connection() as conn:
            with conn.transaction():
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT id, name, slug FROM categories
                        WHERE id = %s OR LOWER(name) = LOWER(%s) OR LOWER(slug) = LOWER(%s)
                        """,
                        (cat_id, clean_name, clean_slug),
                    )
                    existing = cur.fetchone()
                    if existing:
                        raise ValueError(
                            f"Category '{existing['name']}' already exists. Duplicate categories are not allowed."
                        )
                    cur.execute(
                        """
                        INSERT INTO categories
                          (id, name, slug, subtitle, artwork_key, image_url, bg_tint, subcategories, sort_order, is_active, schema_version)
                        VALUES
                          (%s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s, %s, %s)
                        RETURNING *
                        """,
                        (
                            record.id,
                            record.name,
                            record.slug,
                            record.subtitle or "",
                            record.artworkKey or "fruits_veg",
                            record.imageUrl or "",
                            record.bgTint,
                            json.dumps(record.subcategories),
                            record.sortOrder,
                            record.isActive,
                            record.schemaVersion,
                        ),
                    )
                    return _row_to_category(cur.fetchone())

    def update_category(self, category_id: str, payload: CategoryUpdate) -> Optional[dict]:
        patch = payload.model_dump(exclude_none=True)
        if "name" in patch:
            patch["name"] = patch["name"].strip()
        if "slug" in patch:
            patch["slug"] = patch["slug"].strip().lower()

        col_map = {
            "name": ("name", False),
            "slug": ("slug", False),
            "subtitle": ("subtitle", False),
            "artworkKey": ("artwork_key", False),
            "imageUrl": ("image_url", False),
            "bgTint": ("bg_tint", False),
            "subcategories": ("subcategories", True),
            "sortOrder": ("sort_order", False),
            "isActive": ("is_active", False),
        }
        sets = ["updated_at = NOW()"]
        params: list[Any] = []
        for key, val in patch.items():
            col, is_json = col_map[key]
            sets.append(f"{col} = %s::jsonb" if is_json else f"{col} = %s")
            params.append(json.dumps(val) if is_json else val)
        params.append(category_id)
        with get_db_connection() as conn:
            with conn.transaction():
                with conn.cursor() as cur:
                    cur.execute("SELECT * FROM categories WHERE id = %s FOR UPDATE", (category_id,))
                    current = cur.fetchone()
                    if not current:
                        return None

                    if "name" in patch or "slug" in patch:
                        check_name = patch.get("name", current["name"])
                        check_slug = patch.get("slug", current["slug"])
                        cur.execute(
                            """
                            SELECT name FROM categories
                            WHERE id <> %s AND (LOWER(name) = LOWER(%s) OR LOWER(slug) = LOWER(%s))
                            """,
                            (category_id, check_name, check_slug),
                        )
                        dup = cur.fetchone()
                        if dup:
                            raise ValueError(
                                f"Another category named '{dup['name']}' already exists."
                            )

                    cur.execute(
                        f"UPDATE categories SET {', '.join(sets)} WHERE id = %s RETURNING *",
                        params,
                    )
                    row = cur.fetchone()
                    return _row_to_category(row) if row else None

    def delete_category(self, category_id: str) -> bool:
        with get_db_connection() as conn:
            with conn.transaction():
                with conn.cursor() as cur:
                    cur.execute(
                        "SELECT COUNT(*) AS cnt FROM products WHERE category_id = %s",
                        (category_id,),
                    )
                    product_count = int(cur.fetchone()["cnt"])
                    if product_count > 0:
                        raise ValueError(
                            f"Cannot delete category: {product_count} product(s) still belong to it. Reassign or delete those products first."
                        )
                    cur.execute("DELETE FROM categories WHERE id = %s", (category_id,))
                    return cur.rowcount > 0

    # ==================== PRODUCTS ====================

    def list_products(
        self, category_id: Optional[str] = None, active_only: bool = False
    ) -> list[dict]:
        clauses: list[str] = []
        params: list[Any] = []
        if category_id:
            clauses.append("category_id = %s")
            params.append(category_id)
        if active_only:
            clauses.append("is_active = TRUE")
        where_sql = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"SELECT * FROM products {where_sql} ORDER BY created_at DESC",
                    params,
                )
                return [_row_to_product(r) for r in cur.fetchall()]

    def get_product(self, product_id: str) -> Optional[dict]:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM products WHERE id = %s", (product_id,))
                row = cur.fetchone()
                return _row_to_product(row) if row else None

    def create_product(self, payload: ProductCreate) -> dict:
        suffix = uuid.uuid4().hex[:6]
        prod_id = f"prod-{payload.slug[:48]}-{suffix}"
        slug = payload.slug
        with get_db_connection() as conn:
            with conn.transaction():
                with conn.cursor() as cur:
                    cur.execute("SELECT 1 FROM products WHERE slug = %s", (slug,))
                    if cur.fetchone():
                        slug = f"{payload.slug[:120]}-{suffix}"
                    record = ProductRecord(id=prod_id, **{**payload.model_dump(), "slug": slug})
                    cur.execute(
                        """
                        INSERT INTO products
                          (id, name, slug, brand, tagline, category_id, subcategory, description,
                           key_features, dietary_type, artwork_key, image_url, variants, default_variant_id,
                           rating, review_count, delivery_eta_mins, is_popular, is_trending, is_active,
                           store_id, tags, schema_version)
                        VALUES
                          (%s, %s, %s, %s, %s, %s, %s, %s,
                           %s::jsonb, %s, %s, %s, %s::jsonb, %s,
                           %s, %s, %s, %s, %s, %s,
                           %s, %s::jsonb, %s)
                        RETURNING *
                        """,
                        (
                            record.id,
                            record.name,
                            record.slug,
                            record.brand,
                            record.tagline,
                            record.categoryId,
                            record.subcategory,
                            record.description,
                            json.dumps(record.keyFeatures),
                            record.dietaryType,
                            record.artworkKey or "fruits_veg",
                            record.imageUrl or "",
                            json.dumps([v.model_dump() for v in record.variants]),
                            record.defaultVariantId,
                            record.rating,
                            record.reviewCount,
                            record.deliveryEtaMins,
                            record.isPopular,
                            record.isTrending,
                            record.isActive,
                            record.storeId,
                            json.dumps(record.tags),
                            record.schemaVersion,
                        ),
                    )
                    return _row_to_product(cur.fetchone())

    def update_product(self, product_id: str, payload: ProductUpdate) -> Optional[dict]:
        patch = payload.model_dump(exclude_none=True)
        col_map = {
            "name": ("name", False),
            "slug": ("slug", False),
            "brand": ("brand", False),
            "tagline": ("tagline", False),
            "categoryId": ("category_id", False),
            "subcategory": ("subcategory", False),
            "description": ("description", False),
            "keyFeatures": ("key_features", True),
            "dietaryType": ("dietary_type", False),
            "artworkKey": ("artwork_key", False),
            "imageUrl": ("image_url", False),
            "variants": ("variants", True),
            "defaultVariantId": ("default_variant_id", False),
            "deliveryEtaMins": ("delivery_eta_mins", False),
            "isPopular": ("is_popular", False),
            "isTrending": ("is_trending", False),
            "isActive": ("is_active", False),
            "tags": ("tags", True),
        }
        sets = ["updated_at = NOW()"]
        params: list[Any] = []
        for key, val in patch.items():
            col, is_json = col_map[key]
            sets.append(f"{col} = %s::jsonb" if is_json else f"{col} = %s")
            params.append(json.dumps(val) if is_json else val)
        params.append(product_id)
        with get_db_connection() as conn:
            with conn.transaction():
                with conn.cursor() as cur:
                    cur.execute(
                        f"UPDATE products SET {', '.join(sets)} WHERE id = %s RETURNING *",
                        params,
                    )
                    row = cur.fetchone()
                    return _row_to_product(row) if row else None

    def delete_product(self, product_id: str) -> bool:
        with get_db_connection() as conn:
            with conn.transaction():
                with conn.cursor() as cur:
                    cur.execute("DELETE FROM products WHERE id = %s", (product_id,))
                    return cur.rowcount > 0

    # ==================== IMAGE UPLOAD (SUPABASE STORAGE) ====================

    def upload_image(
        self,
        content: bytes,
        content_type: str,
        folder: str = "products",
        slug_hint: str = "item",
    ) -> dict:
        if content_type not in ALLOWED_IMAGE_MIME_TYPES:
            raise ValueError(
                "Unsupported image type. Allowed: image/jpeg, image/png, image/webp, image/avif."
            )
        if len(content) < MIN_IMAGE_BYTES or len(content) > MAX_IMAGE_BYTES:
            raise ValueError("Image size must be between 1 KB and 5 MB.")

        safe_folder = "categories" if folder == "categories" else "products"
        safe_slug = re.sub(r"[^a-z0-9-]+", "-", slug_hint.lower()).strip("-")[:48] or "sku"
        ext = ALLOWED_IMAGE_MIME_TYPES[content_type]
        ts = int(datetime.now(timezone.utc).timestamp() * 1000)
        blob_path = f"{safe_folder}/{safe_slug}-{ts}-{uuid.uuid4().hex[:6]}.{ext}"

        bucket_name = get_storage_bucket_name()
        client = get_supabase_client()
        storage_bucket = client.storage.from_(bucket_name)
        storage_bucket.upload(
            path=blob_path,
            file=content,
            file_options={
                "content-type": content_type,
                "cache-control": "31536000",
                "upsert": "false",
            },
        )
        public_url = storage_bucket.get_public_url(blob_path)
        return {
            "imageUrl": public_url,
            "path": blob_path,
            "contentType": content_type,
            "sizeBytes": len(content),
        }

    # ==================== APP CONFIG (MOBILE SETTINGS MANAGED BY ADMIN) ====================

    def get_app_config(self) -> dict:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM app_config WHERE id = 'mobile'")
                row = cur.fetchone()
                if row:
                    return _row_to_app_config(row)
        self.ensure_seed_data()
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM app_config WHERE id = 'mobile'")
                return _row_to_app_config(cur.fetchone())

    def update_app_config(self, payload: AppConfigUpdate) -> dict:
        patch = payload.model_dump(exclude_none=True)
        col_map = {
            "storeName": "store_name",
            "hubCity": "hub_city",
            "pincode": "pincode",
            "deliveryEtaText": "delivery_eta_text",
            "isStoreOpen": "is_store_open",
            "heroBadge": "hero_badge",
            "heroTitle": "hero_title",
            "heroSubtitle": "hero_subtitle",
            "dealBannerTitle": "deal_banner_title",
            "dealBannerSubtitle": "deal_banner_subtitle",
            "freeDeliveryThreshold": "free_delivery_threshold",
            "deliveryFee": "delivery_fee",
            "packagingFee": "packaging_fee",
        }
        sets = ["updated_at = NOW()"]
        params: list[Any] = []
        for key, val in patch.items():
            sets.append(f"{col_map[key]} = %s")
            params.append(val)
        with get_db_connection() as conn:
            with conn.transaction():
                with conn.cursor() as cur:
                    cur.execute(
                        f"UPDATE app_config SET {', '.join(sets)} WHERE id = 'mobile' RETURNING *",
                        params,
                    )
                    row = cur.fetchone()
                    if row:
                        return _row_to_app_config(row)
        return self.get_app_config()

    # ==================== COUPONS & NOTIFICATIONS ====================

    def list_coupons(self, active_only: bool = True) -> list[dict]:
        sql = "SELECT * FROM coupons"
        if active_only:
            sql += " WHERE is_active = TRUE"
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(sql)
                return [_row_to_coupon(r) for r in cur.fetchall()]

    def list_notifications(self) -> list[dict]:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM notifications ORDER BY created_at DESC")
                return [_row_to_notification(r) for r in cur.fetchall()]

    def mark_notification_read(self, notification_id: str) -> Optional[dict]:
        with get_db_connection() as conn:
            with conn.transaction():
                with conn.cursor() as cur:
                    cur.execute(
                        "UPDATE notifications SET is_read = TRUE WHERE id = %s RETURNING *",
                        (notification_id,),
                    )
                    row = cur.fetchone()
                    return _row_to_notification(row) if row else None

    def mark_all_notifications_read(self) -> int:
        with get_db_connection() as conn:
            with conn.transaction():
                with conn.cursor() as cur:
                    cur.execute("UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE")
                    return cur.rowcount

    # ==================== ORDERS ====================

    def list_orders(self) -> list[dict]:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM orders ORDER BY created_at DESC")
                return [_row_to_order(r) for r in cur.fetchall()]

    def create_order(self, payload: OrderCreate) -> dict:
        ts = int(datetime.now(timezone.utc).timestamp() * 1000)
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

        with get_db_connection() as conn:
            with conn.transaction():
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        INSERT INTO orders
                          (id, order_number, store_id, customer_name, customer_phone,
                           delivery_address, items, pricing, payment_method, payment_status,
                           status, status_timeline, eta_text, schema_version)
                        VALUES
                          (%s, %s, %s, %s, %s,
                           %s::jsonb, %s::jsonb, %s::jsonb, %s, %s,
                           %s, %s::jsonb, %s, %s)
                        RETURNING *
                        """,
                        (
                            record.id,
                            record.orderNumber,
                            record.storeId,
                            record.customerName,
                            record.customerPhone,
                            json.dumps(record.deliveryAddress),
                            json.dumps([it.model_dump() for it in record.items]),
                            json.dumps(record.pricing.model_dump()),
                            record.paymentMethod,
                            record.paymentStatus,
                            record.status,
                            json.dumps([ev.model_dump() for ev in record.statusTimeline]),
                            record.etaText,
                            record.schemaVersion,
                        ),
                    )
                    created_row = cur.fetchone()

                    # Atomically lock product rows & decrement variant stock
                    for item in payload.items:
                        cur.execute(
                            "SELECT variants FROM products WHERE id = %s FOR UPDATE",
                            (item.productId,),
                        )
                        prod_row = cur.fetchone()
                        if prod_row:
                            variants = prod_row.get("variants") or []
                            updated_variants = [
                                {**v, "stock": max(0, int(v.get("stock", 0)) - item.qty)}
                                if v.get("id") == item.variantId
                                else v
                                for v in variants
                            ]
                            cur.execute(
                                "UPDATE products SET variants = %s::jsonb, updated_at = NOW() WHERE id = %s",
                                (json.dumps(updated_variants), item.productId),
                            )

                    notif_id = f"notif-{ts}"
                    cur.execute(
                        """
                        INSERT INTO notifications
                          (id, category, title, message, order_id, artwork_key, is_read, schema_version)
                        VALUES
                          (%s, 'orders', %s, %s, %s, 'box', FALSE, 1)
                        """,
                        (
                            notif_id,
                            f"Order {order_num} Confirmed!",
                            f"{len(payload.items)} item(s) (₹{payload.pricing.grandTotal}) placed. Arriving in 10–15 mins.",
                            order_id,
                        ),
                    )
                    return _row_to_order(created_row)

    def update_order_status(
        self, order_id: str, status: OrderStatus, note: Optional[str]
    ) -> Optional[dict]:
        with get_db_connection() as conn:
            with conn.transaction():
                with conn.cursor() as cur:
                    cur.execute("SELECT * FROM orders WHERE id = %s FOR UPDATE", (order_id,))
                    existing = cur.fetchone()
                    if not existing:
                        return None
                    event = {
                        "status": status,
                        "label": status.replace("_", " ").title(),
                        "note": note or f"Order moved to {status.replace('_', ' ')}.",
                        "timestamp": datetime.now(timezone.utc).strftime("%I:%M %p UTC"),
                    }
                    timeline = [
                        e
                        for e in (existing.get("status_timeline") or [])
                        if e.get("status") != status
                    ]
                    timeline.append(event)
                    cur.execute(
                        """
                        UPDATE orders
                        SET status = %s, status_timeline = %s::jsonb, updated_at = NOW()
                        WHERE id = %s
                        RETURNING *
                        """,
                        (status, json.dumps(timeline), order_id),
                    )
                    return _row_to_order(cur.fetchone())

    def rate_order(self, order_id: str, rating: int) -> Optional[dict]:
        with get_db_connection() as conn:
            with conn.transaction():
                with conn.cursor() as cur:
                    cur.execute(
                        "UPDATE orders SET rating = %s, updated_at = NOW() WHERE id = %s RETURNING *",
                        (rating, order_id),
                    )
                    row = cur.fetchone()
                    return _row_to_order(row) if row else None


repo = SupabaseCatalogRepository()
