import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changeAdminPassword } from '../lib/auth';
import { db } from '../lib/db';

export default function SettingsPage({ onLogout }: { onLogout: () => void }) {
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState('KES');
  const [receiptFooter, setReceiptFooter] = useState('');
  const [defaultLowStockAlert, setDefaultLowStockAlert] = useState(5);
  const [themeColor, setThemeColor] = useState('#3b82f6');
  const [username, setUsername] = useState('admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadSettings() {
      const settings = await db.settings.orderBy('id').last();
      if (settings) {
        setBusinessName(settings.businessName);
        setPhone(settings.phone);
        setAddress(settings.address);
        setCurrency(settings.currency);
        setReceiptFooter(settings.receiptFooter);
        setDefaultLowStockAlert(settings.defaultLowStockAlert);
        setThemeColor(settings.themeColor);
      }
      const admin = await db.admin.orderBy('id').last();
      if (admin) setUsername(admin.username);
    }
    loadSettings();
  }, []);

  async function saveSettings() {
    setMessage('Settings saved.');
    const settings = await db.settings.orderBy('id').last();
    if (settings) {
      await db.settings.update(settings.id, {
        businessName: businessName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        currency,
        receiptFooter: receiptFooter.trim(),
        defaultLowStockAlert,
        themeColor,
        updatedAt: new Date().toISOString()
      });
    }
    setTimeout(() => setMessage(''), 3000);
  }

  async function handlePasswordChange() {
    if (!currentPassword || !newPassword) {
      setMessage('Enter current and new password.');
      return;
    }
    const admin = await db.admin.orderBy('id').last();
    if (!admin) return;
    const verified = await import('../lib/auth').then((m) => m.verifyAdmin(admin.username, currentPassword));
    if (!verified) {
      setMessage('Current password is incorrect.');
      return;
    }
    await changeAdminPassword(admin.id, newPassword);
    setMessage('Password updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setMessage(''), 3000);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-2 text-slate-400">Update your business profile, app preferences, and admin password.</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
          <h2 className="text-xl font-semibold">Business details</h2>
          <div className="mt-4 space-y-4">
            {[
              { label: 'Business name', value: businessName, setter: setBusinessName },
              { label: 'Phone', value: phone, setter: setPhone },
              { label: 'Address', value: address, setter: setAddress }
            ].map((field) => (
              <div key={field.label} className="space-y-2">
                <label className="block text-sm text-slate-300">{field.label}</label>
                <input value={field.value} onChange={(e) => field.setter(e.target.value)} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none" />
              </div>
            ))}
            <div className="space-y-2">
              <label className="block text-sm text-slate-300">Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none">
                <option value="KES">KES</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-slate-300">Receipt footer</label>
              <textarea value={receiptFooter} onChange={(e) => setReceiptFooter(e.target.value)} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none" rows={3} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-slate-300">Default low-stock threshold</label>
              <input type="number" value={defaultLowStockAlert} onChange={(e) => setDefaultLowStockAlert(Number(e.target.value))} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none" min={0} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-slate-300">Theme color</label>
              <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="h-12 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none" />
            </div>
            <button onClick={saveSettings} className="rounded-3xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">Save settings</button>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
          <h2 className="text-xl font-semibold">Admin account</h2>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm text-slate-300">Username</label>
              <input value={username} disabled className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-slate-300">Current password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-slate-300">New password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" />
            </div>
            <button onClick={handlePasswordChange} className="rounded-3xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">Change password</button>
            <button onClick={onLogout} className="rounded-3xl border border-slate-700 bg-slate-950 px-6 py-3 text-sm text-slate-100 transition hover:bg-slate-800">Logout</button>
            {message && <div className="rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-200">{message}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
