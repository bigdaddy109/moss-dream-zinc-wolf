export const CHANNELS = ["門市", "直播", "蝦皮", "IG", "批發", "其他"] as const;
export type Channel = (typeof CHANNELS)[number];

export type Category = {
  id: number;
  name: string;
  sortOrder: number;
};

export type Supplier = {
  id: number;
  name: string;
  note: string;
};

export type Product = {
  id: number;
  sku: string;
  name: string;
  categoryId: number;
  categoryName: string;
  color: string;
  spec: string;
  cost: number;
  price: number;
  stock: number;
  minStock: number;
  isActive: boolean;
};

export type LineDraft = {
  key: string;
  productId: number;
  name: string;
  sku: string;
  stock: number;
  qty: number;
  unit: number;
};

export type RestockSuggestion = {
  supplierId: number | null;
  supplierName: string;
  lines: LineDraft[];
};

export type PurchaseListItem = {
  id: number;
  number: string;
  occurredOn: string;
  supplierName: string;
  note: string;
  itemCount: number;
  qty: number;
  total: number;
};

export type PurchaseDetail = PurchaseListItem & {
  items: Array<{
    productId: number;
    name: string;
    sku: string;
    qty: number;
    unitCost: number;
  }>;
};

export type SaleListItem = {
  id: number;
  number: string;
  occurredOn: string;
  channel: string;
  note: string;
  itemCount: number;
  qty: number;
  total: number;
  cost: number;
  profit: number;
};

export type SaleDetail = SaleListItem & {
  items: Array<{
    productId: number;
    name: string;
    sku: string;
    qty: number;
    unitPrice: number;
    unitCost: number;
  }>;
};

export type StockMove = {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  kind: "purchase" | "sale" | "adjust";
  qtyDelta: number;
  note: string;
  createdAt: string;
};

export type DashboardData = {
  todaySales: number;
  todayCount: number;
  monthSales: number;
  monthCost: number;
  monthProfit: number;
  monthCount: number;
  inventoryValue: number;
  skuCount: number;
  unitCount: number;
  lowStock: Product[];
  recentSales: SaleListItem[];
  series: Array<{ date: string; sales: number; qty: number }>;
  topProducts: Array<{ name: string; qty: number; sales: number }>;
};

export type ReportData = {
  from: string;
  to: string;
  sales: number;
  cost: number;
  profit: number;
  orderCount: number;
  qty: number;
  byChannel: Array<{ channel: string; sales: number; qty: number }>;
  byProduct: Array<{
    productId: number;
    name: string;
    sku: string;
    qty: number;
    sales: number;
    cost: number;
    profit: number;
  }>;
  series: Array<{ date: string; sales: number }>;
};
