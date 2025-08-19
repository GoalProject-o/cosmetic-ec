"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { MonthlyReport, ProductProfitAnalysis, CategorySalesData, ShippingAnalysis } from '@/types/analytics'
import { DummyDataGenerator } from '@/lib/analytics/dummyDataGenerator'
import { SalesLineChart } from '@/components/charts/SalesLineChart'
import { CategoryPieChart } from '@/components/charts/CategoryPieChart'
import { ProductBarChart } from '@/components/charts/ProductBarChart'
import { ShippingAnalysisChart } from '@/components/charts/ShippingAnalysisChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSkeleton } from '@/components/ui/loading-spinner'
import { Download, TrendingUp, Package, Truck, PieChart } from 'lucide-react'

export default function ReportsPage() {
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([])
  const [productProfitData, setProductProfitData] = useState<ProductProfitAnalysis[]>([])
  const [categoryData, setCategoryData] = useState<CategorySalesData[]>([])
  const [shippingData, setShippingData] = useState<ShippingAnalysis[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<string>('6')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReportsData(parseInt(selectedPeriod))
  }, [selectedPeriod])

  const loadReportsData = useCallback(async (months: number) => {
    setLoading(true)
    setError(null)
    try {
      const monthlyData = DummyDataGenerator.generateMonthlyReport(months)
      const profitData = DummyDataGenerator.generateProductProfitAnalysis()
      const categories = DummyDataGenerator.generateCategorySalesData()
      const shipping = DummyDataGenerator.generateShippingAnalysis()
      
      setMonthlyReports(monthlyData)
      setProductProfitData(profitData)
      setCategoryData(categories)
      setShippingData(shipping)
    } catch (error) {
      console.error('レポートデータの読み込みに失敗しました:', error)
      setError('レポートデータの読み込みに失敗しました。再読み込みしてください。')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCSVExport = (type: 'sales' | 'products' | 'shipping' | 'profit') => {
    try {
      const csvData = DummyDataGenerator.generateCSVData(type)
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('CSVエクスポートに失敗しました:', error)
      alert('エクスポートに失敗しました')
    }
  }

  const formatCurrency = useMemo(() => 
    (value: number) => `¥${value.toLocaleString()}`, []
  )

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <LoadingSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={() => loadReportsData(parseInt(selectedPeriod))}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            再読み込み
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" role="banner">売上・利益レポート</h1>
          <p className="text-gray-600 mt-1">詳細な分析とデータエクスポート</p>
        </div>
        <div className="flex items-center space-x-4">
          <label htmlFor="period-select" className="sr-only">期間選択</label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32" id="period-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3ヶ月</SelectItem>
              <SelectItem value="6">6ヶ月</SelectItem>
              <SelectItem value="12">12ヶ月</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* CSVエクスポートボタン */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" aria-hidden="true" />
            <span>データエクスポート</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Button 
              variant="outline" 
              onClick={() => handleCSVExport('sales')}
              className="flex items-center space-x-2"
              aria-label="売上データCSVエクスポート"
            >
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              <span>売上データ</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleCSVExport('products')}
              className="flex items-center space-x-2"
              aria-label="商品収益CSVエクスポート"
            >
              <Package className="h-4 w-4" aria-hidden="true" />
              <span>商品収益</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleCSVExport('shipping')}
              className="flex items-center space-x-2"
              aria-label="配送分析CSVエクスポート"
            >
              <Truck className="h-4 w-4" aria-hidden="true" />
              <span>配送分析</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleCSVExport('profit')}
              className="flex items-center space-x-2"
              aria-label="利益分析CSVエクスポート"
            >
              <PieChart className="h-4 w-4" aria-hidden="true" />
              <span>利益分析</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 月次売上レポート */}
      <Card>
        <CardHeader>
          <CardTitle>月次売上推移</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <div className="space-y-4">
                {monthlyReports.map((report, index) => (
                  <div key={index} className="border rounded p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{report.month}</h3>
                      <Badge variant="outline">{report.totalOrders}注文</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">売上</p>
                        <p className="font-medium">{formatCurrency(report.totalSales)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">利益</p>
                        <p className="font-medium">{formatCurrency(report.totalProfit)}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">利益率</span>
                        <span className={`font-medium ${report.profitMargin >= 25 ? 'text-green-600' : 'text-orange-600'}`}>
                          {report.profitMargin}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-80 sm:h-96">
              <SalesLineChart 
                data={monthlyReports.map(report => ({
                  date: report.month,
                  sales: report.totalSales,
                  profit: report.totalProfit,
                  orders: report.totalOrders
                }))} 
                height={undefined} 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 商品別利益分析 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>商品別利益ランキング（TOP10）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 sm:h-80">
              <ProductBarChart data={productProfitData.slice(0, 10).map(product => ({
                productId: product.productId,
                name: product.name,
                sku: product.sku,
                brand: product.brand,
                totalSold: product.totalSold,
                totalRevenue: product.totalRevenue,
                profitMargin: product.profitMargin,
                image: undefined
              }))} height={undefined} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>商品利益詳細</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
              {productProfitData.slice(0, 8).map((product) => (
                <div key={product.productId} className="border rounded p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{product.name}</h4>
                      <p className="text-xs text-gray-600">{product.brand} • {product.sku}</p>
                    </div>
                    <Badge variant={product.profitMargin >= 30 ? 'default' : 'secondary'}>
                      {product.profitMargin.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-gray-600">売上</p>
                      <p className="font-medium">{formatCurrency(product.totalRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">利益</p>
                      <p className="font-medium">{formatCurrency(product.grossProfit)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">ROI</p>
                      <p className="font-medium">{product.roi.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* カテゴリー別分析と配送コスト分析 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>カテゴリー別売上分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-72">
              <CategoryPieChart data={categoryData} height={undefined} />
            </div>
            <div className="mt-4 space-y-2">
              {categoryData.map((category, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{category.category}</span>
                  <div className="flex items-center space-x-2">
                    <span>{formatCurrency(category.sales)}</span>
                    <Badge variant="outline" className="text-xs">
                      {category.profitMargin}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>配送コスト分析</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-72">
              <ShippingAnalysisChart data={shippingData} height={undefined} />
            </div>
            <div className="mt-4 space-y-3">
              {shippingData.map((shipping, index) => (
                <div key={index} className="border rounded p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium uppercase">{shipping.method}</h4>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatCurrency(shipping.totalCost)}</div>
                      <div className="text-xs text-gray-600">{shipping.totalOrders}件</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-gray-600">平均コスト</p>
                      <p className="font-medium">{formatCurrency(shipping.averageCost)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">配送日数</p>
                      <p className="font-medium">{shipping.averageDeliveryDays}日</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}