import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Home, Store, Package, BarChart3, Settings, Bell, ShoppingBag, Wallet,
  CalendarDays, TrendingUp, Box, Receipt, Search, SlidersHorizontal, Plus,
  ShoppingCart, X, Printer, Download, CreditCard, Banknote, ScanLine, ChevronRight
} from 'lucide-react';
import './styles.css';

const products = [
  { id: 1, name: 'Premium Basmati Rice 5kg', category: 'Groceries', selling: 625, buying: 540, stock: 125, sold: 125, img: '🍚', status: 'In Stock' },
  { id: 2, name: 'Sunflower Cooking Oil 1L', category: 'Groceries', selling: 490, buying: 410, stock: 98, sold: 98, img: '🛢️', status: 'In Stock' },
  { id: 3, name: 'Red Label Tea 250g', category: 'Beverages', selling: 380, buying: 300, stock: 76, sold: 76, img: '🍵', status: 'In Stock' },
  { id: 4, name: 'Fresh Milk 1L', category: 'Dairy', selling: 180, buying: 140, stock: 8, sold: 41, img: '🥛', status: 'Low Stock' },
  { id: 5, name: 'White Sugar 1kg', category: 'Groceries', selling: 120, buying: 95, stock: 0, sold: 25, img: '🧂', status: 'Out of Stock' },
  { id: 6, name: 'Coca-Cola 500ml', category: 'Drinks', selling: 120, buying: 85, stock: 85, sold: 64, img: '🥤', status: 'In Stock' },
  { id: 7, name: 'Britannia Bread 400g', category: 'Food', selling: 150, buying: 110, stock: 35, sold: 57, img: '🍞', status: 'In Stock' },
  { id: 8, name: 'Paracetamol 500mg', category: 'Medicine', selling: 80, buying: 50, stock: 70, sold: 48, img: '💊', status: 'In Stock' },
];

const recentSales = [
  { id: 'INV-10045', time: 'May 22, 2026 • 07:30 PM', amount: 120 },
  { id: 'INV-10044', time: 'May 22, 2026 • 06:45 PM', amount: 85.5 },
  { id: 'INV-10043', time: 'May 22, 2026 • 06:15 PM', amount: 230 },
];

function money(value) {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 2 }).format(value);
}

function Header({ title, subtitle, compact = false }) {
  return <div className={`hero ${compact ? 'compact' : ''}`}>
    <div className="status"><span>7:45</span><span className="pill"/><span>▮▮▮  WiFi  89</span></div>
    <div className="brand-row">
      <div className="logo"><ShoppingBag size={22}/></div>
      <div className="brand"><b>Nexus</b> POS</div>
      <div className="notify"><Bell size={22}/><span>3</span></div>
    </div>
    {title && <h1>{title}</h1>}
    {subtitle && <p>{subtitle}</p>}
  </div>
}

function BottomNav({ tab, setTab }) {
  const items = [
    ['dashboard', Home, 'Dashboard'], ['pos', Store, 'POS'], ['products', Package, 'Products'], ['reports', BarChart3, 'Reports'], ['settings', Settings, 'Settings']
  ];
  return <nav className="bottom-nav">{items.map(([key, Icon, label]) => <button key={key} onClick={() => setTab(key)} className={tab === key ? 'active' : ''}><Icon size={26}/><span>{label}</span></button>)}</nav>;
}

