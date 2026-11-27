import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Edit3,
  Eye,
  EyeOff,
  FolderKanban,
  LayoutDashboard,
  Loader2,
  Minus,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Truck,
  UploadCloud,
  XCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { uploadImageToFirebaseStorage, validateImageUrl } from '../../lib/imageUpload';
import { ProductMedia } from '../shared/GroceryArtwork';
import { ProductEditorDrawer } from './ProductEditorDrawer';
import type { OrderStatus, Product } from '../../types/models';

export type AdminTab = 'overview' | 'orders' | 'products' | 'inventory' | 'categories';

const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: 'Placed',
  packed: 'Packed',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const NEXT_STATUS_ACTION: Partial<
  Record<OrderStatus, { next: OrderStatus; cta: string; icon: React.ComponentType<{ className?: string }> }>
> = {
  placed: { next: 'packed', cta: 'Mark Packed', icon: PackageCheck },
  packed: { next: 'out_for_delivery', cta: 'Dispatch Rider', icon: Truck },
  out_for_delivery: { next: 'delivered', cta: 'Mark Delivered', icon: CheckCircle2 },
};

export function AdminDashboard({
  compact = false,
  externalTriggerAdd = 0,
  activeTab,
  onTabChange,
  hideNav = false,
}: {
  compact?: boolean;
  externalTriggerAdd?: number;
  activeTab?: AdminTab;
  onTabChange?: (tab: AdminTab) => void;
  hideNav?: boolean;
}) {
  const {
    categories,
    products,
    orders,
    loading,
    advanceOrderStatus,
    adjustVariantStock,
    toggleProductActive,
    deleteProduct,
    createCategory,
    updateCategory,
    toggleCategoryActive,
    seedInitialData,
    pushToast,
  } = useStore();

  const [internalTab, setInternalTab] = useState<AdminTab>('orders');
  const tab = activeTab ?? internalTab;
  const setTab = (next: AdminTab) => {
    setInternalTab(next);
    onTabChange?.(next);
  };
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [lastTrigger, setLastTrigger] = useState(externalTriggerAdd);

  // New Category quick form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatSub, setNewCatSub] = useState('');
  const [newCatImageUrl, setNewCatImageUrl] = useState('');
  const [catImageError, setCatImageError] = useState<string | null>(null);
  const [uploadingCatId, setUploadingCatId] = useState<string | null>(null);

  if (externalTriggerAdd !== lastTrigger) {
    setLastTrigger(externalTriggerAdd);
    setEditingProduct(null);
    setDrawerOpen(true);
  }

  const metrics = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
    const revenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.pricing.grandTotal, 0);
    const lowStockVariants = products.reduce(
      (count, p) => count + p.variants.filter((v) => v.stock < 25).length,
      0
    );
    return {
      totalOrders: orders.length,
      activeOrders,
      revenue,
      totalProducts: products.length,
      lowStockVariants,
    };
  }, [orders, products]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderFilter === 'active') return o.status !== 'delivered' && o.status !== 'cancelled';
      if (orderFilter !== 'all') return o.status === orderFilter;
      return true;
    });
  }, [orders, orderFilter]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const catOk = categoryFilter === 'all' || p.categoryId === categoryFilter;
      const qOk =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        p.variants.some((v) => v.sku.toLowerCase().includes(q));
      return catOk && qOk;
    });
  }, [products, searchQuery, categoryFilter]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const urlCheck = validateImageUrl(newCatImageUrl);
    if (!urlCheck.valid) {
      setCatImageError(urlCheck.error);
      return;
    }
    setCatImageError(null);
    const slug = newCatName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    await createCategory({
      name: newCatName.trim(),
      slug,
      subtitle: newCatSub.trim() || 'Fresh daily essentials delivered in minutes',
      artworkKey: 'fruits_veg',
      imageUrl: urlCheck.normalized,
      bgTint: '#EEF9F0',
      subcategories: ['All'],
      sortOrder: categories.length + 1,
      isActive: true,
    });
    setNewCatName('');
    setNewCatSub('');
    setNewCatImageUrl('');
  };

  const handleUploadCategoryImage = async (categoryId: string, slug: string, file: File | undefined) => {
    if (!file) return;
    setUploadingCatId(categoryId);
    setCatImageError(null);
    try {
      const res = await uploadImageToFirebaseStorage(file, 'categories', slug);
      await updateCategory(categoryId, { imageUrl: res.downloadUrl });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Category image upload failed.';
      setCatImageError(msg);
      pushToast(msg, 'warning');
    } finally {
      setUploadingCatId(null);
    }
  };

  const navItems: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'orders', label: 'Live Orders', icon: ClipboardList, badge: metrics.activeOrders },
    { id: 'products', label: 'Products', icon: Boxes, badge: metrics.totalProducts },
    { id: 'inventory', label: 'Inventory', icon: AlertTriangle, badge: metrics.lowStockVariants },
    { id: 'categories', label: 'Categories', icon: FolderKanban },
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  ];

  return (
    <div className="bg-white border border-[#E4EBE6] rounded-2xl overflow-hidden flex flex-col min-h-[760px]">
      {/* Console Top Sub-Header */}
      <div className="px-5 py-3.5 border-b border-[#E4EBE6] flex flex-wrap items-center justify-between gap-3 bg-[#FAFBF9]">
        <div>
          <h2 className="font-display font-bold text-base text-slate-900">
            Admin Operations Console
          </h2>
          <p className="text-xs text-slate-500">
            Chittoor Dark Store Hub · Real-time Firestore Catalog & Fulfillment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void seedInitialData(true)}
            className="h-9 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            Re-seed Demo
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setDrawerOpen(true);
            }}
            className="h-9 px-3.5 rounded-lg bg-[#0E6F2D] hover:bg-[#0A5823] text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Upload Product
          </button>
        </div>
      </div>

      {/* Console Body: Sidebar (desktop full mode) or Compact Tab Strip (split mode) */}
      <div className={`flex-1 flex ${compact ? 'flex-col' : 'flex-col lg:flex-row'}`}>
        {!hideNav && (
          <aside
            className={
              compact
                ? 'px-4 py-2.5 border-b border-[#E4EBE6] flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white'
                : 'lg:w-56 border-b lg:border-b-0 lg:border-r border-[#E4EBE6] p-3 flex lg:flex-col gap-1 overflow-x-auto no-scrollbar bg-[#FCFDFA] shrink-0'
            }
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#EDF8F0] text-[#0E6F2D]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="font-mono text-[11px] tabular-nums opacity-80">{item.badge}</span>
                  )}
                </button>
              );
            })}
          </aside>
        )}

        {/* Main Content Panel */}
        <div className="flex-1 p-5 overflow-y-auto custom-scroll space-y-5">
          {/* KPI Strip */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-[#E4EBE6] bg-white">
              <div className="text-xs text-slate-500">Active Dispatch</div>
              <div className="mt-1 font-display font-bold text-2xl text-[#0E6F2D] tabular-nums">
                {metrics.activeOrders}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
                {metrics.totalOrders} total orders
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-[#E4EBE6] bg-white">
              <div className="text-xs text-slate-500">Gross Revenue</div>
              <div className="mt-1 font-display font-bold text-2xl text-slate-900 tabular-nums">
                ₹{metrics.revenue.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Live order ledger</div>
            </div>
            <div className="p-3.5 rounded-xl border border-[#E4EBE6] bg-white">
              <div className="text-xs text-slate-500">Catalog SKUs</div>
              <div className="mt-1 font-display font-bold text-2xl text-slate-900 tabular-nums">
                {metrics.totalProducts}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Across {categories.length} categories
              </div>
            </div>
            <div className="p-3.5 rounded-xl border border-[#E4EBE6] bg-white">
              <div className="text-xs text-slate-500">Low Stock Alerts</div>
              <div
                className={`mt-1 font-display font-bold text-2xl tabular-nums ${
                  metrics.lowStockVariants > 0 ? 'text-amber-600' : 'text-slate-900'
                }`}
              >
                {metrics.lowStockVariants}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Variants under 25 units</div>
            </div>
          </div>

          {/* TAB 1: LIVE ORDERS */}
          {(tab === 'orders' || tab === 'overview') && (
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-display font-bold text-sm text-slate-900">
                    Real-Time Order Fulfillment Queue
                  </h3>
                  <p className="text-xs text-slate-500">
                    Advance any order stage here and watch the Customer Mobile App update instantly.
                  </p>
                </div>

                {tab === 'orders' && (
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100">
                    {[
                      { id: 'all' as const, label: 'All' },
                      { id: 'active' as const, label: 'Active' },
                      { id: 'placed' as const, label: 'Placed' },
                      { id: 'packed' as const, label: 'Packed' },
                      { id: 'out_for_delivery' as const, label: 'In Transit' },
                      { id: 'delivered' as const, label: 'Delivered' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setOrderFilter(f.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                          orderFilter === f.id
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-8 text-center rounded-xl border border-dashed border-slate-200">
                  <p className="font-display font-semibold text-sm text-slate-700">
                    No orders match this status
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Place an order in the Customer Mobile App to test real-time dispatch.
                  </p>
                </div>
              ) : (
                <div className="border border-[#E4EBE6] rounded-xl divide-y divide-[#EEF3EF] overflow-hidden">
                  {(tab === 'overview' ? filteredOrders.slice(0, 4) : filteredOrders).map((order) => {
                    const action = NEXT_STATUS_ACTION[order.status];
                    const ActionIcon = action?.icon;
                    const canCancel = order.status !== 'delivered' && order.status !== 'cancelled';

                    return (
                      <div
                        key={order.id}
                        className="p-3.5 bg-white hover:bg-[#FAFBF9] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-mono font-bold text-slate-900">
                              {order.orderNumber}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span
                              className={`font-semibold ${
                                order.status === 'delivered'
                                  ? 'text-[#0E6F2D]'
                                  : order.status === 'cancelled'
                                    ? 'text-red-600'
                                    : order.status === 'out_for_delivery'
                                      ? 'text-blue-700'
                                      : 'text-amber-700'
                              }`}
                            >
                              {STATUS_LABEL[order.status]}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-600 font-medium">{order.customerName}</span>
                            <span className="text-slate-300">·</span>
                            <span className="font-mono font-semibold text-slate-900 tabular-nums">
                              ₹{order.pricing.grandTotal}
                            </span>
                          </div>

                          <div className="text-xs text-slate-500 truncate">
                            {order.items.map((it) => `${it.name} ×${it.qty}`).join(', ')}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {order.deliveryAddress.label}: {order.deliveryAddress.line1},{' '}
                            {order.deliveryAddress.pincode} · {order.paymentMethod.toUpperCase()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {action && ActionIcon && (
                            <button
                              type="button"
                              onClick={() => void advanceOrderStatus(order.id, action.next)}
                              className="h-9 px-3 rounded-lg bg-[#0E6F2D] hover:bg-[#0A5823] text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
                            >
                              <ActionIcon className="w-3.5 h-3.5" />
                              {action.cta}
                            </button>
                          )}
                          {canCancel && (
                            <button
                              type="button"
                              onClick={() => void advanceOrderStatus(order.id, 'cancelled')}
                              title="Cancel Order"
                              className="h-9 px-2.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-600 text-xs font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* TAB 2: PRODUCTS CATALOG */}
          {(tab === 'products' || tab === 'overview') && (
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display font-bold text-sm text-slate-900">
                  Product Catalog ({filteredProducts.length})
                </h3>
                {tab === 'products' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 bg-white">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search SKU or name..."
                        className="text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none w-40"
                      />
                    </div>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="border border-[#E4EBE6] rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E4EBE6] bg-[#FAFBF9] text-[11px] font-semibold text-slate-500">
                      <th className="py-2.5 px-3.5">Product</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                      <th className="py-2.5 px-3 text-right">Stock</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF3EF] text-xs">
                    {(tab === 'overview' ? filteredProducts.slice(0, 5) : filteredProducts).map(
                      (prod) => {
                        const defVar =
                          prod.variants.find((v) => v.id === prod.defaultVariantId) ||
                          prod.variants[0];
                        const totalStock = prod.variants.reduce((s, v) => s + v.stock, 0);
                        const catName =
                          categories.find((c) => c.id === prod.categoryId)?.name || 'General';
                        return (
                          <tr key={prod.id} className="hover:bg-[#FAFBF9]">
                            <td className="py-2.5 px-3.5">
                              <div className="flex items-center gap-2.5 min-w-[180px]">
                                <ProductMedia
                                  imageUrl={prod.imageUrl}
                                  artworkKey={prod.artworkKey}
                                  alt={prod.name}
                                  className="w-10 h-10 rounded-lg border border-slate-100 bg-slate-50 p-1 shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="font-semibold text-slate-900 truncate">
                                    {prod.name}
                                  </div>
                                  <div className="text-[11px] text-slate-400 truncate">
                                    {prod.variants.length} variant{prod.variants.length > 1 ? 's' : ''} · {defVar?.sku}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{catName}</td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                              <span className="font-semibold text-slate-900">₹{defVar?.price}</span>
                              {defVar && defVar.mrp > defVar.price && (
                                <span className="text-[10px] text-slate-400 line-through ml-1">
                                  ₹{defVar.mrp}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                              <span
                                className={
                                  totalStock === 0
                                    ? 'text-red-600 font-bold'
                                    : totalStock < 25
                                      ? 'text-amber-600 font-semibold'
                                      : 'text-slate-700'
                                }
                              >
                                {totalStock}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span
                                className={`text-[11px] font-semibold ${
                                  prod.isActive ? 'text-[#0E6F2D]' : 'text-slate-400'
                                }`}
                              >
                                {prod.isActive ? 'Live' : 'Hidden'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingProduct(prod);
                                    setDrawerOpen(true);
                                  }}
                                  title="Edit product"
                                  className="w-7 h-7 rounded-md hover:bg-slate-100 text-slate-600 inline-flex items-center justify-center cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void toggleProductActive(prod.id, !prod.isActive)}
                                  title={prod.isActive ? 'Hide from storefront' : 'Publish to storefront'}
                                  className="w-7 h-7 rounded-md hover:bg-slate-100 text-slate-600 inline-flex items-center justify-center cursor-pointer"
                                >
                                  {prod.isActive ? (
                                    <EyeOff className="w-3.5 h-3.5" />
                                  ) : (
                                    <Eye className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void deleteProduct(prod.id)}
                                  title="Delete product"
                                  className="w-7 h-7 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 inline-flex items-center justify-center cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 3: LIVE INVENTORY CONTROL */}
          {tab === 'inventory' && (
            <section className="space-y-3">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-900">
                  Real-Time Variant Stock Ledger
                </h3>
                <p className="text-xs text-slate-500">
                  Adjust stock per pack size. Setting stock to 0 marks the SKU &ldquo;Sold out&rdquo; immediately in the Customer App.
                </p>
              </div>
              <div className="border border-[#E4EBE6] rounded-xl overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E4EBE6] bg-[#FAFBF9] text-[11px] font-semibold text-slate-500">
                      <th className="py-2.5 px-3.5">SKU / Product</th>
                      <th className="py-2.5 px-3">Variant</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Available Qty</th>
                      <th className="py-2.5 px-3.5 text-right">Quick Adjust</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EEF3EF] text-xs">
                    {products.flatMap((prod) =>
                      prod.variants.map((v) => (
                        <tr key={`${prod.id}-${v.id}`} className="hover:bg-[#FAFBF9]">
                          <td className="py-2.5 px-3.5">
                            <div className="font-semibold text-slate-900">{prod.name}</div>
                            <div className="text-[11px] font-mono text-slate-400">{v.sku}</div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{v.label}</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums">₹{v.price}</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                            <span
                              className={`font-bold ${
                                v.stock === 0
                                  ? 'text-red-600'
                                  : v.stock < 25
                                    ? 'text-amber-600'
                                    : 'text-[#0E6F2D]'
                              }`}
                            >
                              {v.stock}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-1">
                              {v.stock === 0 ? 'Out' : v.stock < 25 ? 'Low' : 'OK'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => void adjustVariantStock(prod.id, v.id, -5)}
                                className="h-7 px-2 rounded-md border border-slate-200 hover:bg-slate-100 text-[11px] font-mono text-slate-700 cursor-pointer"
                              >
                                -5
                              </button>
                              <button
                                type="button"
                                onClick={() => void adjustVariantStock(prod.id, v.id, -1)}
                                className="w-7 h-7 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-700 inline-flex items-center justify-center cursor-pointer"
                                aria-label="Decrease stock by 1"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => void adjustVariantStock(prod.id, v.id, 1)}
                                className="w-7 h-7 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-700 inline-flex items-center justify-center cursor-pointer"
                                aria-label="Increase stock by 1"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => void adjustVariantStock(prod.id, v.id, 20)}
                                className="h-7 px-2 rounded-md bg-[#EDF8F0] hover:bg-[#DCF3E3] text-[#0E6F2D] text-[11px] font-mono font-semibold cursor-pointer"
                              >
                                +20
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 4: CATEGORIES MANAGER */}
          {tab === 'categories' && (
            <section className="space-y-4">
              <form
                onSubmit={(e) => void handleAddCategory(e)}
                className="p-4 rounded-xl border border-[#E4EBE6] bg-[#FAFBF9] grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Organic Juices"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#0E6F2D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={newCatSub}
                    onChange={(e) => setNewCatSub(e.target.value)}
                    placeholder="Cold pressed · Zero sugar"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#0E6F2D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={newCatImageUrl}
                    onChange={(e) => {
                      setNewCatImageUrl(e.target.value);
                      const check = validateImageUrl(e.target.value);
                      setCatImageError(check.valid ? null : check.error);
                    }}
                    placeholder="https://cdn.example.com/cat.webp"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:border-[#0E6F2D] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="h-9 px-4 rounded-lg bg-[#0E6F2D] hover:bg-[#0A5823] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Category
                </button>
              </form>

              {catImageError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{catImageError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categories.map((cat) => {
                  const skuCount = products.filter((p) => p.categoryId === cat.id).length;
                  const isUploadingThis = uploadingCatId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      className="p-3 rounded-xl border border-[#E4EBE6] bg-white flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          style={{ backgroundColor: cat.bgTint }}
                          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 overflow-hidden p-1"
                        >
                          <ProductMedia
                            imageUrl={cat.imageUrl}
                            artworkKey={cat.artworkKey}
                            alt={cat.name}
                            className="w-9 h-9"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-display font-bold text-xs text-slate-900 truncate">
                            {cat.name}
                          </div>
                          <div className="text-[11px] text-slate-500 tabular-nums">
                            {skuCount} SKUs · Order #{cat.sortOrder}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <label
                          title="Upload category image to Firebase Storage"
                          className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          {isUploadingThis ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0E6F2D]" />
                          ) : (
                            <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                          )}
                          <span>{cat.imageUrl ? 'Replace' : 'Image'}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            disabled={isUploadingThis}
                            onChange={(e) => {
                              void handleUploadCategoryImage(cat.id, cat.slug, e.target.files?.[0]);
                              e.target.value = '';
                            }}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => void toggleCategoryActive(cat.id, !cat.isActive)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                            cat.isActive
                              ? 'bg-[#EDF8F0] text-[#0E6F2D]'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {cat.isActive ? 'Active' : 'Paused'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      {drawerOpen && (
        <ProductEditorDrawer
          editingProduct={editingProduct}
          onClose={() => {
            setDrawerOpen(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}
