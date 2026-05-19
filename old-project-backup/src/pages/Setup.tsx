import { useState } from 'react';
import { createAdmin } from '../lib/auth';
import { db } from '../lib/db';
import { SettingsRecord } from '../types';

export default function SetupPage({ onSetup }: { onSetup: () => void }) {
  const [businessName, setBusinessName] = useState('');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState('KES');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    if (!businessName.trim() || !username.trim() || !password) {
      setError('Business name, username and password are required.');
      return;
    }

    setLoading(true);
    try {
      await createAdmin(username, password);
      const now = new Date().toISOString();
      const settings: SettingsRecord = {
        id: 0,
        businessName: businessName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        currency,
        receiptFooter: 'Thank you for shopping with us!',
        defaultLowStockAlert: 5,
        themeColor: '#3b82f6',
        createdAt: now,
        updatedAt: now
      };
      await db.settings.add(settings);
      onSetup();
    } catch (err) {
      setError('Unable to complete setup.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-4 py-10 text-slate-100">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/30">
        <h1 className="text-3xl font-semibold">First-Time Setup</h1>
        <p className="mt-2 text-slate-400">Create your admin login and business settings. All data stays on this phone.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Business name</label>
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Admin username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Admin password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Address</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand" rows={3} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-brand">
              <option value="KES">KES</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          {error && <div className="rounded-3xl border border-red-600 bg-red-950/50 px-4 py-3 text-sm text-red-200">{error}</div>}
          <button disabled={loading} className="w-full rounded-3xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? 'Saving...' : 'Finish Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}
