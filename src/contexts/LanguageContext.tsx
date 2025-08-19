"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'ja' | 'ru'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, section?: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// 翻訳データ
const translations = {
  ja: {
    common: {
      loading: '読み込み中...',
      error: 'エラーが発生しました',
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      edit: '編集',
      add: '追加',
      search: '検索',
      reset: 'リセット',
      back: '戻る',
      next: '次へ',
      prev: '前へ',
      close: '閉じる',
      confirm: '確認',
      yes: 'はい',
      no: 'いいえ',
      yen: '円',
      pieces: '個',
      kg: 'kg',
      cm: 'cm'
    },
    nav: {
      catalog: '商品カタログ',
      orders: '注文履歴',
      profile: 'プロフィール',
      settings: '設定',
      admin: '管理画面'
    },
    catalog: {
      title: '商品カタログ',
      subtitle: '高品質な日本の化粧品とスナック',
      search: '商品を検索...',
      allCategories: 'すべてのカテゴリー',
      allBrands: 'すべてのブランド',
      priceRange: '価格帯',
      noProducts: '該当する商品が見つかりませんでした',
      results: '件の商品',
      addToCart: 'カートに追加',
      viewDetails: '詳細を見る',
      minOrder: '最小注文数量',
      outOfStock: '在庫切れ',
      draft: '準備中'
    },
    product: {
      details: '商品詳細',
      specifications: '仕様',
      brand: 'ブランド',
      manufacturer: 'メーカー',
      category: 'カテゴリー',
      weight: '重量',
      dimensions: 'サイズ',
      quantity: '数量',
      price: '価格',
      unitPrice: '単価',
      totalPrice: '合計価格',
      priceCalculation: '価格計算',
      notFound: '商品が見つかりません'
    }
  },
  ru: {
    common: {
      loading: 'Загрузка...',
      error: 'Произошла ошибка',
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Редактировать',
      add: 'Добавить',
      search: 'Поиск',
      reset: 'Сброс',
      back: 'Назад',
      next: 'Далее',
      prev: 'Назад',
      close: 'Закрыть',
      confirm: 'Подтвердить',
      yes: 'Да',
      no: 'Нет',
      yen: '¥',
      pieces: 'шт',
      kg: 'кг',
      cm: 'см'
    },
    nav: {
      catalog: 'Каталог товаров',
      orders: 'История заказов',
      profile: 'Профиль',
      settings: 'Настройки',
      admin: 'Админ панель'
    },
    catalog: {
      title: 'Каталог товаров',
      subtitle: 'Высококачественная японская косметика и снэки',
      search: 'Поиск товаров...',
      allCategories: 'Все категории',
      allBrands: 'Все бренды',
      priceRange: 'Ценовой диапазон',
      noProducts: 'Товары не найдены',
      results: 'товаров',
      addToCart: 'В корзину',
      viewDetails: 'Подробнее',
      minOrder: 'Мин. заказ',
      outOfStock: 'Нет в наличии',
      draft: 'В разработке'
    },
    product: {
      details: 'Детали товара',
      specifications: 'Характеристики',
      brand: 'Бренд',
      manufacturer: 'Производитель',
      category: 'Категория',
      weight: 'Вес',
      dimensions: 'Размеры',
      quantity: 'Количество',
      price: 'Цена',
      unitPrice: 'Цена за единицу',
      totalPrice: 'Общая стоимость',
      priceCalculation: 'Расчет цены',
      notFound: 'Товар не найден'
    }
  }
}

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>('ja')

  // ローカルストレージから言語設定を読み込み
  useEffect(() => {
    const savedLanguage = localStorage.getItem('tj-cosmetics-language') as Language
    if (savedLanguage && ['ja', 'ru'].includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    }
  }, [])

  // 言語変更時にローカルストレージに保存
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem('tj-cosmetics-language', newLanguage)
  }

  // 翻訳関数
  const t = (key: string, section: string = 'common'): string => {
    const sectionTranslations = translations[language][section as keyof typeof translations['ja']]
    if (sectionTranslations && sectionTranslations[key as keyof typeof sectionTranslations]) {
      return sectionTranslations[key as keyof typeof sectionTranslations] as string
    }
    
    // フォールバック: 共通セクションから検索
    const commonTranslations = translations[language].common
    if (commonTranslations[key as keyof typeof commonTranslations]) {
      return commonTranslations[key as keyof typeof commonTranslations] as string
    }
    
    // 最終フォールバック: キーをそのまま返す
    return key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// フックでの便利な翻訳関数
export function useTranslation(section?: string) {
  const { t, language } = useLanguage()
  return {
    t: (key: string) => t(key, section),
    language
  }
}