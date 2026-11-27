'use client';

import { useEffect, useState } from 'react';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  status: 'placed' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled';
  pricing: { grandTotal: number };
  items: { name: string; qty: number }[];
}

export function useRealtimeOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), where('schemaVersion', '==', 1));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AdminOrder, 'id'>) })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const advanceStatus = async (orderId: string, status: AdminOrder['status']) => {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: new Date().toISOString(),
    });
  };

  return { orders, loading, advanceStatus };
}
