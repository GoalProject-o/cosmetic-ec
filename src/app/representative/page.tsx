"use client"

import Link from 'next/link'
import { useLanguage, useTranslation } from '@/contexts/LanguageContext'

export default function RepresentativeHomePage() {
  const { language } = useLanguage()
  const { t } = useTranslation('nav')

  const features = [
    {
      title: language === 'ja' ? '商品カタログ' : 'Каталог товаров',
      description: language === 'ja' 
        ? '高品質な日本の化粧品とスナックを豊富に取り揃えています' 
        : 'Широкий ассортимент высококачественной японской косметики и снэков',
      icon: '🛍️',
      href: '/representative/catalog'
    },
    {
      title: language === 'ja' ? '簡単注文' : 'Простое оформление заказа',
      description: language === 'ja' 
        ? 'わかりやすいインターフェースで簡単に注文できます' 
        : 'Удобный интерфейс для быстрого оформления заказов',
      icon: '📝',
      href: '/representative/catalog'
    },
    {
      title: language === 'ja' ? '価格計算' : 'Расчет цены',
      description: language === 'ja' 
        ? '数量に応じた価格計算を自動で行います' 
        : 'Автоматический расчет цены в зависимости от количества',
      icon: '🧮',
      href: '/representative/catalog'
    },
    {
      title: language === 'ja' ? '多言語対応' : 'Многоязычная поддержка',
      description: language === 'ja' 
        ? '日本語とロシア語に対応しています' 
        : 'Поддержка японского и русского языков',
      icon: '🌐',
      href: '/representative/catalog'
    }
  ]

  return (
    <div className="space-y-12">
      {/* ヒーローセクション */}
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          TJ-Cosmetics
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          {language === 'ja' 
            ? '日本の高品質化粧品とスナックを世界へお届けします。代表者の皆様に最適な商品カタログシステムをご用意いたしました。' 
            : 'Поставляем высококачественную японскую косметику и снэки по всему миру. Предлагаем оптимальную систему каталога товаров для наших представителей.'
          }
        </p>
        <Link
          href="/representative/catalog"
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          {language === 'ja' ? '商品カタログを見る' : 'Посмотреть каталог'}
        </Link>
      </div>

      {/* 機能紹介 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <Link key={index} href={feature.href}>
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-4xl mb-4 text-center">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                {feature.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* 統計情報 */}
      <div className="bg-blue-50 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          {language === 'ja' ? '私たちの実績' : 'Наши достижения'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-gray-700">
              {language === 'ja' ? '取扱商品数' : 'Товаров в каталоге'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-gray-700">
              {language === 'ja' ? 'パートナーブランド' : 'Партнерских брендов'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">20+</div>
            <div className="text-gray-700">
              {language === 'ja' ? '国・地域への配送' : 'Стран доставки'}
            </div>
          </div>
        </div>
      </div>

      {/* CTA セクション */}
      <div className="bg-gray-900 text-white rounded-2xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">
          {language === 'ja' ? '今すぐ始めましょう' : 'Начните прямо сейчас'}
        </h2>
        <p className="text-xl text-gray-300 mb-6">
          {language === 'ja' 
            ? '豊富な商品ラインナップから、お客様のニーズに最適な商品を見つけてください。' 
            : 'Найдите идеальные товары для ваших клиентов из нашего широкого ассортимента.'
          }
        </p>
        <Link
          href="/representative/catalog"
          className="inline-block bg-white text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          {language === 'ja' ? 'カタログを見る' : 'Открыть каталог'}
        </Link>
      </div>
    </div>
  )
}