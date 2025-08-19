"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Cart } from '@/components/cart/Cart'
import { useCart } from '@/contexts/CartContext'
import { useLanguage, useTranslation } from '@/contexts/LanguageContext'
import { ShippingAddress } from '@/types/cart'

export default function CartPage() {
  const router = useRouter()
  const { cart, setShippingAddress, validateCart, exportOrder } = useCart()
  const { language } = useLanguage()
  const { t } = useTranslation('common')

  const [currentStep, setCurrentStep] = useState<'cart' | 'shipping' | 'confirm'>('cart')
  const [shippingInfo, setShippingInfo] = useState<Partial<ShippingAddress>>({
    name: '',
    company: '',
    country: 'Tajikistan',
    city: '',
    postalCode: '',
    address1: '',
    address2: '',
    phone: '',
    email: ''
  })

  const translations = {
    ja: {
      cartTitle: 'ショッピングカート',
      shippingTitle: '配送先情報',
      confirmTitle: '注文確認',
      nextStep: '次へ',
      prevStep: '戻る',
      placeOrder: '注文確定',
      exportOrder: 'JSON出力',
      backToCatalog: 'カタログに戻る',
      requiredField: '必須',
      name: '氏名',
      company: '会社名（任意）',
      country: '国',
      city: '都市',
      postalCode: '郵便番号',
      address1: '住所1',
      address2: '住所2（任意）',
      phone: '電話番号',
      email: 'メールアドレス',
      orderPlaced: '注文が確定されました！',
      orderExported: '注文データをエクスポートしました',
      validationErrors: '入力エラーがあります',
      fillRequired: '必須項目を入力してください'
    },
    ru: {
      cartTitle: 'Корзина покупок',
      shippingTitle: 'Информация о доставке',
      confirmTitle: 'Подтверждение заказа',
      nextStep: 'Далее',
      prevStep: 'Назад',
      placeOrder: 'Разместить заказ',
      exportOrder: 'Экспорт JSON',
      backToCatalog: 'Назад к каталогу',
      requiredField: 'обязательно',
      name: 'Имя',
      company: 'Компания (необязательно)',
      country: 'Страна',
      city: 'Город',
      postalCode: 'Почтовый индекс',
      address1: 'Адрес 1',
      address2: 'Адрес 2 (необязательно)',
      phone: 'Телефон',
      email: 'Email',
      orderPlaced: 'Заказ размещен!',
      orderExported: 'Данные заказа экспортированы',
      validationErrors: 'Есть ошибки ввода',
      fillRequired: 'Заполните обязательные поля'
    }
  }

  const tr = translations[language]

  const steps = [
    { id: 'cart', title: tr.cartTitle },
    { id: 'shipping', title: tr.shippingTitle },
    { id: 'confirm', title: tr.confirmTitle }
  ]

  const validateShippingInfo = (): boolean => {
    const required = ['name', 'country', 'city', 'address1', 'phone', 'email']
    return required.every(field => shippingInfo[field as keyof ShippingAddress]?.toString().trim())
  }

  const handleNextStep = () => {
    if (currentStep === 'cart') {
      const validation = validateCart()
      if (!validation.isValid) {
        alert(tr.validationErrors + ': ' + validation.errors.map(e => e.message).join(', '))
        return
      }
      setCurrentStep('shipping')
    } else if (currentStep === 'shipping') {
      if (!validateShippingInfo()) {
        alert(tr.fillRequired)
        return
      }

      // 配送先情報を保存
      const address: ShippingAddress = {
        id: crypto.randomUUID(),
        name: shippingInfo.name || '',
        company: shippingInfo.company,
        country: shippingInfo.country || '',
        city: shippingInfo.city || '',
        postalCode: shippingInfo.postalCode || '',
        address1: shippingInfo.address1 || '',
        address2: shippingInfo.address2,
        phone: shippingInfo.phone || '',
        email: shippingInfo.email || '',
        isDefault: true
      }
      setShippingAddress(address)
      setCurrentStep('confirm')
    }
  }

  const handlePrevStep = () => {
    if (currentStep === 'shipping') {
      setCurrentStep('cart')
    } else if (currentStep === 'confirm') {
      setCurrentStep('shipping')
    }
  }

  const handlePlaceOrder = () => {
    const validation = validateCart()
    if (!validation.isValid) {
      alert(tr.validationErrors)
      return
    }

    alert(tr.orderPlaced)
    // 注文確定後の処理（実際のシステムではAPIコール等）
    router.push('/representative/catalog')
  }

  const handleExportOrder = () => {
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
    alert(tr.orderExported)
  }

  if (!cart) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ステップインジケーター */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                currentStep === step.id 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : steps.findIndex(s => s.id === currentStep) > index
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 text-gray-400'
              }`}>
                {steps.findIndex(s => s.id === currentStep) > index ? '✓' : index + 1}
              </div>
              <div className={`ml-3 ${
                currentStep === step.id ? 'text-blue-600 font-semibold' : 'text-gray-600'
              }`}>
                {step.title}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-6 ${
                  steps.findIndex(s => s.id === currentStep) > index ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ステップコンテンツ */}
      {currentStep === 'cart' && (
        <Cart showHeader={false} showCheckout={false} />
      )}

      {currentStep === 'shipping' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">{tr.shippingTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                {tr.name} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={shippingInfo.name || ''}
                onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {tr.company}
              </label>
              <input
                type="text"
                value={shippingInfo.company || ''}
                onChange={(e) => setShippingInfo({...shippingInfo, company: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {tr.country} <span className="text-red-500">*</span>
              </label>
              <select
                value={shippingInfo.country || ''}
                onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">選択してください</option>
                <option value="Tajikistan">Tajikistan</option>
                <option value="Russia">Russia</option>
                <option value="Kyrgyzstan">Kyrgyzstan</option>
                <option value="Kazakhstan">Kazakhstan</option>
                <option value="Uzbekistan">Uzbekistan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {tr.city} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={shippingInfo.city || ''}
                onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {tr.postalCode}
              </label>
              <input
                type="text"
                value={shippingInfo.postalCode || ''}
                onChange={(e) => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {tr.phone} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={shippingInfo.phone || ''}
                onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                {tr.address1} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={shippingInfo.address1 || ''}
                onChange={(e) => setShippingInfo({...shippingInfo, address1: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                {tr.address2}
              </label>
              <input
                type="text"
                value={shippingInfo.address2 || ''}
                onChange={(e) => setShippingInfo({...shippingInfo, address2: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">
                {tr.email} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={shippingInfo.email || ''}
                onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>
      )}

      {currentStep === 'confirm' && (
        <div className="space-y-6">
          <Cart showHeader={false} showCheckout={false} />
          
          {cart.shippingAddress && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">{tr.shippingTitle}</h3>
              <div className="text-sm space-y-1">
                <div><strong>{cart.shippingAddress.name}</strong></div>
                {cart.shippingAddress.company && <div>{cart.shippingAddress.company}</div>}
                <div>{cart.shippingAddress.address1}</div>
                {cart.shippingAddress.address2 && <div>{cart.shippingAddress.address2}</div>}
                <div>{cart.shippingAddress.city}, {cart.shippingAddress.postalCode}</div>
                <div>{cart.shippingAddress.country}</div>
                <div>{cart.shippingAddress.phone}</div>
                <div>{cart.shippingAddress.email}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ナビゲーションボタン */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.push('/representative/catalog')}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          {tr.backToCatalog}
        </button>

        <div className="flex space-x-4">
          {currentStep !== 'cart' && (
            <button
              onClick={handlePrevStep}
              className="bg-gray-100 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {tr.prevStep}
            </button>
          )}
          
          {currentStep === 'confirm' && (
            <button
              onClick={handleExportOrder}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              {tr.exportOrder}
            </button>
          )}

          {currentStep !== 'confirm' ? (
            <button
              onClick={handleNextStep}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {tr.nextStep}
            </button>
          ) : (
            <button
              onClick={handlePlaceOrder}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {tr.placeOrder}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}