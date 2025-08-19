// 分析・レポート用の型定義

export interface SalesData {
  id: string
  date: Date
  orderId: string
  productId: string
  productName: string
  productSku: string
  category: string
  brand: string
  quantity: number
  unitPrice: number
  totalAmount: number
  shippingCost: number
  totalCost: number
  profit: number
  profitMargin: number
  shippingMethod: string
  destination: string
  currency: 'JPY' | 'USD' | 'TJS'
}

export interface DashboardStats {
  totalSales: number
  totalOrders: number
  totalProducts: number
  averageOrderValue: number
  topSellingProducts: ProductRanking[]
  recentOrders: RecentOrder[]
  salesTrend: SalesTrendData[]
  alertItems: PriceAlert[]
}

export interface ProductRanking {
  productId: string
  name: string
  sku: string
  brand: string
  totalSold: number
  totalRevenue: number
  profitMargin: number
  image?: string
}

export interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  amount: number
  items: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
  createdAt: Date
  destination: string
}

export interface SalesTrendData {
  date: string
  sales: number
  orders: number
  profit: number
}

export interface PriceAlert {
  id: string
  productId: string
  productName: string
  type: 'price_increase' | 'high_shipping_cost' | 'low_profit_margin' | 'exchange_rate_change'
  severity: 'low' | 'medium' | 'high'
  message: string
  oldValue: number
  newValue: number
  createdAt: Date
}

export interface CategorySalesData {
  category: string
  sales: number
  orders: number
  profit: number
  profitMargin: number
}

export interface ShippingAnalysis {
  method: string
  totalOrders: number
  totalCost: number
  averageCost: number
  averageWeight: number
  averageDeliveryDays: number
}

export interface MonthlyReport {
  month: string
  totalSales: number
  totalOrders: number
  totalProfit: number
  profitMargin: number
  topCategories: CategorySalesData[]
  shippingBreakdown: ShippingAnalysis[]
}

export interface ProductProfitAnalysis {
  productId: string
  name: string
  sku: string
  brand: string
  totalSold: number
  averagePrice: number
  totalRevenue: number
  totalCost: number
  grossProfit: number
  profitMargin: number
  roi: number // Return on Investment
}

export interface CSVExportOptions {
  dateRange: {
    start: Date
    end: Date
  }
  includeColumns: string[]
  format: 'sales' | 'products' | 'shipping' | 'profit'
}