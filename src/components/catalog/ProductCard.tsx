"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/contexts/LanguageContext'
import { useCart } from '@/contexts/CartContext'
import { ProductListItem } from '@/types/product'

interface ProductCardProps {
  product: ProductListItem
  language: 'ja' | 'ru'
  onAddToCart?: (productId: string, quantity: number) => void
}

export function ProductCard({ product, language, onAddToCart }: ProductCardProps) {
  const { t } = useTranslation('catalog')
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    setIsAdding(true)
    try {
      // コンテキストのaddToCartを使用
      const success = await addToCart(product.id, quantity)
      if (success && onAddToCart) {
        await onAddToCart(product.id, quantity)
      }
    } catch (error) {
      console.error('カート追加エラー:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const isAvailable = product.status === 'active'
  const productName = product.name[language] || product.name.ja
  const minOrderQuantity = 1 // 最小注文数量（実際のデータから取得予定）

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* 商品画像 */}
      <div className="relative aspect-square bg-gray-100">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={productName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-sm">No Image</div>
            </div>
          </div>
        )}
        
        {/* ステータスバッジ */}
        {!isAvailable && (
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              product.status === 'draft' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {product.status === 'draft' ? t('draft') : t('outOfStock')}
            </span>
          </div>
        )}
      </div>

      {/* 商品情報 */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-lg line-clamp-2 mb-1">
            {productName}
          </h3>
          <p className="text-sm text-gray-600">
            ブランド: {product.brand}
          </p>
        </div>

        {/* 価格 */}
        <div className="mb-3">
          {product.calculatedPrice ? (
            <div className="text-xl font-bold text-blue-600">
              ¥{product.calculatedPrice.toLocaleString()}
            </div>
          ) : (
            <div className="text-gray-500">価格調整中</div>
          )}
        </div>

        {/* 最小注文数量 */}
        <div className="mb-3 text-sm text-gray-600">
          {t('minOrder')}: {minOrderQuantity} {t('pieces')}
        </div>

        {/* アクションボタン */}
        <div className="space-y-2">
          {isAvailable && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center border rounded">
                <button
                  onClick={() => setQuantity(Math.max(minOrderQuantity, quantity - 1))}
                  className="px-3 py-1 hover:bg-gray-100"
                  disabled={quantity <= minOrderQuantity}
                >
                  -
                </button>
                <span className="px-3 py-1 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
              
              {onAddToCart && (
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm"
                >
                  {isAdding ? '追加中...' : t('addToCart')}
                </button>
              )}
            </div>
          )}
          
          <Link
            href={`/representative/catalog/${product.id}`}
            className="block w-full text-center border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors text-sm"
          >
            {t('viewDetails')}
          </Link>
        </div>
      </div>
    </div>
  )
}

// CSS for line-clamp (Tailwind CSS utility)
const styles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style')
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}