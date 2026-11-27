import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Link2,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { DEFAULT_STORE_ID } from '../../data/seedData';
import {
  formatBytes,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_DIMENSION,
  MIN_IMAGE_DIMENSION,
  uploadImageToFirebaseStorage,
  validateImageUrl,
  type ValidatedImageMeta,
} from '../../lib/imageUpload';
import { ProductMedia } from '../shared/GroceryArtwork';
import type { DietaryType, Product, ProductVariant } from '../../types/models';

const ARTWORK_OPTIONS = [
  { key: 'tomato', label: 'Tomato' },
  { key: 'onion', label: 'Onion' },
  { key: 'potato', label: 'Potato' },
  { key: 'banana', label: 'Banana' },
  { key: 'apple', label: 'Apple' },
  { key: 'grapes', label: 'Grapes' },
  { key: 'carrot', label: 'Carrot' },
  { key: 'cauliflower', label: 'Cauliflower' },
  { key: 'milk', label: 'Dairy / Milk' },
  { key: 'bread', label: 'Bread' },
  { key: 'eggs', label: 'Eggs' },
  { key: 'rice', label: 'Rice / Grains' },
  { key: 'oil', label: 'Cooking Oil' },
  { key: 'almonds', label: 'Almonds / Nuts' },
  { key: 'snacks_beverages', label: 'Snacks & Drinks' },
  { key: 'instant_food', label: 'Instant Food' },
  { key: 'dog_food', label: 'Pet Food' },
  { key: 'lunchbox', label: 'Kitchen' },
  { key: 'toys_games', label: 'Toys' },
  { key: 'trimmer', label: 'Personal Care' },
  { key: 'fruits_veg', label: 'Produce Basket' },
];

type ImageSourceTab = 'upload' | 'url';

