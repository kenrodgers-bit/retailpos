import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import { StockAdjustmentRecord } from '../types';
import { formatDateTime, getImageUrl } from '../lib/helpers';

export default function StockHistoryPage() {
  const [history, setHistory] = useState<StockAdjustmentRecord[]>([]);

  useEffect(() => {
    async function load() {
      const records = await db.stockAdjustments.orderBy('createdAt').reverse().toArray();
      setHistory(records);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
        <h1 className="text-2xl font-semibold">Stock adjustment history</h1>
        <p className="mt-2 text-slate-400">Track changes, reasons, and inventory corrections.</p>
      </div>
      <div className="space-y-4">
        {history.length ? (
          history.map((record) => (
            <div key={record.id} className="rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-xl shadow-slate-950/20">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  {record.productImage ? <img src={getImageUrl(record.productImage, 'image/jpeg') ?? undefined} alt={record.productName} className="h-16 w-16 rounded-3xl object-cover" /> : <div className="h-16 w-16 rounded-3xl bg-slate-800" />}
                  <div>
                    <p className="text-lg font-semibold text-white">{record.productName}</p>
                    <p className="text-sm text-slate-400">{record.adjustmentType}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400">{formatDateTime(record.createdAt)}</p>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <Summary label="Changed" value={`${record.quantityChanged}`} />
                <Summary label="Before" value={`${record.previousQuantity}`} />
                <Summary label="After" value={`${record.newQuantity}`} />
              </div>
              <div className="mt-3 rounded-3xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-400">Reason: {record.reason}</div>
            </div>
          ))
        ) : (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-400">No stock adjustments recorded yet.</div>
        )}
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-200">
      <p className="text-slate-400">{label}</p>
      <p className="mt-1 text-white">{value}</p>
    </div>
  );
}
