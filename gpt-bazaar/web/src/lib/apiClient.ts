export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
).replace(/\/+$/, '');

export function getWebSocketUrl(room: string): string {
  const configured = (process.env.NEXT_PUBLIC_WS_BASE_URL || '').trim().replace(/\/+$/, '');
  if (configured) {
    return `${configured}/ws/live/${encodeURIComponent(room)}`;
  }
  const wsBase = API_BASE_URL.replace(/^https:\/\//i, 'wss://').replace(/^http:\/\//i, 'ws://');
  return `${wsBase}/ws/live/${encodeURIComponent(room)}`;
}

export interface CategoryDoc {
  id: string;
  name: string;
  slug: string;
  subtitle?: string;
  artworkKey?: string;
  imageUrl?: string;
  bgTint: string;
  subcategories: string[];
  sortOrder: number;
  isActive: boolean;
  schemaVersion?: number;
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

export interface AppConfigDoc {
  id: string;
  storeName: string;
  hubCity: string;
  pincode: string;
  deliveryEtaText: string;
  isStoreOpen: boolean;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  dealBannerTitle: string;
  dealBannerSubtitle: string;
  freeDeliveryThreshold: number;
  deliveryFee: number;
  packagingFee: number;
  updatedAt?: string;
}

export interface AdminOrderDoc {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  status: 'placed' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled';
  pricing: { grandTotal: number };
  items: { name: string; variantLabel?: string; qty: number }[];
  createdAt?: string;
}

export type CreateProductInput = Omit<ProductDoc, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateCategoryInput = Omit<CategoryDoc, 'id' | 'schemaVersion'>;

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const raw = await res.text();
    let message = raw;
    try {
      const parsed = JSON.parse(raw) as { detail?: string };
      if (parsed?.detail) message = parsed.detail;
    } catch {
      // Keep raw response text
    }
    throw new Error(message || `API error (${res.status})`);
  }
  return (await res.json()) as T;
}

export async function fetchCategories(): Promise<CategoryDoc[]> {
  const res = await apiJson<{ items: CategoryDoc[] }>('/api/v1/categories');
  return res.items || [];
}

export async function createCategory(input: CreateCategoryInput): Promise<CategoryDoc> {
  return apiJson<CategoryDoc>('/api/v1/categories', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateCategory(
  categoryId: string,
  patch: Partial<CreateCategoryInput>
): Promise<CategoryDoc> {
  return apiJson<CategoryDoc>(`/api/v1/categories/${encodeURIComponent(categoryId)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await apiJson(`/api/v1/categories/${encodeURIComponent(categoryId)}`, {
    method: 'DELETE',
  });
}

export async function fetchProducts(): Promise<ProductDoc[]> {
  const res = await apiJson<{ items: ProductDoc[] }>('/api/v1/products');
  return res.items || [];
}

export async function createProduct(input: CreateProductInput): Promise<ProductDoc> {
  return apiJson<ProductDoc>('/api/v1/products', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateProduct(
  productId: string,
  patch: Partial<CreateProductInput>
): Promise<ProductDoc> {
  return apiJson<ProductDoc>(`/api/v1/products/${encodeURIComponent(productId)}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function deleteProduct(productId: string): Promise<void> {
  await apiJson(`/api/v1/products/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  });
}

export async function fetchAppConfig(): Promise<AppConfigDoc> {
  return apiJson<AppConfigDoc>('/api/v1/app-config');
}

export async function updateAppConfig(
  patch: Partial<Omit<AppConfigDoc, 'id' | 'updatedAt'>>
): Promise<AppConfigDoc> {
  return apiJson<AppConfigDoc>('/api/v1/app-config', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function fetchOrders(): Promise<AdminOrderDoc[]> {
  const res = await apiJson<{ items: AdminOrderDoc[] }>('/api/v1/orders');
  return res.items || [];
}

export async function updateOrderStatus(
  orderId: string,
  status: AdminOrderDoc['status'],
  note?: string
): Promise<AdminOrderDoc> {
  return apiJson<AdminOrderDoc>(`/api/v1/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note }),
  });
}
