export type AdminRecord = {
  id: number;
  username: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export type SettingsRecord = {
  id: number;
  businessName: string;
  phone: string;
  address: string;
  currency: string;
  receiptFooter: string;
  defaultLowStockAlert: number;
  themeColor: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductRecord = {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  description: string;
  buyingPrice: number;
  sellingPrice: number;
  quantity: number;
  lowStockAlert: number;
  imageData: string | null;
  imageType: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SaleItem = {
  productId: number;
  productName: string;
  productImage: string | null;
  quantity: number;
  buyingPrice: number;
  sellingPrice: number;
  total: number;
  profit: number;
};

export type SaleRecord = {
  id: number;
  receiptNumber: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  profit: number;
  status: 'completed' | 'voided';
  voidReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StockAdjustmentRecord = {
  id: number;
  productId: number;
  productName: string;
  productImage: string | null;
  adjustmentType: string;
  quantityChanged: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  createdAt: string;
};

export type BackupLogRecord = {
  id: number;
  type: string;
  fileName: string;
  createdAt: string;
};

export type SessionRecord = {
  id: number;
  adminId: number;
  createdAt: string;
};
