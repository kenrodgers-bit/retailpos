import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/db';
import { SaleRecord } from '../types';
import { formatCurrency, formatDateTime } from '../lib/helpers';

const paymentMethods = ['All', 'Cash', 'M-Pesa', 'Card', 'Bank Transfer', 'Other'];

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [query, setQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadSales() {
      setLoading(true);
      const records = await db.sales.orderBy('createdAt').reverse().toArray();
      setSales(records);
      setLoading(false);
    }
    loadSales();
  }, []);

  const filtered = sales.filter((sale) => {
    const matchesReceipt = sale.receiptNumber.toLowerCase().includes(query.toLowerCase());
    const matchesPayment = paymentFilter === 'All' || sale.paymentMethod === paymentFilter;
    return matchesReceipt && matchesPayment;
  });

  async function voidSale(sale: SaleRecord) {
    const reason = prompt('Reason for voiding sale');
    if (!reason) return;
    if (!confirm('Void this sale? It will no longer count in reports.')) return;
    await db.sales.update(sale.id, { status: 'voided', voidReason: reason, updatedAt: new Date().toISOString() });
    if (confirm('Restore sold stock?')) {
      for (const item of sale.items) {
        const product = await db.products.get(item.productId);
        if (product) {
          await db.products.update(product.id, { quantity: product.quantity + item.quantity, updatedAt: new Date().toISOString() });
        }
      }
    }
    setSales((current) => current.map((record) => (record.id === sale.id ? { ...record, status: 'voided', voidReason: reason } : record)));
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Sales history</h1>
            <p className="mt-2 text-slate-400">Search receipts, filter payments, inspect or void completed sales.</p>
          </div>
          <button onClick={() => navigate('/pos')} className="rounded-3xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">Go to POS</button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search receipt" className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand" />
        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand">
          {paymentMethods.map((method) => <option key={method} value={method}>{method}</option>)}
        </select>
      </div>
      {loading ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-400">Loading sales history...</div>
      ) : filtered.length ? (
        <div className="space-y-4">
          {filtered.map((sale) => (
            <div key={sale.id} className={`rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl shadow-slate-950/20 ${sale.status === 'voided' ? 'opacity-70' : ''}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-400">{formatDateTime(sale.createdAt)}</p>
                  <p className="text-lg font-semibold text-white">{sale.receiptNumber}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">{sale.paymentMethod}</span>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">{sale.status}</span>
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
                <div className="text-slate-400">{sale.items.length} items • {formatCurrency(sale.total)}</div>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/sales/${sale.id}`} className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 transition hover:bg-slate-800">Details</Link>
                  <Link to={`/receipt/${sale.id}`} className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 transition hover:bg-slate-800">Receipt</Link>
                  {sale.status !== 'voided' && (
                    <button onClick={() => void voidSale(sale)} className="rounded-3xl border border-rose-600 bg-rose-600/10 px-4 py-2 text-sm text-rose-200 transition hover:bg-rose-600/20">Void</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-400">No sales found for this search.</div>
      )}
    </div>
  );
}
