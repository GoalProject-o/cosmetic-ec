"use client"

import { useEffect, useState, useMemo } from 'react'
import { TrendingUp, ShoppingCart, Package, Globe, ChevronDown, Users, BarChart3 } from 'lucide-react'
import { CountryDashboardService, GlobalDashboardData, CountryDashboardData } from '@/lib/dashboard/CountryDashboardService'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [globalData, setGlobalData] = useState<GlobalDashboardData | null>(null)
  const [selectedCountry, setSelectedCountry] = useState('ALL')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)

  // 利用可能な国リストを取得
  const countries = useMemo(() => CountryDashboardService.getAvailableCountries(), [])

  // 現在選択されている国の情報
  const selectedCountryInfo = useMemo(() => 
    countries.find(c => c.code === selectedCountry) || countries[0], 
    [countries, selectedCountry]
  )

  // 表示データを計算
  const displayData = useMemo(() => {
    if (!globalData) return null

    if (selectedCountry === 'ALL') {
      // 全国統合データ
      return {
        totalSales: globalData.totalSales,
        totalOrders: globalData.totalOrders,
        totalProducts: globalData.totalProducts,
        averageOrderValue: globalData.averageOrderValue,
        recentOrders: globalData.countries.flatMap(c => c.recentOrders).slice(0, 5),
        topSellingProducts: globalData.countries.flatMap(c => c.topSellingProducts)
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, 5)
      }
    } else {
      // 特定国のデータ
      const countryData = globalData.countries.find(c => c.countryCode === selectedCountry)
      return countryData || null
    }
  }, [globalData, selectedCountry])

  useEffect(() => {
    setLoading(true)
    try {
      const data = CountryDashboardService.getGlobalDashboardData()
      setGlobalData(data)
    } catch (error) {
      console.error('ダッシュボードデータの読み込みに失敗:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="animate-pulse">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!displayData) {
    return <div className="p-6 text-center text-gray-500">データを読み込めませんでした。</div>
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* ヘッダーと国選択 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">管理者ダッシュボード</h1>
          <div className="text-sm text-gray-500 mt-1">
            最終更新: {new Date().toLocaleString('ja-JP')}
          </div>
        </div>

        {/* 国選択ドロップダウン */}
        <div className="relative">
          <button
            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
            className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors min-w-[200px] justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedCountryInfo.flag}</span>
              <span>{selectedCountryInfo.name}</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </button>

          {showCountryDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              <div className="py-2">
                {countries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => {
                      setSelectedCountry(country.code)
                      setShowCountryDropdown(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      selectedCountry === country.code ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <span className="text-lg">{country.flag}</span>
                    <div className="text-left">
                      <div className="font-medium">{country.name}</div>
                      <div className="text-xs text-gray-500">{country.currency}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 概要統計 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">総売上</div>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {CountryDashboardService.formatCurrency(displayData.totalSales, selectedCountry)}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {selectedCountry === 'ALL' ? '全国統合' : selectedCountryInfo.name}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">総注文数</div>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{displayData.totalOrders.toLocaleString()}</div>
            <p className="text-xs text-blue-600 mt-1">件の注文</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">商品数</div>
            <Package className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{displayData.totalProducts.toLocaleString()}</div>
            <p className="text-xs text-purple-600 mt-1">商品登録済み</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="text-sm font-medium">平均注文額</div>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {CountryDashboardService.formatCurrency(displayData.averageOrderValue, selectedCountry)}
            </div>
            <p className="text-xs text-orange-600 mt-1">1注文あたり</p>
          </div>
        </div>
      </div>

      {/* 国別売上トップ5（全国表示時のみ） */}
      {selectedCountry === 'ALL' && globalData && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 pb-0">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              国別売上ランキング
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {globalData.topCountriesBySales.map((country, index) => (
                <div key={country.countryCode} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-lg">{country.flag}</span>
                    <div>
                      <div className="font-medium">{country.countryName}</div>
                      <div className="text-sm text-gray-600">{country.totalOrders}件の注文</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{CountryDashboardService.formatCurrency(country.totalSales)}</div>
                    <div className={`text-sm ${country.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {country.growth >= 0 ? '+' : ''}{country.growth}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 最近の注文 */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 pb-0">
            <h3 className="text-lg font-medium">最近の注文</h3>
            <p className="text-sm text-gray-600 mt-1">
              {selectedCountry === 'ALL' ? '全国からの注文' : `${selectedCountryInfo.name}からの注文`}
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {displayData.recentOrders?.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-sm truncate">{order.orderNumber}</div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 
                        order.status === 'shipped' ? 'bg-green-100 text-green-800' : 
                        order.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'confirmed' ? '確認済み' : 
                         order.status === 'shipped' ? '配送中' : 
                         order.status === 'delivered' ? '配送完了' : order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span>{order.customerName}</span> • <span>{order.destination}</span> • <span>{order.items}点</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">
                      {CountryDashboardService.formatCurrency(order.amount, selectedCountry)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 人気商品 */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 pb-0">
            <h3 className="text-lg font-medium">人気商品</h3>
            <p className="text-sm text-gray-600 mt-1">
              {selectedCountry === 'ALL' ? '全国での人気商品' : `${selectedCountryInfo.name}での人気商品`}
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {displayData.topSellingProducts?.slice(0, 5).map((product: any, index: number) => (
                <div key={product.productId} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600">{product.brand} • SKU: {product.sku}</div>
                      <div className="text-xs text-gray-500">販売数: {product.totalSold}点</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {CountryDashboardService.formatCurrency(product.totalRevenue, selectedCountry)}
                    </div>
                    <div className="text-sm text-green-600">{product.profitMargin}% 利益率</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* フッター */}
      <div className="text-center text-sm text-gray-500 mt-8">
        🎉 マルチ国対応ダッシュボードが正常に動作しています！
        {selectedCountry !== 'ALL' && (
          <div className="mt-1">
            現在表示中: {selectedCountryInfo.flag} {selectedCountryInfo.name}
          </div>
        )}
      </div>

      {/* ドロップダウンを閉じるためのオーバーレイ */}
      {showCountryDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowCountryDropdown(false)}
        />
      )}
    </div>
  )
}