# GPT Bazaar — Admin Web Console (Next.js)

Standalone Next.js App Router admin interface deployed on **Vercel**. Built with **TypeScript**, **TanStack Query**, and **Tailwind CSS v4** to manage products, upload product/category images, control mobile app storefront settings, and process live customer orders through the **FastAPI Backend** (`gpt-bazaar/backend`), which persists everything to **Supabase PostgreSQL & Storage**.

It has **zero local dependencies** on `backend/`, `mobile/`, or any parent directory.

## Environment Variables

Copy `.env.example` to `.env.local`:

- `NEXT_PUBLIC_API_BASE_URL` — Your Render FastAPI backend URL (e.g. `https://gpt-bazaar-api.onrender.com`, or `http://localhost:8000` locally)
- `NEXT_PUBLIC_WS_BASE_URL` — Optional explicit WebSocket base URL (derived automatically from `NEXT_PUBLIC_API_BASE_URL` if omitted)

## Local Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Runs at `http://localhost:3001`.

## Vercel Deployment

- **Root Directory**: `gpt-bazaar/web`
- **Framework Preset**: Next.js
- **Environment Variable**: Set `NEXT_PUBLIC_API_BASE_URL` to your Render backend URL.
