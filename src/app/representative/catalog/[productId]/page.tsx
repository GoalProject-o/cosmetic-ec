"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ProductStorage } from '@/lib/storage/productStorage'
import { loadSampleData } from '@/lib/storage/sampleData'
import { calculatePricing, PricingInputs } from '@/lib/pricing/calculator'
import { useLanguage, useTranslation } from '@/contexts/LanguageContext'
import { useCart } from '@/contexts/CartContext'
import { Product } from '@/types/product'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.productId as string
  const { language } = useLanguage()
  const { t } = useTranslation('product')
  const { addToCart } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [calculatedPricing, setCalculatedPricing] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)


  // 商品データの読み込み
  useEffect(() => {
    loadProduct()
  }, [productId])

  // 数量変更時の価格再計算
  useEffect(() => {
    if (product && quantity > 0) {
      calculatePrice()
    }
  }, [product, quantity])

  const loadProduct = async () => {
    setLoading(true)
    try {
      loadSampleData()
      const foundProduct = ProductStorage.getProductById(productId)
      setProduct(foundProduct)
    } catch (error) {
      console.error('商品の読み込みに失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculatePrice = async () => {
    if (!product) return

    setIsCalculating(true)
    try {
      const pricingInputs: PricingInputs = {
        purchasePrice: product.purchasePrice || 0,
        weight: (product.physical?.weight || 0) * quantity,
        dimensions: product.physical?.dimensions,
        quantity: quantity,
        profitMargin: product.profitMargin || 30,
        shippingMethod: 'air'
      }

      const result = calculatePricing(pricingInputs)
      setCalculatedPricing(result)
    } catch (error) {
      console.error('価格計算に失敗:', error)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    try {
      const success = await addToCart(product.id, quantity)
      if (success) {
        alert(`${product.name[language] || product.name.ja} を ${quantity} 個カートに追加しました`)
      } else {
        alert('カートへの追加に失敗しました')
      }
    } catch (error) {
      console.error('カート追加エラー:', error)
      alert('カートへの追加中にエラーが発生しました')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">商品を読み込み中...</div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('notFound')}</h2>
        <Link 
          href="/representative/catalog"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          商品カタログ
        </Link>
      </div>
    )
  }

  const productName = product.name[language] || product.name.ja
  const unitPrice = calculatedPricing?.breakdown.sellingPrice || product.calculatedPrice || 0
  const totalPrice = unitPrice * quantity

  return (
    <div className="space-y-6">
      {/* ナビゲーション */}
      <div className="flex items-center text-sm text-gray-600">
        <Link href="/representative/catalog" className="hover:text-blue-600">
          商品カタログ
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">{productName}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 商品画像 */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={productName}
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center">
                  <div className="text-6xl mb-4">📦</div>
                  <div>商品画像なし</div>
                </div>
              </div>
            )}
          </div>

          {/* サムネイル（複数画像がある場合） */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((image, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={image}
                    alt={`${productName} ${index + 1}`}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 商品情報 */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {productName}
            </h1>
            <p className="text-gray-600">SKU: {product.sku}</p>
          </div>

          {/* 基本情報 */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('brand')}:</span>
              <span className="font-medium">{product.brand}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('manufacturer')}:</span>
              <span className="font-medium">{product.manufacturer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('category')}:</span>
              <span className="font-medium">{product.category.name}</span>
            </div>
            {product.physical?.weight && (
              <div className="flex justify-between">
                <span className="text-gray-600">{t('weight')}:</span>
                <span className="font-medium">{product.physical.weight} kg</span>
              </div>
            )}
            {product.physical?.dimensions && (
              <div className="flex justify-between">
                <span className="text-gray-600">{t('dimensions')}:</span>
                <span className="font-medium">
                  {product.physical.dimensions.length} × {product.physical.dimensions.width} × {product.physical.dimensions.height} cm
                </span>
              </div>
            )}
          </div>

          {/* 価格と注文 */}
          <div className="border rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold">{t('price')}</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>{t('unitPrice')}:</span>
                <span className="text-xl font-bold text-blue-600">
                  ¥{unitPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* 数量選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('quantity')}
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-600">個</span>
              </div>
            </div>

            {/* 合計価格 */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-xl">
                <span className="font-semibold">{t('totalPrice')}:</span>
                <span className="font-bold text-green-600">
                  ¥{totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* アクションボタン */}
            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              カートに追加
            </button>
          </div>

          {/* 価格計算詳細 */}
          {calculatedPricing && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">{t('priceCalculation')}</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>商品原価:</span>
                  <span>¥{calculatedPricing.breakdown.productCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>配送料:</span>
                  <span>¥{calculatedPricing.breakdown.internationalShipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>関税・税金:</span>
                  <span>¥{(calculatedPricing.breakdown.customsDuty + calculatedPricing.breakdown.vat).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>手数料:</span>
                  <span>¥{calculatedPricing.breakdown.processingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>利益込み価格:</span>
                  <span>¥{calculatedPricing.breakdown.sellingPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}