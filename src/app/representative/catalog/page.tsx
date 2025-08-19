"use client"

import { useState, useEffect, useMemo } from 'react'
import { ProductStorage } from '@/lib/storage/productStorage'
import { loadSampleData } from '@/lib/storage/sampleData'
import { ProductCard } from '@/components/catalog/ProductCard'
import { useLanguage, useTranslation } from '@/contexts/LanguageContext'
import { ProductListItem, ProductFilter } from '@/types/product'

interface CatalogFilters {
  search: string
  category: string
  priceRange: {
    min: number
    max: number
  }
  brand: string
}

export default function CatalogPage() {
  const { language } = useLanguage()
  const { t } = useTranslation('catalog')
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<CatalogFilters>({
    search: '',
    category: '',
    priceRange: { min: 0, max: 50000 },
    brand: ''
  })

  // 商品データの読み込み
  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      // サンプルデータの読み込み
      loadSampleData()
      
      // アクティブな商品のみを取得
      const result = ProductStorage.getFilteredProducts(
        { status: 'active' },
        { field: 'updatedAt', direction: 'desc' }
      )
      
      setProducts(result.products)
    } catch (error) {
      console.error('商品の読み込みに失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  // フィルタリングされた商品
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const productName = product.name[language] || product.name.ja || ''
      const searchMatch = productName.toLowerCase().includes(filters.search.toLowerCase()) ||
                         product.brand.toLowerCase().includes(filters.search.toLowerCase())
      
      const categoryMatch = !filters.category || product.category.id === filters.category
      const brandMatch = !filters.brand || product.brand === filters.brand
      const priceMatch = !product.calculatedPrice || 
                        (product.calculatedPrice >= filters.priceRange.min && 
                         product.calculatedPrice <= filters.priceRange.max)
      
      return searchMatch && categoryMatch && brandMatch && priceMatch
    })
  }, [products, filters, language])

  // 利用可能なカテゴリーとブランド
  const availableCategories = useMemo(() => {
    const categories = new Set(products.map(p => p.category.name))
    return Array.from(categories).sort()
  }, [products])

  const availableBrands = useMemo(() => {
    const brands = new Set(products.map(p => p.brand))
    return Array.from(brands).sort()
  }, [products])


  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      priceRange: { min: 0, max: 50000 },
      brand: ''
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">{t('loading')}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-gray-600">{t('subtitle')}</p>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* 検索 */}
          <div>
            <input
              type="text"
              placeholder={t('search')}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* カテゴリー */}
          <div>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('allCategories')}</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* ブランド */}
          <div>
            <select
              value={filters.brand}
              onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('allBrands')}</option>
              {availableBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* 価格帯 */}
          <div className="flex items-center space-x-2">
            <input
              type="number"
              placeholder="最小"
              value={filters.priceRange.min}
              onChange={(e) => setFilters({
                ...filters,
                priceRange: { ...filters.priceRange, min: Number(e.target.value) || 0 }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="最大"
              value={filters.priceRange.max}
              onChange={(e) => setFilters({
                ...filters,
                priceRange: { ...filters.priceRange, max: Number(e.target.value) || 50000 }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {filteredProducts.length} {t('results')}
          </div>
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            {t('reset')}
          </button>
        </div>
      </div>

      {/* 商品グリッド */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noProducts')}</h3>
          <p className="text-gray-600">フィルターを調整してください</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              language={language}
            />
          ))}
        </div>
      )}
    </div>
  )
}