"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProductTable } from '@/components/products/ProductTable'
import { ProductStorage } from '@/lib/storage/productStorage'
import { loadSampleData } from '@/lib/storage/sampleData'
import { ProductListItem, ProductFilter, ProductSort, Pagination } from '@/types/product'
import { MapPin, TrendingUp, Package, Globe } from 'lucide-react'

export default function TajikistanProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  
  // フィルター・ソート・ページネーション状態
  const [filter, setFilter] = useState<ProductFilter>({})
  const [sort, setSort] = useState<ProductSort>({ field: 'updatedAt', direction: 'desc' })
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // タジキスタン情報
  const countryInfo = {
    name: 'タジキスタン',
    nameLocal: 'Тоҷикистон',
    flag: '🇹🇯',
    code: 'TJ',
    currency: 'TJS',
    exchangeRate: 14.0 // 1円 = 14TJS (概算)
  }

  // データの読み込み
  const loadProducts = () => {
    setLoading(true)
    try {
      // 初回のみサンプルデータを読み込み
      loadSampleData()
      
      // タジキスタン向けの商品データを取得
      const countryProducts = ProductStorage.getProductsForCountry('TJ')
      
      const result = ProductStorage.getFilteredProducts(filter, sort, {
        page: pagination.page,
        limit: pagination.limit
      })
      
      // タジキスタン価格情報を適用
      const productsWithTajikPricing = result.products.map(product => {
        const tajikPricing = product.countryPricing?.find(cp => cp.countryCode === 'TJ')
        return {
          ...product,
          calculatedPrice: tajikPricing?.calculatedPrice || product.calculatedPrice,
          profitMargin: tajikPricing?.profitMargin || product.profitMargin
        }
      })
      
      setProducts(productsWithTajikPricing)
      setPagination(result.pagination)
    } catch (error) {
      console.error('商品データの読み込みに失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  // 初期読み込みとフィルター・ソート変更時の再読み込み
  useEffect(() => {
    loadProducts()
  }, [filter, sort, pagination.page])

  // フィルター変更時はページを1に戻す
  const handleFilterChange = (newFilter: ProductFilter) => {
    setFilter(newFilter)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // ソート変更
  const handleSortChange = (newSort: ProductSort) => {
    setSort(newSort)
  }

  // ページ変更
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  // 選択状態変更
  const handleSelectionChange = (productIds: string[]) => {
    setSelectedProducts(productIds)
  }

  // 編集（読み取り専用モードで詳細表示）
  const handleEdit = (productId: string) => {
    alert('タジキスタン管理者には商品の詳細表示のみ利用可能です。\n編集は本社管理者にお問い合わせください。')
  }

  // 複製・削除は無効
  const handleDuplicate = () => {
    alert('タジキスタン管理者には商品複製機能は利用できません。')
  }

  const handleDelete = () => {
    alert('タジキスタン管理者には商品削除機能は利用できません。')
  }

  // タジキスタン価格統計の計算
  const calculateTajikStats = () => {
    const tajikProducts = products.filter(p => p.calculatedPrice && p.calculatedPrice > 0)
    const totalProducts = tajikProducts.length
    const avgPrice = totalProducts > 0 
      ? tajikProducts.reduce((sum, p) => sum + (p.calculatedPrice || 0), 0) / totalProducts 
      : 0
    const avgPriceInTJS = avgPrice * countryInfo.exchangeRate
    
    return {
      totalProducts,
      avgPrice,
      avgPriceInTJS,
      activeProducts: products.filter(p => p.status === 'active').length
    }
  }

  const stats = calculateTajikStats()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{countryInfo.flag}</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">タジキスタン商品管理</h1>
            <p className="text-sm text-gray-600">
              {countryInfo.nameLocal} • 商品一覧と価格確認
            </p>
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総商品数</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">アクティブ商品</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeProducts}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均価格 (円)</p>
              <p className="text-2xl font-bold text-purple-600">¥{Math.round(stats.avgPrice).toLocaleString()}</p>
            </div>
            <Globe className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均価格 (TJS)</p>
              <p className="text-2xl font-bold text-orange-600">{Math.round(stats.avgPriceInTJS).toLocaleString()} TJS</p>
            </div>
            <MapPin className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* 商品テーブル */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            タジキスタン向け商品一覧
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            タジキスタン市場向けの価格で表示されています（税金・関税・送料込み）
          </p>
        </div>

        <ProductTable
          products={products}
          pagination={pagination}
          filter={filter}
          sort={sort}
          selectedProducts={selectedProducts}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onPageChange={handlePageChange}
          onSelectionChange={handleSelectionChange}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      </div>

      {/* 注意事項 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">ご注意</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 表示価格には、タジキスタン向けの税金・関税・送料が含まれています</li>
          <li>• 為替レートは概算値です（1円 = {countryInfo.exchangeRate} TJS）</li>
          <li>• 商品の編集・削除は本社管理者にお問い合わせください</li>
          <li>• 価格は設定に基づいて自動計算されており、最終価格は変動する可能性があります</li>
        </ul>
      </div>
    </div>
  )
}