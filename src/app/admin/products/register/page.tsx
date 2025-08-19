"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProductBasicForm } from '@/components/products'
import { ProductPhysicalForm } from '@/components/products'
import { PricingCalculator } from '@/components/products/PricingCalculator'
import { CostBreakdown } from '@/components/products/CostBreakdown'
import { ImageUploader } from '@/components/products/ImageUploader'
import { ProductCore, ProductPhysical, ProductPurchase, ProductListItem } from '@/types'
import { PricingResult } from '@/lib/pricing/calculator'
import { ProductStorage } from '@/lib/storage/productStorage'
import { useRouter, useSearchParams } from 'next/navigation'
import { PRODUCT_CATEGORIES, getCategoryById, getSubcategoryById, generateSKU } from '@/data/productCategories'

interface ProductFormData {
  basicInfo: Partial<ProductCore>
  physicalInfo: Partial<ProductPhysical>
  purchaseInfo: Partial<ProductPurchase>
  categoryInfo: {
    categoryId: string
    subcategoryId: string
    hsCode: string
    autoSku: string
  }
  images: string[]
}

type TabType = 'basic' | 'pricing' | 'analysis'

export default function ProductRegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  
  const [activeTab, setActiveTab] = useState<TabType>('basic')
  const [pricingResult, setPricingResult] = useState<PricingResult | null>(null)
  const [isEditing, setIsEditing] = useState(!!editId)
  const [productId, setProductId] = useState<string>(editId || crypto.randomUUID())
  // 初期データを関数で生成して確実にcategoryInfoが含まれるようにする
  const getInitialFormData = (): ProductFormData => ({
    basicInfo: {
      name: { ja: '', ru: '', tg: '' },
      description: { ja: '', ru: '', tg: '' },
      status: 'draft'
    },
    physicalInfo: {
      weight: 0,
      dimensions: { length: 0, width: 0, height: 0 },
      containerInfo: {
        material: 'plastic',
        size: 0,
        isDangerous: false
      }
    },
    purchaseInfo: {
      supplier: {
        name: '',
        type: 'other',
        location: ''
      },
      purchasePrice: 0,
      minimumOrderQuantity: 1,
      leadTimeDays: 7
    },
    categoryInfo: {
      categoryId: '',
      subcategoryId: '',
      hsCode: '',
      autoSku: ''
    },
    images: []
  })

  const [formData, setFormData] = useState<ProductFormData>(getInitialFormData())

  const tabs = [
    { id: 'basic' as TabType, label: '基本情報・物理仕様', description: '商品情報、カテゴリー、重量、サイズ、画像' },
    { id: 'pricing' as TabType, label: '価格計算', description: '利益率、配送方法、価格算出' },
    { id: 'analysis' as TabType, label: 'コスト分析', description: '詳細内訳、配送比較、データエクスポート' }
  ]

  // 編集時のデータ読み込み
  useEffect(() => {
    if (editId) {
      const existingProduct = ProductStorage.getProductById(editId)
      if (existingProduct) {
        setFormData({
          basicInfo: {
            name: existingProduct.name,
            brand: existingProduct.brand,
            manufacturer: existingProduct.manufacturer,
            category: existingProduct.category,
            hsCode: existingProduct.category.hsCode,
            sku: existingProduct.sku,
            status: existingProduct.status
          },
          physicalInfo: {
            weight: existingProduct.weight,
            // その他の物理情報は必要に応じて追加
          },
          purchaseInfo: {
            purchasePrice: existingProduct.purchasePrice
          }
        })
        
        // 価格計算結果も読み込み
        const savedPricingResult = ProductStorage.getPricingResult(editId)
        if (savedPricingResult) {
          setPricingResult(savedPricingResult)
        }
      }
    }
  }, [editId])

  // カテゴリー変更時の処理
  const handleCategoryChange = (categoryId: string, subcategoryId: string = '') => {
    const category = getCategoryById(categoryId)
    const subcategory = subcategoryId ? getSubcategoryById(categoryId, subcategoryId) : null
    
    if (category) {
      const hsCode = subcategory?.hsCode || category.hsCode
      const autoSku = generateSKU(categoryId, subcategoryId, formData.basicInfo.name?.ja)
      
      setFormData(prev => ({
        ...prev,
        categoryInfo: {
          categoryId,
          subcategoryId,
          hsCode,
          autoSku
        },
        basicInfo: {
          ...prev.basicInfo,
          sku: autoSku,
          category: {
            id: subcategory?.id || categoryId,
            name: subcategory?.name.ja || category.name.ja,
            hsCode,
            tariffRate: 0
          }
        }
      }))
    }
  }

  // SKU手動編集
  const handleSkuChange = (newSku: string) => {
    setFormData(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        sku: newSku
      },
      categoryInfo: {
        ...prev.categoryInfo,
        autoSku: newSku
      }
    }))
  }

  // 画像変更
  const handleImagesChange = (newImages: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: newImages
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // バリデーション
      if (!formData.basicInfo.name?.ja) {
        alert('商品名（日本語）を入力してください')
        setActiveTab('basic')
        return
      }
      
      if (!formData.basicInfo.sku) {
        alert('SKUを入力してください')
        setActiveTab('basic')
        return
      }

      if (!formData.physicalInfo.weight) {
        alert('重量を入力してください')
        setActiveTab('physical')
        return
      }

      // 商品データを保存形式に変換
      const productData: ProductListItem = {
        id: productId,
        sku: formData.basicInfo.sku!,
        name: formData.basicInfo.name!,
        category: formData.basicInfo.category || {
          id: 'default',
          name: 'その他',
          hsCode: '0000.00.00',
          tariffRate: 0
        },
        brand: formData.basicInfo.brand || '',
        manufacturer: formData.basicInfo.manufacturer || '',
        status: formData.basicInfo.status || 'draft',
        purchasePrice: formData.purchaseInfo.purchasePrice || 0,
        calculatedPrice: pricingResult?.breakdown.sellingPrice,
        profitMargin: pricingResult?.breakdown.profitMargin,
        weight: formData.physicalInfo.weight || 0,
        images: [], // 画像機能は後で実装
        createdAt: isEditing ? ProductStorage.getProductById(productId)?.createdAt || new Date() : new Date(),
        updatedAt: new Date()
      }

      // 国別価格計算機能を使って保存
      ProductStorage.saveProductWithCountryPricing(productData)
      
      // 価格計算結果も保存
      if (pricingResult) {
        ProductStorage.savePricingResult(productId, pricingResult)
      }

      alert(isEditing ? '商品情報を更新しました' : '商品登録が完了しました')
      
      // 一覧画面に遷移
      router.push('/admin/products')
      
    } catch (error) {
      console.error('商品保存エラー:', error)
      alert('商品の保存に失敗しました')
    }
  }

  const updateFormData = (section: keyof ProductFormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{isEditing ? '商品編集' : '商品登録'}</h1>
        <p className="text-muted-foreground">
          {isEditing ? '商品情報を編集します' : '新しい商品を登録します'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex space-x-1 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600 bg-blue-50'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="font-medium">{tab.label}</div>
                  <div className="text-xs text-gray-500">{tab.description}</div>
                </div>
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit}>
            {activeTab === 'basic' && (
              <div className="space-y-8">
                {/* カテゴリー選択セクション */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">商品カテゴリー</CardTitle>
                    <p className="text-sm text-gray-600">商品カテゴリーを選択すると、HSコードとSKUが自動設定されます</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">メインカテゴリー *</label>
                        <select
                          value={formData.categoryInfo?.categoryId || ''}
                          onChange={(e) => handleCategoryChange(e.target.value, '')}
                          className="w-full border rounded-lg px-3 py-2"
                        >
                          <option value="">カテゴリーを選択してください</option>
                          {PRODUCT_CATEGORIES.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name.ja} ({category.hsCode})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {formData.categoryInfo?.categoryId && (
                        <div>
                          <label className="block text-sm font-medium mb-2">サブカテゴリー</label>
                          <select
                            value={formData.categoryInfo?.subcategoryId || ''}
                            onChange={(e) => handleCategoryChange(formData.categoryInfo?.categoryId || '', e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                          >
                            <option value="">サブカテゴリーを選択（オプション）</option>
                            {getCategoryById(formData.categoryInfo?.categoryId || '')?.subcategories?.map(sub => (
                              <option key={sub.id} value={sub.id}>
                                {sub.name.ja} ({sub.hsCode})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {formData.categoryInfo?.hsCode && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-blue-800">HSコード:</span>
                            <span className="ml-2 text-blue-600 font-mono">{formData.categoryInfo?.hsCode || ''}</span>
                          </div>
                          <div>
                            <span className="font-medium text-blue-800">自動生成SKU:</span>
                            <span className="ml-2 text-blue-600 font-mono">{formData.categoryInfo?.autoSku || ''}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 基本情報セクション */}
                <Card>
                  <CardHeader>
                    <CardTitle>基本情報</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">SKU *</label>
                        <input
                          type="text"
                          value={formData.basicInfo.sku || ''}
                          onChange={(e) => handleSkuChange(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="自動生成されたSKUを編集可能"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">ブランド</label>
                        <input
                          type="text"
                          value={formData.basicInfo.brand || ''}
                          onChange={(e) => updateFormData('basicInfo', { brand: e.target.value })}
                          className="w-full border rounded-lg px-3 py-2"
                          placeholder="ブランド名"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">商品名（日本語）*</label>
                      <input
                        type="text"
                        value={formData.basicInfo.name?.ja || ''}
                        onChange={(e) => {
                          const newName = { ...formData.basicInfo.name, ja: e.target.value }
                          updateFormData('basicInfo', { name: newName })
                          // 名前変更時にSKUを再生成
                          if (formData.categoryInfo?.categoryId) {
                            const autoSku = generateSKU(
                              formData.categoryInfo.categoryId, 
                              formData.categoryInfo.subcategoryId || '', 
                              e.target.value
                            )
                            handleSkuChange(autoSku)
                          }
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="商品の日本語名"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">商品名（ロシア語）</label>
                      <input
                        type="text"
                        value={formData.basicInfo.name?.ru || ''}
                        onChange={(e) => {
                          const newName = { ...formData.basicInfo.name, ru: e.target.value }
                          updateFormData('basicInfo', { name: newName })
                        }}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="Название продукта"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">商品説明（日本語）</label>
                      <textarea
                        value={formData.basicInfo.description?.ja || ''}
                        onChange={(e) => {
                          const newDesc = { ...formData.basicInfo.description, ja: e.target.value }
                          updateFormData('basicInfo', { description: newDesc })
                        }}
                        rows={3}
                        className="w-full border rounded-lg px-3 py-2"
                        placeholder="商品の詳細説明"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 物理仕様セクション */}
                <Card>
                  <CardHeader>
                    <CardTitle>物理仕様</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProductPhysicalForm
                      data={formData.physicalInfo}
                      onChange={(data) => updateFormData('physicalInfo', data)}
                    />
                  </CardContent>
                </Card>

                {/* 画像アップロードセクション */}
                <Card>
                  <CardHeader>
                    <CardTitle>商品画像</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ImageUploader
                      images={formData.images || []}
                      onImagesChange={handleImagesChange}
                      maxImages={10}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'pricing' && (
              <PricingCalculator
                basicData={formData.basicInfo}
                physicalData={formData.physicalInfo}
                purchaseData={formData.purchaseInfo}
                onPricingResult={setPricingResult}
              />
            )}

            {activeTab === 'analysis' && (
              <CostBreakdown pricingResult={pricingResult} />
            )}

            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1].id)
                  }
                }}
                disabled={activeTab === 'basic'}
              >
                前へ
              </Button>

              <div className="flex space-x-2">
                {activeTab !== 'analysis' ? (
                  <Button
                    type="button"
                    onClick={() => {
                      const currentIndex = tabs.findIndex(tab => tab.id === activeTab)
                      if (currentIndex < tabs.length - 1) {
                        setActiveTab(tabs[currentIndex + 1].id)
                      }
                    }}
                  >
                    次へ
                  </Button>
                ) : (
                  <>
                    <Button type="button" variant="outline">
                      プレビュー
                    </Button>
                    <Button 
                      type="submit"
                      disabled={!pricingResult}
                    >
                      {isEditing ? '更新' : '登録'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}