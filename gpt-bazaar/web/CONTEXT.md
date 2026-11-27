# GPT Bazaar Admin Console — Next.js Context

## Purpose
Desktop operations portal for store managers and catalog admins to upload products, manage multi-variant stock, toggle categories, and dispatch live customer orders in real time.

## Stack
- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Data & Real-Time**: TanStack React Query v5 + Firebase Firestore `onSnapshot` + optional FastAPI WebSocket (`ws://localhost:8000/ws/live/admin`)
- **Styling**: Tailwind CSS v4 adhering to GPT Bazaar neutral SaaS tokens (`#FFFFFF` cards, `#E4EBE6` 1px borders, `#0E6F2D` actions, tabular numerals)

## Quick Start
```bash
cd admin-nextjs
npm install
npm run dev
```
Configure `NEXT_PUBLIC_FIREBASE_*` and `NEXT_PUBLIC_API_URL` in `.env.local`.
