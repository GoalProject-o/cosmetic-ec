// ダミーデータ生成機能
import { 
  SalesData, 
  DashboardStats, 
  ProductRanking, 
  RecentOrder, 
  SalesTrendData, 
  PriceAlert,
  CategorySalesData,
  ShippingAnalysis,
  MonthlyReport,
  ProductProfitAnalysis
} from '@/types/analytics'
import { sampleProducts } from '@/lib/storage/sampleData'

export class DummyDataGenerator {
  private static readonly SHIPPING_METHODS = ['air', 'sea', 'ems', 'dhl']
  private static readonly DESTINATIONS = ['Tajikistan', 'Russia', 'Kyrgyzstan', 'Kazakhstan', 'Uzbekistan']
  private static readonly CUSTOMER_NAMES = [
    'Faridun Ahmadov', 'Svetlana Petrova', 'Aziz Karimov', 'Marina Volkov', 'Timur Nazarov',
    'Elena Sidorova', 'Davron Umarov', 'Natasha Kozlov', 'Rustam Mahmadov', 'Irina Smirnova'
  ]

  /**
   * 指定期間の売上データを生成
   */
  static generateSalesData(startDate: Date, endDate: Date, recordCount: number = 1000): SalesData[] {
    const salesData: SalesData[] = []
    const products = sampleProducts

    for (let i = 0; i < recordCount; i++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))
      const quantity = Math.floor(Math.random() * 50) + 1
      const unitPrice = product.calculatedPrice || Math.floor(Math.random() * 5000) + 1000
      const shippingMethod = this.SHIPPING_METHODS[Math.floor(Math.random() * this.SHIPPING_METHODS.length)]
      const shippingCost = this.calculateShippingCost(quantity * (product.weight || 0.1), shippingMethod)
      const totalAmount = unitPrice * quantity
      const totalCost = (product.purchasePrice || unitPrice * 0.6) * quantity + shippingCost
      const profit = totalAmount - totalCost

