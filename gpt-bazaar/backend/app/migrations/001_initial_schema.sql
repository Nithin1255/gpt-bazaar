-- GPT Bazaar Initial PostgreSQL Schema (auto-applied by backend migrator on startup)

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    subtitle TEXT NOT NULL DEFAULT '',
    artwork_key TEXT NOT NULL DEFAULT 'fruits_veg',
    image_url TEXT NOT NULL DEFAULT '',
    bg_tint TEXT NOT NULL DEFAULT '#EEF9F0',
    subcategories JSONB NOT NULL DEFAULT '[]'::jsonb,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    schema_version INTEGER NOT NULL DEFAULT 1,
    extra JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    brand TEXT,
    tagline TEXT,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    subcategory TEXT,
    description TEXT,
    key_features JSONB NOT NULL DEFAULT '[]'::jsonb,
    dietary_type TEXT NOT NULL DEFAULT 'veg',
    artwork_key TEXT NOT NULL DEFAULT 'fruits_veg',
    image_url TEXT NOT NULL DEFAULT '',
    variants JSONB NOT NULL DEFAULT '[]'::jsonb,
    default_variant_id TEXT NOT NULL,
    rating DOUBLE PRECISION NOT NULL DEFAULT 4.6,
    review_count INTEGER NOT NULL DEFAULT 0,
    delivery_eta_mins INTEGER NOT NULL DEFAULT 12,
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    is_trending BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    store_id TEXT NOT NULL DEFAULT 'store-chittoor-hub-1',
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    schema_version INTEGER NOT NULL DEFAULT 1,
    extra JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    store_id TEXT NOT NULL DEFAULT 'store-chittoor-hub-1',
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    delivery_address JSONB NOT NULL,
    items JSONB NOT NULL,
    pricing JSONB NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'upi',
    payment_status TEXT NOT NULL DEFAULT 'paid',
    status TEXT NOT NULL DEFAULT 'placed',
    status_timeline JSONB NOT NULL DEFAULT '[]'::jsonb,
    delivery_partner JSONB,
    eta_text TEXT NOT NULL DEFAULT '10–15 mins',
    rating INTEGER,
    schema_version INTEGER NOT NULL DEFAULT 1,
    extra JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    discount_type TEXT NOT NULL DEFAULT 'percent',
    discount_value DOUBLE PRECISION NOT NULL,
    min_order_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    max_discount DOUBLE PRECISION,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    schema_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL DEFAULT 'orders',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    order_id TEXT,
    artwork_key TEXT NOT NULL DEFAULT 'box',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    schema_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

CREATE TABLE IF NOT EXISTS app_config (
    id TEXT PRIMARY KEY,
    store_name TEXT NOT NULL DEFAULT 'GPT Bazaar Chittoor Hub',
    hub_city TEXT NOT NULL DEFAULT 'Chittoor',
    pincode TEXT NOT NULL DEFAULT '517584',
    delivery_eta_text TEXT NOT NULL DEFAULT '10–15 mins',
    is_store_open BOOLEAN NOT NULL DEFAULT TRUE,
    hero_badge TEXT NOT NULL DEFAULT 'UP TO 40% OFF',
    hero_title TEXT NOT NULL DEFAULT 'Fresh picks, better prices',
    hero_subtitle TEXT NOT NULL DEFAULT 'Handpicked farm produce & daily essentials delivered in minutes.',
    deal_banner_title TEXT NOT NULL DEFAULT 'Free delivery on orders above ₹149',
    deal_banner_subtitle TEXT NOT NULL DEFAULT 'Use code GROCER10 in cart for instant savings on daily essentials.',
    free_delivery_threshold DOUBLE PRECISION NOT NULL DEFAULT 149,
    delivery_fee DOUBLE PRECISION NOT NULL DEFAULT 25,
    packaging_fee DOUBLE PRECISION NOT NULL DEFAULT 5,
    schema_version INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lock down direct public PostgREST access; FastAPI uses DATABASE_URL & service_role key
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
