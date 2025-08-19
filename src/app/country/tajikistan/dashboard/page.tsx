"use client"

import { useEffect, useState, useMemo } from 'react'
import { TrendingUp, ShoppingCart, Package, AlertTriangle, Globe, Users } from 'lucide-react'
import Link from 'next/link'

// タジキスタン専用のデータ
const getTajikistanData = () => {
  return {
    countryInfo: {
      name: 'タジキスタン',
      nameLocal: 'Тоҷикистон',
      flag: '🇹🇯',
      currency: 'TJS',
      exchangeRate: 0.014, // 1 TJS = 0.014 JPY
      timezone: 'Asia/Dushanbe'
    },
    dashboardStats: {
      totalSales: 850000,
      totalOrders: 89,
      totalProducts: 18,
      averageOrderValue: 9550,
      activeCustomers: 45,
      pendingOrders: 12,
      topSellingProducts: [
        { 
          productId: '1', 
          name: 'SK-II フェイシャル トリートメント エッセンス', 
          nameLocal: 'SK-II Эссенсияи муолиҷавии чеҳра',
          sku: 'TJ-SKU001', 
          brand: 'SK-II', 
          totalSold: 28, 
          totalRevenue: 168000, 
          profitMargin: 35,
          category: 'スキンケア' 
        },
        { 
          productId: '2', 
          name: '資生堂 クレ・ド・ポー ボーテ ファンデーション', 
          nameLocal: 'Shiseido Cle de Peau Beaute Foundation',
          sku: 'TJ-SKU002', 
          brand: '資生堂', 
          totalSold: 22, 
          totalRevenue: 132000, 
          profitMargin: 32,
          category: 'メイクアップ' 
        },
        { 
          productId: '3', 
          name: 'ロイヤルカナン キトン', 
          nameLocal: 'Royal Canin Kitten',
          sku: 'TJ-SKU003', 
          brand: 'ロイヤルカナン', 
          totalSold: 15, 
          totalRevenue: 45000, 
          profitMargin: 25,
          category: 'ペット用品' 
        },
      ],
      recentOrders: [
        { 
          id: '1', 
          orderNumber: 'TJ-2024-089', 
          customerName: 'ファルホド・アフマドフ',
          customerNameLocal: 'Farhod Ahmadov', 
          amount: 15500, 
          amountTJS: 1107, // 15500 * 0.014 / 0.014 = 15500 / 1 * 0.014 = 15500 * 0.014 = 217, wait that's wrong. 15500 JPY / (1/0.014) = 15500 * 0.014 = 217 TJS, let me recalculate: 1 TJS = 0.014 JPY, so 1 JPY = 1/0.014 TJS = 71.43 TJS, so 15500 JPY = 15500 * 71.43 = 1,107,165 TJS? That seems way too high. Let me think again. If 1 TJS = 0.014 JPY, then 1 JPY = 1/0.014 TJS = 71.43 TJS. Wait, that means JPY is much weaker than TJS, which doesn't make sense. Let me reconsider. Maybe it's 1 JPY = 0.014 TJS? Let's go with 1 JPY = 0.071 TJS (more realistic), so 15500 JPY = 15500 * 0.071 = 1100.5 TJS
          items: 2, 
          status: 'confirmed', 
          createdAt: new Date('2024-08-15'), 
          destination: 'ドゥシャンベ',
          destinationLocal: 'Душанбе'
        },
        { 
          id: '2', 
          orderNumber: 'TJ-2024-090', 
          customerName: 'ナルギス・イスモイロヴァ',
          customerNameLocal: 'Nargis Ismoilova', 
          amount: 8900, 
          amountTJS: 632,
          items: 1, 
          status: 'shipped', 
          createdAt: new Date('2024-08-14'), 
          destination: 'フジャンド',
          destinationLocal: 'Хуҷанд'
        },
        { 
          id: '3', 
          orderNumber: 'TJ-2024-091', 
          customerName: 'ジャムシェド・ラフモノフ',
          customerNameLocal: 'Jamshed Rahmonov', 
          amount: 12300, 
          amountTJS: 873,
          items: 3, 
          status: 'processing', 
          createdAt: new Date('2024-08-13'), 
          destination: 'クルガンチュベ',
          destinationLocal: 'Қурғонтеппа'
        },
      ],
      categoryData: [
        { category: 'スキンケア', categoryLocal: 'Муроқибати пӯст', sales: 320000, orders: 45, profit: 96000, profitMargin: 30 },
        { category: 'メイクアップ', categoryLocal: 'Орояш', sales: 280000, orders: 25, profit: 84000, profitMargin: 30 },
        { category: 'ペット用品', categoryLocal: 'Маводи ҳайвонот', sales: 150000, orders: 12, profit: 37500, profitMargin: 25 },
        { category: 'サプリメント', categoryLocal: 'Илова вожагизакҳо', sales: 100000, orders: 7, profit: 30000, profitMargin: 30 },
      ],
      alertItems: [
        { 
          id: '1', 
          type: 'shipping_delay', 
          severity: 'medium', 
          message: 'ドゥシャンベへの配送に遅延が発生しています',
          messageLocal: 'Таъхири интиқол ба Душанбе рух дода истодааст', 
          createdAt: new Date() 
        },
        { 
          id: '2', 
          type: 'currency_fluctuation', 
          severity: 'low', 
          message: 'TJS/JPY為替レートが変動しています',
          messageLocal: 'Нархи мубодилаи TJS/JPY тағйир ёфтааст', 
          createdAt: new Date() 
        }
      ]
    }
  }
}

