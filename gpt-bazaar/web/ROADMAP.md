# Admin Next.js Console — Phased Roadmap

## Phase 1 (Initialized)
- Next.js App Router scaffold + TanStack React Query + real-time order hook (`useRealtimeOrders.ts`).
- Live Order Dispatch Queue (`Placed → Packed → Out for Delivery → Delivered`) and Product Upload architecture.

## Phase 2
- Firebase Google Sign-In RBAC middleware verifying `/admins/{uid}` roles.
- Drag-and-drop Firebase Storage image uploader with client-side compression.
- Bulk CSV SKU import & price sheet exporter.

## Phase 3
- Live Dark-Store Dispatch Map showing active riders and order clusters.
- One-click rider reassignment and SLA breach alerts.

## Phase 4
- Revenue cohort charts, low-stock reorder automation, and multi-store role switcher.
