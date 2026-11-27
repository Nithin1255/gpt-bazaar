'use client';

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  API_BASE_URL,
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  fetchAppConfig,
  fetchCategories,
  fetchProducts,
  getWebSocketUrl,
  updateAppConfig,
  updateCategory,
  updateProduct,
  type AppConfigDoc,
  type CategoryDoc,
  type ProductDoc,
  type ProductVariantDoc,
} from '../lib/apiClient';
import { uploadProductImage, validateImageUrl } from '../lib/imageUpload';
import { useRealtimeOrders } from '../hooks/useRealtimeOrders';

type AdminTab = 'products' | 'categories' | 'mobile-app' | 'orders';

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `item-${Date.now()}`
  );
}

export default function AdminHomePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Live WebSocket cache invalidation for catalog updates
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(getWebSocketUrl('catalog'));
      ws.onmessage = () => {
        void queryClient.invalidateQueries({ queryKey: ['products'] });
        void queryClient.invalidateQueries({ queryKey: ['categories'] });
        void queryClient.invalidateQueries({ queryKey: ['app-config'] });
      };
    } catch {
      // TanStack Query handles refetches gracefully even if WS is unavailable
    }
    return () => {
      ws?.close();
    };
  }, [queryClient]);

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const appConfigQuery = useQuery({
    queryKey: ['app-config'],
    queryFn: fetchAppConfig,
  });

  const { orders, loading: ordersLoading, advanceStatus } = useRealtimeOrders();

  const categories = categoriesQuery.data ?? [];
  const products = productsQuery.data ?? [];

  // ==================== PRODUCT FORM STATE ====================
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('GPT Farm Direct');
  const [tagline, setTagline] = useState('Farm Fresh • Delivered in Minutes');
  const [categoryId, setCategoryId] = useState('cat-fruits-veg');
  const [dietaryType, setDietaryType] = useState<'veg' | 'non_veg' | 'none'>('veg');
  const [packLabel, setPackLabel] = useState('500 g');
  const [price, setPrice] = useState('45');
  const [mrp, setMrp] = useState('55');
  const [stock, setStock] = useState('50');
  const [isPopular, setIsPopular] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (categories.length > 0 && !categories.some((c) => c.id === categoryId)) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const resetProductForm = () => {
    setEditingId(null);
    setName('');
    setBrand('GPT Farm Direct');
    setTagline('Farm Fresh • Delivered in Minutes');
    setCategoryId(categories[0]?.id || 'cat-fruits-veg');
    setDietaryType('veg');
    setPackLabel('500 g');
    setPrice('45');
    setMrp('55');
    setStock('50');
    setIsPopular(true);
    setImageUrl('');
  };

  const saveProductMutation = useMutation({
    mutationFn: async () => {
      const normalizedUrl = validateImageUrl(imageUrl);
      const slug = slugify(name);
      const sellingPrice = Math.max(1, Number(price) || 1);
      const maxRetail = Math.max(sellingPrice, Number(mrp) || sellingPrice);
      const stockNum = Math.max(0, Number(stock) || 0);
      const discountPercent = Math.round(((maxRetail - sellingPrice) / maxRetail) * 100);

      if (editingId) {
        const existing = products.find((p) => p.id === editingId);
        const existingVariants = existing?.variants || [];
        const updatedVariants: ProductVariantDoc[] =
          existingVariants.length > 0
            ? existingVariants.map((v, idx) =>
                idx === 0
                  ? {
                      ...v,
                      label: packLabel.trim() || v.label,
                      price: sellingPrice,
                      mrp: maxRetail,
                      discountPercent,
                      stock: stockNum,
                    }
                  : v
              )
            : [
                {
                  id: 'v-default',
                  label: packLabel.trim() || '500 g',
                  unitValue: 500,
                  unit: 'g',
                  price: sellingPrice,
                  mrp: maxRetail,
                  discountPercent,
                  stock: stockNum,
                  sku: `GBT-${Math.floor(1000 + Math.random() * 9000)}`,
                },
              ];

        await updateProduct(editingId, {
          name: name.trim().slice(0, 140),
          slug,
          brand: brand.trim() || 'GPT Farm Direct',
          tagline: tagline.trim() || 'Farm Fresh • Delivered in Minutes',
          categoryId,
          dietaryType,
          isPopular,
          imageUrl: normalizedUrl,
          variants: updatedVariants,
          defaultVariantId: updatedVariants[0].id,
        });
        return `Updated "${name.trim()}" in Supabase.`;
      }

      await createProduct({
        name: name.trim().slice(0, 140),
        slug,
        brand: brand.trim() || 'GPT Farm Direct',
        tagline: tagline.trim() || 'Farm Fresh • Delivered in Minutes',
        categoryId,
        subcategory: 'Daily Essentials',
        description: 'Quality-checked daily essential packed hygienically.',
        keyFeatures: ['Farm fresh & handpicked'],
        dietaryType,
        artworkKey: 'tomato',
        imageUrl: normalizedUrl,
        variants: [
          {
            id: 'v-default',
            label: packLabel.trim() || '500 g',
            unitValue: 500,
            unit: 'g',
            price: sellingPrice,
            mrp: maxRetail,
            discountPercent,
            stock: stockNum,
            sku: `GBT-${Math.floor(1000 + Math.random() * 9000)}`,
          },
        ],
        defaultVariantId: 'v-default',
        isPopular,
        isTrending: false,
        isActive: true,
        storeId: 'store-chittoor-hub-1',
        tags: [name.trim().toLowerCase()],
      });
      return `Published "${name.trim()}" to Supabase.`;
    },
    onSuccess: (msg) => {
      setError(null);
      setNotice(msg);
      resetProductForm();
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to save product.');
    },
  });

  const toggleProductMutation = useMutation({
    mutationFn: (prod: ProductDoc) => updateProduct(prod.id, { isActive: !prod.isActive }),
    onSuccess: (_data, prod) => {
      setNotice(!prod.isActive ? `"${prod.name}" is now Live on Mobile.` : `"${prod.name}" hidden from Mobile.`);
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to toggle visibility.');
    },
  });

  const adjustStockMutation = useMutation({
    mutationFn: ({ prod, delta }: { prod: ProductDoc; delta: number }) => {
      const updatedVariants = prod.variants.map((v, idx) =>
        idx === 0 ? { ...v, stock: Math.max(0, v.stock + delta) } : v
      );
      return updateProduct(prod.id, { variants: updatedVariants });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to adjust stock.');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (prod: ProductDoc) => deleteProduct(prod.id),
    onSuccess: (_data, prod) => {
      if (editingId === prod.id) resetProductForm();
      setNotice(`Deleted "${prod.name}".`);
      void queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to delete product.');
    },
  });

  const handleProductFileUpload = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadProductImage(file, name || 'product', 'products');
      setImageUrl(url);
      setNotice('Product image uploaded through FastAPI to Supabase Storage.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleStartEditProduct = (prod: ProductDoc) => {
    const v = prod.variants.find((x) => x.id === prod.defaultVariantId) || prod.variants[0];
    setEditingId(prod.id);
    setName(prod.name);
    setBrand(prod.brand || 'GPT Farm Direct');
    setTagline(prod.tagline || '');
    setCategoryId(prod.categoryId || 'cat-fruits-veg');
    setDietaryType(prod.dietaryType || 'veg');
    setPackLabel(v?.label || '500 g');
    setPrice(String(v?.price ?? 45));
    setMrp(String(v?.mrp ?? 55));
    setStock(String(v?.stock ?? 0));
    setIsPopular(Boolean(prod.isPopular));
    setImageUrl(prod.imageUrl || '');
    setError(null);
    setNotice(`Editing "${prod.name}"`);
  };

  // ==================== CATEGORY FORM STATE ====================
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catSubtitle, setCatSubtitle] = useState('');
  const [catBgTint, setCatBgTint] = useState('#EEF9F0');
  const [catSortOrder, setCatSortOrder] = useState('5');
  const [catSubcategories, setCatSubcategories] = useState('All');
  const [catImageUrl, setCatImageUrl] = useState('');
  const [catIsActive, setCatIsActive] = useState(true);
  const [catUploading, setCatUploading] = useState(false);

  const resetCategoryForm = () => {
    setEditingCatId(null);
    setCatName('');
    setCatSubtitle('');
    setCatBgTint('#EEF9F0');
    setCatSortOrder(String(categories.length + 1));
    setCatSubcategories('All');
    setCatImageUrl('');
    setCatIsActive(true);
  };

  const handleStartEditCategory = (cat: CategoryDoc) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatSubtitle(cat.subtitle || '');
    setCatBgTint(cat.bgTint || '#EEF9F0');
    setCatSortOrder(String(cat.sortOrder ?? 0));
    setCatSubcategories((cat.subcategories || ['All']).join(', '));
    setCatImageUrl(cat.imageUrl || '');
    setCatIsActive(Boolean(cat.isActive));
    setError(null);
    setNotice(`Editing category "${cat.name}"`);
  };

  const saveCategoryMutation = useMutation({
    mutationFn: async () => {
      const cleanName = catName.trim();
      const cleanSlug = slugify(cleanName);
      const duplicate = categories.find(
        (c) =>
          c.id !== editingCatId &&
          (c.name.trim().toLowerCase() === cleanName.toLowerCase() ||
            c.slug.trim().toLowerCase() === cleanSlug)
      );
      if (duplicate) {
        throw new Error(
          `Category "${duplicate.name}" already exists. Duplicate categories are not allowed.`
        );
      }

      const parsedSubs = catSubcategories
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 12);

      const payload = {
        name: cleanName,
        slug: cleanSlug,
        subtitle: catSubtitle.trim(),
        artworkKey: 'fruits_veg',
        imageUrl: validateImageUrl(catImageUrl),
        bgTint: catBgTint.trim() || '#EEF9F0',
        subcategories: parsedSubs.length > 0 ? parsedSubs : ['All'],
        sortOrder: Math.max(0, Number(catSortOrder) || 0),
        isActive: catIsActive,
      };

      if (editingCatId) {
        const updated = await updateCategory(editingCatId, payload);
        return { mode: 'update' as const, category: updated };
      }
      const created = await createCategory(payload);
      return { mode: 'create' as const, category: created };
    },
    onSuccess: ({ mode, category }) => {
      setError(null);
      setNotice(
        mode === 'update'
          ? `Updated category "${category.name}" in Supabase.`
          : `Category "${category.name}" published to Supabase.`
      );
      resetCategoryForm();
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to save category.');
    },
  });

  const toggleCategoryMutation = useMutation({
    mutationFn: (cat: CategoryDoc) => updateCategory(cat.id, { isActive: !cat.isActive }),
    onSuccess: (_data, cat) => {
      setError(null);
      setNotice(
        !cat.isActive
          ? `Category "${cat.name}" is now Live.`
          : `Category "${cat.name}" hidden from storefront.`
      );
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to toggle category visibility.');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (cat: CategoryDoc) => deleteCategory(cat.id),
    onSuccess: (_data, cat) => {
      if (editingCatId === cat.id) resetCategoryForm();
      setError(null);
      setNotice(`Deleted category "${cat.name}".`);
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to delete category.');
    },
  });

  const handleCategoryFileUpload = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setCatUploading(true);
    try {
      const url = await uploadProductImage(file, catName || 'category', 'categories');
      setCatImageUrl(url);
      setNotice('Category image uploaded through FastAPI to Supabase Storage.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Category image upload failed.');
    } finally {
      setCatUploading(false);
    }
  };

  // ==================== MOBILE APP CONFIG STATE ====================
  const [cfgForm, setCfgForm] = useState<Partial<AppConfigDoc>>({});

  useEffect(() => {
    if (appConfigQuery.data) {
      setCfgForm(appConfigQuery.data);
    }
  }, [appConfigQuery.data]);

  const saveAppConfigMutation = useMutation({
    mutationFn: () =>
      updateAppConfig({
        storeName: cfgForm.storeName,
        hubCity: cfgForm.hubCity,
        pincode: cfgForm.pincode,
        deliveryEtaText: cfgForm.deliveryEtaText,
        isStoreOpen: cfgForm.isStoreOpen,
        heroBadge: cfgForm.heroBadge,
        heroTitle: cfgForm.heroTitle,
        heroSubtitle: cfgForm.heroSubtitle,
        dealBannerTitle: cfgForm.dealBannerTitle,
        dealBannerSubtitle: cfgForm.dealBannerSubtitle,
        freeDeliveryThreshold: Number(cfgForm.freeDeliveryThreshold ?? 149),
        deliveryFee: Number(cfgForm.deliveryFee ?? 25),
        packagingFee: Number(cfgForm.packagingFee ?? 5),
      }),
    onSuccess: () => {
      setError(null);
      setNotice('Mobile app storefront configuration saved to Supabase.');
      void queryClient.invalidateQueries({ queryKey: ['app-config'] });
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to save app config.');
    },
  });

  const anyBackendError =
    error ||
    (productsQuery.error instanceof Error ? productsQuery.error.message : null) ||
    (categoriesQuery.error instanceof Error ? categoriesQuery.error.message : null);

  return (
    <main className="min-h-screen bg-[#F6F8F7] p-4 sm:p-8 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4EBE6] pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#074220]">GPT Bazaar Admin Console</h1>
            <p className="text-sm text-slate-600">
              FastAPI + Supabase PostgreSQL &amp; Storage ({API_BASE_URL})
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0E6F2D] bg-[#EDF8F0] border border-[#CBE7D5] rounded-full px-3 py-1.5">
            <span>{products.length} Products</span>
            <span>·</span>
            <span>{categories.length} Categories</span>
            <span>·</span>
            <span>{orders.length} Orders</span>
          </div>
        </header>

        {/* Accessible Tabs */}
        <div
          role="tablist"
          aria-label="Admin sections"
          className="flex overflow-x-auto border-b border-[#E4EBE6] bg-white rounded-t-xl px-2"
        >
          {(
            [
              ['products', 'Products & Images'],
              ['categories', 'Categories'],
              ['mobile-app', 'Mobile App Control'],
              ['orders', `Live Orders (${orders.length})`],
            ] as const
          ).map(([tabId, label]) => {
            const selected = activeTab === tabId;
            return (
              <button
                key={tabId}
                type="button"
                role="tab"
                id={`tab-${tabId}`}
                aria-selected={selected}
                onClick={() => setActiveTab(tabId)}
                className={`admin-tab shrink-0 px-4 py-3 text-sm font-bold transition-colors ${
                  selected ? 'text-[#0E6F2D]' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Live Status Banner */}
        <div role="status" aria-live="polite" className="space-y-2">
          {anyBackendError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700">
              {anyBackendError}
            </p>
          )}
          {notice && (
            <p className="rounded-lg border border-[#CBE7D5] bg-[#EDF8F0] px-4 py-2.5 text-xs font-semibold text-[#0E6F2D]">
              {notice}
            </p>
          )}
        </div>

        {/* TAB 1: PRODUCTS & IMAGES */}
        <section
          role="tabpanel"
          aria-labelledby="tab-products"
          hidden={activeTab !== 'products'}
          className="space-y-6"
        >
          <div className="rounded-xl border border-[#E4EBE6] bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="product-form-heading" className="text-base font-bold text-slate-900">
                {editingId ? 'Edit Product' : 'Add Product & Upload Image'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={resetProductForm}
                  className="admin-btn text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form
              aria-labelledby="product-form-heading"
              onSubmit={(e) => {
                e.preventDefault();
                if (!name.trim() || uploading || saveProductMutation.isPending) return;
                saveProductMutation.mutate();
              }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              <div className="flex flex-col gap-1">
                <label htmlFor="prod-name" className="text-xs font-bold text-slate-700">
                  Product Name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="prod-name"
                  name="name"
                  type="text"
                  required
                  maxLength={140}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Organic Spinach"
                  className="admin-input h-11 rounded-lg border border-slate-300 px-3 text-base sm:text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="prod-category" className="text-xs font-bold text-slate-700">
                  Category <span aria-hidden="true">*</span>
                </label>
                <select
                  id="prod-category"
                  name="categoryId"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="admin-select h-11 rounded-lg border border-slate-300 bg-white px-3 text-base sm:text-sm"
                >
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  ) : (
                    <option value="cat-fruits-veg">Fruits &amp; Veg</option>
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="prod-brand" className="text-xs font-bold text-slate-700">
                  Brand
                </label>
                <input
                  id="prod-brand"
                  name="brand"
                  type="text"
                  maxLength={80}
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="admin-input h-11 rounded-lg border border-slate-300 px-3 text-base sm:text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="prod-tagline" className="text-xs font-bold text-slate-700">
                  Tagline
                </label>
                <input
                  id="prod-tagline"
                  name="tagline"
                  type="text"
                  maxLength={160}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="admin-input h-11 rounded-lg border border-slate-300 px-3 text-base sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:col-span-2">
                <div className="flex flex-col gap-1">
                  <label htmlFor="prod-pack" className="text-xs font-bold text-slate-700">
                    Pack Label
                  </label>
                  <input
                    id="prod-pack"
                    name="packLabel"
                    type="text"
                    required
                    value={packLabel}
                    onChange={(e) => setPackLabel(e.target.value)}
                    className="admin-input h-11 w-full rounded-lg border border-slate-300 px-2.5 text-base sm:text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="prod-price" className="text-xs font-bold text-slate-700">
                    Price (₹)
                  </label>
                  <input
                    id="prod-price"
                    name="price"
                    type="number"
                    min={1}
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="admin-input h-11 w-full rounded-lg border border-slate-300 px-2.5 text-base sm:text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="prod-mrp" className="text-xs font-bold text-slate-700">
                    MRP (₹)
                  </label>
                  <input
                    id="prod-mrp"
                    name="mrp"
                    type="number"
                    min={1}
                    required
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    className="admin-input h-11 w-full rounded-lg border border-slate-300 px-2.5 text-base sm:text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="prod-stock" className="text-xs font-bold text-slate-700">
                    Stock
                  </label>
                  <input
                    id="prod-stock"
                    name="stock"
                    type="number"
                    min={0}
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="admin-input h-11 w-full rounded-lg border border-slate-300 px-2.5 text-base sm:text-sm"
                  />
                </div>
              </div>

              <fieldset className="flex flex-wrap items-center gap-4 border border-slate-200 rounded-lg px-3 py-2">
                <legend className="px-1 text-xs font-bold text-slate-700">Dietary Type</legend>
                {(['veg', 'non_veg', 'none'] as const).map((dt) => (
                  <label key={dt} className="inline-flex items-center gap-1.5 text-xs font-medium">
                    <input
                      type="radio"
                      name="dietaryType"
                      value={dt}
                      checked={dietaryType === dt}
                      onChange={() => setDietaryType(dt)}
                      className="accent-[#0E6F2D]"
                    />
                    {dt === 'veg' ? 'Veg' : dt === 'non_veg' ? 'Non-Veg' : 'None'}
                  </label>
                ))}
              </fieldset>

              <div className="flex items-center gap-3 px-2">
                <input
                  id="prod-popular"
                  name="isPopular"
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="h-4 w-4 accent-[#0E6F2D]"
                />
                <label htmlFor="prod-popular" className="text-xs font-bold text-slate-700">
                  Feature in Mobile &ldquo;Popular near you&rdquo; carousel
                </label>
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label htmlFor="prod-image-url" className="text-xs font-bold text-slate-700">
                  Product Image (Upload via FastAPI to Supabase Storage, or paste HTTPS URL)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    id="prod-image-file"
                    name="imageFile"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={uploading}
                    onChange={(e) => void handleProductFileUpload(e.target.files?.[0])}
                    className="text-xs text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-[#EDF8F0] file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#0E6F2D]"
                  />
                  <input
                    id="prod-image-url"
                    name="imageUrl"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://<project>.supabase.co/storage/v1/object/public/catalog-images/..."
                    className="admin-input h-11 flex-1 min-w-55 rounded-lg border border-slate-300 px-3 text-base sm:text-sm"
                  />
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Product preview"
                      className="h-11 w-11 rounded-lg border border-slate-200 object-contain bg-slate-50"
                    />
                  )}
                </div>
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={uploading || saveProductMutation.isPending}
                  className="admin-btn h-11 rounded-lg bg-[#0E6F2D] px-6 text-sm font-bold text-white hover:bg-[#0A5823] disabled:bg-slate-300"
                >
                  {uploading
                    ? 'Uploading image...'
                    : saveProductMutation.isPending
                      ? 'Saving to Firebase...'
                      : editingId
                        ? 'Save Product Update'
                        : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>

          {/* Responsive Product Catalog Table */}
          <div className="rounded-xl border border-[#E4EBE6] bg-white">
            <div className="px-5 py-4 border-b border-[#E4EBE6] flex items-center justify-between">
              <h2 id="products-table-caption" className="text-base font-bold text-slate-900">
                Product Catalog ({products.length})
              </h2>
            </div>

            {productsQuery.isLoading ? (
              <p className="p-6 text-sm text-slate-500">Loading products from FastAPI...</p>
            ) : products.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">No products yet. Publish one above.</p>
            ) : (
              <div
                tabIndex={0}
                role="region"
                aria-labelledby="products-table-caption"
                className="table-wrapper"
              >
                <table className="responsive-table text-left text-xs">
                  <thead className="border-b border-[#E4EBE6] text-slate-600">
                    <tr>
                      <th scope="col" className="px-4 py-3">Product</th>
                      <th scope="col" className="px-3 py-3">Category</th>
                      <th scope="col" className="px-3 py-3">Pack</th>
                      <th scope="col" className="px-3 py-3 text-right">Price</th>
                      <th scope="col" className="px-3 py-3 text-right">Stock</th>
                      <th scope="col" className="px-3 py-3">Status</th>
                      <th scope="col" className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF3EF]">
                    {products.map((prod) => {
                      const v =
                        prod.variants.find((x) => x.id === prod.defaultVariantId) || prod.variants[0];
                      const catName =
                        categories.find((c) => c.id === prod.categoryId)?.name || prod.categoryId;
                      return (
                        <tr key={prod.id} className="hover:bg-[#FAFBF9]">
                          <th scope="row" className="px-4 py-3 font-semibold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              {prod.imageUrl ? (
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.name}
                                  className="h-9 w-9 rounded-lg border border-slate-200 object-contain bg-slate-50 shrink-0"
                                />
                              ) : (
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EDF8F0] text-[10px] font-bold text-[#0E6F2D]">
                                  SKU
                                </div>
                              )}
                              <span>{prod.name}</span>
                            </div>
                          </th>
                          <td data-label="Category" className="px-3 py-3 text-slate-600">
                            {catName}
                          </td>
                          <td data-label="Pack" className="px-3 py-3 text-slate-600">
                            {v?.label || '-'}
                          </td>
                          <td data-label="Price" className="px-3 py-3 text-right font-mono">
                            ₹{v?.price ?? 0}
                          </td>
                          <td data-label="Stock" className="px-3 py-3 text-right font-mono">
                            <span className="mr-2">{v?.stock ?? 0}</span>
                            <button
                              type="button"
                              onClick={() => adjustStockMutation.mutate({ prod, delta: -1 })}
                              className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] hover:bg-slate-100"
                            >
                              -1
                            </button>
                            <button
                              type="button"
                              onClick={() => adjustStockMutation.mutate({ prod, delta: 10 })}
                              className="ml-1 rounded bg-[#EDF8F0] px-1.5 py-0.5 text-[10px] font-bold text-[#0E6F2D]"
                            >
                              +10
                            </button>
                          </td>
                          <td data-label="Status" className="px-3 py-3">
                            <span
                              className={
                                prod.isActive ? 'font-semibold text-[#0E6F2D]' : 'text-slate-400'
                              }
                            >
                              {prod.isActive ? 'Live' : 'Hidden'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleStartEditProduct(prod)}
                              className="rounded-md border border-slate-200 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleProductMutation.mutate(prod)}
                              className="rounded-md border border-slate-200 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              {prod.isActive ? 'Hide' : 'Show'}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProductMutation.mutate(prod)}
                              className="rounded-md border border-red-200 px-2.5 py-1 font-semibold text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* TAB 2: CATEGORIES */}
        <section
          role="tabpanel"
          aria-labelledby="tab-categories"
          hidden={activeTab !== 'categories'}
          className="space-y-6"
        >
          <div className="rounded-xl border border-[#E4EBE6] bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="category-form-heading" className="text-base font-bold text-slate-900">
                {editingCatId ? 'Edit Category' : 'Add Storefront Category'}
              </h2>
              {editingCatId && (
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="admin-btn text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel Edit
                </button>
              )}
            </div>
            <form
              aria-labelledby="category-form-heading"
              onSubmit={(e) => {
                e.preventDefault();
                if (!catName.trim() || catUploading || saveCategoryMutation.isPending) return;
                saveCategoryMutation.mutate();
              }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              <div className="flex flex-col gap-1">
                <label htmlFor="cat-name" className="text-xs font-bold text-slate-700">
                  Category Name <span aria-hidden="true">*</span>
                </label>
                <input
                  id="cat-name"
                  name="catName"
                  type="text"
                  required
                  maxLength={80}
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Snacks & Beverages"
                  className="admin-input h-11 rounded-lg border border-slate-300 px-3 text-base sm:text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="cat-subtitle" className="text-xs font-bold text-slate-700">
                  Subtitle
                </label>
                <input
                  id="cat-subtitle"
                  name="catSubtitle"
                  type="text"
                  maxLength={160}
                  value={catSubtitle}
                  onChange={(e) => setCatSubtitle(e.target.value)}
                  placeholder="e.g. Chips, biscuits & chilled drinks"
                  className="admin-input h-11 rounded-lg border border-slate-300 px-3 text-base sm:text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="cat-tint" className="text-xs font-bold text-slate-700">
                  Card Background Tint
                </label>
                <input
                  id="cat-tint"
                  name="catBgTint"
                  type="text"
                  value={catBgTint}
                  onChange={(e) => setCatBgTint(e.target.value)}
                  className="admin-input h-11 rounded-lg border border-slate-300 px-3 text-base sm:text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="cat-order" className="text-xs font-bold text-slate-700">
                  Sort Order
                </label>
                <input
                  id="cat-order"
                  name="catSortOrder"
                  type="number"
                  min={0}
                  max={1000}
                  value={catSortOrder}
                  onChange={(e) => setCatSortOrder(e.target.value)}
                  className="admin-input h-11 rounded-lg border border-slate-300 px-3 text-base sm:text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="cat-subs" className="text-xs font-bold text-slate-700">
                  Subcategories (comma-separated)
                </label>
                <input
                  id="cat-subs"
                  name="catSubcategories"
                  type="text"
                  value={catSubcategories}
                  onChange={(e) => setCatSubcategories(e.target.value)}
                  placeholder="All, Fruits, Vegetables"
                  className="admin-input h-11 rounded-lg border border-slate-300 px-3 text-base sm:text-sm"
                />
              </div>
              <div className="flex items-center gap-3 px-2 sm:pt-5">
                <input
                  id="cat-active"
                  name="catIsActive"
                  type="checkbox"
                  checked={catIsActive}
                  onChange={(e) => setCatIsActive(e.target.checked)}
                  className="h-4 w-4 accent-[#0E6F2D]"
                />
                <label htmlFor="cat-active" className="text-xs font-bold text-slate-700">
                  Active on Mobile Storefront
                </label>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label htmlFor="cat-image-url" className="text-xs font-bold text-slate-700">
                  Category Image (Upload via FastAPI or HTTPS URL)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    id="cat-image-file"
                    name="catImageFile"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={catUploading}
                    onChange={(e) => void handleCategoryFileUpload(e.target.files?.[0])}
                    className="text-xs text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-[#EDF8F0] file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#0E6F2D]"
                  />
                  <input
                    id="cat-image-url"
                    name="catImageUrl"
                    type="url"
                    value={catImageUrl}
                    onChange={(e) => setCatImageUrl(e.target.value)}
                    placeholder="https://<project>.supabase.co/storage/v1/object/public/catalog-images/..."
                    className="admin-input h-11 flex-1 min-w-55 rounded-lg border border-slate-300 px-3 text-base sm:text-sm"
                  />
                  {catImageUrl && (
                    <img
                      src={catImageUrl}
                      alt="Category preview"
                      className="h-11 w-11 rounded-lg border border-slate-200 object-cover bg-slate-50"
                    />
                  )}
                </div>
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={catUploading || saveCategoryMutation.isPending}
                  className="admin-btn h-11 rounded-lg bg-[#0E6F2D] px-6 text-sm font-bold text-white disabled:bg-slate-300"
                >
                  {catUploading
                    ? 'Uploading...'
                    : saveCategoryMutation.isPending
                      ? 'Saving...'
                      : editingCatId
                        ? 'Save Category Update'
                        : 'Add Category'}
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => {
              const productCount = products.filter((p) => p.categoryId === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#E4EBE6] bg-white p-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 object-cover"
                      />
                    ) : (
                      <div
                        className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 flex items-center justify-center text-xs font-bold text-[#0E6F2D]"
                        style={{ backgroundColor: cat.bgTint || '#EEF9F0' }}
                      >
                        #{cat.sortOrder}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-bold text-slate-900">{cat.name}</span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            cat.isActive
                              ? 'bg-[#EDF8F0] text-[#0E6F2D]'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {cat.isActive ? 'Live' : 'Hidden'}
                        </span>
                      </div>
                      <div className="truncate text-xs text-slate-500">
                        {cat.subtitle || cat.slug} · {productCount} product{productCount === 1 ? '' : 's'}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStartEditCategory(cat)}
                      className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleCategoryMutation.mutate(cat)}
                      className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      {cat.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCategoryMutation.mutate(cat)}
                      className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* TAB 3: MOBILE APP CONTROL */}
        <section
          role="tabpanel"
          aria-labelledby="tab-mobile-app"
          hidden={activeTab !== 'mobile-app'}
          className="rounded-xl border border-[#E4EBE6] bg-white p-5 space-y-4"
        >
          <h2 id="mobile-config-heading" className="text-base font-bold text-slate-900">
            Mobile Storefront &amp; Delivery Settings
          </h2>
          <p className="text-xs text-slate-600">
            Changes saved here update the Expo Mobile App home banner, hub availability, and delivery fees in Firebase.
          </p>
          <form
            aria-labelledby="mobile-config-heading"
            onSubmit={(e) => {
              e.preventDefault();
              saveAppConfigMutation.mutate();
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="flex flex-col gap-1">
              <label htmlFor="cfg-store" className="text-xs font-bold text-slate-700">
                Store Hub Name
              </label>
              <input
                id="cfg-store"
                name="storeName"
                type="text"
                required
                value={cfgForm.storeName || ''}
                onChange={(e) => setCfgForm((p) => ({ ...p, storeName: e.target.value }))}
                className="admin-input h-11 rounded-lg border border-slate-300 px-3 text-base sm:text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="cfg-eta" className="text-xs font-bold text-slate-700">
                Delivery ETA Text
              </label>
              <input
                id="cfg-eta"
                name="deliveryEtaText"
                type="text"
                required
                value={cfgForm.deliveryEtaText || ''}
                onChange={(e) => setCfgForm((p) => ({ ...p, deliveryEtaText: e.target.value }))}
                className="admin-input h-11 rounded-lg border border-slate-300 px-3 text-base sm:text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="cfg-badge" className="text-xs font-bold text-slate-700">
                Hero Offer Badge
              </label>
              <input
                id="cfg-badge"
                name="heroBadge"
                type="text"
                value={cfgForm.heroBadge || ''}
                onChange={(e) => setCfgForm((p) => ({ ...p, heroBadge: e.target.value }))}
                className="admin-input h-11 rounded-lg border border-slate-300 px-3 text-base sm:text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="cfg-hero-title" className="text-xs font-bold text-slate-700">
                Hero Banner Title
              </label>
              <input
                id="cfg-hero-title"
                name="heroTitle"
                type="text"
                value={cfgForm.heroTitle || ''}
                onChange={(e) => setCfgForm((p) => ({ ...p, heroTitle: e.target.value }))}
                className="admin-input h-11 rounded-lg border border-slate-300 px-3 text-base sm:text-sm"
              />
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label htmlFor="cfg-hero-sub" className="text-xs font-bold text-slate-700">
                Hero Banner Subtitle
              </label>
              <input
                id="cfg-hero-sub"
                name="heroSubtitle"
                type="text"
                value={cfgForm.heroSubtitle || ''}
                onChange={(e) => setCfgForm((p) => ({ ...p, heroSubtitle: e.target.value }))}
                className="admin-input h-11 rounded-lg border border-slate-300 px-3 text-base sm:text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="cfg-deal-title" className="text-xs font-bold text-slate-700">
                Deal Strip Title
              </label>
              <input
                id="cfg-deal-title"
                name="dealBannerTitle"
                type="text"
                value={cfgForm.dealBannerTitle || ''}
                onChange={(e) => setCfgForm((p) => ({ ...p, dealBannerTitle: e.target.value }))}
                className="admin-input h-11 rounded-lg border border-slate-300 px-3 text-base sm:text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="cfg-deal-sub" className="text-xs font-bold text-slate-700">
                Deal Strip Subtitle
              </label>
              <input
                id="cfg-deal-sub"
                name="dealBannerSubtitle"
                type="text"
                value={cfgForm.dealBannerSubtitle || ''}
                onChange={(e) => setCfgForm((p) => ({ ...p, dealBannerSubtitle: e.target.value }))}
                className="admin-input h-11 rounded-lg border border-slate-300 px-3 text-base sm:text-sm"
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                id="cfg-open"
                name="isStoreOpen"
                type="checkbox"
                checked={Boolean(cfgForm.isStoreOpen ?? true)}
                onChange={(e) => setCfgForm((p) => ({ ...p, isStoreOpen: e.target.checked }))}
                className="h-4 w-4 accent-[#0E6F2D]"
              />
              <label htmlFor="cfg-open" className="text-xs font-bold text-slate-700">
                Store Hub is Open for Mobile Orders
              </label>
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saveAppConfigMutation.isPending}
                className="admin-btn h-11 rounded-lg bg-[#0E6F2D] px-6 text-sm font-bold text-white disabled:bg-slate-300"
              >
                {saveAppConfigMutation.isPending ? 'Saving...' : 'Save Mobile App Settings'}
              </button>
            </div>
          </form>
        </section>

        {/* TAB 4: LIVE ORDERS */}
        <section
          role="tabpanel"
          aria-labelledby="tab-orders"
          hidden={activeTab !== 'orders'}
          className="space-y-3"
        >
          <h2 className="text-base font-bold text-slate-900">Live Customer Orders</h2>
          {ordersLoading ? (
            <p className="text-sm text-slate-500">Loading orders from FastAPI...</p>
          ) : orders.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
              No orders placed yet. Orders from the Expo mobile app will appear here in real time.
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E4EBE6] bg-white p-4"
                >
                  <div>
                    <div className="font-mono text-sm font-bold">
                      {ord.orderNumber} · ₹{ord.pricing.grandTotal}
                    </div>
                    <div className="text-xs text-slate-600">
                      {ord.customerName} · {ord.items.length} item(s) · Status:{' '}
                      <span className="font-semibold">{ord.status}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {ord.status === 'placed' && (
                      <button
                        type="button"
                        onClick={() => void advanceStatus(ord.id, 'packed')}
                        className="rounded-lg bg-[#0E6F2D] px-3 py-2 text-xs font-semibold text-white"
                      >
                        Mark Packed
                      </button>
                    )}
                    {ord.status === 'packed' && (
                      <button
                        type="button"
                        onClick={() => void advanceStatus(ord.id, 'out_for_delivery')}
                        className="rounded-lg bg-[#0E6F2D] px-3 py-2 text-xs font-semibold text-white"
                      >
                        Dispatch Rider
                      </button>
                    )}
                    {ord.status === 'out_for_delivery' && (
                      <button
                        type="button"
                        onClick={() => void advanceStatus(ord.id, 'delivered')}
                        className="rounded-lg bg-[#0E6F2D] px-3 py-2 text-xs font-semibold text-white"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
