import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/db';
import { getImageUrl } from '../lib/helpers';
import { ProductRecord } from '../types';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<ProductRecord | null>(null);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      const record = await db.products.get(Number(id));
      setProduct(record ?? null);
    }
    loadProduct();
  }, [id]);

  if (!product) {
    return <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-400">Product not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{product.name}</h1>
            <p className="mt-2 text-slate-400">SKU: {product.sku || 'N/A'} • Barcode: {product.barcode || 'N/A'}</p>
          </div>
          <Link to={`/products/${product.id}/edit`} className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 transition hover:bg-slate-800">Edit product</Link>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
          {product.imageData ? <img src={getImageUrl(product.imageData, product.imageType) ?? undefined} alt={product.name} className="h-80 w-full rounded-3xl object-cover" /> : <div className="h-80 rounded-3xl bg-slate-950" />}
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
          <div className="space-y-4">
            <Property label="Category" value={product.category || 'Uncategorized'} />
            <Property label="Description" value={product.description || 'No description'} />
            <Property label="Buying price" value={`${product.buyingPrice}`} />
            <Property label="Selling price" value={`${product.sellingPrice}`} />
            <Property label="Quantity" value={`${product.quantity}`} />
            <Property label="Low-stock alert" value={`${product.lowStockAlert}`} />
            <Property label="Status" value={product.quantity === 0 ? 'Out of stock' : product.quantity <= product.lowStockAlert ? 'Low stock' : 'In stock'} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Property({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