      salesData.push({
        id: `sale-${Date.now()}-${i}`,
        date: randomDate,
        orderId: `TJ-${randomDate.getFullYear()}${String(randomDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(4, '0')}`,
        productId: product.id,
        productName: product.name.ja,
        productSku: product.sku,
        category: product.category.name,
        brand: product.brand,
        quantity,
        unitPrice,
        totalAmount,
        shippingCost,
        totalCost,
        profit,
        profitMargin: (profit / totalAmount) * 100,
        shippingMethod,
        destination: this.DESTINATIONS[Math.floor(Math.random() * this.DESTINATIONS.length)],
        currency: 'JPY'
      })
    }

    return salesData.sort((a, b) => b.date.getTime() - a.date.getTime())
  }

  /**
   * ダッシュボード統計データを生成
   */
  static generateDashboardStats(): DashboardStats {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000) // 過去30日
    const salesData = this.generateSalesData(startDate, endDate, 500)

    const totalSales = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0)
    const totalOrders = new Set(salesData.map(sale => sale.orderId)).size
    const totalProducts = sampleProducts.length
    const averageOrderValue = totalSales / totalOrders

    // 人気商品ランキング
    const productSales = new Map<string, { product: any; totalSold: number; totalRevenue: number }>()
    salesData.forEach(sale => {
      const existing = productSales.get(sale.productId)
      if (existing) {
        existing.totalSold += sale.quantity
        existing.totalRevenue += sale.totalAmount
      } else {
        const product = sampleProducts.find(p => p.id === sale.productId)
        if (product) {
          productSales.set(sale.productId, {
            product,
            totalSold: sale.quantity,
            totalRevenue: sale.totalAmount
          })
        }
      }
    })

    const topSellingProducts: ProductRanking[] = Array.from(productSales.values())
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5)
      .map(item => ({
        productId: item.product.id,
        name: item.product.name.ja,
        sku: item.product.sku,
        brand: item.product.brand,
        totalSold: item.totalSold,
        totalRevenue: item.totalRevenue,
        profitMargin: item.product.profitMargin || 30,
        image: item.product.images?.[0]
      }))

    // 最近の注文
    const recentOrderMap = new Map<string, RecentOrder>()
    salesData.slice(0, 20).forEach(sale => {
      if (!recentOrderMap.has(sale.orderId)) {
        recentOrderMap.set(sale.orderId, {
          id: sale.orderId,
          orderNumber: sale.orderId,
          customerName: this.CUSTOMER_NAMES[Math.floor(Math.random() * this.CUSTOMER_NAMES.length)],
          amount: 0,
          items: 0,
          status: ['pending', 'confirmed', 'shipped', 'delivered'][Math.floor(Math.random() * 4)] as any,
          createdAt: sale.date,
          destination: sale.destination
        })
      }
      const order = recentOrderMap.get(sale.orderId)!
      order.amount += sale.totalAmount
      order.items += sale.quantity
    })

    const recentOrders = Array.from(recentOrderMap.values()).slice(0, 10)

    // 売上トレンド（過去7日）
    const salesTrend: SalesTrendData[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(endDate.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const daySales = salesData.filter(sale => 
        sale.date.toISOString().split('T')[0] === dateStr
      )
      const dayOrders = new Set(daySales.map(sale => sale.orderId)).size
      
      salesTrend.push({
        date: dateStr,
        sales: daySales.reduce((sum, sale) => sum + sale.totalAmount, 0),
        orders: dayOrders,
        profit: daySales.reduce((sum, sale) => sum + sale.profit, 0)
      })
    }

    // 価格変動アラート
    const alertItems: PriceAlert[] = [
      {
        id: 'alert-1',
        productId: 'sample-1',
        productName: 'DHC オリーブオイル クレンジング',
        type: 'price_increase',
        severity: 'medium',
        message: '商品価格が15%上昇しました',
        oldValue: 4068,
        newValue: 4680,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'alert-2',
        productId: 'sample-3',
        productName: 'ロッテ ガーナミルクチョコレート',
        type: 'high_shipping_cost',
        severity: 'high',
        message: '配送コストが商品価格の40%を超えています',
        oldValue: 350,
        newValue: 140,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
      },
      {
        id: 'alert-3',
        productId: 'sample-4',
        productName: 'クラシエ 肌美精 うるおい浸透マスク',
        type: 'low_profit_margin',
        severity: 'medium',
        message: '利益率が20%を下回りました',
        oldValue: 30,
        newValue: 18,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ]

    return {
      totalSales,
      totalOrders,
      totalProducts,
      averageOrderValue,
      topSellingProducts,
      recentOrders,
      salesTrend,
      alertItems
    }
  }

  /**
   * カテゴリー別売上データを生成
   */
  static generateCategorySalesData(): CategorySalesData[] {
    const categories = ['スキンケア', '食品・スナック', '飲料', 'ヘアケア', 'メイクアップ']
    
    return categories.map(category => ({
      category,
      sales: Math.floor(Math.random() * 500000) + 100000,
      orders: Math.floor(Math.random() * 200) + 50,
      profit: Math.floor(Math.random() * 150000) + 30000,
      profitMargin: Math.floor(Math.random() * 20) + 15
    }))
  }

  /**
   * 配送方法別分析データを生成
   */
  static generateShippingAnalysis(): ShippingAnalysis[] {
    return this.SHIPPING_METHODS.map(method => ({
      method,
      totalOrders: Math.floor(Math.random() * 100) + 20,
      totalCost: Math.floor(Math.random() * 100000) + 20000,
      averageCost: Math.floor(Math.random() * 3000) + 1000,
      averageWeight: Math.floor(Math.random() * 5) + 1,
      averageDeliveryDays: this.getAverageDeliveryDays(method)
    }))
  }

  /**
   * 月次レポートデータを生成
   */
  static generateMonthlyReport(months: number = 6): MonthlyReport[] {
    const reports: MonthlyReport[] = []
    const now = new Date()

    for (let i = months - 1; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStr = month.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' })
      
      reports.push({
        month: monthStr,
        totalSales: Math.floor(Math.random() * 800000) + 200000,
        totalOrders: Math.floor(Math.random() * 150) + 50,
        totalProfit: Math.floor(Math.random() * 200000) + 60000,
        profitMargin: Math.floor(Math.random() * 15) + 20,
        topCategories: this.generateCategorySalesData().slice(0, 3),
        shippingBreakdown: this.generateShippingAnalysis()
      })
    }

    return reports
  }

  /**
   * 商品別利益分析データを生成
   */
  static generateProductProfitAnalysis(): ProductProfitAnalysis[] {
    return sampleProducts.map(product => {
      const totalSold = Math.floor(Math.random() * 200) + 10
      const averagePrice = product.calculatedPrice || Math.floor(Math.random() * 5000) + 1000
      const totalRevenue = totalSold * averagePrice
      const totalCost = totalSold * (product.purchasePrice || averagePrice * 0.6)
      const grossProfit = totalRevenue - totalCost
      const profitMargin = (grossProfit / totalRevenue) * 100
      const roi = (grossProfit / totalCost) * 100

      return {
        productId: product.id,
        name: product.name.ja,
        sku: product.sku,
        brand: product.brand,
        totalSold,
        averagePrice,
        totalRevenue,
        totalCost,
        grossProfit,
        profitMargin,
        roi
      }
    }).sort((a, b) => b.grossProfit - a.grossProfit)
  }

  /**
   * 配送コストを計算（簡略版）
   */
  private static calculateShippingCost(weight: number, method: string): number {
    const rates = {
      air: 2800,
      sea: 800,
      ems: 3200,
      dhl: 4500
    }
    return Math.ceil(weight * (rates[method as keyof typeof rates] || 2800))
  }

  /**
   * 配送方法の平均配送日数を取得
   */
  private static getAverageDeliveryDays(method: string): number {
    const days = {
      air: 10,
      sea: 60,
      ems: 5,
      dhl: 2
    }
    return days[method as keyof typeof days] || 10
  }

  /**
   * CSVデータを生成
   */
  static generateCSVData(format: 'sales' | 'products' | 'shipping' | 'profit', dateRange?: { start: Date; end: Date }): string {
    switch (format) {
      case 'sales': {
        const salesData = dateRange 
          ? this.generateSalesData(dateRange.start, dateRange.end, 100)
          : this.generateSalesData(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date(), 100)
        
        const csvHeader = 'Date,Order ID,Product Name,SKU,Brand,Quantity,Unit Price,Total Amount,Shipping Cost,Profit,Destination'
        const csvRows = salesData.map(sale => 
          `${sale.date.toISOString().split('T')[0]},${sale.orderId},"${sale.productName}",${sale.productSku},${sale.brand},${sale.quantity},${sale.unitPrice},${sale.totalAmount},${sale.shippingCost},${sale.profit},${sale.destination}`
        )
        return [csvHeader, ...csvRows].join('\n')
      }
      
      case 'products': {
        const profitAnalysis = this.generateProductProfitAnalysis()
        const csvHeader = 'Product Name,SKU,Brand,Total Sold,Average Price,Total Revenue,Total Cost,Gross Profit,Profit Margin %,ROI %'
        const csvRows = profitAnalysis.map(product => 
          `"${product.name}",${product.sku},${product.brand},${product.totalSold},${product.averagePrice},${product.totalRevenue},${product.totalCost},${product.grossProfit},${product.profitMargin.toFixed(2)},${product.roi.toFixed(2)}`
        )
        return [csvHeader, ...csvRows].join('\n')
      }
      
      case 'shipping': {
        const shippingAnalysis = this.generateShippingAnalysis()
        const csvHeader = 'Shipping Method,Total Orders,Total Cost,Average Cost,Average Weight,Average Delivery Days'
        const csvRows = shippingAnalysis.map(shipping => 
          `${shipping.method},${shipping.totalOrders},${shipping.totalCost},${shipping.averageCost},${shipping.averageWeight},${shipping.averageDeliveryDays}`
        )
        return [csvHeader, ...csvRows].join('\n')
      }
      
      case 'profit': {
        const categoryData = this.generateCategorySalesData()
        const csvHeader = 'Category,Sales,Orders,Profit,Profit Margin %'
        const csvRows = categoryData.map(cat => 
          `${cat.category},${cat.sales},${cat.orders},${cat.profit},${cat.profitMargin}`
        )
        return [csvHeader, ...csvRows].join('\n')
      }
      
      default:
        return ''
    }
  }
}