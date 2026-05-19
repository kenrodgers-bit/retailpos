import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../lib/db';
import { formatCurrency, formatDateTime, getImageUrl } from '../lib/helpers';
import { SaleRecord } from '../types';

export default function ReceiptViewPage() {
  const { id } = useParams();
  const [sale, setSale] = useState<SaleRecord | null>(null);
  const [settings, setSettings] = useState<{ businessName: string; phone: string; address: string; receiptFooter: string; currency: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      if (!id) return;
      const record = await db.sales.get(Number(id));
      const businessSettings = await db.settings.orderBy('id').last();
      setSale(record ?? null);
      setSettings(
        businessSettings
          ? {
              businessName: businessSettings.businessName,
              phone: businessSettings.phone,
              address: businessSettings.address,
              receiptFooter: businessSettings.receiptFooter,
              currency: businessSettings.currency
            }
          : null
      );
    }
    load();
  }, [id]);

  if (!sale || !settings) {
    return <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-400">Sale receipt not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Receipt</h1>
            <p className="mt-2 text-slate-400">Receipt number {sale.receiptNumber}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => window.print()} className="rounded-3xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">Print</button>
            <button onClick={() => navigate('/sales')} className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 transition hover:bg-slate-800">Back to sales</button>
          </div>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white">{settings.businessName}</h2>
            <p className="text-sm text-slate-400">{settings.address}</p>
            <p className="text-sm text-slate-400">{settings.phone}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Detail label="Date" value={formatDateTime(sale.createdAt)} />
            <Detail label="Payment" value={sale.paymentMethod} />
            <Detail label="Status" value={sale.status} />
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
              <thead className="bg-slate-950">
                <tr>
                  <th className="px-4 py-3 text-slate-400">Item</th>
                  <th className="px-4 py-3 text-right text-slate-400">Qty</th>
                  <th className="px-4 py-3 text-right text-slate-400">Unit</th>
                  <th className="px-4 py-3 text-right text-slate-400">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sale.items.map((item) => (
                  <tr key={item.productId}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {item.productImage ? <img src={getImageUrl(item.productImage, 'image/jpeg') ?? undefined} alt={item.productName} className="h-12 w-12 rounded-2xl object-cover" /> : <div className="h-12 w-12 rounded-2xl bg-slate-800" />}
                        <div>
                          <p className="font-semibold text-white">{item.productName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-slate-300">{item.quantity}</td>
                    <td className="px-4 py-4 text-right text-slate-300">{formatCurrency(item.sellingPrice)}</td>
                    <td className="px-4 py-4 text-right text-slate-200">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-2 rounded-3xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between text-sm text-slate-400"><span>Subtotal</span><span>{formatCurrency(sale.subtotal)}</span></div>
            <div className="flex items-center justify-between text-sm text-slate-400"><span>Discount</span><span>{formatCurrency(sale.discount)}</span></div>
            <div className="flex items-center justify-between text-lg font-semibold text-white"><span>Total</span><span>{formatCurrency(sale.total)}</span></div>
          </div>
          <p className="text-sm text-slate-400">{settings.receiptFooter}</p>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}
