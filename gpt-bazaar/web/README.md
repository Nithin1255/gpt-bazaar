# GPT Bazaar — Admin Console (Next.js)

Real-time inventory management, product catalog upload, and live order fulfillment console built with **Next.js App Router**, **React Query**, **Tailwind CSS**, and **Firebase Firestore**.

## Quick Start

```bash
cp .env.example .env.local
npm install
npm run dev
```

The admin console runs on `http://localhost:3001`.

## Project Structure

- `src/app/page.tsx` — Live order dispatch & inventory operations console
- `src/hooks/useRealtimeOrders.ts` — Firestore real-time order listener & status advancement hook
- `CONTEXT.md` — AI/developer architectural context for the admin console
- `ROADMAP.md` — Phased feature roadmap

## Companion Repositories

- **Customer Mobile App (Expo)**: `gpt-bazaar-mobile`
- **Backend API (Python FastAPI)**: `gpt-bazaar-backend`
