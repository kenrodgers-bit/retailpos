import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import { ProductRecord, StockAdjustmentRecord } from '../types';
import { formatDateTime } from '../lib/helpers';

const adjustmentTypes = ['New stock received', 'Damaged item', 'Expired item', 'Lost item', 'Correction', 'Other'];

export default function StockManagementPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [adjustmentType, setAdjustmentType] = useState('New stock received');
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function load() {
      const items = await db.products.orderBy('name').toArray();
      setProducts(items);
      if (items.length) setSelectedProductId(items[0].id);
    }
    load();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedProductId) {
      setError('Select a product.');
      return;
    }
    if (!quantity) {
      setError('Enter a quantity.');
      return;
    }
    const product = await db.products.get(selectedProductId);
    if (!product) {
      setError('Product not selected.');
      return;
    }
    const previousQuantity = product.quantity;
    const newQuantity = adjustmentType === 'Damaged item' || adjustmentType === 'Expired item' || adjustmentType === 'Lost item' ? Math.max(0, previousQuantity - quantity) : previousQuantity + quantity;
    const record: StockAdjustmentRecord = {
      id: 0,
      productId: product.id,
      productName: product.name,
      productImage: product.imageData,
      adjustmentType,
      quantityChanged: adjustmentType === 'Damaged item' || adjustmentType === 'Expired item' || adjustmentType === 'Lost item' ? -quantity : quantity,
      previousQuantity,
      newQuantity,
      reason: reason.trim() || adjustmentType,
      createdAt: new Date().toISOString()
    };
    await db.stockAdjustments.add(record);
    await db.products.update(product.id, { quantity: newQuantity, updatedAt: new Date().toISOString() });
    setSuccess('Stock adjustment saved.');
    setTimeout(() => setSuccess(''), 3000);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
        <h1 className="text-2xl font-semibold">Stock management</h1>
        <p className="mt-2 text-slate-400">Adjust quantities and keep a full history of stock changes.</p>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20 md:grid-cols-2">
        <div className="space-y-4">
          <label className="block text-sm text-slate-300">Product</label>
          <select value={selectedProductId ?? ''} onChange={(e) => setSelectedProductId(Number(e.target.value))} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand">
            {products.map((product) => (
              <option key={product.id} value={product.id}>{product.name} ({product.quantity})</option>
            ))}
          </select>
        </div>
        <div className="space-y-4">
          <label className="block text-sm text-slate-300">Adjustment type</label>
          <select value={adjustmentType} onChange={(e) => setAdjustmentType(e.target.value)} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand">
            {adjustmentTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div className="space-y-4">
          <label className="block text-sm text-slate-300">Quantity</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min={0} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand" />
        </div>
        <div className="space-y-4">
          <label className="block text-sm text-slate-300">Reason</label>
          <input value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand" />
        </div>
        <div className="md:col-span-2">
          {(error || success) && (
            <div className={`rounded-3xl border px-4 py-3 text-sm ${error ? 'border-red-600 bg-red-950/50 text-rose-200' : 'border-emerald-600 bg-emerald-950/50 text-emerald-200'}`}>
              {error || success}
            </div>
          )}
          <button type="submit" className="rounded-3xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">Save adjustment</button>
        </div>
      </form>
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
        <p className="text-sm text-slate-400">View the adjustment history on the history page.</p>
      </div>
    </div>
  );
}
