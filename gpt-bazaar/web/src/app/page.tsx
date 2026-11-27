'use client';

import React, { useEffect, useState } from 'react';
import { uploadProductImage, validateImageUrl } from '../lib/imageUpload';
import {
  API_BASE_URL,
  createProductRecord,
  DATA_SOURCE,
  deleteProductRecord,
  fetchProductsOnce,
  subscribeCategories,
  subscribeProducts,
  updateProductRecord,
  type CategoryDoc,
  type ProductDoc,
  type ProductVariantDoc,
} from '../lib/productsApi';
import { useRealtimeOrders } from '../hooks/useRealtimeOrders';

export default function AdminHomePage() {
  const { orders, loading: ordersLoading, advanceStatus } = useRealtimeOrders();
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('cat-fruits-veg');
  const [packLabel, setPackLabel] = useState('500 g');
  const [price, setPrice] = useState('45');
  const [mrp, setMrp] = useState('55');
  const [stock, setStock] = useState('50');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadPct, setUploadPct] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const unsubCats = subscribeCategories(
      (list) => {
        setCategories(list);
        if (list.length > 0) {
          setCategoryId((prev) => prev || list[0].id);
        }
      },
      () => {}
    );
    const unsubProds = subscribeProducts(
      (list) => {
        setProducts(list);
        setProductsLoading(false);
      },
      (msg) => {
        setError(msg);
        setProductsLoading(false);
      }
    );
    return () => {
      unsubCats();
      unsubProds();
    };
  }, []);

  const refreshIfApi = async () => {
    if (DATA_SOURCE === 'api') {
      const fresh = await fetchProductsOnce();
      setProducts(fresh);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategoryId(categories[0]?.id || 'cat-fruits-veg');
    setPackLabel('500 g');
    setPrice('45');
    setMrp('55');
    setStock('50');
    setImageUrl('');
  };

  const handleStartEdit = (prod: ProductDoc) => {
    const v = prod.variants.find((x) => x.id === prod.defaultVariantId) || prod.variants[0];
    setEditingId(prod.id);
    setName(prod.name);
    setCategoryId(prod.categoryId || 'cat-fruits-veg');
    setPackLabel(v?.label || '500 g');
    setPrice(String(v?.price ?? 45));
    setMrp(String(v?.mrp ?? 55));
    setStock(String(v?.stock ?? 0));
    setImageUrl(prod.imageUrl || '');
    setError(null);
    setNotice(`Editing "${prod.name}"`);
  };

  const handleFileUpload = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    setUploadPct(0);
    try {
      const url = await uploadProductImage(file, name || 'product', setUploadPct);
      setImageUrl(url);
      setNotice('Image uploaded to Firebase Storage.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      setError(
        `${msg} If Firebase Storage is not enabled yet on your Starter Tier project, paste a direct HTTPS image URL instead.`
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || uploading || saving) return;
    setError(null);
    setNotice(null);
    setSaving(true);

    try {
      const normalizedUrl = validateImageUrl(imageUrl);
      const slug =
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') || `sku-${Date.now()}`;
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

        await updateProductRecord(editingId, {
          name: name.trim().slice(0, 140),
          slug,
          categoryId,
          imageUrl: normalizedUrl,
          variants: updatedVariants,
          defaultVariantId: updatedVariants[0].id,
        });
        await refreshIfApi();
        setNotice(`Updated "${name.trim()}".`);
      } else {
        await createProductRecord({
          name: name.trim().slice(0, 140),
          slug,
          brand: 'GPT Farm Direct',
          tagline: 'Farm Fresh • Delivered in Minutes',
          categoryId,
          subcategory: 'Daily Essentials',
          description: 'Quality-checked daily essential packed hygienically.',
          keyFeatures: ['Farm fresh & handpicked'],
          dietaryType: 'veg',
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
          isPopular: true,
          isTrending: false,
          isActive: true,
          storeId: 'store-chittoor-hub-1',
          tags: [name.trim().toLowerCase()],
        });
        await refreshIfApi();
        setNotice(`Published "${name.trim()}" live.`);
      }

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (prod: ProductDoc) => {
    try {
      await updateProductRecord(prod.id, { isActive: !prod.isActive });
      await refreshIfApi();
      setNotice(
        !prod.isActive
          ? `"${prod.name}" is now Live.`
          : `"${prod.name}" hidden from storefront.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle visibility.');
    }
  };

  const handleQuickStock = async (prod: ProductDoc, delta: number) => {
    try {
      const updatedVariants = prod.variants.map((v, idx) =>
        idx === 0 ? { ...v, stock: Math.max(0, v.stock + delta) } : v
      );
      await updateProductRecord(prod.id, { variants: updatedVariants });
      await refreshIfApi();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adjust stock.');
    }
  };

  const handleDeleteProduct = async (prod: ProductDoc) => {
    try {
      await deleteProductRecord(prod.id);
      if (editingId === prod.id) resetForm();
      await refreshIfApi();
      setNotice(`Deleted "${prod.name}".`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product.');
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F8F7] p-8 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4EBE6] pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#074220]">GPT Bazaar Admin Console</h1>
            <p className="text-sm text-slate-500">
              {DATA_SOURCE === 'api'
                ? `Connected to FastAPI Backend (${API_BASE_URL})`
                : 'Connected to Live Firebase Firestore & Storage'}
            </p>
          </div>
        </header>

        {/* Product Create / Update Form */}
        <section className="rounded-xl border border-[#E4EBE6] bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              {editingId ? 'Edit Product' : 'Create Product (Firebase Storage or HTTPS URL)'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                Cancel Edit
              </button>
            )}
          </div>
          <form onSubmit={(e) => void handleSaveProduct(e)} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product name (e.g. Organic Spinach)"
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            />
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
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
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="HTTPS Image URL (overrides sample artwork)"
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            />
            <div className="grid grid-cols-4 gap-2">
              <input
                type="text"
                value={packLabel}
                onChange={(e) => setPackLabel(e.target.value)}
                placeholder="Pack"
                className="h-10 w-full rounded-lg border border-slate-200 px-2.5 text-sm"
              />
              <input
                type="number"
                min={1}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price ₹"
                className="h-10 w-full rounded-lg border border-slate-200 px-2.5 text-sm"
              />
              <input
                type="number"
                min={1}
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
                placeholder="MRP ₹"
                className="h-10 w-full rounded-lg border border-slate-200 px-2.5 text-sm"
              />
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Stock"
                className="h-10 w-full rounded-lg border border-slate-200 px-2.5 text-sm"
              />
            </div>
            <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                disabled={uploading}
                onChange={(e) => void handleFileUpload(e.target.files?.[0])}
                className="text-xs text-slate-600"
              />
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="h-10 w-10 rounded-lg border border-slate-200 object-contain bg-slate-50"
                />
              )}
              <button
                type="submit"
                disabled={uploading || saving}
                className="ml-auto h-10 rounded-lg bg-[#0E6F2D] px-5 text-xs font-bold text-white disabled:bg-slate-300"
              >
                {uploading
                  ? `Uploading ${uploadPct}%`
                  : saving
                    ? 'Saving...'
                    : editingId
                      ? 'Save Update'
                      : 'Publish Product'}
              </button>
            </div>
          </form>
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
          {notice && <p className="text-xs font-medium text-[#0E6F2D]">{notice}</p>}
        </section>

        {/* Live Product Catalog (Read / Update / Stock / Delete) */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            Product Catalog ({products.length})
          </h2>
          {productsLoading ? (
            <p className="text-sm text-slate-500">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
              No products yet. Create your first product above.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#E4EBE6] bg-white">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#E4EBE6] bg-[#FAFBF9] text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">Product</th>
                    <th className="px-3 py-2.5">Pack</th>
                    <th className="px-3 py-2.5 text-right">Price</th>
                    <th className="px-3 py-2.5 text-right">Stock</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF3EF]">
                  {products.map((prod) => {
                    const v = prod.variants.find((x) => x.id === prod.defaultVariantId) || prod.variants[0];
                    return (
                      <tr key={prod.id} className="hover:bg-[#FAFBF9]">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            {prod.imageUrl ? (
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                className="h-9 w-9 rounded-lg border border-slate-200 object-contain bg-slate-50"
                              />
                            ) : (
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EDF8F0] text-[10px] font-bold text-[#0E6F2D]">
                                SKU
                              </div>
                            )}
                            <span className="font-semibold text-slate-900">{prod.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-slate-600">{v?.label || '-'}</td>
                        <td className="px-3 py-2.5 text-right font-mono">₹{v?.price ?? 0}</td>
                        <td className="px-3 py-2.5 text-right font-mono">
                          <span className="mr-2">{v?.stock ?? 0}</span>
                          <button
                            type="button"
                            onClick={() => void handleQuickStock(prod, -1)}
                            className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] hover:bg-slate-100"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleQuickStock(prod, 10)}
                            className="ml-1 rounded bg-[#EDF8F0] px-1.5 py-0.5 text-[10px] font-bold text-[#0E6F2D]"
                          >
                            +10
                          </button>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={prod.isActive ? 'font-semibold text-[#0E6F2D]' : 'text-slate-400'}>
                            {prod.isActive ? 'Live' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(prod)}
                            className="rounded-md border border-slate-200 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleToggleActive(prod)}
                            className="rounded-md border border-slate-200 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            {prod.isActive ? 'Hide' : 'Show'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteProduct(prod)}
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
        </section>

        {/* Live Orders (Firestore) */}
        {DATA_SOURCE === 'firestore' && (
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">Live Orders</h2>
            {ordersLoading ? (
              <p className="text-sm text-slate-500">Connecting to Firestore...</p>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="flex items-center justify-between rounded-xl border border-[#E4EBE6] bg-white p-4"
                  >
                    <div>
                      <div className="font-mono text-sm font-bold">
                        {ord.orderNumber} · ₹{ord.pricing.grandTotal}
                      </div>
                      <div className="text-xs text-slate-500">
                        {ord.customerName} · Status: {ord.status}
                      </div>
                    </div>
                    {ord.status === 'placed' && (
                      <button
                        onClick={() => void advanceStatus(ord.id, 'packed')}
                        className="rounded-lg bg-[#0E6F2D] px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Mark Packed
                      </button>
                    )}
                    {ord.status === 'packed' && (
                      <button
                        onClick={() => void advanceStatus(ord.id, 'out_for_delivery')}
                        className="rounded-lg bg-[#0E6F2D] px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Dispatch Rider
                      </button>
                    )}
                    {ord.status === 'out_for_delivery' && (
                      <button
                        onClick={() => void advanceStatus(ord.id, 'delivered')}
                        className="rounded-lg bg-[#0E6F2D] px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
