import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import { ProductRecord, SaleRecord, SettingsRecord, StockAdjustmentRecord, AdminRecord } from '../types';

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function BackupRestorePage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(''), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  async function exportBackup() {
    const admin = await db.admin.toArray();
    const settings = await db.settings.toArray();
    const products = await db.products.toArray();
    const sales = await db.sales.toArray();
    const stockAdjustments = await db.stockAdjustments.toArray();
    const data = { admin, settings, products, sales, stockAdjustments, exportedAt: new Date().toISOString() };
    downloadFile(`shoeshop-backup-${new Date().toISOString()}.json`, JSON.stringify(data, null, 2));
    setMessage('Backup exported successfully.');
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    setError('');
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || !parsed.admin || !parsed.settings || !parsed.products || !parsed.sales) {
        setError('Backup file is invalid.');
        return;
      }
      if (!confirm('Importing backup will replace existing data. Continue?')) return;
      await db.transaction('rw', [db.admin, db.settings, db.products, db.sales, db.stockAdjustments], async () => {
        await db.admin.clear();
        await db.settings.clear();
        await db.products.clear();
        await db.sales.clear();
        await db.stockAdjustments.clear();
        await db.admin.bulkAdd(parsed.admin as AdminRecord[]);
        await db.settings.bulkAdd(parsed.settings as SettingsRecord[]);
        await db.products.bulkAdd(parsed.products as ProductRecord[]);
        await db.sales.bulkAdd(parsed.sales as SaleRecord[]);
        await db.stockAdjustments.bulkAdd(parsed.stockAdjustments as StockAdjustmentRecord[]);
      });
      setMessage('Import completed successfully.');
    } catch (err) {
      setError('Failed to import backup. File may be invalid.');
    }
  }

  async function exportCSV(table: string) {
    const records = await db.table(table).toArray();
    if (!records.length) {
      setError(`No records available for ${table}.`);
      return;
    }
    const keys = Object.keys(records[0]);
    const csv = [keys.join(','), ...records.map((row) => keys.map((key) => JSON.stringify((row as any)[key] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${table}-${new Date().toISOString()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage(`${table} exported as CSV.`);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-slate-950/20">
        <h1 className="text-2xl font-semibold">Backup & restore</h1>
        <p className="mt-2 text-slate-400">Export a full JSON backup and restore local data if the phone changes or browser storage is cleared.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <button onClick={exportBackup} className="rounded-3xl bg-brand px-6 py-4 text-left text-sm font-semibold text-white transition hover:bg-blue-500">Export full app backup</button>
        <label className="cursor-pointer rounded-3xl border border-slate-700 bg-slate-950 px-6 py-4 text-sm text-slate-100 transition hover:bg-slate-900">
          Import backup JSON
          <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
        </label>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {['products', 'sales', 'stockAdjustments'].map((table) => (
          <button key={table} onClick={() => void exportCSV(table)} className="rounded-3xl border border-slate-800 bg-slate-900 px-6 py-4 text-left text-sm text-slate-100 transition hover:bg-slate-950">
            Export {table} CSV
          </button>
        ))}
      </div>
      <div className="rounded-3xl border border-amber-600 bg-amber-950/20 p-4 text-sm text-amber-100">
        <p className="font-semibold">Warning</p>
        <p>Your data is stored only on this phone. If this phone is lost, damaged, reset, or browser data is cleared, your POS data may be lost. Export backups regularly.</p>
      </div>
      {message && <div className="rounded-3xl border border-emerald-600 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">{message}</div>}
      {error && <div className="rounded-3xl border border-rose-600 bg-rose-950/30 px-4 py-3 text-sm text-rose-200">{error}</div>}
    </div>
  );
}
