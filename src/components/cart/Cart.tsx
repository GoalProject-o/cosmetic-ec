"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useLanguage, useTranslation } from '@/contexts/LanguageContext'
import { DEFAULT_SHIPPING_METHODS } from '@/contexts/CartContext'
import { ShippingMethod, CartItem } from '@/types/cart'

interface CartProps {
  showHeader?: boolean
  showCheckout?: boolean
}

export function Cart({ showHeader = true, showCheckout = true }: CartProps) {
  const { cart, removeFromCart, updateQuantity, setShippingMethod, validateCart, getTotalItems } = useCart()
  const { language } = useLanguage()
  const { t } = useTranslation('common')
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string>(cart?.shippingMethod?.id || 'air')

  const translations = {
    ja: {
      cart: 'カート',
      emptyCart: 'カートが空です',
      continueShopping: 'ショッピングを続ける',
      item: '商品',
      quantity: '数量',
      price: '価格',
      total: '合計',
      remove: '削除',
      shippingMethod: '配送方法',
      subtotal: '小計',
      shippingCost: '配送料',
      tax: '税金',
      customsDuty: '関税',
      otherFees: 'その他手数料',
      grandTotal: '総合計',
      totalWeight: '総重量',
      totalItems: '商品点数',
      checkout: 'レジに進む',
      days: '日',
      kg: 'kg',
      pieces: '個'
    },
    ru: {
      cart: 'Корзина',
      emptyCart: 'Корзина пуста',
      continueShopping: 'Продолжить покупки',
      item: 'Товар',
      quantity: 'Количество',
      price: 'Цена',
      total: 'Итого',
      remove: 'Удалить',
      shippingMethod: 'Способ доставки',
      subtotal: 'Промежуточный итог',
      shippingCost: 'Стоимость доставки',
      tax: 'Налог',
      customsDuty: 'Таможенная пошлина',
      otherFees: 'Прочие сборы',
      grandTotal: 'Общий итог',
      totalWeight: 'Общий вес',
      totalItems: 'Количество товаров',
      checkout: 'Оформить заказ',
      days: 'дней',
      kg: 'кг',
      pieces: 'шт'
    }
  }

  const tr = translations[language]

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(itemId, newQuantity)
    }
  }

  const handleShippingMethodChange = (methodId: string) => {
    const method = DEFAULT_SHIPPING_METHODS.find(m => m.id === methodId)
    if (method) {
      setSelectedShippingMethod(methodId)
      setShippingMethod(method)
    }
  }

  const handleRemoveItem = (itemId: string) => {
    if (confirm(tr.remove + '?')) {
      removeFromCart(itemId)
    }
  }

  if (!cart) {
    return <div>Loading...</div>
  }

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🛒</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{tr.emptyCart}</h3>
        <Link 
          href="/representative/catalog"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          {tr.continueShopping}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{tr.cart}</h2>
          <div className="text-sm text-gray-600">
            {getTotalItems()} {tr.pieces}
          </div>
        </div>
      )}

      {/* カート商品一覧 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200">
          {cart.items.map((item) => (
            <CartItemRow 
              key={item.id} 
              item={item} 
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemoveItem}
              language={language}
              translations={tr}
            />
          ))}
        </div>
      </div>

      {/* 配送方法選択 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">{tr.shippingMethod}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEFAULT_SHIPPING_METHODS.map((method) => (
            <label
              key={method.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedShippingMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="shippingMethod"
                value={method.id}
                checked={selectedShippingMethod === method.id}
                onChange={(e) => handleShippingMethodChange(e.target.value)}
                className="sr-only"
              />
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{method.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{method.description}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {method.estimatedDays.min}-{method.estimatedDays.max} {tr.days}
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedShippingMethod === method.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedShippingMethod === method.id && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 価格サマリー */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">注文サマリー</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>{tr.subtotal}:</span>
            <span>¥{cart.summary.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>{tr.shippingCost}:</span>
            <span>¥{cart.summary.shippingCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>{tr.tax}:</span>
            <span>¥{cart.summary.tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>{tr.customsDuty}:</span>
            <span>¥{cart.summary.customsDuty.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>{tr.otherFees}:</span>
            <span>¥{cart.summary.otherFees.toLocaleString()}</span>
          </div>
          <hr />
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>{tr.grandTotal}:</span>
            <span className="text-green-600">¥{cart.summary.total.toLocaleString()}</span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div>{tr.totalItems}: {cart.summary.totalQuantity} {tr.pieces}</div>
            <div>{tr.totalWeight}: {cart.summary.totalWeight.toFixed(2)} {tr.kg}</div>
          </div>
        </div>
      </div>

      {/* チェックアウトボタン */}
      {showCheckout && (
        <div className="flex space-x-4">
          <Link
            href="/representative/catalog"
            className="flex-1 bg-gray-100 text-gray-800 py-3 px-6 rounded-lg text-center font-medium hover:bg-gray-200 transition-colors"
          >
            {tr.continueShopping}
          </Link>
          <Link
            href="/representative/cart"
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors"
          >
            {tr.checkout}
          </Link>
        </div>
      )}
    </div>
  )
}

// カート商品行コンポーネント
interface CartItemRowProps {
  item: CartItem
  onQuantityChange: (itemId: string, quantity: number) => void
  onRemove: (itemId: string) => void
  language: 'ja' | 'ru'
  translations: any
}

function CartItemRow({ item, onQuantityChange, onRemove, language, translations: tr }: CartItemRowProps) {
  const productName = item.name[language] || item.name.ja
  const lineTotal = item.price * item.quantity

  return (
    <div className="p-6">
      <div className="flex items-center space-x-4">
        {/* 商品画像 */}
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {item.image ? (
            <Image
              src={item.image}
              alt={productName}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">
              📦
            </div>
          )}
        </div>

        {/* 商品情報 */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-900">{productName}</h4>
              <div className="text-sm text-gray-600">
                {item.brand} • SKU: {item.sku}
              </div>
              <div className="text-sm text-gray-600">
                単価: ¥{item.price.toLocaleString()} • {item.weight}{tr.kg}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">¥{lineTotal.toLocaleString()}</div>
            </div>
          </div>

          {/* 数量調整と削除 */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="px-3 py-1 min-w-[3rem] text-center">
                {item.quantity}
              </span>
              <button
                onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
            </div>
            
            <button
              onClick={() => onRemove(item.id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
            >
              {tr.remove}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}