import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import { formatCurrency, formatDateTime } from '../lib/helpers';

export default function DashboardPage() {
  const [salesToday, setSalesToday] = useState(0);
  const [thisWeek, setThisWeek] = useState(0);
  const [thisMonth, setThisMonth] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStock, setLowStock] = useState(0);
  const [outOfStock, setOutOfStock] = useState(0);
  const [inventoryValue, setInventoryValue] = useState(0);
  const [profit, setProfit] = useState(0);
  const [recentSales, setRecentSales] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      const products = await db.products.toArray();
      const sales = await db.sales.toArray();
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const todaySales = sales.filter((sale) => sale.createdAt >= startOfDay && sale.status === 'completed');
      setSalesToday(todaySales.reduce((sum, sale) => sum + sale.total, 0));
      setThisWeek(sales.filter((sale) => sale.createdAt >= startOfWeek && sale.status === 'completed').reduce((sum, sale) => sum + sale.total, 0));
      setThisMonth(sales.filter((sale) => sale.createdAt >= startOfMonth && sale.status === 'completed').reduce((sum, sale) => sum + sale.total, 0));
      setTotalProducts(products.length);
      setLowStock(products.filter((product) => product.quantity > 0 && product.quantity <= product.lowStockAlert).length);
      setOutOfStock(products.filter((product) => product.quantity === 0).length);
      setInventoryValue(products.reduce((sum, product) => sum + product.buyingPrice * product.quantity, 0));
      setProfit(sales.filter((sale) => sale.status === 'completed').reduce((sum, sale) => sum + sale.profit, 0));
      setRecentSales(sales.slice(-5).reverse());
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Today', value: formatCurrency(salesToday) },
          { title: 'This week', value: formatCurrency(thisWeek) },
          { title: 'This month', value: formatCurrency(thisMonth) },
          { title: 'Profit', value: formatCurrency(profit) }
        ].map((card) => (
          <div key={card.title} className="card p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{card.title}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-950">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-slate-950">Inventory status</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Stat label="Products" value={totalProducts} />
            <Stat label="Low stock" value={lowStock} badge="warning" />
            <Stat label="Out of stock" value={outOfStock} badge="danger" />
          </div>
          <div className="mt-6 rounded-3xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Inventory value</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(inventoryValue)}</p>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold text-slate-950">Recent sales</h2>
          <div className="mt-4 space-y-3">
            {recentSales.length ? (
              recentSales.map((sale) => (
                <div key={sale.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{sale.receiptNumber}</p>
                  <p className="mt-2 text-base font-semibold text-slate-950">{formatCurrency(sale.total)}</p>
                  <p className="text-sm text-slate-500">{formatDateTime(sale.createdAt)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No recent sales yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-semibold text-slate-950">Sales snapshot</h2>
        <p className="mt-3 text-slate-500">All totals are computed from the local IndexedDB database.</p>
      </div>
    </div>
  );
}

function Stat({ label, value, badge }: { label: string; value: number; badge?: 'warning' | 'danger' }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
      {badge === 'warning' && <span className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-700">Low stock</span>}
      {badge === 'danger' && <span className="mt-3 inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-700">Out of stock</span>}
    </div>
  );
}
