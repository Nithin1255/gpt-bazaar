# GPT Bazaar — Backend API (FastAPI + Supabase PostgreSQL & Storage)

Standalone Python FastAPI backend deployed on **Render**. Serves as the single authoritative API and media-upload gateway for both **Web Admin** (`gpt-bazaar/web`) and **Mobile App** (`gpt-bazaar/mobile`), persisting structured data in **Supabase PostgreSQL** (with automatic startup SQL migrations) and images in **Supabase Storage** (`catalog-images`).

It has **zero local dependencies** on `web/`, `mobile/`, or any parent directory.

## Environment Variables (Required — Fail-Fast on Startup)

The server validates PostgreSQL & Supabase credentials on startup and fails fast if they are missing:

- `DATABASE_URL` — Supabase PostgreSQL Connection String URI (use the **Session Pooler** URI on Render for IPv4 support).
- `SUPABASE_URL` — Supabase Project URL (`https://<project-ref>.supabase.co`).
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase secret `service_role` key (backend-only; never expose in web or mobile).
- `SUPABASE_STORAGE_BUCKET` — Public Supabase Storage bucket name (default: `catalog-images`).
- `ALLOWED_ORIGINS` — Comma-separated allowed CORS origins (e.g. `https://your-admin.vercel.app`) or `*`.
- `PORT` — HTTP port (Render injects this automatically; defaults to `8000`).

## Automatic Schema Migrations

Versioned SQL files in `app/migrations/*.sql` (starting with `001_initial_schema.sql`) run automatically inside transactions on server startup and are tracked in the `schema_migrations` table.

- Flexible nested fields (`variants`, `key_features`, `tags`, `delivery_address`, `items`, `pricing`, `status_timeline`) use `JSONB`.
- To add new SQL columns or tables later, add `002_<name>.sql` with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...` and redeploy.

## Local Setup

```bash
cp .env.example .env
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
python -m pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive Swagger docs: `http://localhost:8000/docs`

## Render Deployment

- **Root Directory**: `gpt-bazaar/backend`
- **Environment**: Python 3 (or Docker using `Dockerfile`)
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
