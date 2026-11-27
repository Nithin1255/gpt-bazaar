export type DietaryType = 'veg' | 'non_veg' | 'none';

export type OrderStatus =
  | 'placed'
  | 'packed'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'cod_due' | 'refunded';

export interface Category {
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
  schemaVersion: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
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

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  tagline?: string;
  categoryId: string;
  subcategory?: string;
  description?: string;
  keyFeatures?: string[];
  dietaryType: DietaryType;
  artworkKey?: string;
  imageUrl?: string;
  variants: ProductVariant[];
  defaultVariantId: string;
  rating?: number;
  reviewCount?: number;
  deliveryEtaMins?: number;
  isPopular?: boolean;
  isTrending?: boolean;
  isActive: boolean;
  storeId: string;
  tags?: string[];
  schemaVersion: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeliveryAddress {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  recipientName: string;
  phone: string;
  line1: string;
  landmark?: string;
  city: string;
  pincode: string;
  isDefault?: boolean;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  unitPrice: number;
  mrp: number;
  qty: number;
  artworkKey?: string;
  imageUrl?: string;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  label: string;
  note: string;
  timestamp: string;
}

export interface OrderPricing {
  itemTotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  packagingFee: number;
  grandTotal: number;
  totalSavings: number;
}

export interface DeliveryPartner {
  name: string;
  rating: number;
  deliveriesCount: number;
  phone: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  storeId: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddress: DeliveryAddress;
  items: OrderItem[];
  pricing: OrderPricing;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  statusTimeline: OrderTimelineEvent[];
  deliveryPartner?: DeliveryPartner;
  etaText?: string;
  rating?: number;
  schemaVersion: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  description?: string;
  discountType: 'flat' | 'percent';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  isActive: boolean;
  schemaVersion: number;
}

export interface NotificationItem {
  id: string;
  category: 'orders' | 'offers' | 'account' | 'updates';
  title: string;
  message: string;
  orderId?: string;
  artworkKey?: string;
  isRead: boolean;
  schemaVersion: number;
  createdAt?: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  qty: number;
  selected: boolean;
}

export interface AppConfig {
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