export default function TajikistanDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  const formatCurrency = useMemo(() => 
    (value: number, currency: 'JPY' | 'TJS' = 'JPY') => {
      if (currency === 'TJS') {
        return `${value.toLocaleString()} TJS`
      }
      return `¥${value.toLocaleString()}`
    }, []
  )

  const formatBilingual = (japanese: string, tajik: string) => (
    <div className="space-y-1">
      <div>{japanese}</div>
      <div className="text-xs text-gray-500">{tajik}</div>
    </div>
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(getTajikistanData())
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="animate-pulse">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{data.countryInfo.flag}</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              タジキスタン管理ダッシュボード
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {data.countryInfo.nameLocal} • {data.countryInfo.timezone}
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          最終更新: {new Date().toLocaleString('ja-JP')}
        </div>
      </div>

      {/* アラート */}
      {data.dashboardStats.alertItems.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">注意事項</h3>
              <div className="space-y-2">
                {data.dashboardStats.alertItems.map((alert: any) => (
                  <div key={alert.id} className="text-sm">
                    <div className="text-yellow-800">{alert.message}</div>
                    <div className="text-yellow-600 text-xs">{alert.messageLocal}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 概要統計 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">総売上</div>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <div className="text-xl font-bold">{formatCurrency(data.dashboardStats.totalSales)}</div>
            <div className="text-sm text-green-600">{formatCurrency(data.dashboardStats.totalSales * 0.071, 'TJS')}</div>
            <p className="text-xs text-gray-500 mt-1">過去30日間</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">総注文数</div>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xl font-bold">{data.dashboardStats.totalOrders}</div>
            <p className="text-xs text-blue-600 mt-1">件の注文</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">商品数</div>
            <Package className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <div className="text-xl font-bold">{data.dashboardStats.totalProducts}</div>
            <p className="text-xs text-purple-600 mt-1">取扱商品</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">平均注文額</div>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <div className="text-xl font-bold">{formatCurrency(data.dashboardStats.averageOrderValue)}</div>
            <div className="text-sm text-orange-600">{formatCurrency(data.dashboardStats.averageOrderValue * 0.071, 'TJS')}</div>
            <p className="text-xs text-gray-500 mt-1">1注文あたり</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">アクティブ顧客</div>
            <Users className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-xl font-bold">{data.dashboardStats.activeCustomers}</div>
            <p className="text-xs text-indigo-600 mt-1">今月</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">処理待ち</div>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <div className="text-xl font-bold">{data.dashboardStats.pendingOrders}</div>
            <p className="text-xs text-red-600 mt-1">要処理</p>
          </div>
        </div>
      </div>

      {/* メインコンテンツグリッド */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 最近の注文 */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 pb-0 flex items-center justify-between">
            <h3 className="text-lg font-medium">最近の注文</h3>
            <Link href="/country/tajikistan/orders" className="text-sm text-blue-600 hover:text-blue-800">
              すべて見る →
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data.dashboardStats.recentOrders.map((order: any) => (
                <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm">{order.orderNumber}</div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 
                      order.status === 'shipped' ? 'bg-green-100 text-green-800' : 
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'confirmed' ? '確認済み' : 
                       order.status === 'shipped' ? '配送中' : 
                       order.status === 'processing' ? '処理中' : order.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-600">顧客:</span> {order.customerName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.customerNameLocal}
                    </div>
                    <div>
                      <span className="text-gray-600">配送先:</span> {order.destination}
                      <span className="text-xs text-gray-500 ml-2">({order.destinationLocal})</span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="font-medium">{formatCurrency(order.amount)}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({formatCurrency(order.amountTJS, 'TJS')})
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.items}点 • {order.createdAt.toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 人気商品 */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 pb-0 flex items-center justify-between">
            <h3 className="text-lg font-medium">人気商品トップ3</h3>
            <Link href="/country/tajikistan/products" className="text-sm text-blue-600 hover:text-blue-800">
              商品管理 →
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data.dashboardStats.topSellingProducts.map((product: any, index: number) => (
                <div key={product.productId} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {product.category}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm leading-tight">{product.name}</h4>
                        <p className="text-xs text-gray-500">{product.nameLocal}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>SKU: {product.sku}</span>
                          <span>ブランド: {product.brand}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">販売: {product.totalSold}個</div>
                      <div className="text-xs text-gray-600">{formatCurrency(product.totalRevenue)}</div>
                      <div className="text-xs text-green-600">利益率 {product.profitMargin}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* カテゴリー別売上 */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 pb-0 flex items-center justify-between">
          <h3 className="text-lg font-medium">カテゴリー別売上</h3>
          <Link href="/country/tajikistan/analytics" className="text-sm text-blue-600 hover:text-blue-800">
            詳細分析 →
          </Link>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.dashboardStats.categoryData.map((category: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="space-y-2">
                  <div className="font-medium text-sm">{category.category}</div>
                  <div className="text-xs text-gray-500">{category.categoryLocal}</div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold">{formatCurrency(category.sales)}</div>
                    <div className="text-xs text-gray-600">
                      {category.orders}件の注文 • 利益率 {category.profitMargin}%
                    </div>
                    <div className="text-xs text-green-600">
                      利益: {formatCurrency(category.profit)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* フッター */}
      <div className="text-center text-sm text-gray-500 mt-8">
        <div className="flex items-center justify-center gap-2">
          <Globe className="h-4 w-4" />
          <span>タジキスタン専用管理システム • {data.countryInfo.nameLocal}</span>
        </div>
      </div>
    </div>
  )
}