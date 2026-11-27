'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchOrders,
  getWebSocketUrl,
  updateOrderStatus,
  type AdminOrderDoc,
} from '../lib/apiClient';

export function useRealtimeOrders() {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    refetchInterval: 15_000,
  });

  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(getWebSocketUrl('admin'));
      ws.onmessage = () => {
        void queryClient.invalidateQueries({ queryKey: ['orders'] });
      };
    } catch {
      // Fall back to TanStack Query polling if WebSocket cannot connect
    }
    return () => {
      ws?.close();
    };
  }, [queryClient]);

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: AdminOrderDoc['status'] }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    orders: ordersQuery.data ?? [],
    loading: ordersQuery.isLoading,
    error: ordersQuery.error instanceof Error ? ordersQuery.error.message : null,
    advanceStatus: (orderId: string, status: AdminOrderDoc['status']) =>
      statusMutation.mutateAsync({ orderId, status }),
    isUpdating: statusMutation.isPending,
  };
}
