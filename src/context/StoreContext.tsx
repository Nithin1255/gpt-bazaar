import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  DEFAULT_STORE_ID,
  INITIAL_ADDRESSES,
  INITIAL_CART_SEED,
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDERS_SEED,
  INITIAL_PRODUCTS,
  INITIAL_STORE,
  INITIAL_WISHLIST_IDS,
} from '../data/seedData';
import type {
  CartItem,
  Category,
  Coupon,
  DeliveryAddress,
  NotificationItem,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  StoreHub,
} from '../types/models';

export interface ToastItem {
  id: string;
  message: string;
  tone?: 'success' | 'info' | 'warning';
}

interface StoreContextValue {
  categories: Category[];
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  notifications: NotificationItem[];
  stores: StoreHub[];
  loading: boolean;
  firestoreError: string | null;
  authUser: User | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;

  // Customer local state
  cart: CartItem[];
  wishlistIds: string[];
  addresses: DeliveryAddress[];
  selectedAddressId: string;
  selectedCouponCode: string | null;
  recentSearches: string[];
  toasts: ToastItem[];
  pushToast: (message: string, tone?: ToastItem['tone']) => void;

  // Cart & wishlist handlers
  addToCart: (productId: string, variantId?: string, qty?: number) => void;
  updateCartQty: (productId: string, variantId: string, delta: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  toggleCartSelected: (productId: string, variantId: string) => void;
  clearCart: () => void;
  setSelectedCouponCode: (code: string | null) => void;
  toggleWishlist: (productId: string) => void;
  addAllWishlistToCart: () => void;
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;

  // Address handlers
  selectAddress: (id: string) => void;
  addAddress: (addr: Omit<DeliveryAddress, 'id'>) => void;
  deleteAddress: (id: string) => void;

  // Firestore Customer + Admin Mutations
  placeOrder: (params: {
    customerName: string;
    customerPhone: string;
    paymentMethod: PaymentMethod;
  }) => Promise<Order | null>;
  rateOrder: (orderId: string, rating: number) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  createProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'schemaVersion'>) => Promise<void>;
  updateProduct: (productId: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  adjustVariantStock: (productId: string, variantId: string, delta: number) => Promise<void>;
  toggleProductActive: (productId: string, isActive: boolean) => Promise<void>;
  createCategory: (cat: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'schemaVersion'>) => Promise<void>;
  updateCategory: (categoryId: string, updates: Partial<Pick<Category, 'name' | 'subtitle' | 'imageUrl' | 'artworkKey'>>) => Promise<void>;
  toggleCategoryActive: (categoryId: string, isActive: boolean) => Promise<void>;
  advanceOrderStatus: (orderId: string, nextStatus: OrderStatus) => Promise<void>;
  seedInitialData: (force?: boolean) => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function safeLoad<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function formatNowTime(): string {
  return `Today, ${new Date().toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })}`;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [stores, setStores] = useState<StoreHub[]>([]);
  const [loading, setLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => safeLoad('gbt_cart_v1', INITIAL_CART_SEED));
  const [wishlistIds, setWishlistIds] = useState<string[]>(() =>
    safeLoad('gbt_wishlist_v1', INITIAL_WISHLIST_IDS)
  );
  const [addresses, setAddresses] = useState<DeliveryAddress[]>(() =>
    safeLoad('gbt_addresses_v1', INITIAL_ADDRESSES)
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string>(() =>
    safeLoad('gbt_selected_addr_v1', INITIAL_ADDRESSES[0].id)
  );
  const [selectedCouponCode, setSelectedCouponCode] = useState<string | null>('GROCER10');
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    safeLoad('gbt_recent_searches_v1', ['Milk', 'Eggs', 'Dog food', 'Rice', 'Banana'])
  );
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seededRef = useRef(false);

  const pushToast = useCallback((message: string, tone: ToastItem['tone'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev.slice(-3), { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  // Persist customer local preferences
  useEffect(() => {
    try {
      localStorage.setItem('gbt_cart_v1', JSON.stringify(cart));
    } catch {
      // ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('gbt_wishlist_v1', JSON.stringify(wishlistIds));
    } catch {
      // ignore
    }
  }, [wishlistIds]);

  useEffect(() => {
    try {
      localStorage.setItem('gbt_addresses_v1', JSON.stringify(addresses));
    } catch {
      // ignore
    }
  }, [addresses]);

  useEffect(() => {
    try {
      localStorage.setItem('gbt_selected_addr_v1', JSON.stringify(selectedAddressId));
    } catch {
      // ignore
    }
  }, [selectedAddressId]);

  useEffect(() => {
    try {
      localStorage.setItem('gbt_recent_searches_v1', JSON.stringify(recentSearches));
    } catch {
      // ignore
    }
  }, [recentSearches]);

  // Optional Firebase Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setAuthUser(u));
    return unsub;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      pushToast('Signed in with Google');
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Sign-in cancelled', 'warning');
    }
  }, [pushToast]);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
    pushToast('Signed out', 'info');
  }, [pushToast]);

  // Seed Firestore once if collections are empty
  const seedInitialData = useCallback(
    async (force = false) => {
      try {
        const now = new Date().toISOString();
        const catSnap = await getDocs(query(collection(db, 'categories'), where('schemaVersion', '==', 1)));
        if (!force && !catSnap.empty) {
          return;
        }

        const batch = writeBatch(db);

        // Store
        const { id: storeId, ...storeBody } = INITIAL_STORE;
        batch.set(doc(db, 'stores', storeId), { ...storeBody, createdAt: now });

        // Categories
        for (const cat of INITIAL_CATEGORIES) {
          const { id, ...body } = cat;
          batch.set(doc(db, 'categories', id), { ...body, createdAt: now, updatedAt: now });
        }

        // Products
        for (const prod of INITIAL_PRODUCTS) {
          const { id, ...body } = prod;
          batch.set(doc(db, 'products', id), { ...body, createdAt: now, updatedAt: now });
        }

        // Coupons
        for (const cpn of INITIAL_COUPONS) {
          const { id, ...body } = cpn;
          batch.set(doc(db, 'coupons', id), { ...body, createdAt: now });
        }

        // Notifications
        for (const notif of INITIAL_NOTIFICATIONS) {
          const { id, ...body } = notif;
          batch.set(doc(db, 'notifications', id), { ...body, createdAt: body.createdAt || now });
        }

        await batch.commit();

        // Seed orders adhering strictly to rule: create with status='placed', then transition
        const orderSnap = await getDocs(query(collection(db, 'orders'), where('schemaVersion', '==', 1)));
        if (force || orderSnap.empty) {
          for (const ord of INITIAL_ORDERS_SEED) {
            const { id, ...body } = ord;
            const orderRef = doc(db, 'orders', id);
            await setDoc(orderRef, {
              ...body,
              status: 'placed',
              statusTimeline: [body.statusTimeline[0]],
            });
            if (body.status !== 'placed') {
              await updateDoc(orderRef, {
                status: body.status,
                statusTimeline: body.statusTimeline,
                etaText: body.etaText || '10–15 mins',
                deliveryPartner: body.deliveryPartner || {
                  name: 'Karthik S.',
                  rating: 4.8,
                  deliveriesCount: 2340,
                  phone: '+91 98491 77820',
                },
                paymentStatus: body.paymentStatus,
                updatedAt: now,
              });
            }
          }
        }

        if (force) {
          pushToast('GPT Bazaar catalog & live demo orders re-seeded in Firestore');
        }
      } catch (err) {
        console.error('Seed failed:', err);
        setFirestoreError(err instanceof Error ? err.message : 'Failed to initialize Firestore data');
      }
    },
    [pushToast]
  );

  // Real-time Firestore listeners
  useEffect(() => {
    let active = true;

    const boot = async () => {
      if (!seededRef.current) {
        seededRef.current = true;
        await seedInitialData(false);
      }
    };
    void boot();

    const unsubs: (() => void)[] = [];

    unsubs.push(
      onSnapshot(
        query(collection(db, 'categories'), where('schemaVersion', '==', 1)),
        (snap) => {
          if (!active) return;
          const items = snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<Category, 'id'>) }))
            .sort((a, b) => a.sortOrder - b.sortOrder);
          setCategories(items);
          setLoading(false);
        },
        (err) => {
          setFirestoreError(err.message);
          setLoading(false);
          handleFirestoreError(err, OperationType.LIST, 'categories');
        }
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'products'), where('schemaVersion', '==', 1)),
        (snap) => {
          if (!active) return;
          const items = snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }))
            .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          setProducts(items);
        },
        (err) => {
          setFirestoreError(err.message);
          handleFirestoreError(err, OperationType.LIST, 'products');
        }
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'orders'), where('schemaVersion', '==', 1)),
        (snap) => {
          if (!active) return;
          const items = snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<Order, 'id'>) }))
            .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          setOrders(items);
        },
        (err) => {
          setFirestoreError(err.message);
          handleFirestoreError(err, OperationType.LIST, 'orders');
        }
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'coupons'), where('schemaVersion', '==', 1)),
        (snap) => {
          if (!active) return;
          setCoupons(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Coupon, 'id'>) })));
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, 'coupons');
        }
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'notifications'), where('schemaVersion', '==', 1)),
        (snap) => {
          if (!active) return;
          const items = snap.docs
            .map((d) => ({ id: d.id, ...(d.data() as Omit<NotificationItem, 'id'>) }))
            .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          setNotifications(items);
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, 'notifications');
        }
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'stores'), where('schemaVersion', '==', 1)),
        (snap) => {
          if (!active) return;
          setStores(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<StoreHub, 'id'>) })));
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, 'stores');
        }
      )
    );

    return () => {
      active = false;
      unsubs.forEach((u) => u());
    };
  }, [seedInitialData]);

  // Cart & customer handlers
  const addToCart = useCallback(
    (productId: string, variantId?: string, qty = 1) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      const targetVariantId = variantId || product.defaultVariantId || product.variants[0]?.id;
      if (!targetVariantId) return;

      setCart((prev) => {
        const idx = prev.findIndex((i) => i.productId === productId && i.variantId === targetVariantId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + qty, selected: true };
          return next;
        }
        return [...prev, { productId, variantId: targetVariantId, qty, selected: true }];
      });
      pushToast(`Added ${product.name} to cart`);
    },
    [products, pushToast]
  );

  const updateCartQty = useCallback((productId: string, variantId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, qty: item.qty + delta }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  }, []);

  const removeFromCart = useCallback((productId: string, variantId: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.productId === productId && item.variantId === variantId))
    );
  }, []);

  const toggleCartSelected = useCallback((productId: string, variantId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, selected: !item.selected }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlistIds((prev) => {
        const exists = prev.includes(productId);
        if (exists) {
          pushToast('Removed from wishlist', 'info');
          return prev.filter((id) => id !== productId);
        }
        pushToast('Saved to wishlist');
        return [productId, ...prev];
      });
    },
    [pushToast]
  );

  const addAllWishlistToCart = useCallback(() => {
    let added = 0;
    wishlistIds.forEach((pid) => {
      const prod = products.find((p) => p.id === pid && p.isActive);
      if (prod) {
        const vid = prod.defaultVariantId || prod.variants[0]?.id;
        if (vid) {
          setCart((prev) => {
            const idx = prev.findIndex((c) => c.productId === pid && c.variantId === vid);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
              return next;
            }
            return [...prev, { productId: pid, variantId: vid, qty: 1, selected: true }];
          });
          added += 1;
        }
      }
    });
    if (added > 0) pushToast(`Added ${added} saved items to cart`);
  }, [wishlistIds, products, pushToast]);

  const addRecentSearch = useCallback((term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) => [clean, ...prev.filter((t) => t.toLowerCase() !== clean.toLowerCase())].slice(0, 8));
  }, []);

  const clearRecentSearches = useCallback(() => setRecentSearches([]), []);

  const selectAddress = useCallback((id: string) => setSelectedAddressId(id), []);

  const addAddress = useCallback(
    (addr: Omit<DeliveryAddress, 'id'>) => {
      const id = `addr-${Date.now()}`;
      setAddresses((prev) => [
        ...prev.map((a) => (addr.isDefault ? { ...a, isDefault: false } : a)),
        { ...addr, id },
      ]);
      setSelectedAddressId(id);
      pushToast(`${addr.label} address saved`);
    },
    [pushToast]
  );

  const deleteAddress = useCallback(
    (id: string) => {
      setAddresses((prev) => {
        const next = prev.filter((a) => a.id !== id);
        if (selectedAddressId === id && next.length > 0) {
          setSelectedAddressId(next[0].id);
        }
        return next;
      });
      pushToast('Address removed', 'info');
    },
    [selectedAddressId, pushToast]
  );

  // Firestore Mutations
  const placeOrder = useCallback(
    async ({
      customerName,
      customerPhone,
      paymentMethod,
    }: {
      customerName: string;
      customerPhone: string;
      paymentMethod: PaymentMethod;
    }): Promise<Order | null> => {
      const selectedItems = cart.filter((c) => c.selected);
      if (selectedItems.length === 0) {
        pushToast('Select at least one item to checkout', 'warning');
        return null;
      }

      const orderItems = selectedItems
        .map((c) => {
          const prod = products.find((p) => p.id === c.productId);
          const variant = prod?.variants.find((v) => v.id === c.variantId) || prod?.variants[0];
          if (!prod || !variant) return null;
          return {
            productId: prod.id,
            variantId: variant.id,
            name: prod.name,
            variantLabel: variant.label,
            artworkKey: prod.artworkKey || 'fruits_veg',
            imageUrl: prod.imageUrl || '',
            unitPrice: variant.price,
            mrp: variant.mrp,
            qty: c.qty,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);

      if (orderItems.length === 0) return null;

      const itemTotal = orderItems.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
      const mrpTotal = orderItems.reduce((sum, i) => sum + i.mrp * i.qty, 0);
      const coupon = coupons.find((c) => c.code === selectedCouponCode && c.isActive);
      let discount = 0;
      if (coupon && itemTotal >= coupon.minOrderAmount) {
        discount =
          coupon.discountType === 'flat'
            ? coupon.discountValue
            : Math.min(Math.round((itemTotal * coupon.discountValue) / 100), coupon.maxDiscount || 999);
      }
      const deliveryFee = itemTotal >= 149 ? 0 : 25;
      const packagingFee = 5;
      const grandTotal = Math.max(1, itemTotal - discount + deliveryFee + packagingFee);
      const totalSavings = Math.max(0, mrpTotal - itemTotal) + discount + (deliveryFee === 0 ? 25 : 0);

      const address = addresses.find((a) => a.id === selectedAddressId) || addresses[0] || INITIAL_ADDRESSES[0];
      const randomNum = Math.floor(10000000 + Math.random() * 89999999);
      const orderId = `ord-gbt${randomNum}`;
      const orderNumber = `#GBT${randomNum}`;
      const nowIso = new Date().toISOString();

      const newOrderBody: Omit<Order, 'id'> = {
        orderNumber,
        storeId: DEFAULT_STORE_ID,
        customerName: customerName.trim().slice(0, 100) || 'Guest Shopper',
        customerPhone: customerPhone.trim().slice(0, 24) || '+91 98480 12345',
        deliveryAddress: address,
        items: orderItems,
        pricing: {
          itemTotal,
          discount,
          ...(discount > 0 && coupon ? { couponCode: coupon.code } : {}),
          deliveryFee,
          packagingFee,
          grandTotal,
          totalSavings,
        },
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'cod_due' : 'paid',
        status: 'placed',
        statusTimeline: [
          {
            status: 'placed',
            label: 'Order Placed',
            note: 'Order received at Chittoor Hub. Assigning picker now.',
            timestamp: formatNowTime(),
          },
        ],
        deliveryPartner: {
          name: 'Karthik S.',
          rating: 4.8,
          deliveriesCount: 2340,
          phone: '+91 98491 77820',
        },
        etaText: '10–15 mins',
        schemaVersion: 1,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      try {
        await setDoc(doc(db, 'orders', orderId), newOrderBody);

        // Decrement stock in Firestore for ordered variants
        for (const item of orderItems) {
          const prod = products.find((p) => p.id === item.productId);
          if (prod) {
            const updatedVariants = prod.variants.map((v) =>
              v.id === item.variantId ? { ...v, stock: Math.max(0, v.stock - item.qty) } : v
            );
            await updateDoc(doc(db, 'products', prod.id), {
              variants: updatedVariants,
              updatedAt: nowIso,
            });
          }
        }

        // Create real-time notification
        const notifId = `notif-${Date.now()}`;
        await setDoc(doc(db, 'notifications', notifId), {
          category: 'orders',
          title: `Order ${orderNumber} Confirmed!`,
          message: `${orderItems.length} items (₹${grandTotal}) placed. Arriving in 10–15 mins.`,
          orderId,
          artworkKey: 'box',
          isRead: false,
          schemaVersion: 1,
          createdAt: nowIso,
        });

        setCart((prev) => prev.filter((c) => !c.selected));
        pushToast(`Order ${orderNumber} placed! Live tracking active.`);
        return { id: orderId, ...newOrderBody };
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `orders/${orderId}`);
      }
    },
    [cart, products, coupons, selectedCouponCode, addresses, selectedAddressId, pushToast]
  );

  const rateOrder = useCallback(
    async (orderId: string, rating: number) => {
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          rating,
          updatedAt: new Date().toISOString(),
        });
        pushToast(`Rated order ${rating.toFixed(1)}★ — thank you!`);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
      }
    },
    [pushToast]
  );

  const markNotificationRead = useCallback(async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${id}`);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.isRead);
    for (const n of unread) {
      try {
        await updateDoc(doc(db, 'notifications', n.id), { isRead: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `notifications/${n.id}`);
      }
    }
    pushToast('All notifications marked read', 'info');
  }, [notifications, pushToast]);

  const createProduct = useCallback(
    async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'schemaVersion'>) => {
      const slugClean = product.slug
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || `sku-${Date.now()}`;
      const productId = `prod-${slugClean}-${Math.random().toString(36).slice(2, 6)}`;
      const now = new Date().toISOString();
      try {
        await setDoc(doc(db, 'products', productId), {
          ...product,
          slug: slugClean,
          storeId: product.storeId || DEFAULT_STORE_ID,
          schemaVersion: 1,
          createdAt: now,
          updatedAt: now,
        });
        pushToast(`Published "${product.name}" live to Customer App`);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `products/${productId}`);
      }
    },
    [pushToast]
  );

  const updateProduct = useCallback(
    async (productId: string, updates: Partial<Product>) => {
      const { id: _id, createdAt: _createdAt, schemaVersion: _sv, storeId: _sid, rating: _r, reviewCount: _rc, ...safeUpdates } = updates;
      try {
        await updateDoc(doc(db, 'products', productId), {
          ...safeUpdates,
          updatedAt: new Date().toISOString(),
        });
        pushToast('Product updated in real time');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `products/${productId}`);
      }
    },
    [pushToast]
  );

  const deleteProduct = useCallback(
    async (productId: string) => {
      try {
        await deleteDoc(doc(db, 'products', productId));
        pushToast('Product removed from catalog', 'info');
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `products/${productId}`);
      }
    },
    [pushToast]
  );

  const adjustVariantStock = useCallback(
    async (productId: string, variantId: string, delta: number) => {
      const prod = products.find((p) => p.id === productId);
      if (!prod) return;
      const nextVariants = prod.variants.map((v) =>
        v.id === variantId ? { ...v, stock: Math.max(0, v.stock + delta) } : v
      );
      try {
        await updateDoc(doc(db, 'products', productId), {
          variants: nextVariants,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `products/${productId}`);
      }
    },
    [products]
  );

  const toggleProductActive = useCallback(
    async (productId: string, isActive: boolean) => {
      try {
        await updateDoc(doc(db, 'products', productId), {
          isActive,
          updatedAt: new Date().toISOString(),
        });
        pushToast(isActive ? 'Product enabled on storefront' : 'Product hidden from storefront', 'info');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `products/${productId}`);
      }
    },
    [pushToast]
  );

  const createCategory = useCallback(
    async (cat: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'schemaVersion'>) => {
      const slugClean = cat.slug
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || `cat-${Date.now()}`;
      const categoryId = `cat-${slugClean}`;
      const now = new Date().toISOString();
      try {
        await setDoc(doc(db, 'categories', categoryId), {
          ...cat,
          slug: slugClean,
          schemaVersion: 1,
          createdAt: now,
          updatedAt: now,
        });
        pushToast(`Category "${cat.name}" created`);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `categories/${categoryId}`);
      }
    },
    [pushToast]
  );

  const updateCategory = useCallback(
    async (
      categoryId: string,
      updates: Partial<Pick<Category, 'name' | 'subtitle' | 'imageUrl' | 'artworkKey'>>
    ) => {
      try {
        await updateDoc(doc(db, 'categories', categoryId), {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
        pushToast('Category updated in real time');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `categories/${categoryId}`);
      }
    },
    [pushToast]
  );

  const toggleCategoryActive = useCallback(
    async (categoryId: string, isActive: boolean) => {
      try {
        await updateDoc(doc(db, 'categories', categoryId), {
          isActive,
          updatedAt: new Date().toISOString(),
        });
        pushToast(isActive ? 'Category activated' : 'Category paused', 'info');
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `categories/${categoryId}`);
      }
    },
    [pushToast]
  );

  const advanceOrderStatus = useCallback(
    async (orderId: string, nextStatus: OrderStatus) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;
      const nowIso = new Date().toISOString();

      const statusMeta: Record<OrderStatus, { label: string; note: string; eta: string }> = {
        placed: { label: 'Order Placed', note: 'Order confirmed at dark store.', eta: '12–15 mins' },
        packed: { label: 'Packed', note: 'Your items are packed and sealed.', eta: '8–12 mins' },
        out_for_delivery: {
          label: 'Out for Delivery',
          note: `${order.deliveryPartner?.name || 'Karthik S.'} picked up your order and is on the way.`,
          eta: '5–8 mins',
        },
        delivered: { label: 'Delivered', note: 'Order delivered safely to your doorstep.', eta: 'Delivered' },
        cancelled: { label: 'Cancelled', note: 'Order was cancelled by store operations.', eta: 'Cancelled' },
      };

      const meta = statusMeta[nextStatus];
      const nextTimeline = [
        ...order.statusTimeline.filter((e) => e.status !== nextStatus),
        {
          status: nextStatus,
          label: meta.label,
          note: meta.note,
          timestamp: formatNowTime(),
        },
      ];

      try {
        await updateDoc(doc(db, 'orders', orderId), {
          status: nextStatus,
          statusTimeline: nextTimeline,
          etaText: meta.eta,
          paymentStatus:
            nextStatus === 'delivered'
              ? 'paid'
              : nextStatus === 'cancelled'
                ? 'refunded'
                : order.paymentStatus,
          updatedAt: nowIso,
        });

        await setDoc(doc(db, 'notifications', `notif-${Date.now()}`), {
          category: 'orders',
          title: `Order ${order.orderNumber} — ${meta.label}`,
          message: meta.note,
          orderId,
          artworkKey: nextStatus === 'out_for_delivery' ? 'scooter' : 'box',
          isRead: false,
          schemaVersion: 1,
          createdAt: nowIso,
        });

        pushToast(`${order.orderNumber} updated to "${meta.label}"`);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
      }
    },
    [orders, pushToast]
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      categories,
      products,
      orders,
      coupons,
      notifications,
      stores,
      loading,
      firestoreError,
      authUser,
      signInWithGoogle,
      signOutUser,
      cart,
      wishlistIds,
      addresses,
      selectedAddressId,
      selectedCouponCode,
      recentSearches,
      toasts,
      pushToast,
      addToCart,
      updateCartQty,
      removeFromCart,
      toggleCartSelected,
      clearCart,
      setSelectedCouponCode,
      toggleWishlist,
      addAllWishlistToCart,
      addRecentSearch,
      clearRecentSearches,
      selectAddress,
      addAddress,
      deleteAddress,
      placeOrder,
      rateOrder,
      markNotificationRead,
      markAllNotificationsRead,
      createProduct,
      updateProduct,
      deleteProduct,
      adjustVariantStock,
      toggleProductActive,
      createCategory,
      updateCategory,
      toggleCategoryActive,
      advanceOrderStatus,
      seedInitialData,
    }),
    [
      categories,
      products,
      orders,
      coupons,
      notifications,
      stores,
      loading,
      firestoreError,
      authUser,
      signInWithGoogle,
      signOutUser,
      cart,
      wishlistIds,
      addresses,
      selectedAddressId,
      selectedCouponCode,
      recentSearches,
      toasts,
      pushToast,
      addToCart,
      updateCartQty,
      removeFromCart,
      toggleCartSelected,
      clearCart,
      toggleWishlist,
      addAllWishlistToCart,
      addRecentSearch,
      clearRecentSearches,
      selectAddress,
      addAddress,
      deleteAddress,
      placeOrder,
      rateOrder,
      markNotificationRead,
      markAllNotificationsRead,
      createProduct,
      updateProduct,
      deleteProduct,
      adjustVariantStock,
      toggleProductActive,
      createCategory,
      updateCategory,
      toggleCategoryActive,
      advanceOrderStatus,
      seedInitialData,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
