import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/db';
import { formatCurrency, generateReceiptNumber } from '../lib/helpers';
import { ProductRecord, SaleItem, SaleRecord } from '../types';

const paymentMethods = ['Cash', 'M-Pesa', 'Card', 'Bank Transfer', 'Other'];

export default function POSPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProducts() {
      const items = (await db.products.toArray()).filter((product) => product.isActive);
      setProducts(items);
    }
    loadProducts();
  }, []);

  const categories = useMemo(() => ['all', ...new Set(products.map((p) => p.category).filter(Boolean))], [products]);
  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const q = search.toLowerCase();
        return (
          (category === 'all' || product.category === category) &&
          (product.name.toLowerCase().includes(q) || product.sku.toLowerCase().includes(q) || product.barcode.toLowerCase().includes(q))
        );
      }),
    [category, products, search]
  );

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const total = Math.max(0, subtotal - discount);

  async function addToCart(product: ProductRecord) {
    setError('');
    const existing = cart.find((item) => item.productId === product.id);
    if (existing) {
      if (existing.quantity + 1 > product.quantity) {
        if (!confirm('Stock is insufficient. Add override?')) return;
      }
      setCart((current) => current.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.sellingPrice, profit: (item.quantity + 1) * (item.sellingPrice - item.buyingPrice) } : item));
      return;
    }
    setCart((current) => [
      ...current,
      {
        productId: product.id,
        productName: product.name,
        productImage: product.imageData && product.imageType ? `data:${product.imageType};base64,${product.imageData}` : null,
        quantity: 1,
        buyingPrice: product.buyingPrice,
        sellingPrice: product.sellingPrice,
        total: product.sellingPrice,
        profit: product.sellingPrice - product.buyingPrice
      }
    ]);
  }

  function updateQuantity(productId: number, newQty: number) {
    setCart((current) => current.map((item) => {
      if (item.productId !== productId) return item;
      const quantity = Math.max(0, newQty);
      return {
        ...item,
        quantity,
        total: quantity * item.sellingPrice,
        profit: quantity * (item.sellingPrice - item.buyingPrice)
      };
    }).filter((item) => item.quantity > 0));
  }

  async function completeSale() {
    setError('');
    if (!cart.length) {
      setError('Add at least one item to complete sale.');
      return;
    }
    if (!paymentMethod) {
      setError('Select a payment method.');
      return;
    }
    if (discount > subtotal) {
      setError('Discount cannot exceed the subtotal.');
      return;
    }
    setSaving(true);
    try {
      const receiptNumber = generateReceiptNumber();
      const now = new Date().toISOString();
      const sale: SaleRecord = {
        id: 0,
        receiptNumber,
        items: cart,
        subtotal,
        discount,
        total,
        paymentMethod,
        profit: cart.reduce((sum, item) => sum + item.profit, 0),
        status: 'completed',
        voidReason: null,
        createdAt: now,
        updatedAt: now
      };
      const saleId = await db.sales.add(sale);
      for (const item of cart) {
        const product = await db.products.get(item.productId);
        if (!product) continue;
        await db.products.update(product.id, { quantity: Math.max(0, product.quantity - item.quantity), updatedAt: now });
      }
      setCart([]);
      setDiscount(0);
      navigate(`/receipt/${saleId}`);
    } catch (err) {
      setError('Unable to complete sale.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold text-slate-950">New Sale</h1>
        <p className="mt-2 text-slate-500">Search products, add items to cart and complete checkout quickly.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1.5fr_auto]">
            <div className="card p-4">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
              />
            </div>
            <div className="card p-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat === 'all' ? 'All categories' : cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="card p-4">
            <div className="grid gap-4 xl:grid-cols-3">
              {filtered.slice(0, 12).map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group rounded-3xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-500 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-3xl bg-slate-100">
                      <img
                        src={product.imageData ? `data:${product.imageType};base64,${product.imageData}` : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDE2MCAxNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE2MCIgaGVpZ2h0PSIxNjAiIGZpbGw9IiMxMTExMTExIi8+PHRleHQgeD0iODAiIHk9Ijg1IiBmb250LXNpemU9IjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNGRkZCI+PC90ZXh0Pjwvc3ZnPg=='}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-950">{product.name}</p>
                      <p className="text-xs text-slate-500">{formatCurrency(product.sellingPrice)}</p>
                      <p className="text-xs text-slate-400">Stock: {product.quantity}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-4">
            <h2 className="text-lg font-semibold text-slate-950">Cart</h2>
            {cart.length ? (
              <div className="mt-4 space-y-3">
                {cart.map((item) => (
                  <div key={item.productId} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{item.productName}</p>
                        <p className="text-sm text-slate-500">{formatCurrency(item.sellingPrice)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">-</button>
                        <span className="text-sm text-slate-950">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">+</button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                      <span>Item total</span>
                      <span>{formatCurrency(item.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Add products from the list to begin.</p>
            )}
          </div>
          <div className="card p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-600">Discount</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-600">Payment method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900">
                <div className="flex items-center justify-between font-semibold">
                  <span>Grand total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <button
                type="button"
                onClick={completeSale}
                disabled={saving}
                className="w-full rounded-3xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Processing...' : 'Complete sale'}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
