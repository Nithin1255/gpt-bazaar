# GPT Bazaar — Master Project Context (AI & Engineering Handbook)

## 1. Product Summary
**GPT Bazaar ("Groceries in Minutes")** is a hyperlocal quick-commerce grocery delivery platform inspired by Blinkit, Zepto, and BigBasket, delivering daily essentials in 10–15 minutes.

## 2. Ecosystem Architecture (Standalone Deployable Modules)
| Sub-Project | Directory | Tech Stack & Deployment | Responsibility |
| :--- | :--- | :--- | :--- |
| **Admin Web Console** | `gpt-bazaar/web/` | Next.js 15 App Router, TypeScript, TanStack React Query v5, Tailwind CSS v4 (**Vercel**) | Manage products, upload images, manage categories, configure mobile storefront settings, and dispatch orders via FastAPI |
| **Core Backend API** | `gpt-bazaar/backend/` | Python 3.11+, FastAPI, Pydantic v2, WebSockets, `psycopg`, `supabase` (**Render**) | Single authoritative REST + WebSocket + Media Upload API connected to Supabase PostgreSQL (auto-migrated) & Supabase Storage (`catalog-images`) |
| **Customer Mobile App** | `gpt-bazaar/mobile/` | React Native, Expo SDK 52, Expo Router, TypeScript (**Expo EAS**) | Production iOS/Android customer app fetching products, categories, storefront config, and orders from Supabase through FastAPI |
| **Legacy AI Studio Prototype** | `/src/` | React 19, Vite, Tailwind CSS v4 | Original AI Studio root preview (isolated from `gpt-bazaar/{web,backend,mobile}`) |

## 3. Isolation & Deployment Rules
1. **Zero Local Cross-Dependencies**: `gpt-bazaar/web`, `gpt-bazaar/backend`, and `gpt-bazaar/mobile` must never import files from each other or from outside their own folder.
2. **Shared Backend & Database**: Both `web` and `mobile` communicate with the same Python FastAPI backend (`backend`), which persists all structured data in Supabase PostgreSQL and uploaded images in Supabase Storage (`catalog-images`).
3. **No Hardcoded Secrets**: Keep `DATABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` strictly in backend environment variables.
