import { useState } from 'react';
import { db } from '../lib/db';
import { generateReceiptNumber } from '../lib/helpers';
import { hashPassword } from '../lib/auth';

export default function SeedDemo() {
  const [status, setStatus] = useState<string>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function seed() {
    setStatus('seeding');
    try {
      await db.transaction('rw', [db.admin, db.settings, db.products, db.sales, db.stockAdjustments], async () => {
        await db.admin.clear();
        await db.settings.clear();
        await db.products.clear();
        await db.sales.clear();
        await db.stockAdjustments.clear();

        const now = new Date().toISOString();
        // create admin with password 'admin'
        const passwordHash = await hashPassword('admin');
        await db.admin.add({ username: 'admin', passwordHash, createdAt: now, updatedAt: now } as any);

        // settings
        await db.settings.add({
          businessName: 'Demo Shoeshop',
          phone: '+254700000000',
          address: '1 Demo Street, Nairobi',
          currency: 'KES',
          receiptFooter: 'Thank you for shopping with Demo Shoeshop!',
          defaultLowStockAlert: 3,
          themeColor: '#3b82f6',
          createdAt: now,
          updatedAt: now
        } as any);

        // small placeholder image base64 (1x1 PNG)
        const placeholder = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
        const products = [
          { name: 'Classic Leather Shoe', sku: 'CLS-001', barcode: '1000001', category: 'Shoes', description: 'Comfortable leather shoes', buyingPrice: 1200, sellingPrice: 1800, quantity: 10 },
          { name: 'Sport Runner', sku: 'SPT-002', barcode: '1000002', category: 'Shoes', description: 'Lightweight running shoes', buyingPrice: 900, sellingPrice: 1400, quantity: 8 },
          { name: 'Formal Oxford', sku: 'FRM-003', barcode: '1000003', category: 'Shoes', description: 'Elegant oxford shoes', buyingPrice: 1500, sellingPrice: 2200, quantity: 5 },
          { name: 'Casual Slip-on', sku: 'CSL-004', barcode: '1000004', category: 'Shoes', description: 'Easy slip-on for daily wear', buyingPrice: 600, sellingPrice: 950, quantity: 12 },
          { name: 'Kids Sneaker', sku: 'KID-005', barcode: '1000005', category: 'Kids', description: 'Cute sneakers for kids', buyingPrice: 500, sellingPrice: 850, quantity: 6 }
        ];

        const createdProducts: { id: number; name: string; buyingPrice: number; sellingPrice: number; quantity: number }[] = [];
        for (const p of products) {
          const id = await db.products.add({
            name: p.name,
            sku: p.sku,
            barcode: p.barcode,
            category: p.category,
            description: p.description,
            buyingPrice: p.buyingPrice,
            sellingPrice: p.sellingPrice,
            quantity: p.quantity,
            lowStockAlert: 3,
            imageData: placeholder,
            imageType: 'image/png',
            isActive: true,
            createdAt: now,
            updatedAt: now
          } as any);
          createdProducts.push({ id: id as number, name: p.name, buyingPrice: p.buyingPrice, sellingPrice: p.sellingPrice, quantity: p.quantity });
        }

        // create a sample sale
        const items = createdProducts.slice(0, 2).map((p) => ({
          productId: p.id,
          productName: p.name,
          productImage: `data:image/png;base64,${placeholder}`,
          quantity: 1,
          buyingPrice: p.buyingPrice,
          sellingPrice: p.sellingPrice,
          total: p.sellingPrice,
          profit: p.sellingPrice - p.buyingPrice
        }));
        const subtotal = items.reduce((s, it) => s + it.total, 0);
        const profit = items.reduce((s, it) => s + it.profit, 0);
        await db.sales.add({ receiptNumber: generateReceiptNumber(), items, subtotal, discount: 0, total: subtotal, paymentMethod: 'Cash', profit, status: 'completed', voidReason: null, createdAt: now, updatedAt: now } as any);

        // stock adjustment example
        await db.stockAdjustments.add({ productId: createdProducts[0].id, productName: createdProducts[0].name, productImage: `data:image/png;base64,${placeholder}`, adjustmentType: 'New stock received', quantityChanged: 10, previousQuantity: createdProducts[0].quantity, newQuantity: createdProducts[0].quantity + 10, reason: 'Initial demo stock', createdAt: now } as any);
      });

      setStatus('done');
    } catch (err: any) {
      setStatus('error');
      const msg = err?.message || String(err);
      setErrorMessage(msg);
      console.error(err);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-10 text-slate-100">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-slate-950/30">
        <h1 className="text-3xl font-semibold">Seed demo data</h1>
        <p className="mt-2 text-slate-400">This will populate the local IndexedDB with sample admin, settings, products, sales, and stock adjustments.</p>
        <div className="mt-6 space-y-4">
          <button onClick={seed} disabled={status === 'seeding' || status === 'done'} className="w-full rounded-3xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50">{status === 'seeding' ? 'Seeding...' : status === 'done' ? 'Seeded' : 'Seed demo data'}</button>
          {status === 'done' && <p className="text-sm text-emerald-200">Demo data added. Go to <a className="text-brand underline" href="/login">Login</a> to sign in as <strong>admin</strong> (password: <strong>admin</strong>).</p>}
          {status === 'error' && <div className="space-y-2 text-sm text-rose-200"><div>Failed to seed demo data.</div><pre className="whitespace-pre-wrap break-words text-xs text-rose-300">{errorMessage}</pre></div>}
        </div>
      </div>
    </div>
  );
}