export function ProductEditorDrawer({
  editingProduct,
  onClose,
}: {
  editingProduct: Product | null;
  onClose: () => void;
}) {
  const { categories, createProduct, updateProduct, pushToast } = useStore();
  const [name, setName] = useState(editingProduct?.name || '');
  const [brand, setBrand] = useState(editingProduct?.brand || 'GPT Farm Direct');
  const [tagline, setTagline] = useState(editingProduct?.tagline || 'Farm Fresh • Delivered in Minutes');
  const [categoryId, setCategoryId] = useState(
    editingProduct?.categoryId || categories[0]?.id || 'cat-fruits-veg'
  );
  const [subcategory, setSubcategory] = useState(editingProduct?.subcategory || 'Vegetables');
  const [dietaryType, setDietaryType] = useState<DietaryType>(editingProduct?.dietaryType || 'veg');
  const [artworkKey, setArtworkKey] = useState(editingProduct?.artworkKey || 'tomato');
  const [imageUrl, setImageUrl] = useState(editingProduct?.imageUrl || '');
  const [imageTab, setImageTab] = useState<ImageSourceTab>(
    editingProduct?.imageUrl && !editingProduct.imageUrl.includes('firebasestorage') ? 'url' : 'upload'
  );
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadedMeta, setUploadedMeta] = useState<ValidatedImageMeta | null>(null);
  const [urlPreviewStatus, setUrlPreviewStatus] = useState<'idle' | 'loaded' | 'error'>('idle');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [description, setDescription] = useState(
    editingProduct?.description ||
      'Quality-checked daily essential packed hygienically at Chittoor Hub.'
  );
  const [featuresText, setFeaturesText] = useState(
    (editingProduct?.keyFeatures || ['Farm fresh & handpicked', 'Hygienic instant pack']).join('\n')
  );
  const [isPopular, setIsPopular] = useState(editingProduct?.isPopular ?? true);
  const [isTrending, setIsTrending] = useState(editingProduct?.isTrending ?? false);
  const [isActive, setIsActive] = useState(editingProduct?.isActive ?? true);
  const [variants, setVariants] = useState<ProductVariant[]>(
    editingProduct?.variants?.length
      ? editingProduct.variants
      : [
          {
            id: 'v-500g',
            label: '500 g',
            unitValue: 500,
            unit: 'g',
            price: 45,
            mrp: 55,
            discountPercent: 18,
            stock: 60,
            sku: `GBT-${Math.floor(1000 + Math.random() * 9000)}`,
          },
        ]
  );
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const hasCustomImage = imageUrl.trim().length > 0;

  const handleFileSelected = async (file: File | null | undefined) => {
    if (!file) return;
    setImageError(null);
    setUploading(true);
    setUploadProgress(0);
    setUploadedMeta(null);

    try {
      const result = await uploadImageToFirebaseStorage(
        file,
        'products',
        name.trim() || artworkKey || 'product',
        (pct) => setUploadProgress(pct)
      );
      setImageUrl(result.downloadUrl);
      setUploadedMeta(result.meta);
      setUrlPreviewStatus('loaded');
      pushToast('Image uploaded to Firebase Storage');
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlInputChange = (val: string) => {
    setImageUrl(val);
    setUploadedMeta(null);
    setUrlPreviewStatus('idle');
    const check = validateImageUrl(val);
    if (!check.valid) {
      setImageError(check.error);
    } else {
      setImageError(null);
    }
  };

  const handleClearCustomImage = () => {
    setImageUrl('');
    setImageError(null);
    setUploadedMeta(null);
    setUrlPreviewStatus('idle');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateVariantField = (idx: number, patch: Partial<ProductVariant>) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== idx) return v;
        const merged = { ...v, ...patch };
        const discountPercent =
          merged.mrp > merged.price && merged.mrp > 0
            ? Math.round(((merged.mrp - merged.price) / merged.mrp) * 100)
            : 0;
        return { ...merged, discountPercent };
      })
    );
  };

  const addVariantRow = () => {
    if (variants.length >= 6) return;
    setVariants((prev) => [
      ...prev,
      {
        id: `v-${Date.now().toString(36)}`,
        label: '1 kg',
        unitValue: 1,
        unit: 'kg',
        price: 85,
        mrp: 100,
        discountPercent: 15,
        stock: 40,
        sku: `GBT-${Math.floor(1000 + Math.random() * 9000)}`,
      },
    ]);
  };

  const removeVariantRow = (idx: number) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || variants.length === 0 || uploading) return;

    const urlValidation = validateImageUrl(imageUrl);
    if (!urlValidation.valid) {
      setImageError(urlValidation.error);
      return;
    }

    setSubmitError(null);
    setSaving(true);
    try {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const keyFeatures = featuresText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 8);

      const payload = {
        name: name.trim().slice(0, 140),
        slug: slug || `product-${Date.now()}`,
        brand: brand.trim().slice(0, 80),
        tagline: tagline.trim().slice(0, 160),
        categoryId,
        subcategory: subcategory.trim().slice(0, 80),
        description: description.trim().slice(0, 1000),
        keyFeatures,
        dietaryType,
        artworkKey,
        imageUrl: urlValidation.normalized,
        variants,
        defaultVariantId: variants[0].id,
        rating: editingProduct?.rating ?? 4.7,
        reviewCount: editingProduct?.reviewCount ?? 120,
        deliveryEtaMins: editingProduct?.deliveryEtaMins ?? 12,
        isPopular,
        isTrending,
        isActive,
        storeId: editingProduct?.storeId || DEFAULT_STORE_ID,
        tags: [
          ...new Set(
            [name.toLowerCase(), brand.toLowerCase(), subcategory.toLowerCase()]
              .filter(Boolean)
              .slice(0, 8)
          ),
        ],
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save product to Firestore.';
      setSubmitError(msg);
      pushToast('Could not save product — check fields or Firestore rules.', 'warning');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-[2px]">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-[#E4EBE6] flex flex-col">
        <div className="px-6 py-4 border-b border-[#E4EBE6] flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900">
              {editingProduct ? 'Edit Product SKU' : 'Upload New Product'}
            </h2>
            <p className="text-xs text-slate-500">
              Saves live to Firebase Firestore and syncs immediately to the mobile app.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="w-9 h-9 rounded-lg hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scroll p-6 space-y-5">
          {/* Product Image Upload / URL Override Panel */}
          <div className="p-4 rounded-xl bg-[#F8FAF8] border border-[#E4EBE6] space-y-3.5">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <ProductMedia
                  imageUrl={!imageError ? imageUrl : ''}
                  artworkKey={artworkKey}
                  alt={name || 'Product preview'}
                  className="w-24 h-24 bg-white rounded-xl border border-slate-200 p-2"
                />
                {hasCustomImage && !imageError && (
                  <img
                    src={imageUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="hidden"
                    onLoad={() => setUrlPreviewStatus('loaded')}
                    onError={() => setUrlPreviewStatus('error')}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Product Image</h3>
                    <p className="text-[11px] text-slate-500">
                      {hasCustomImage && !imageError
                        ? 'Custom image active — overrides sample artwork.'
                        : 'Using fallback sample illustration until an image is provided.'}
                    </p>
                  </div>
                  {hasCustomImage && (
                    <button
                      type="button"
                      onClick={handleClearCustomImage}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-600 cursor-pointer shrink-0"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>

                {/* Source Mode Toggle: Upload File vs Paste URL */}
                <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-200/70">
                  <button
                    type="button"
                    onClick={() => {
                      setImageTab('upload');
                      setImageError(null);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      imageTab === 'upload'
                        ? 'bg-white text-[#0E6F2D] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageTab('url');
                      setImageError(null);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      imageTab === 'url'
                        ? 'bg-white text-[#0E6F2D] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    Image URL
                  </button>
                </div>
              </div>
            </div>

            {imageTab === 'upload' ? (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={(e) => void handleFileSelected(e.target.files?.[0])}
                  className="hidden"
                />
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    void handleFileSelected(e.dataTransfer.files?.[0]);
                  }}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !uploading) {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  className={`rounded-xl border-2 border-dashed p-4 text-center transition-colors cursor-pointer ${
                    dragActive
                      ? 'border-[#0E6F2D] bg-[#EDF8F0]'
                      : 'border-slate-300 bg-white hover:border-[#0E6F2D]/60'
                  }`}
                >
                  {uploading ? (
                    <div className="space-y-2 py-1">
                      <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#0E6F2D]">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading to Firebase Storage... {uploadProgress}%
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-[#0E6F2D] transition-all duration-150"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <UploadCloud className="w-6 h-6 text-[#0E6F2D] mx-auto" />
                      <div className="text-xs font-semibold text-slate-800">
                        Click to choose or drag &amp; drop product image
                      </div>
                      <div className="text-[11px] text-slate-500">
                        JPG, PNG, WebP, or AVIF · Max {formatBytes(MAX_IMAGE_BYTES)} · {MIN_IMAGE_DIMENSION}×{MIN_IMAGE_DIMENSION}px to {MAX_IMAGE_DIMENSION}×{MAX_IMAGE_DIMENSION}px
                      </div>
                    </div>
                  )}
                </div>

                {uploadedMeta && hasCustomImage && !imageError && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-[#0E6F2D]">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Uploaded ({uploadedMeta.formatLabel} · {uploadedMeta.width}×{uploadedMeta.height}px · {formatBytes(uploadedMeta.sizeBytes)})
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Direct HTTPS Image URL (overrides sample artwork)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => handleUrlInputChange(e.target.value)}
                  placeholder="https://cdn.example.com/products/tomato.webp"
                  className={`w-full h-9 px-3 rounded-lg border bg-white text-xs text-slate-900 focus:outline-none ${
                    imageError
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-slate-200 focus:border-[#0E6F2D]'
                  }`}
                />
                {hasCustomImage && !imageError && urlPreviewStatus === 'loaded' && (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#0E6F2D]">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Image URL verified — overrides sample artwork on save.</span>
                  </div>
                )}
                {hasCustomImage && !imageError && urlPreviewStatus === 'error' && (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Preview could not load this URL. Check that the link points directly to a public image file.</span>
                  </div>
                )}
              </div>
            )}

            {imageError && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{imageError}</span>
              </div>
            )}

            {/* Sample Fallback Preset */}
            <div className="pt-2 border-t border-[#E4EBE6] flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Fallback Sample Preset (used only if no image is provided)</span>
              </div>
              <select
                value={artworkKey}
                onChange={(e) => setArtworkKey(e.target.value)}
                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 focus:border-[#0E6F2D] focus:outline-none"
              >
                {ARTWORK_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Core Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Organic Palak (Spinach)"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 focus:border-[#0E6F2D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 focus:border-[#0E6F2D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dietary Type</label>
              <select
                value={dietaryType}
                onChange={(e) => setDietaryType(e.target.value as DietaryType)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:border-[#0E6F2D] focus:outline-none"
              >
                <option value="veg">Vegetarian (Green Dot)</option>
                <option value="non_veg">Non-Vegetarian (Red Dot)</option>
                <option value="none">Non-Food / None</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  const cat = categories.find((c) => c.id === e.target.value);
                  if (cat && cat.subcategories[1]) setSubcategory(cat.subcategories[1]);
                }}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:border-[#0E6F2D] focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subcategory</label>
              <input
                type="text"
                list="subcat-suggestions"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 focus:border-[#0E6F2D] focus:outline-none"
              />
              <datalist id="subcat-suggestions">
                {(selectedCategory?.subcategories || [])
                  .filter((s) => s !== 'All')
                  .map((s) => (
                    <option key={s} value={s} />
                  ))}
              </datalist>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Short Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 focus:border-[#0E6F2D] focus:outline-none"
              />
            </div>
          </div>

          {/* Variants & Pricing Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-display font-bold text-sm text-slate-900">
                  Pack Variants &amp; Inventory Stock
                </h3>
                <p className="text-[11px] text-slate-500">
                  Supports multi-weight pricing (250g, 500g, 1kg) and per-variant SKU inventory.
                </p>
              </div>
              <button
                type="button"
                onClick={addVariantRow}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#EDF8F0] text-[#0E6F2D] text-xs font-semibold hover:bg-[#DCF3E3] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Variant
              </button>
            </div>

            <div className="space-y-2">
              {variants.map((v, idx) => (
                <div
                  key={v.id}
                  className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl border border-slate-200 bg-slate-50/60"
                >
                  <div className="col-span-3">
                    <label className="block text-[10px] font-medium text-slate-500">Pack Size</label>
                    <input
                      type="text"
                      value={v.label}
                      onChange={(e) => updateVariantField(idx, { label: e.target.value })}
                      className="w-full h-8 px-2 rounded-md border border-slate-200 bg-white text-xs text-slate-900"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-medium text-slate-500">Price (₹)</label>
                    <input
                      type="number"
                      min={1}
                      value={v.price}
                      onChange={(e) =>
                        updateVariantField(idx, { price: Math.max(1, Number(e.target.value) || 1) })
                      }
                      className="w-full h-8 px-2 rounded-md border border-slate-200 bg-white text-xs font-mono text-slate-900"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-medium text-slate-500">MRP (₹)</label>
                    <input
                      type="number"
                      min={1}
                      value={v.mrp}
                      onChange={(e) =>
                        updateVariantField(idx, { mrp: Math.max(1, Number(e.target.value) || 1) })
                      }
                      className="w-full h-8 px-2 rounded-md border border-slate-200 bg-white text-xs font-mono text-slate-900"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-medium text-slate-500">Stock</label>
                    <input
                      type="number"
                      min={0}
                      value={v.stock}
                      onChange={(e) =>
                        updateVariantField(idx, { stock: Math.max(0, Number(e.target.value) || 0) })
                      }
                      className="w-full h-8 px-2 rounded-md border border-slate-200 bg-white text-xs font-mono text-slate-900"
                    />
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="text-[10px] text-slate-400">Discount</div>
                    <div className="text-xs font-mono font-bold text-[#0E6F2D]">
                      {v.discountPercent}% OFF
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      disabled={variants.length <= 1}
                      onClick={() => removeVariantRow(idx)}
                      className="w-7 h-7 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 disabled:opacity-30 flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description & Highlights */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:border-[#0E6F2D] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Key Features (one per line)
              </label>
              <textarea
                rows={3}
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:border-[#0E6F2D] focus:outline-none"
              />
            </div>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => setIsPopular(e.target.checked)}
                className="rounded accent-[#0E6F2D]"
              />
              Show in &ldquo;Popular near you&rdquo;
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
                className="rounded accent-[#0E6F2D]"
              />
              Trending shelf
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded accent-[#0E6F2D]"
              />
              Active on Storefront
            </label>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-[#E4EBE6] bg-[#F8FAF8] space-y-2.5">
          {submitError && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="break-words">{submitError}</span>
            </div>
          )}
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving || uploading || Boolean(imageError)}
              onClick={(e) => void handleSubmit(e as unknown as React.FormEvent)}
              className="px-5 py-2 rounded-lg bg-[#0E6F2D] hover:bg-[#0A5823] disabled:bg-slate-300 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              {uploading
                ? 'Uploading image...'
                : saving
                  ? 'Saving to Firestore...'
                  : editingProduct
                    ? 'Save Changes'
                    : 'Publish Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
