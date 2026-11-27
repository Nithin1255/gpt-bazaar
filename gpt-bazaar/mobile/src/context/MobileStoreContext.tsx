import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { API_BASE_URL, apiRequest, getWebSocketUrl } from '../services/api';
import type {
  AppConfig,
  CartItem,
  Category,
  Coupon,
  DeliveryAddress,
  NotificationItem,
  Order,
  OrderItem,
  PaymentMethod,
  Product,
} from '../types/models';

export const DEFAULT_STORE_ID = 'store-chittoor-hub-1';
export const FREE_DELIVERY_THRESHOLD = 149;
export const STANDARD_DELIVERY_FEE = 25;
export const PACKAGING_FEE = 5;

const DEFAULT_APP_CONFIG: AppConfig = {
  id: 'mobile',
  storeName: 'GPT Bazaar Chittoor Hub',
  hubCity: 'Chittoor',
  pincode: '517584',
  deliveryEtaText: '10–15 mins',
  isStoreOpen: true,
  heroBadge: 'UP TO 40% OFF',
  heroTitle: 'Fresh picks, better prices',
  heroSubtitle: 'Handpicked farm produce & daily essentials delivered in minutes.',
  dealBannerTitle: 'Free delivery on orders above ₹149',
  dealBannerSubtitle: 'Use code GROCER10 in cart for instant savings on daily essentials.',
  freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
  deliveryFee: STANDARD_DELIVERY_FEE,
  packagingFee: PACKAGING_FEE,
};

const STORAGE_KEYS = {
  cart: 'gptbazaar_cart_v1',
  wishlist: 'gptbazaar_wishlist_v1',
  addresses: 'gptbazaar_addresses_v1',
  selectedAddressId: 'gptbazaar_selected_address_v1',
  recentSearches: 'gptbazaar_recent_searches_v1',
  onboarded: 'gptbazaar_onboarded_v1',
  customerProfile: 'gptbazaar_customer_v1',
} as const;

const DEFAULT_ADDRESSES: DeliveryAddress[] = [
  {
    id: 'addr-home-1',
    label: 'Home',
    recipientName: 'Nithin Kumar',
    phone: '+91 98480 12345',
    line1: '14-2-88, Pudukpet Main Road',
    landmark: 'Near Sri Venkateswara Temple',
    city: 'Chittoor',
    pincode: '517584',
    isDefault: true,
  },
  {
    id: 'addr-work-2',
    label: 'Work',
    recipientName: 'Nithin Kumar',
    phone: '+91 98480 12345',
    line1: 'Tirupati Road, Tech Park Annex',
    landmark: 'Opp. Bus Depot',
    city: 'Nagari',
    pincode: '517590',
    isDefault: false,
  },
];

const DEFAULT_RECENT_SEARCHES = ['Milk', 'Eggs', 'Tomato', 'Rice', 'Banana'];

function triggerLightHaptic() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export interface CartSummary {
  rows: {
    cartItem: CartItem;
    product: Product;
    variant: Product['variants'][number];
  }[];
  selectedCount: number;
  totalQty: number;
  itemTotal: number;
  mrpTotal: number;
  discount: number;
  appliedCoupon: Coupon | null;
  deliveryFee: number;
  packagingFee: number;
  grandTotal: number;
  totalSavings: number;
  freeDeliveryRemaining: number;
}

interface MobileStoreContextValue {
  appConfig: AppConfig;
  categories: Category[];
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  notifications: NotificationItem[];
  loading: boolean;
  refreshing: boolean;
  refreshCatalog: () => Promise<void>;
  hydrated: boolean;
  syncError: string | null;

  hasCompletedOnboarding: boolean;
  completeOnboarding: (phone?: string) => void;
  customerName: string;
  customerPhone: string;
  updateCustomerInfo: (name: string, phone: string) => void;

  cart: CartItem[];
  cartSummary: CartSummary;
  wishlistIds: string[];
  addresses: DeliveryAddress[];
  selectedAddress: DeliveryAddress;
  selectedCouponCode: string | null;
  recentSearches: string[];
  unreadNotificationsCount: number;

