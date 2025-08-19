"use client"

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useLanguage, useTranslation } from '@/contexts/LanguageContext'
import { Cart, CartItem, ShippingMethod } from '@/types/cart'

interface OrderSummaryProps {
  cart?: Cart
  showActions?: boolean
  title?: string
}

export function OrderSummary({ cart: propCart, showActions = true, title }: OrderSummaryProps) {
  const { cart: contextCart, exportOrder } = useCart()
  const { language } = useLanguage()
  const { t } = useTranslation('common')
  const [isGeneratingQuote, setIsGeneratingQuote] = useState(false)

  const cart = propCart || contextCart
  
  const translations = {
    ja: {
      orderSummary: '注文サマリー',
      quotation: '見積書',
      itemsOrdered: '注文商品',
      shippingInfo: '配送情報',
      priceBreakdown: '価格内訳',
      item: '商品',
      quantity: '数量',
      unitPrice: '単価',
      lineTotal: '小計',
      subtotal: '商品合計',
      shippingCost: '配送料',
      tax: '税金（VAT）',
      customsDuty: '関税',
      otherFees: 'その他手数料',
      grandTotal: '総合計',
      totalWeight: '総重量',
      totalItems: '商品点数',
      shippingMethod: '配送方法',
      estimatedDelivery: '配送予定',
      generateQuote: '見積書生成',
      exportJson: 'JSON出力',
      printOrder: '印刷',
      days: '日',
      kg: 'kg',
      pieces: '個',
      processing: '処理中...',
      downloadQuote: '見積書ダウンロード',
      quoteGenerated: '見積書を生成しました'
    },
    ru: {
      orderSummary: 'Сводка заказа',
      quotation: 'Котировка',
      itemsOrdered: 'Заказанные товары',
      shippingInfo: 'Информация о доставке',
      priceBreakdown: 'Разбивка цен',
      item: 'Товар',
      quantity: 'Количество',
      unitPrice: 'Цена за единицу',
      lineTotal: 'Промежуточный итог',
      subtotal: 'Итого товары',
      shippingCost: 'Стоимость доставки',
      tax: 'Налог (НДС)',
      customsDuty: 'Таможенная пошлина',
      otherFees: 'Прочие сборы',
      grandTotal: 'Общий итог',
      totalWeight: 'Общий вес',
      totalItems: 'Количество товаров',
      shippingMethod: 'Способ доставки',
      estimatedDelivery: 'Расчетная доставка',
      generateQuote: 'Создать котировку',
      exportJson: 'Экспорт JSON',
      printOrder: 'Печать',
      days: 'дней',
      kg: 'кг',
      pieces: 'шт',
      processing: 'Обработка...',
      downloadQuote: 'Скачать котировку',
      quoteGenerated: 'Котировка создана'
    }
  }

  const tr = translations[language]

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">{title || tr.orderSummary}</h3>
        <div className="text-center text-gray-500 py-8">
          カートに商品がありません
        </div>
      </div>
    )
  }

  const handleGenerateQuote = async () => {
    setIsGeneratingQuote(true)
    try {
      const quoteData = generateQuotation(cart)
      const blob = new Blob([quoteData], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `quotation-${Date.now()}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      alert(tr.quoteGenerated)
    } catch (error) {
      console.error('見積書生成エラー:', error)
      alert('見積書生成に失敗しました')
    } finally {
      setIsGeneratingQuote(false)
    }
  }

  const handleExportJson = () => {
    const orderJson = exportOrder()
    const blob = new Blob([orderJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `order-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">{title || tr.orderSummary}</h3>
        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={handleGenerateQuote}
              disabled={isGeneratingQuote}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {isGeneratingQuote ? tr.processing : tr.generateQuote}
            </button>
            <button
              onClick={handleExportJson}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              {tr.exportJson}
            </button>
            <button
              onClick={handlePrint}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
            >
              {tr.printOrder}
            </button>
          </div>
        )}
      </div>

      {/* 注文商品 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h4 className="font-semibold">{tr.itemsOrdered}</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {cart.items.map((item, index) => (
            <OrderItemRow key={item.id} item={item} language={language} translations={tr} />
          ))}
        </div>
      </div>

      {/* 配送情報 */}
      {cart.shippingAddress && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4">{tr.shippingInfo}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium mb-2">配送先</h5>
              <div className="text-sm space-y-1">
                <div><strong>{cart.shippingAddress.name}</strong></div>
                {cart.shippingAddress.company && <div>{cart.shippingAddress.company}</div>}
                <div>{cart.shippingAddress.address1}</div>
                {cart.shippingAddress.address2 && <div>{cart.shippingAddress.address2}</div>}
                <div>{cart.shippingAddress.city}, {cart.shippingAddress.postalCode}</div>
                <div>{cart.shippingAddress.country}</div>
                <div>📞 {cart.shippingAddress.phone}</div>
                <div>✉️ {cart.shippingAddress.email}</div>
              </div>
            </div>
            
            {cart.shippingMethod && (
              <div>
                <h5 className="font-medium mb-2">{tr.shippingMethod}</h5>
                <div className="text-sm space-y-1">
                  <div><strong>{cart.shippingMethod.name}</strong></div>
                  <div>{cart.shippingMethod.description}</div>
                  <div>{tr.estimatedDelivery}: {cart.shippingMethod.estimatedDays.min}-{cart.shippingMethod.estimatedDays.max} {tr.days}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 価格内訳 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="font-semibold mb-4">{tr.priceBreakdown}</h4>
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
          <hr className="border-gray-200" />
          <div className="flex justify-between items-center text-xl font-bold">
            <span>{tr.grandTotal}:</span>
            <span className="text-green-600">¥{cart.summary.total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
            <span>{tr.totalItems}: {cart.summary.totalQuantity} {tr.pieces}</span>
            <span>{tr.totalWeight}: {cart.summary.totalWeight.toFixed(2)} {tr.kg}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// 注文商品行コンポーネント
interface OrderItemRowProps {
  item: CartItem
  language: 'ja' | 'ru'
  translations: any
}

function OrderItemRow({ item, language, translations: tr }: OrderItemRowProps) {
  const productName = item.name[language] || item.name.ja
  const lineTotal = item.price * item.quantity

  return (
    <div className="p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h5 className="font-medium text-gray-900">{productName}</h5>
          <div className="text-sm text-gray-600 mt-1">
            {item.brand} • SKU: {item.sku}
          </div>
          <div className="text-sm text-gray-600">
            重量: {item.weight}{tr.kg} × {item.quantity} = {(item.weight * item.quantity).toFixed(2)}{tr.kg}
          </div>
        </div>
        
        <div className="text-right ml-4">
          <div className="text-sm text-gray-600">
            ¥{item.price.toLocaleString()} × {item.quantity}
          </div>
          <div className="font-semibold">
            ¥{lineTotal.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}

// 見積書HTML生成関数
function generateQuotation(cart: Cart): string {
  const now = new Date()
  const quoteNumber = `TJ-Q${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getTime().toString().slice(-4)}`
  
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>見積書 - ${quoteNumber}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .company-info { text-align: right; margin-bottom: 30px; }
        .quote-info { margin-bottom: 30px; }
        .customer-info { margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .text-right { text-align: right; }
        .total-row { background-color: #f9f9f9; font-weight: bold; }
        .grand-total { background-color: #e8f5e8; font-weight: bold; font-size: 1.1em; }
        .footer { margin-top: 40px; text-align: center; font-size: 0.9em; color: #666; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>見積書 / QUOTATION</h1>
        <p>TJ-Cosmetics Representative System</p>
    </div>

    <div class="company-info">
        <strong>TJ-Cosmetics Co., Ltd.</strong><br>
        Japanese Cosmetics & Snacks Export<br>
        Email: info@tj-cosmetics.com<br>
        Date: ${now.toLocaleDateString('ja-JP')}
    </div>

    <div class="quote-info">
        <strong>見積番号 / Quote Number: ${quoteNumber}</strong><br>
        有効期限 / Valid Until: ${new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP')}
    </div>

    ${cart.shippingAddress ? `
    <div class="customer-info">
        <strong>お客様情報 / Customer Information:</strong><br>
        ${cart.shippingAddress.name}<br>
        ${cart.shippingAddress.company ? cart.shippingAddress.company + '<br>' : ''}
        ${cart.shippingAddress.address1}<br>
        ${cart.shippingAddress.address2 ? cart.shippingAddress.address2 + '<br>' : ''}
        ${cart.shippingAddress.city}, ${cart.shippingAddress.postalCode}<br>
        ${cart.shippingAddress.country}<br>
        Tel: ${cart.shippingAddress.phone}<br>
        Email: ${cart.shippingAddress.email}
    </div>
    ` : ''}

    <table>
        <thead>
            <tr>
                <th>商品名 / Item</th>
                <th>ブランド / Brand</th>
                <th>数量 / Qty</th>
                <th>単価 / Unit Price</th>
                <th>重量 / Weight</th>
                <th>小計 / Subtotal</th>
            </tr>
        </thead>
        <tbody>
            ${cart.items.map(item => `
            <tr>
                <td>${item.name.ja}<br><small style="color: #666;">${item.name.ru}</small></td>
                <td>${item.brand}</td>
                <td class="text-right">${item.quantity}</td>
                <td class="text-right">¥${item.price.toLocaleString()}</td>
                <td class="text-right">${item.weight} kg</td>
                <td class="text-right">¥${(item.price * item.quantity).toLocaleString()}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>

    <table style="width: 50%; margin-left: auto;">
        <tr>
            <td>商品合計 / Subtotal:</td>
            <td class="text-right">¥${cart.summary.subtotal.toLocaleString()}</td>
        </tr>
        <tr>
            <td>配送料 / Shipping:</td>
            <td class="text-right">¥${cart.summary.shippingCost.toLocaleString()}</td>
        </tr>
        <tr>
            <td>税金 (VAT) / Tax:</td>
            <td class="text-right">¥${cart.summary.tax.toLocaleString()}</td>
        </tr>
        <tr>
            <td>関税 / Customs Duty:</td>
            <td class="text-right">¥${cart.summary.customsDuty.toLocaleString()}</td>
        </tr>
        <tr>
            <td>その他手数料 / Other Fees:</td>
            <td class="text-right">¥${cart.summary.otherFees.toLocaleString()}</td>
        </tr>
        <tr class="grand-total">
            <td>総合計 / Grand Total:</td>
            <td class="text-right">¥${cart.summary.total.toLocaleString()}</td>
        </tr>
    </table>

    <div style="margin-top: 30px;">
        <strong>配送情報 / Shipping Information:</strong><br>
        ${cart.shippingMethod ? `
        配送方法 / Method: ${cart.shippingMethod.name}<br>
        配送予定 / Estimated Delivery: ${cart.shippingMethod.estimatedDays.min}-${cart.shippingMethod.estimatedDays.max} days<br>
        ` : ''}
        総重量 / Total Weight: ${cart.summary.totalWeight.toFixed(2)} kg<br>
        総商品数 / Total Items: ${cart.summary.totalQuantity} pieces
    </div>

    <div class="footer">
        <p>本見積書は30日間有効です。価格は予告なく変更される場合があります。<br>
        This quotation is valid for 30 days. Prices are subject to change without notice.</p>
        <p>Generated by TJ-Cosmetics Representative System - ${now.toLocaleString('ja-JP')}</p>
    </div>
</body>
</html>
  `.trim()
}