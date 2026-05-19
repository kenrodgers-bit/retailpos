import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../lib/db';
import { formatCurrency, formatDateTime, getImageUrl } from '../lib/helpers';
import { SaleRecord } from '../types';

export default function SaleDetailsPage() {
  const { id } = useParams();
  const [sale, setSale] = useState<SaleRecord | null>(null);

  useEffect(() => {
    async function loadSale() {
      if (!id) return;
      const record = await db.sales.get(Number(id));
      setSale(record ?? null);
    }
    loadSale();
  }, [id]);

  if (!sale) {
    return <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-400">Sale not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Sale details</h1>
            <p className="mt-2 text-slate-400">Receipt {sale.receiptNumber} • {formatDateTime(sale.createdAt)}</p>
          </div>
          <Link to="/sales" className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 transition hover:bg-slate-800">Back to sales</Link>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
        <div className="grid gap-4 sm:grid-cols-2">
          <Info label="Payment method" value={sale.paymentMethod} />
          <Info label="Status" value={sale.status} />
          <Info label="Subtotal" value={formatCurrency(sale.subtotal)} />
          <Info label="Total" value={formatCurrency(sale.total)} />
        </div>
        {sale.voidReason && <div className="mt-4 rounded-3xl border border-rose-600 bg-rose-950/40 p-4 text-sm text-rose-200">Voided: {sale.voidReason}</div>}
      </div>
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl shadow-slate-950/20">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-950">
            <tr>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-slate-400">Item</th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-[0.2em] text-slate-400">Qty</th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-[0.2em] text-slate-400">Unit</th>
              <th className="px-4 py-3 text-right text-xs uppercase tracking-[0.2em] text-slate-400">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950">
            {sale.items.map((item) => (
              <tr key={item.productId}>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    {item.productImage ? <img src={getImageUrl(item.productImage, 'image/jpeg') ?? undefined} alt={item.productName} className="h-12 w-12 rounded-2xl object-cover" /> : <div className="h-12 w-12 rounded-2xl bg-slate-800" />}
                    <div>
                      <p className="font-semibold text-white">{item.productName}</p>
                      <p className="text-sm text-slate-400">Profit {formatCurrency(item.profit)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-right text-slate-400">{item.quantity}</td>
                <td className="px-4 py-4 text-right text-slate-400">{formatCurrency(item.sellingPrice)}</td>
                <td className="px-4 py-4 text-right text-slate-200">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