  addToCart: (productId: string, variantId?: string, qty?: number) => void;
  updateCartQty: (productId: string, variantId: string, delta: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  toggleCartSelected: (productId: string, variantId: string) => void;
  clearCart: () => void;
  getCartQty: (productId: string, variantId?: string) => number;
  setSelectedCouponCode: (code: string | null) => void;

  toggleWishlist: (productId: string) => void;
  addAllWishlistToCart: () => void;

  selectAddress: (id: string) => void;
  addAddress: (addr: Omit<DeliveryAddress, 'id'>) => void;
  deleteAddress: (id: string) => void;

  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;

  placeOrder: (params: {
    customerName: string;
    customerPhone: string;
    paymentMethod: PaymentMethod;
  }) => Promise<Order>;
  reorderFromOrder: (order: Order) => void;
  rateOrder: (orderId: string, rating: number) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const MobileStoreContext = createContext<MobileStoreContextValue | null>(null);

export function MobileStoreProvider({ children }: { children: React.ReactNode }) {
  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_APP_CONFIG);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [customerName, setCustomerName] = useState('Nithin Kumar');
  const [customerPhone, setCustomerPhone] = useState('+91 98480 12345');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>(DEFAULT_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(DEFAULT_ADDRESSES[0].id);
  const [selectedCouponCode, setSelectedCouponCode] = useState<string | null>('GROCER10');
  const [recentSearches, setRecentSearches] = useState<string[]>(DEFAULT_RECENT_SEARCHES);

  // Hydrate offline device state from AsyncStorage
  useEffect(() => {
    let active = true;
    async function hydrate() {
      try {
        const pairs = await AsyncStorage.multiGet(Object.values(STORAGE_KEYS));
        if (!active) return;
        const map = Object.fromEntries(pairs);

        const rawCart = map[STORAGE_KEYS.cart];
        if (rawCart) setCart(JSON.parse(rawCart));
        const rawWishlist = map[STORAGE_KEYS.wishlist];
        if (rawWishlist) setWishlistIds(JSON.parse(rawWishlist));
        const rawAddresses = map[STORAGE_KEYS.addresses];
        if (rawAddresses) {
          const parsed = JSON.parse(rawAddresses) as DeliveryAddress[];
          if (parsed.length > 0) setAddresses(parsed);
        }
        const rawSelectedAddr = map[STORAGE_KEYS.selectedAddressId];
        if (rawSelectedAddr) {
          setSelectedAddressId(rawSelectedAddr);
        }
        const rawSearches = map[STORAGE_KEYS.recentSearches];
        if (rawSearches) {
          setRecentSearches(JSON.parse(rawSearches));
        }
        if (map[STORAGE_KEYS.onboarded] === 'true') {
          setHasCompletedOnboarding(true);
        }
        const rawProfile = map[STORAGE_KEYS.customerProfile];
        if (rawProfile) {
          const prof = JSON.parse(rawProfile) as {
            name?: string;
            phone?: string;
          };
          if (prof.name) setCustomerName(prof.name);
          if (prof.phone) setCustomerPhone(prof.phone);
        }
      } catch {
        // Ignore corrupt local storage and use clean defaults
      } finally {
        if (active) setHydrated(true);
      }
    }
    void hydrate();
    return () => {
      active = false;
    };
  }, []);

  // Persist local device state whenever updated after hydration
  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart)).catch(() => {});
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(wishlistIds)).catch(() => {});
  }, [wishlistIds, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(STORAGE_KEYS.addresses, JSON.stringify(addresses)).catch(() => {});
  }, [addresses, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(STORAGE_KEYS.selectedAddressId, selectedAddressId).catch(() => {});
  }, [selectedAddressId, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(STORAGE_KEYS.recentSearches, JSON.stringify(recentSearches)).catch(
      () => {}
    );
  }, [recentSearches, hydrated]);

  const loadFromApi = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const [storefront, ordRes, notifRes] = await Promise.all([
        apiRequest<{
          appConfig?: AppConfig;
          categories: Category[];
          products: Product[];
          coupons: Coupon[];
        }>('/api/v1/storefront'),
        apiRequest<{ items: Order[] }>('/api/v1/orders').catch(() => ({ items: [] as Order[] })),
        apiRequest<{ items: NotificationItem[] }>('/api/v1/notifications').catch(() => ({
          items: [] as NotificationItem[],
        })),
      ]);

      if (storefront.appConfig) {
        setAppConfig({ ...DEFAULT_APP_CONFIG, ...storefront.appConfig });
      }
      const sortedCategories = [...(storefront.categories || [])].sort(
        (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
      );
      const sortedOrders = [...(ordRes.items || [])].sort((a, b) =>
        (b.createdAt || '').localeCompare(a.createdAt || '')
      );
      setCategories(sortedCategories);
      setProducts(storefront.products || []);
      setCoupons(storefront.coupons || []);
      setOrders(sortedOrders);
      setNotifications(notifRes.items || []);
      setSyncError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to reach FastAPI backend';
      setSyncError(
        `${msg}. Verify EXPO_PUBLIC_API_BASE_URL (${API_BASE_URL}) is reachable from your device.`
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refreshCatalog = useCallback(async () => {
    await loadFromApi(true);
  }, [loadFromApi]);

  // Initial load + live WebSocket sync with FastAPI backend
  useEffect(() => {
    void loadFromApi(false);

    let catalogWs: WebSocket | null = null;
    let adminWs: WebSocket | null = null;
    try {
      catalogWs = new WebSocket(getWebSocketUrl('catalog'));
      catalogWs.onmessage = () => {
        void loadFromApi(true);
      };
      adminWs = new WebSocket(getWebSocketUrl('admin'));
      adminWs.onmessage = () => {
        void loadFromApi(true);
      };
    } catch {
      // Pull-to-refresh remains available if WS cannot connect
    }

    return () => {
      catalogWs?.close();
      adminWs?.close();
    };
  }, [loadFromApi]);

  const completeOnboarding = useCallback(
    (phone?: string) => {
      setHasCompletedOnboarding(true);
      void AsyncStorage.setItem(STORAGE_KEYS.onboarded, 'true').catch(() => {});
      if (phone && phone.trim().length >= 8) {
        const normalized = phone.trim().startsWith('+') ? phone.trim() : `+91 ${phone.trim()}`;
        setCustomerPhone(normalized);
        void AsyncStorage.setItem(
          STORAGE_KEYS.customerProfile,
          JSON.stringify({ name: customerName, phone: normalized })
        ).catch(() => {});
      }
    },
    [customerName]
  );

  const updateCustomerInfo = useCallback((name: string, phone: string) => {
    setCustomerName(name);
    setCustomerPhone(phone);
    void AsyncStorage.setItem(
      STORAGE_KEYS.customerProfile,
      JSON.stringify({ name, phone })
    ).catch(() => {});
  }, []);

  const addToCart = useCallback(
    (productId: string, variantId?: string, qty = 1) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      const targetVariant =
        product.variants.find((v) => v.id === (variantId || product.defaultVariantId)) ||
        product.variants[0];
      if (!targetVariant || targetVariant.stock <= 0) return;

      triggerLightHaptic();
      setCart((prev) => {
        const idx = prev.findIndex(
          (item) => item.productId === productId && item.variantId === targetVariant.id
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            qty: Math.min(targetVariant.stock, next[idx].qty + qty),
            selected: true,
          };
          return next;
        }
        return [
          ...prev,
          {
            productId,
            variantId: targetVariant.id,
            qty: Math.min(targetVariant.stock, qty),
            selected: true,
          },
        ];
      });
    },
    [products]
  );

  const updateCartQty = useCallback(
    (productId: string, variantId: string, delta: number) => {
      const product = products.find((p) => p.id === productId);
      const maxStock = product?.variants.find((v) => v.id === variantId)?.stock ?? 99;
      triggerLightHaptic();
      setCart((prev) =>
        prev
          .map((item) => {
            if (item.productId !== productId || item.variantId !== variantId) return item;
            const nextQty = Math.min(maxStock, item.qty + delta);
            return nextQty <= 0 ? null : { ...item, qty: nextQty };
          })
          .filter((x): x is CartItem => x !== null)
      );
    },
    [products]
  );

  const removeFromCart = useCallback((productId: string, variantId: string) => {
    triggerLightHaptic();
    setCart((prev) =>
      prev.filter((i) => !(i.productId === productId && i.variantId === variantId))
    );
  }, []);

  const toggleCartSelected = useCallback((productId: string, variantId: string) => {
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId && i.variantId === variantId
          ? { ...i, selected: !i.selected }
          : i
      )
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const getCartQty = useCallback(
    (productId: string, variantId?: string) => {
      if (variantId) {
        return (
          cart.find((i) => i.productId === productId && i.variantId === variantId)?.qty || 0
        );
      }
      return cart
        .filter((i) => i.productId === productId)
        .reduce((sum, i) => sum + i.qty, 0);
    },
    [cart]
  );

  const toggleWishlist = useCallback((productId: string) => {
    triggerLightHaptic();
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [productId, ...prev]
    );
  }, []);

  const addAllWishlistToCart = useCallback(() => {
    wishlistIds.forEach((pid) => addToCart(pid, undefined, 1));
  }, [wishlistIds, addToCart]);

  const selectAddress = useCallback((id: string) => {
    setSelectedAddressId(id);
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  }, []);

  const addAddress = useCallback((addr: Omit<DeliveryAddress, 'id'>) => {
    const newId = `addr-${Date.now().toString(36)}`;
    const nextAddr: DeliveryAddress = { ...addr, id: newId, isDefault: true };
    setAddresses((prev) => [
      nextAddr,
      ...prev.map((a) => ({ ...a, isDefault: false })),
    ]);
    setSelectedAddressId(newId);
  }, []);

  const deleteAddress = useCallback(
    (id: string) => {
      setAddresses((prev) => {
        if (prev.length <= 1) return prev;
        const filtered = prev.filter((a) => a.id !== id);
        if (id === selectedAddressId && filtered[0]) {
          setSelectedAddressId(filtered[0].id);
        }
        return filtered;
      });
    },
    [selectedAddressId]
  );

  const addRecentSearch = useCallback((term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) =>
      [clean, ...prev.filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(0, 8)
    );
  }, []);

  const clearRecentSearches = useCallback(() => setRecentSearches([]), []);

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId) || addresses[0] || DEFAULT_ADDRESSES[0],
    [addresses, selectedAddressId]
  );

  const cartSummary = useMemo<CartSummary>(() => {
    const rows = cart
      .map((cartItem) => {
        const product = products.find((p) => p.id === cartItem.productId);
        if (!product) return null;
        const variant =
          product.variants.find((v) => v.id === cartItem.variantId) || product.variants[0];
        if (!variant) return null;
        return { cartItem, product, variant };
      })
      .filter((x): x is CartSummary['rows'][number] => x !== null);

    const selectedRows = rows.filter((r) => r.cartItem.selected);
    const totalQty = rows.reduce((sum, r) => sum + r.cartItem.qty, 0);
    const selectedCount = selectedRows.reduce((sum, r) => sum + r.cartItem.qty, 0);
    const itemTotal = selectedRows.reduce((sum, r) => sum + r.variant.price * r.cartItem.qty, 0);
    const mrpTotal = selectedRows.reduce((sum, r) => sum + r.variant.mrp * r.cartItem.qty, 0);

    const coupon =
      coupons.find((c) => c.code === selectedCouponCode && c.isActive) || null;
    let discount = 0;
    let appliedCoupon: Coupon | null = null;
    if (coupon && itemTotal >= coupon.minOrderAmount) {
      appliedCoupon = coupon;
      discount =
        coupon.discountType === 'flat'
          ? coupon.discountValue
          : Math.min(
              Math.round((itemTotal * coupon.discountValue) / 100),
              coupon.maxDiscount || 999
            );
    }

    const freeThreshold = appConfig.freeDeliveryThreshold ?? FREE_DELIVERY_THRESHOLD;
    const baseDeliveryFee = appConfig.deliveryFee ?? STANDARD_DELIVERY_FEE;
    const basePkgFee = appConfig.packagingFee ?? PACKAGING_FEE;

    const deliveryFee =
      itemTotal === 0 || itemTotal >= freeThreshold ? 0 : baseDeliveryFee;
    const packagingFee = itemTotal > 0 ? basePkgFee : 0;
    const grandTotal =
      itemTotal > 0 ? Math.max(1, itemTotal - discount + deliveryFee + packagingFee) : 0;
    const totalSavings =
      itemTotal > 0
        ? Math.max(0, mrpTotal - itemTotal) +
          discount +
          (itemTotal >= freeThreshold ? baseDeliveryFee : 0)
        : 0;
    const freeDeliveryRemaining = Math.max(0, freeThreshold - itemTotal);

    return {
      rows,
      selectedCount,
      totalQty,
      itemTotal,
      mrpTotal,
      discount,
      appliedCoupon,
      deliveryFee,
      packagingFee,
      grandTotal,
      totalSavings,
      freeDeliveryRemaining,
    };
  }, [cart, products, coupons, selectedCouponCode, appConfig]);

  const placeOrder = useCallback(
    async ({
      customerName: nameInput,
      customerPhone: phoneInput,
      paymentMethod,
    }: {
      customerName: string;
      customerPhone: string;
      paymentMethod: PaymentMethod;
    }): Promise<Order> => {
      const selectedRows = cartSummary.rows.filter((r) => r.cartItem.selected);
      if (selectedRows.length === 0) {
        throw new Error('Your cart has no selected items.');
      }

      const orderItems: OrderItem[] = selectedRows.map((r) => ({
        productId: r.product.id,
        variantId: r.variant.id,
        name: r.product.name,
        variantLabel: r.variant.label,
        unitPrice: r.variant.price,
        mrp: r.variant.mrp,
        qty: r.cartItem.qty,
        artworkKey: r.product.artworkKey || 'fruits_veg',
        imageUrl: r.product.imageUrl || '',
      }));

      const pricing = {
        itemTotal: cartSummary.itemTotal,
        discount: cartSummary.discount,
        ...(cartSummary.discount > 0 && cartSummary.appliedCoupon
          ? { couponCode: cartSummary.appliedCoupon.code }
          : {}),
        deliveryFee: cartSummary.deliveryFee,
        packagingFee: cartSummary.packagingFee,
        grandTotal: cartSummary.grandTotal,
        totalSavings: cartSummary.totalSavings,
      };

      const createdOrder = await apiRequest<Order>('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify({
          storeId: DEFAULT_STORE_ID,
          customerName: nameInput.trim().slice(0, 100) || 'Guest Shopper',
          customerPhone: phoneInput.trim().slice(0, 24) || '+91 98480 12345',
          deliveryAddress: selectedAddress,
          items: orderItems,
          pricing,
          paymentMethod,
        }),
      });

      const hydratedOrder: Order = {
        ...createdOrder,
        deliveryPartner: createdOrder.deliveryPartner || {
          name: 'Karthik S.',
          rating: 4.8,
          deliveriesCount: 2340,
          phone: '+91 98491 77820',
        },
      };

      setCart((prev) => prev.filter((item) => !item.selected));
      void loadFromApi(true);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      return hydratedOrder;
    },
    [cartSummary, selectedAddress, loadFromApi]
  );

  const reorderFromOrder = useCallback(
    (order: Order) => {
      order.items.forEach((item) => addToCart(item.productId, item.variantId, item.qty));
    },
    [addToCart]
  );

  const rateOrder = useCallback(async (orderId: string, rating: number) => {
    await apiRequest(`/api/v1/orders/${encodeURIComponent(orderId)}/rating`, {
      method: 'PATCH',
      body: JSON.stringify({ rating }),
    });
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, rating, updatedAt: new Date().toISOString() } : o
      )
    );
    triggerLightHaptic();
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    await apiRequest(`/api/v1/notifications/${encodeURIComponent(id)}/read`, {
      method: 'PATCH',
    }).catch(() => {});
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    await apiRequest('/api/v1/notifications/read-all', { method: 'POST' }).catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const value = useMemo<MobileStoreContextValue>(
    () => ({
      appConfig,
      categories,
      products,
      orders,
      coupons,
      notifications,
      loading,
      refreshing,
      refreshCatalog,
      hydrated,
      syncError,
      hasCompletedOnboarding,
      completeOnboarding,
      customerName,
      customerPhone,
      updateCustomerInfo,
      cart,
      cartSummary,
      wishlistIds,
      addresses,
      selectedAddress,
      selectedCouponCode,
      recentSearches,
      unreadNotificationsCount,
      addToCart,
      updateCartQty,
      removeFromCart,
      toggleCartSelected,
      clearCart,
      getCartQty,
      setSelectedCouponCode,
      toggleWishlist,
      addAllWishlistToCart,
      selectAddress,
      addAddress,
      deleteAddress,
      addRecentSearch,
      clearRecentSearches,
      placeOrder,
      reorderFromOrder,
      rateOrder,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      appConfig,
      categories,
      products,
      orders,
      coupons,
      notifications,
      loading,
      refreshing,
      refreshCatalog,
      hydrated,
      syncError,
      hasCompletedOnboarding,
      completeOnboarding,
      customerName,
      customerPhone,
      updateCustomerInfo,
      cart,
      cartSummary,
      wishlistIds,
      addresses,
      selectedAddress,
      selectedCouponCode,
      recentSearches,
      unreadNotificationsCount,
      addToCart,
      updateCartQty,
      removeFromCart,
      toggleCartSelected,
      clearCart,
      getCartQty,
      toggleWishlist,
      addAllWishlistToCart,
      selectAddress,
      addAddress,
      deleteAddress,
      addRecentSearch,
      clearRecentSearches,
      placeOrder,
      reorderFromOrder,
      rateOrder,
      markNotificationRead,
      markAllNotificationsRead,
    ]
  );

  return <MobileStoreContext.Provider value={value}>{children}</MobileStoreContext.Provider>;
}

export function useMobileStore() {
  const ctx = useContext(MobileStoreContext);
  if (!ctx) throw new Error('useMobileStore must be used inside MobileStoreProvider');
  return ctx;
}
