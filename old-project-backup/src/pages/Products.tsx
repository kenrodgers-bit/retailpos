import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/db';
import { getImageUrl } from '../lib/helpers';
import { ProductRecord } from '../types';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const items = await db.products.toArray();
      setProducts(items);
      setLoading(false);
    }
    loadProducts();
  }, []);

  const categories = useMemo(() => ['all', ...new Set(products.map((p) => p.category).filter(Boolean))], [products]);
  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const matchesCategory = category === 'all' || product.category === category;
        const query = search.toLowerCase();
        return (
          matchesCategory &&
          (product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query) || product.barcode.toLowerCase().includes(query))
        );
      }),
    [category, products, search]
  );

  async function handleDelete(id: number) {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await db.products.delete(id);
    setProducts(products.filter((product) => product.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">Products</h1>
            <p className="mt-2 text-sm text-slate-500">Manage inventory, photos, price, and stock levels.</p>
          </div>
          <button onClick={() => navigate('/products/new')} className="rounded-3xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">
            Add product
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="card p-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU, barcode"
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
          />
        </div>
        <div className="card p-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
          >
            {categories.map((item) => (
              <option key={item} value={item}>{item === 'all' ? 'All categories' : item}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="card p-6 text-slate-500">Loading products...</div>
        ) : filtered.length ? (
          filtered.map((product) => (
            <div key={product.id} className="card overflow-hidden">
              <div className="h-52 overflow-hidden bg-slate-100">
                <img
                  src={getImageUrl(product.imageData, product.imageType) ?? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSI1MDAiIGZpbGw9IiMxMTExMTExIi8+PHRleHQgeD0iMjUwIiB5PSIyNzAiIGZvbnQtc2l6ZT0iNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNkZGQiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-5">
                <h2 className="text-xl font-semibold text-slate-950">{product.name}</h2>
                <p className="mt-2 text-sm text-slate-500">SKU: {product.sku || 'N/A'}</p>
                <p className="mt-1 text-sm text-slate-500">Category: {product.category || 'Uncategorized'}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <span className={`rounded-full px-3 py-1 ${product.quantity === 0 ? 'bg-rose-100 text-rose-700' : product.quantity <= product.lowStockAlert ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                    {product.quantity} in stock
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{product.lowStockAlert} alert</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link to={`/products/${product.id}`} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100">View</Link>
                  <Link to={`/products/${product.id}/edit`} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100">Edit</Link>
                  <button onClick={() => handleDelete(product.id)} className="rounded-3xl border border-rose-200 bg-rose-100 px-4 py-2 text-sm text-rose-700 transition hover:bg-rose-200">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card p-6 text-slate-500">No products found. Add your first product.</div>
        )}
      </div>
    </div>
  );
}