function Metric({ icon: Icon, label, value, detail, tone = 'purple' }) {
  return <div className="metric-card"><div className={`round ${tone}`}><Icon size={30}/></div><div><span className="label">{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</div></div>;
}

function Dashboard() {
  return <><Header title="Good evening, Admin" subtitle="Here’s what’s happening with your store today." />
    <main className="content overlap">
      <section className="metrics"><Metric icon={Wallet} label="Today's Sales" value={money(1245.5)} detail="↑ 12.5% vs yesterday"/><Metric icon={CalendarDays} label="This Month" value={money(18430.75)} detail="↑ 15.3% vs last month" tone="blue"/><Metric icon={TrendingUp} label="Total Profit" value={money(6240.3)} detail="↑ 10.8% vs last month" tone="green"/><Metric icon={Box} label="Low Stock" value="8" detail="Products need attention" tone="orange"/></section>
      <SectionTitle title="Recent Sales" />
      <div className="list-card">{recentSales.map(s => <div className="sale-row" key={s.id}><div className="circle-icon"><Receipt size={22}/></div><div><b>{s.id}</b><span>{s.time}</span></div><strong>{money(s.amount)}</strong><em>Paid</em><ChevronRight className="chev" size={22}/></div>)}</div>
      <SectionTitle title="Best Selling Products" />
      <div className="list-card products-mini">{products.slice(0,3).map((p, i) => <div className="top-product" key={p.id}><div className="emoji-img">{p.img}</div><div><b>{p.name}</b><span>{p.sold} sold</span><div className="bar"><i style={{width: `${95 - i*14}%`}}/></div></div><strong>{money(p.selling)}</strong></div>)}</div>
    </main></>;
}

function SectionTitle({ title }) { return <div className="section-title"><h2>{title}</h2><button>View all</button></div>; }

function POS() {
  const cart = [products[5], products[6], products[2]];
  return <><div className="hero compact sale-head"><div className="status"><span>7:45</span><span className="pill"/><span>▮▮▮ WiFi 89</span></div><h1>New Sale</h1><ScanLine className="scan"/></div>
    <main className="content pos-content overlap">
      <div className="search"><Search size={24}/><span>Search products by name or barcode</span><ScanLine size={23}/></div>
      <div className="chips"><button className="selected">All</button><button>☕ Drinks</button><button>🍴 Food</button><button>💊 Medicine</button></div>
      <div className="product-grid">{products.slice(5,8).concat(products.slice(3,5), products.slice(0,1)).map(p => <div className="pos-card" key={p.id}><span className="emoji-img">{p.img}</span><div><b>{p.name}</b><strong>{money(p.selling)}</strong><small>In stock: {p.stock}</small></div><button>Add</button><i>+</i></div>)}</div>
      <div className="cart-sheet"><div className="cart-title"><span><ShoppingCart/> Cart (3 items)</span><button>Clear</button></div>{cart.map((p, i) => <div className="cart-row" key={p.id}><span className="mini-img">{p.img}</span><b>{p.name}</b><em>x {i===0?2:1}</em><strong>{money(i===0?p.selling*2:p.selling)}</strong><X size={18}/></div>)}<div className="totals"><span>Subtotal <b>{money(650)}</b></span><span className="green">Discount <b>-{money(30)}</b></span><strong>Total <b>{money(620)}</b></strong></div><p className="pay-label">Payment Method</p><div className="pay"><button className="selected"><Banknote size={20}/>Cash</button><button>M-Pesa</button><button><CreditCard size={20}/>Card</button></div><div className="checkout"><button>Complete Sale</button><button className="print"><Printer/>Print</button></div></div>
    </main></>;
}

function Products() {
  return <><Header title="Products" subtitle="Manage your inventory and product catalog." />
    <main className="content overlap inventory-panel"><div className="search"><Search/><span>Search products...</span><SlidersHorizontal/></div><div className="filters"><button>All Categories⌄</button><button>All Status⌄</button><button>🟠 Low Stock</button></div><div className="actions"><button><Plus/> Add Product</button><button><Receipt/> Stock Management</button></div><div className="summary"><span>Total Products<br/><b>128</b></span><span>Total Value<br/><b>{money(24580.75)}</b></span></div>{products.slice(0,5).map(p => <div className="inventory-card" key={p.id}><div className="emoji-img">{p.img}</div><div className="inv-main"><b>{p.name}</b><span>{p.category}</span><div className="prices"><span>Selling Price<br/><b>{money(p.selling)}</b></span><span>Buying Price<br/><b>{money(p.buying)}</b></span><span>Stock<br/><b className={p.stock < 1 ? 'red' : p.stock < 10 ? 'orange-text' : 'green'}>{p.stock}</b></span></div></div><Badge status={p.status}/><button className="dots">⋮</button></div>)}</main></>;
}
function Badge({ status }) { const c = status === 'Out of Stock' ? 'danger' : status === 'Low Stock' ? 'warn' : 'ok'; return <span className={`badge ${c}`}>{status}</span> }

function Reports() {
  return <><div className="hero compact report-head"><div className="status"><span>7:45</span><span className="pill"/><span>▮▮▮ WiFi 89</span></div><h1>Reports</h1><CalendarDays className="scan"/></div><main className="content overlap"><div className="range"><button className="selected">📅 Today</button><button>Week</button><button>Month</button><button>Custom⌄</button></div><section className="metrics"><Metric icon={Wallet} label="Total Revenue" value={money(2845.6)} detail="↑ 12.6% vs yesterday"/><Metric icon={TrendingUp} label="Gross Profit" value={money(1240.3)} detail="↑ 11.3% vs yesterday" tone="green"/><Metric icon={ShoppingBag} label="Products Sold" value="128" detail="↑ 8.7% vs yesterday" tone="orange"/><Metric icon={Receipt} label="Sales Count" value="45" detail="↑ 5.4% vs yesterday" tone="blue"/></section><SectionTitle title="Top Products"/><div className="list-card products-mini">{products.slice(0,3).map((p, i) => <div className="top-product" key={p.id}><div className="emoji-img">{p.img}</div><div><b>{p.name}</b><span>{p.sold} sold</span><div className="bar"><i style={{width: `${95 - i*14}%`}}/></div></div><strong>{money(p.selling)}</strong></div>)}</div><h2 className="plain-title">Payment Methods</h2><div className="payment-card"><div className="donut"><span>Total<br/>{money(2845.6)}</span></div><div className="legend"><p><i/>Cash <b>{money(1256)}</b> 44.1%</p><p><i className="g"/>M-Pesa <b>{money(1023)}</b> 36.0%</p><p><i className="b"/>Card <b>{money(416)}</b> 14.6%</p><p><i className="o"/>Other <b>{money(150)}</b> 5.3%</p></div></div><div className="report-buttons"><button><Download/> Export CSV</button><button><Printer/> Print Report</button></div></main></>;
}

function SettingsPage() { return <><Header title="Settings" subtitle="Business profile, backup, and app options."/><main className="content overlap"><div className="settings-card"><h2>Nexus POS</h2><p>This demo is ready for you to extend with Dexie IndexedDB storage, image uploads, backup/restore, and real receipt printing.</p><button>Export Backup</button><button>Import Backup</button></div></main></>; }

function App() { const [tab, setTab] = useState('dashboard'); const Page = useMemo(() => ({ dashboard: Dashboard, pos: POS, products: Products, reports: Reports, settings: SettingsPage }[tab]), [tab]); return <div className="app"><div className="phone"><Page/><BottomNav tab={tab} setTab={setTab}/></div></div>; }

createRoot(document.getElementById('root')).render(<App />);
