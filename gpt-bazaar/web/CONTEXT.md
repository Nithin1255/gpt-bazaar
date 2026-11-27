# GPT Bazaar Admin Console — Next.js Context

## Purpose
Standalone Admin Web Portal for managing products, uploading images, configuring categories, controlling mobile storefront banners/settings, and dispatching orders—all persisted to Supabase PostgreSQL & Storage via the Python FastAPI backend.

## Stack
- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Data & Real-Time**: TanStack React Query v5 (`src/components/QueryProvider.tsx`, `src/lib/apiClient.ts`) + FastAPI WebSocket cache invalidation
- **Media Upload**: Multipart upload via `POST /api/v1/uploads/image` (`src/lib/imageUpload.ts`) stored in Supabase Storage (`catalog-images`) by FastAPI
- **Styling**: Tailwind CSS v4 (`src/app/globals.css`)
