"use client"

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ProductTable } from '@/components/products/ProductTable'
import { ProductStorage } from '@/lib/storage/productStorage'
import { loadSampleData } from '@/lib/storage/sampleData'
import { ProductListItem, ProductFilter, ProductSort, Pagination } from '@/types/product'
import { CountryDashboardService } from '@/lib/dashboard/CountryDashboardService'
import { ChevronDown, Globe, RefreshCw } from 'lucide-react'

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [selectedCountry, setSelectedCountry] = useState('ALL')
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  
  // フィルター・ソート・ページネーション状態
  const [filter, setFilter] = useState<ProductFilter>({})
  const [sort, setSort] = useState<ProductSort>({ field: 'updatedAt', direction: 'desc' })
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // 利用可能な国リストを取得
  const countries = useMemo(() => CountryDashboardService.getAvailableCountries(), [])

  // 現在選択されている国の情報
  const selectedCountryInfo = useMemo(() => 
    countries.find(c => c.code === selectedCountry) || countries[0], 
    [countries, selectedCountry]
  )

  // データの読み込み
  const loadProducts = () => {
    setLoading(true)
    try {
      // 初回のみサンプルデータを読み込み
      loadSampleData()
      
      // 商品の国別価格を更新（修正された計算式を適用）
      console.log('商品の国別価格を更新しています...')
      ProductStorage.recalculateAllCountryPricing()
      
      let allProducts: ProductListItem[] = []
      
      if (selectedCountry === 'ALL') {
        // 全商品を取得
        allProducts = ProductStorage.getAllProducts()
      } else {
        // 特定国向けの商品データを取得
        allProducts = ProductStorage.getProductsForCountry(selectedCountry)
      }
      
      // フィルタリングとソート、ページネーション処理
      const result = ProductStorage.getFilteredProducts(filter, sort, {
        page: pagination.page,
        limit: pagination.limit
      })
      
      // 選択された国に応じて価格表示を調整
      const processedProducts = result.products.map(product => {
        if (selectedCountry !== 'ALL') {
          const countryPricing = product.countryPricing?.find(cp => cp.countryCode === selectedCountry)
          return {
            ...product,
            calculatedPrice: countryPricing?.calculatedPrice || product.calculatedPrice,
            profitMargin: countryPricing?.profitMargin || product.profitMargin
          }
        }
        return product
      })
      
      setProducts(processedProducts)
      setPagination(result.pagination)
    } catch (error) {
      console.error('商品データの読み込みに失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  // 初期読み込みとフィルター・ソート・国変更時の再読み込み
  useEffect(() => {
    loadProducts()
  }, [filter, sort, pagination.page, selectedCountry])

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

  // 編集
  const handleEdit = (productId: string) => {
    router.push(`/admin/products/register?edit=${productId}`)
  }

  // 複製
  const handleDuplicate = (productId: string) => {
    const product = ProductStorage.getProductById(productId)
    if (product) {
      // 新しいIDとSKUで複製
      const duplicatedProduct = {
        ...product,
        id: crypto.randomUUID(),
        sku: `${product.sku}-COPY`,
        name: {
          ...product.name,
          ja: `${product.name.ja} (複製)`
        },
        status: 'draft' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      ProductStorage.saveProduct(duplicatedProduct)
      loadProducts()
      alert('商品を複製しました')
    }
  }

  // 削除
  const handleDelete = (productId: string) => {
    if (confirm('この商品を削除してもよろしいですか？')) {
      const success = ProductStorage.deleteProduct(productId)
      if (success) {
        loadProducts()
        setSelectedProducts(prev => prev.filter(id => id !== productId))
        alert('商品を削除しました')
      } else {
        alert('商品の削除に失敗しました')
      }
    }
  }

  // 全商品の国別価格を再計算
  const handleRecalculateAllPricing = () => {
    if (confirm('全商品の国別価格を再計算しますか？この処理には時間がかかる場合があります。')) {
      try {
        ProductStorage.recalculateAllCountryPricing()
        loadProducts()
        alert('全商品の国別価格を再計算しました')
      } catch (error) {
        alert('価格再計算に失敗しました')
        console.error('価格再計算エラー:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <span className="text-lg">{selectedCountryInfo.flag}</span>
              商品管理
            </h1>
            <p className="text-muted-foreground">
              {selectedCountry === 'ALL' ? '全ての国の商品一覧・編集・管理' : `${selectedCountryInfo.name}向けの商品管理`}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* 国選択ドロップダウン */}
            <div className="relative">
              <button
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors min-w-[180px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
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

            <button
              onClick={handleRecalculateAllPricing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              国別価格再計算
            </button>
            <button
              onClick={() => router.push('/admin/products/register')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              新規商品登録
            </button>
          </div>
        </div>
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

      {/* 国情報表示 */}
      {selectedCountry !== 'ALL' && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <span className="text-lg">{selectedCountryInfo.flag}</span>
            {selectedCountryInfo.name}向け価格表示中
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 表示価格は{selectedCountryInfo.name}向けの税金・関税・送料が含まれた商品1個あたりの価格です</li>
            <li>• 配送方法: 国際小包（20kgパッケージ ¥39,800）を商品重量で按分して送料計算</li>
            <li>• 計算例: 400g商品の場合 → 20kg÷0.4kg=50個入る → ¥39,800÷50個=¥796/個</li>
            <li>• 税金・手数料は商品価格ベース、固定費用は商品個数で按分</li>
            <li>• 最終価格 = 総コスト ÷ 0.7（利益率30%）→ 小数点切り上げ</li>
            <li>• 通貨表示: {selectedCountryInfo.currency}</li>
          </ul>
        </div>
      )}

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