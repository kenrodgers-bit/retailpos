import { useEffect, useMemo, useState } from 'react';
import { db } from '../lib/db';
import { formatCurrency, formatDateTime } from '../lib/helpers';
import { SaleRecord } from '../types';

const filters = ['Today', 'This week', 'This month', 'All'];

export default function ReportsPage() {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [filter, setFilter] = useState('This month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    async function load() {
      const records = await db.sales.toArray();
      setSales(records);
    }
    load();
  }, []);

  const rangeSales = useMemo(() => {
    const now = new Date();
    let minDate = new Date(0);
    if (filter === 'Today') {
      minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (filter === 'This week') {
      minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    } else if (filter === 'This month') {
      minDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    let values = sales;
    if (filter !== 'All') {
      values = values.filter((sale) => sale.createdAt >= minDate.toISOString() && sale.status === 'completed');
    }
    if (startDate) {
      values = values.filter((sale) => sale.createdAt >= new Date(startDate).toISOString());
    }
    if (endDate) {
      values = values.filter((sale) => sale.createdAt <= new Date(endDate).toISOString());
    }
    return values;
  }, [endDate, filter, sales, startDate]);

  const totalRevenue = rangeSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalCost = rangeSales.reduce((sum, sale) => sum + sale.subtotal - sale.profit, 0);
  const grossProfit = rangeSales.reduce((sum, sale) => sum + sale.profit, 0);
  const productSales = useMemo(() => {
    const counts = new Map<string, number>();
    rangeSales.forEach((sale) => sale.items.forEach((item) => counts.set(item.productName, (counts.get(item.productName) ?? 0) + item.quantity)));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [rangeSales]);

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-semibold text-slate-950">Reports</h1>
        <p className="mt-2 text-slate-500">View sales, profit, best-selling products and low-stock trends from local data.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="card p-5">
          <label className="block text-sm font-medium text-slate-600">Quick filter</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
          >
            {filters.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="card p-5">
          <label className="block text-sm font-medium text-slate-600">Custom date range</label>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
            />
          </div>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Stat label="Revenue" value={formatCurrency(totalRevenue)} />
        <Stat label="Cost" value={formatCurrency(totalCost)} />
        <Stat label="Profit" value={formatCurrency(grossProfit)} />
      </div>
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-950">Best-selling products</h2>
        <div className="mt-4 space-y-3">
          {productSales.length ? (
            productSales.slice(0, 5).map(([name, qty]) => (
              <div key={name} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span>{name}</span>
                <span>{qty} sold</span>
              </div>
            ))
          ) : (
            <p className="text-slate-500">No product sales yet for this range.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-4 text-3xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
