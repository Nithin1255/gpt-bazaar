import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export type DataSourceMode = 'firestore' | 'api';

export const DATA_SOURCE: DataSourceMode =
  (process.env.NEXT_PUBLIC_DATA_SOURCE || 'firestore').toLowerCase() === 'api'
    ? 'api'
    : 'firestore';

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
).replace(/\/+$/, '');

export interface CategoryDoc {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductVariantDoc {
  id: string;
  label: string;
  unitValue: number;
  unit: string;
  price: number;
  mrp: number;
  discountPercent: number;
  stock: number;
  sku: string;
}

export interface ProductDoc {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  tagline?: string;
  categoryId: string;
  subcategory?: string;
  description?: string;
  keyFeatures?: string[];
  dietaryType?: 'veg' | 'non_veg' | 'none';
  artworkKey?: string;
  imageUrl?: string;
  isPopular?: boolean;
  isTrending?: boolean;
  isActive: boolean;
  storeId?: string;
  tags?: string[];
  variants: ProductVariantDoc[];
  defaultVariantId: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateProductInput = Omit<ProductDoc, 'id' | 'createdAt' | 'updatedAt'>;

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Backend error (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as T;
}

export function subscribeCategories(
  onData: (items: CategoryDoc[]) => void,
  onError: (msg: string) => void
): () => void {
  if (DATA_SOURCE === 'api') {
    let active = true;
    void apiJson<{ items: CategoryDoc[] }>('/api/v1/categories')
      .then((res) => {
        if (active) onData(res.items || []);
      })
      .catch((err) => {
        if (active) onError(err instanceof Error ? err.message : 'Failed to load categories.');
      });
    return () => {
      active = false;
    };
  }

  const q = query(collection(db, 'categories'), where('schemaVersion', '==', 1));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<CategoryDoc, 'id'>) }))
        .sort((a, b) => a.sortOrder - b.sortOrder);
      onData(list);
    },
    (err) => onError(err.message)
  );
}

export function subscribeProducts(
  onData: (items: ProductDoc[]) => void,
  onError: (msg: string) => void
): () => void {
  if (DATA_SOURCE === 'api') {
    let active = true;
    void apiJson<{ items: ProductDoc[] }>('/api/v1/products')
      .then((res) => {
        if (active) onData(res.items || []);
      })
      .catch((err) => {
        if (active) onError(err instanceof Error ? err.message : 'Failed to load products.');
      });
    return () => {
      active = false;
    };
  }

  const q = query(collection(db, 'products'), where('schemaVersion', '==', 1));
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<ProductDoc, 'id'>) }))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onData(list);
    },
    (err) => onError(err.message)
  );
}

export async function fetchProductsOnce(): Promise<ProductDoc[]> {
  if (DATA_SOURCE === 'api') {
    const res = await apiJson<{ items: ProductDoc[] }>('/api/v1/products');
    return res.items || [];
  }
  return [];
}

export async function createProductRecord(input: CreateProductInput): Promise<ProductDoc> {
  if (DATA_SOURCE === 'api') {
    return apiJson<ProductDoc>('/api/v1/products', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  const productId = `prod-${input.slug}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  const body = {
    ...input,
    rating: 4.7,
    reviewCount: 100,
    deliveryEtaMins: 12,
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(doc(db, 'products', productId), body);
  return { id: productId, ...body };
}

export async function updateProductRecord(
  productId: string,
  patch: Partial<CreateProductInput>
): Promise<void> {
  if (DATA_SOURCE === 'api') {
    await apiJson(`/api/v1/products/${encodeURIComponent(productId)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    return;
  }

  await updateDoc(doc(db, 'products', productId), {
    ...patch,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteProductRecord(productId: string): Promise<void> {
  if (DATA_SOURCE === 'api') {
    await apiJson(`/api/v1/products/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
    });
    return;
  }

  await deleteDoc(doc(db, 'products', productId));
}
