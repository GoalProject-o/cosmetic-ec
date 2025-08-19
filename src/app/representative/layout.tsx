"use client"

import Link from 'next/link'
import { LanguageProvider, useLanguage, useTranslation } from '@/contexts/LanguageContext'
import { CartProvider, useCart } from '@/contexts/CartContext'

export default function RepresentativeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LanguageProvider>
      <CartProvider>
        <RepresentativeLayoutContent>{children}</RepresentativeLayoutContent>
      </CartProvider>
    </LanguageProvider>
  )
}

function RepresentativeLayoutContent({ children }: { children: React.ReactNode }) {
  const { language, setLanguage } = useLanguage()
  const { getTotalItems } = useCart()
  const { t } = useTranslation('nav')
  const totalItems = getTotalItems()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/representative" className="text-xl font-bold text-blue-600">
              TJ-Cosmetics {language === 'ja' ? 'カタログ' : 'Каталог'}
            </Link>
            <div className="flex items-center space-x-6">
              <Link
                href="/representative/catalog"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                {t('catalog')}
              </Link>
              
              {/* カートアイコン */}
              <Link
                href="/representative/cart"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors relative"
              >
                <div className="flex items-center space-x-1">
                  <span>🛒</span>
                  <span>{language === 'ja' ? 'カート' : 'Корзина'}</span>
                  {totalItems > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center absolute -top-1 -right-1">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </div>
              </Link>
              
              <Link
                href="/representative/orders"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                {t('orders')}
              </Link>
              <Link
                href="/representative/profile"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                {t('profile')}
              </Link>
              
              {/* 言語切り替え */}
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'ja' | 'ru')}
                  className="text-sm border border-gray-300 rounded px-3 py-1 bg-white"
                >
                  <option value="ja">日本語</option>
                  <option value="ru">Русский</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  )
}