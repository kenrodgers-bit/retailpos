import Dexie, { Table } from 'dexie';
import {
  AdminRecord,
  BackupLogRecord,
  ProductRecord,
  SaleRecord,
  SessionRecord,
  SettingsRecord,
  StockAdjustmentRecord
} from '../types';

export class ShoeshopDB extends Dexie {
  admin!: Table<AdminRecord, number>;
  settings!: Table<SettingsRecord, number>;
  products!: Table<ProductRecord, number>;
  sales!: Table<SaleRecord, number>;
  stockAdjustments!: Table<StockAdjustmentRecord, number>;
  backupLogs!: Table<BackupLogRecord, number>;
  sessions!: Table<SessionRecord, number>;

  constructor() {
    super('shoeshopdb');
    this.version(1).stores({
      admin: '++id,username,createdAt',
      settings: '++id,businessName',
      products: '++id,sku,barcode,category,name,quantity',
      sales: '++id,receiptNumber,createdAt,paymentMethod,status',
      stockAdjustments: '++id,productId,createdAt,adjustmentType',
      backupLogs: '++id,type,createdAt',
      sessions: '++id,adminId,createdAt'
    });
  }
}

export const db = new ShoeshopDB();
