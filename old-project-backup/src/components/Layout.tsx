import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/', icon: <HomeIcon /> },
  { label: 'POS', to: '/pos', icon: <POSIcon /> },
  { label: 'Products', to: '/products', icon: <ProductIcon /> },
  { label: 'Sales', to: '/sales', icon: <SalesIcon /> },
  { label: 'More', to: '/settings', icon: <SettingsIcon /> }
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="relative overflow-hidden pb-28">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-br from-slate-900 via-blue-600 to-indigo-600" />
        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 text-white shadow-2xl shadow-slate-900/20 backdrop-blur-xl">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-3 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-slate-950/20">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 7h16M4 12h16M4 17h16" />
                    </svg>
                  </span>
                  Nexus POS
                </div>
                <h1 className="mt-5 text-3xl font-semibold sm:text-4xl">A modern mobile-first point of sale.</h1>
                <p className="mt-3 max-w-xl text-sm text-slate-200 sm:text-base">
                  Clean product cards, fast checkout, inventory insights, and daily reports that feel built for small shops.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" className="rounded-3xl border border-white/25 bg-white/10 px-4 py-3 text-sm text-white transition hover:bg-white/20">
                  Scan
                </button>
                <button type="button" className="rounded-3xl border border-white/25 bg-white/10 px-4 py-3 text-sm text-white transition hover:bg-white/20">
                  Alerts
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-32 sm:px-6 lg:px-8">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-6xl items-center justify-between gap-2 border-t border-slate-200/70 bg-white/95 px-4 py-3 shadow-2xl shadow-slate-900/5 backdrop-blur-xl">
        {navItems.map((item) => {
          const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 rounded-3xl px-3 py-2 text-center text-xs font-semibold transition ${isActive ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/10' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
            >
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-2xl">{item.icon}</div>
              <span className="mt-1 block">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12L12 3l9 9" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function POSIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path d="M7 11h10M7 15h4" />
    </svg>
  );
}

function ProductIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" />
      <path d="M12 3v18" />
      <path d="M21 7l-9 4-9-4" />
    </svg>
  );
}

function SalesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19h16" />
      <path d="M7 15l3-3 4 4 5-5" />
      <path d="M5 7h14" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
