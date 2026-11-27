# GPT Bazaar Backend — Python FastAPI Context

## Purpose
Standalone Python FastAPI + Supabase PostgreSQL & Storage service bridging the Next.js Admin Web Console, Expo React Native Mobile App, PostgreSQL database, and `catalog-images` Storage bucket.

## Stack
- **Framework**: FastAPI (`0.115+`) + Uvicorn ASGI
- **Validation**: Pydantic v2 (`app/schemas/models.py`)
- **Database & Auto-Migrations**: PostgreSQL via `psycopg` (`app/services/supabase_client.py`, `app/services/migrator.py`, `app/migrations/*.sql`, `app/services/supabase_repo.py`)
- **Media Storage**: Supabase Storage (`catalog-images` bucket via `supabase` Python SDK)
- **Real-Time**: Native FastAPI WebSockets (`/ws/live/{room}`) via `ConnectionManager`

## Deployment
Deploy independently on Render with Root Directory `gpt-bazaar/backend` and `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_STORAGE_BUCKET=catalog-images` configured.
