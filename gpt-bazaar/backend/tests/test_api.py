import os
import ssl
import unittest
from contextlib import nullcontext
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi import HTTPException

from app.main import (
    app,
    create_category,
    create_product,
    delete_category,
    get_mobile_storefront,
    health,
    update_app_config,
    update_category,
    upload_image,
)
from app.schemas.models import (
    AppConfigUpdate,
    CategoryCreate,
    CategoryUpdate,
    ProductCreate,
    ProductVariant,
)
from app.services.migrator import run_migrations
from app.services.supabase_client import (
    SupabaseConfigurationError,
    _build_pg8000_ssl_context,
    _Pg8000Connection,
    init_supabase,
    normalize_database_url,
)
from app.services.supabase_repo import SupabaseCatalogRepository


def run_sync_coro(coro):
    """Drive a coroutine that yields no pending Futures to completion."""
    try:
        coro.send(None)
    except StopIteration as stop:
        return stop.value
    raise RuntimeError("Coroutine yielded unexpectedly")


class BackendApiTests(unittest.TestCase):
    def test_init_supabase_fails_fast_without_credentials(self):
        env_patch = {
            "DATABASE_URL": "",
            "SUPABASE_URL": "",
            "SUPABASE_SERVICE_ROLE_KEY": "",
        }
        with patch.dict(os.environ, env_patch, clear=False):
            with self.assertRaises(SupabaseConfigurationError):
                init_supabase()

    def test_normalize_database_url_appends_ssl_for_remote_postgres(self):
        url = normalize_database_url("postgres://user:pass@aws-0-ap-south-1.pooler.supabase.com:5432/postgres")
        self.assertTrue(url.startswith("postgresql://"))
        self.assertIn("sslmode=require", url)

        local = normalize_database_url("postgresql://postgres:postgres@localhost:5432/gpt_bazaar")
        self.assertNotIn("sslmode=require", local)

        require_ctx = _build_pg8000_ssl_context(url, "aws-0-ap-south-1.pooler.supabase.com")
        self.assertEqual(require_ctx.verify_mode, ssl.CERT_NONE)
        verify_ctx = _build_pg8000_ssl_context(
            "postgresql://u:p@aws-0.pooler.supabase.com:5432/postgres?sslmode=verify-full",
            "aws-0.pooler.supabase.com",
        )
        self.assertEqual(verify_ctx.verify_mode, ssl.CERT_REQUIRED)
        self.assertTrue(verify_ctx.check_hostname)
        self.assertIsNone(_build_pg8000_ssl_context(local, "localhost"))

    def test_run_migrations_applies_pending_sql_idempotently(self):
        fake_cursor = MagicMock()
        fake_cursor.fetchall.return_value = []
        fake_conn = MagicMock()
        fake_conn.cursor.return_value.__enter__.return_value = fake_cursor
        fake_conn.transaction.return_value = nullcontext()

        applied = run_migrations(conn_override=fake_conn)
        self.assertIn("001_initial_schema.sql", applied)

        # Second run with 001_initial_schema.sql already recorded applies nothing
        fake_cursor.fetchall.return_value = [{"version": "001_initial_schema.sql"}]
        applied_second = run_migrations(conn_override=fake_conn)
        self.assertEqual(applied_second, [])

    def test_pg8000_adapter_returns_dict_rows_and_commits_transactions(self):
        raw_cursor = MagicMock()
        raw_cursor.description = [("id",), ("name",)]
        raw_cursor.fetchone.return_value = ("cat-1", "Fruits")
        raw_cursor.fetchall.return_value = [("cat-1", "Fruits")]
        raw_conn = MagicMock()
        raw_conn.cursor.return_value = raw_cursor

        with _Pg8000Connection(raw_conn) as conn:
            with conn.transaction():
                with conn.cursor() as cur:
                    cur.execute("SELECT id, name FROM categories WHERE id = %s", ("cat-1",))
                    self.assertEqual(cur.fetchone(), {"id": "cat-1", "name": "Fruits"})
                    self.assertEqual(cur.fetchall(), [{"id": "cat-1", "name": "Fruits"}])
        raw_conn.commit.assert_called_once()
        raw_conn.close.assert_called_once()

    def test_app_routes_registered(self):
        paths = {getattr(r, "path", "") for r in app.routes}
        self.assertIn("/health", paths)
        self.assertIn("/api/v1/storefront", paths)
        self.assertIn("/api/v1/uploads/image", paths)
        self.assertIn("/api/v1/products", paths)
        self.assertIn("/api/v1/categories", paths)
        self.assertIn("/api/v1/app-config", paths)
        self.assertIn("/api/v1/orders", paths)

    def test_storefront_create_product_config_and_upload_handlers(self):
        sample_products = [{"id": "prod-tomato", "name": "Fresh Tomato", "isActive": True}]
        sample_config = {"id": "mobile", "storeName": "GPT Bazaar Hub", "isStoreOpen": True}

        with (
            patch("app.main.init_supabase", return_value={"storage_bucket": "catalog-images"}),
            patch("app.main.repo.list_categories", return_value=[]),
            patch("app.main.repo.list_products", return_value=sample_products),
            patch("app.main.repo.list_coupons", return_value=[]),
            patch("app.main.repo.get_app_config", return_value=sample_config),
            patch("app.main.repo.create_product", return_value={"id": "prod-spinach", "name": "Spinach"}),
            patch("app.main.repo.update_app_config", return_value={**sample_config, "heroTitle": "Fresh Deals"}),
            patch(
                "app.main.repo.upload_image",
                return_value={
                    "imageUrl": "https://demo.supabase.co/storage/v1/object/public/catalog-images/products/img.jpg",
                    "path": "products/img.jpg",
                    "contentType": "image/jpeg",
                    "sizeBytes": 2048,
                },
            ),
        ):
            health_res = run_sync_coro(health())
            self.assertEqual(health_res["database"], "supabase-postgres")

            storefront_res = run_sync_coro(get_mobile_storefront())
            self.assertEqual(len(storefront_res["products"]), 1)
            self.assertEqual(storefront_res["appConfig"]["storeName"], "GPT Bazaar Hub")

            created = run_sync_coro(
                create_product(
                    ProductCreate(
                        name="Spinach",
                        slug="spinach",
                        categoryId="cat-fruits-veg",
                        variants=[
                            ProductVariant(
                                id="v-1",
                                label="250 g",
                                unitValue=250,
                                unit="g",
                                price=20,
                                mrp=25,
                                discountPercent=20,
                                stock=15,
                                sku="GBT-SPN-250",
                            )
                        ],
                        defaultVariantId="v-1",
                    )
                )
            )
            self.assertEqual(created["id"], "prod-spinach")

            cfg_res = run_sync_coro(update_app_config(AppConfigUpdate(heroTitle="Fresh Deals")))
            self.assertEqual(cfg_res["heroTitle"], "Fresh Deals")

            upload_file = MagicMock()
            upload_file.content_type = "image/jpeg"
            upload_file.read = AsyncMock(return_value=b"x" * 2048)
            upload_res = run_sync_coro(upload_image(file=upload_file, folder="products", slug="tomato"))
            self.assertIn("/storage/v1/object/public/catalog-images/", upload_res["imageUrl"])

    def test_repo_upload_image_validates_and_builds_supabase_url(self):
        repo_instance = SupabaseCatalogRepository()
        fake_storage_bucket = MagicMock()
        fake_storage_bucket.get_public_url.return_value = (
            "https://demo.supabase.co/storage/v1/object/public/catalog-images/products/fresh-mango.png"
        )
        fake_client = MagicMock()
        fake_client.storage.from_.return_value = fake_storage_bucket

        with (
            patch("app.services.supabase_repo.get_storage_bucket_name", return_value="catalog-images"),
            patch("app.services.supabase_repo.get_supabase_client", return_value=fake_client),
        ):
            res = repo_instance.upload_image(
                content=b"x" * 2048,
                content_type="image/png",
                folder="products",
                slug_hint="Fresh Mango",
            )
            self.assertTrue(res["path"].startswith("products/fresh-mango-"))
            self.assertIn("catalog-images", res["imageUrl"])
            fake_storage_bucket.upload.assert_called_once()

            with self.assertRaises(ValueError):
                repo_instance.upload_image(content=b"tiny", content_type="image/png")

            with self.assertRaises(ValueError):
                repo_instance.upload_image(content=b"x" * 2048, content_type="application/pdf")

        bad_file = MagicMock()
        bad_file.content_type = "text/plain"
        bad_file.read = AsyncMock(return_value=b"x" * 2048)
        with self.assertRaises(HTTPException) as ctx:
            run_sync_coro(upload_image(file=bad_file, folder="products", slug="bad"))
        self.assertEqual(ctx.exception.status_code, 400)

    def test_category_crud_blocks_duplicates_and_nonempty_deletes(self):
        repo_instance = SupabaseCatalogRepository()
        fake_cursor = MagicMock()
        fake_conn = MagicMock()
        fake_conn.cursor.return_value.__enter__.return_value = fake_cursor
        fake_conn.transaction.return_value = nullcontext()
        fake_conn.__enter__.return_value = fake_conn

        # Duplicate category creation raises ValueError in repo & 409 in route
        fake_cursor.fetchone.return_value = {
            "id": "cat-fruits-veg",
            "name": "Fruits & Veg",
            "slug": "fruits-veg",
        }
        with patch("app.services.supabase_repo.get_db_connection", return_value=fake_conn):
            with self.assertRaises(ValueError):
                repo_instance.create_category(CategoryCreate(name="Fruits & Veg", slug="fruits-veg"))

        # Duplicate rename on update raises ValueError
        fake_cursor.fetchone.side_effect = [
            {"id": "cat-dairy", "name": "Dairy", "slug": "dairy"},
            {"name": "Fruits & Veg"},
        ]
        with patch("app.services.supabase_repo.get_db_connection", return_value=fake_conn):
            with self.assertRaises(ValueError):
                repo_instance.update_category("cat-dairy", CategoryUpdate(name="Fruits & Veg", slug="fruits-veg"))

        # Deleting category with assigned products raises ValueError
        fake_cursor.fetchone.side_effect = None
        fake_cursor.fetchone.return_value = {"cnt": 2}
        with patch("app.services.supabase_repo.get_db_connection", return_value=fake_conn):
            with self.assertRaises(ValueError):
                repo_instance.delete_category("cat-fruits-veg")

        # HTTP endpoints map ValueError to 409 Conflict
        with patch("app.main.repo.create_category", side_effect=ValueError("already exists")):
            with self.assertRaises(HTTPException) as ctx:
                run_sync_coro(create_category(CategoryCreate(name="Fruits & Veg", slug="fruits-veg")))
            self.assertEqual(ctx.exception.status_code, 409)

        with patch("app.main.repo.update_category", side_effect=ValueError("already exists")):
            with self.assertRaises(HTTPException) as ctx:
                run_sync_coro(update_category("cat-dairy", CategoryUpdate(name="Fruits & Veg")))
            self.assertEqual(ctx.exception.status_code, 409)

        with patch("app.main.repo.delete_category", side_effect=ValueError("products still belong")):
            with self.assertRaises(HTTPException) as ctx:
                run_sync_coro(delete_category("cat-fruits-veg"))
            self.assertEqual(ctx.exception.status_code, 409)


if __name__ == "__main__":
    unittest.main()
