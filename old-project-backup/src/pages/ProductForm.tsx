import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../lib/db';
import { compressImage, getImageUrl } from '../lib/helpers';
import { ProductRecord } from '../types';

const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function ProductFormPage() {
  const params = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(params.id);
  const [product, setProduct] = useState<Partial<ProductRecord>>({
    name: '',
    sku: '',
    barcode: '',
    category: '',
    description: '',
    buyingPrice: 0,
    sellingPrice: 0,
    quantity: 0,
    lowStockAlert: 5,
    imageData: null,
    imageType: null,
    isActive: true
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!params.id) return;
      const existing = await db.products.get(Number(params.id));
      if (existing) {
        setProduct(existing);
        setImagePreview(getImageUrl(existing.imageData, existing.imageType));
      }
    }
    loadProduct();
  }, [params.id]);

  const hasImage = Boolean(imagePreview);
  const title = isEdit ? 'Edit product' : 'Add product';

  const validationError = useMemo(() => {
    if (!product.name?.trim()) return 'Product name is required.';
    if (product.sellingPrice == null || product.sellingPrice < 0) return 'Selling price is required and cannot be negative.';
    if (product.buyingPrice == null || product.buyingPrice < 0) return 'Buying price cannot be negative.';
    if (product.quantity == null || product.quantity < 0) return 'Quantity cannot be negative.';
    return '';
  }, [product]);

  async function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!validImageTypes.includes(file.type)) {
      setError('Invalid image type. Use JPG, PNG, or WebP.');
      return;
    }
    if (file.size > 4_000_000) {
      setError('Image must be smaller than 4MB.');
      return;
    }
    setError('');
    try {
      const compressed = await compressImage(file);
      setProduct((current) => ({ ...current, imageData: compressed.data, imageType: compressed.type }));
      setImagePreview(`data:${compressed.type};base64,${compressed.data}`);
    } catch {
      setError('Failed to process the image.');
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const record: ProductRecord = {
        id: product.id ?? 0,
        name: product.name!.trim(),
        sku: product.sku?.trim() ?? '',
        barcode: product.barcode?.trim() ?? '',
        category: product.category?.trim() ?? '',
        description: product.description?.trim() ?? '',
        buyingPrice: Number(product.buyingPrice),
        sellingPrice: Number(product.sellingPrice),
        quantity: Number(product.quantity),
        lowStockAlert: Number(product.lowStockAlert ?? 5),
        imageData: product.imageData ?? null,
        imageType: product.imageType ?? null,
        isActive: product.isActive ?? true,
        createdAt: isEdit && product.createdAt ? product.createdAt : now,
        updatedAt: now
      };

      if (isEdit) {
        await db.products.update(record.id, record);
      } else {
        await db.products.add(record);
      }
      navigate('/products');
    } catch {
      setError('Unable to save product.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-slate-400">Add or update product details. Images are stored locally in IndexedDB.</p>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20 md:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm text-slate-300">Product name*</label>
          <input value={product.name ?? ''} onChange={(e) => setProduct({ ...product, name: e.target.value })} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand" />
        </div>
        <div className="space-y-4">
          <label className="block text-sm text-slate-300">SKU</label>
          <input value={product.sku ?? ''} onChange={(e) => setProduct({ ...product, sku: e.target.value })} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand" />
        </div>
        <div className="space-y-4">
          <label className="block text-sm text-slate-300">Barcode</label>
          <input value={product.barcode ?? ''} onChange={(e) => setProduct({ ...product, barcode: e.target.value })} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand" />
        </div>
        <div className="space-y-4">
          <label className="block text-sm text-slate-300">Category</label>
          <input value={product.category ?? ''} onChange={(e) => setProduct({ ...product, category: e.target.value })} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand" />
        </div>
        <div className="space-y-4 md:col-span-2">
          <label className="block text-sm text-slate-300">Description</label>
          <textarea value={product.description ?? ''} onChange={(e) => setProduct({ ...product, description: e.target.value })} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand" rows={4} />
        </div>
        <div className="space-y-4">
          <label className="block text-sm text-slate-300">Buying price</label>
          <input type="number" value={product.buyingPrice ?? 0} onChange={(e) => setProduct({ ...product, buyingPrice: Number(e.target.value) })} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand" min={0} step="0.01" />
        </div>
        <div className="space-y-4">
          <label className="block text-sm text-slate-300">Selling price*</label>
          <input type="number" value={product.sellingPrice ?? 0} onChange={(e) => setProduct({ ...product, sellingPrice: Number(e.target.value) })} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand" min={0} step="0.01" />
        </div>
        <div className="space-y-4">
          <label className="block text-sm text-slate-300">Quantity*</label>
          <input type="number" value={product.quantity ?? 0} onChange={(e) => setProduct({ ...product, quantity: Number(e.target.value) })} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand" min={0} />
        </div>
        <div className="space-y-4">
          <label className="block text-sm text-slate-300">Low-stock alert</label>
          <input type="number" value={product.lowStockAlert ?? 5} onChange={(e) => setProduct({ ...product, lowStockAlert: Number(e.target.value) })} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand" min={0} />
        </div>
        <div className="space-y-4 md:col-span-2">
          <label className="block text-sm text-slate-300">Product photo</label>
          <div className="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-slate-950 p-4">
            {hasImage ? (
              <img src={imagePreview ?? undefined} alt="Preview" className="h-48 w-full rounded-3xl object-cover" />
            ) : (
              <div className="flex h-48 items-center justify-center rounded-3xl border border-dashed border-slate-700 text-slate-500">No image selected</div>
            )}
            <input type="file" accept="image/*" onChange={handleImage} className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none" />
            {product.imageData && (
              <button type="button" onClick={() => { setProduct({ ...product, imageData: null, imageType: null }); setImagePreview(null); }} className="rounded-3xl bg-rose-600/10 px-4 py-3 text-sm text-rose-200 transition hover:bg-rose-600/20">
                Remove photo
              </button>
            )}
          </div>
        </div>
        {error && <div className="md:col-span-2 rounded-3xl border border-red-600 bg-red-950/50 px-4 py-3 text-sm text-red-200">{error}</div>}
        <div className="md:col-span-2 flex flex-wrap gap-3">
          <button disabled={saving} type="submit" className="rounded-3xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? 'Saving...' : 'Save product'}
          </button>
          <button type="button" onClick={() => navigate('/products')} className="rounded-3xl border border-slate-700 bg-slate-950 px-6 py-3 text-sm text-slate-100 transition hover:bg-slate-900">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
