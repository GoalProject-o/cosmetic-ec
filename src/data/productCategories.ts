// 商品カテゴリーとHSコード データ

export interface ProductCategory {
  id: string
  name: { ja: string; en: string }
  hsCode: string
  skuPrefix: string
  description?: string
  subcategories?: ProductSubcategory[]
}

export interface ProductSubcategory {
  id: string
  name: { ja: string; en: string }
  hsCode: string
  skuPrefix: string
  description?: string
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: 'skincare',
    name: { ja: 'スキンケア', en: 'Skincare' },
    hsCode: '3304.99',
    skuPrefix: 'SK',
    description: 'フェイスクリーム、美容液、化粧水など',
    subcategories: [
      {
        id: 'face-cream',
        name: { ja: 'フェイスクリーム', en: 'Face Cream' },
        hsCode: '3304.99.10',
        skuPrefix: 'SKFC',
        description: '顔用クリーム・乳液'
      },
      {
        id: 'serum',
        name: { ja: '美容液', en: 'Serum' },
        hsCode: '3304.99.20',
        skuPrefix: 'SKSR',
        description: '美容液・エッセンス'
      },
      {
        id: 'toner',
        name: { ja: '化粧水', en: 'Toner' },
        hsCode: '3304.99.30',
        skuPrefix: 'SKTN',
        description: '化粧水・トナー'
      }
    ]
  },
  {
    id: 'makeup',
    name: { ja: 'メイクアップ', en: 'Makeup' },
    hsCode: '3304.10',
    skuPrefix: 'MK',
    description: 'ファンデーション、リップ、アイメイクなど',
    subcategories: [
      {
        id: 'foundation',
        name: { ja: 'ファンデーション', en: 'Foundation' },
        hsCode: '3304.10.10',
        skuPrefix: 'MKFD',
        description: 'リキッド・パウダーファンデーション'
      },
      {
        id: 'lipstick',
        name: { ja: 'リップスティック', en: 'Lipstick' },
        hsCode: '3304.10.20',
        skuPrefix: 'MKLP',
        description: 'リップスティック・グロス'
      },
      {
        id: 'eyeshadow',
        name: { ja: 'アイシャドウ', en: 'Eyeshadow' },
        hsCode: '3304.10.30',
        skuPrefix: 'MKES',
        description: 'アイシャドウ・アイライナー'
      }
    ]
  },
  {
    id: 'haircare',
    name: { ja: 'ヘアケア', en: 'Hair Care' },
    hsCode: '3305.10',
    skuPrefix: 'HC',
    description: 'シャンプー、コンディショナー、ヘアトリートメントなど',
    subcategories: [
      {
        id: 'shampoo',
        name: { ja: 'シャンプー', en: 'Shampoo' },
        hsCode: '3305.10.10',
        skuPrefix: 'HCSH',
        description: 'シャンプー'
      },
      {
        id: 'conditioner',
        name: { ja: 'コンディショナー', en: 'Conditioner' },
        hsCode: '3305.10.20',
        skuPrefix: 'HCCN',
        description: 'コンディショナー・リンス'
      },
      {
        id: 'hair-treatment',
        name: { ja: 'ヘアトリートメント', en: 'Hair Treatment' },
        hsCode: '3305.10.30',
        skuPrefix: 'HCTR',
        description: 'ヘアマスク・トリートメント'
      }
    ]
  },
  {
    id: 'supplements',
    name: { ja: '健康食品・サプリメント', en: 'Health Supplements' },
    hsCode: '2106.90',
    skuPrefix: 'SP',
    description: 'ビタミン、ミネラル、健康食品など',
    subcategories: [
      {
        id: 'vitamins',
        name: { ja: 'ビタミン', en: 'Vitamins' },
        hsCode: '2106.90.10',
        skuPrefix: 'SPVT',
        description: 'ビタミンサプリメント'
      },
      {
        id: 'minerals',
        name: { ja: 'ミネラル', en: 'Minerals' },
        hsCode: '2106.90.20',
        skuPrefix: 'SPMN',
        description: 'ミネラルサプリメント'
      },
      {
        id: 'herbal',
        name: { ja: 'ハーブ系', en: 'Herbal' },
        hsCode: '2106.90.30',
        skuPrefix: 'SPHB',
        description: 'ハーブエキス・植物系サプリ'
      }
    ]
  },
  {
    id: 'accessories',
    name: { ja: '美容アクセサリー', en: 'Beauty Accessories' },
    hsCode: '9603.21',
    skuPrefix: 'AC',
    description: 'ブラシ、スポンジ、美容器具など',
    subcategories: [
      {
        id: 'brushes',
        name: { ja: 'ブラシ', en: 'Brushes' },
        hsCode: '9603.21.10',
        skuPrefix: 'ACBR',
        description: 'メイクブラシ・洗顔ブラシ'
      },
      {
        id: 'sponges',
        name: { ja: 'スポンジ', en: 'Sponges' },
        hsCode: '9603.21.20',
        skuPrefix: 'ACSP',
        description: 'メイクスポンジ・パフ'
      },
      {
        id: 'tools',
        name: { ja: '美容器具', en: 'Beauty Tools' },
        hsCode: '9603.21.30',
        skuPrefix: 'ACTOOL',
        description: '美容器具・小道具'
      }
    ]
  }
]

// カテゴリーIDからカテゴリー情報を取得
export function getCategoryById(id: string): ProductCategory | undefined {
  return PRODUCT_CATEGORIES.find(cat => cat.id === id)
}

// サブカテゴリーIDからサブカテゴリー情報を取得
export function getSubcategoryById(categoryId: string, subcategoryId: string): ProductSubcategory | undefined {
  const category = getCategoryById(categoryId)
  return category?.subcategories?.find(sub => sub.id === subcategoryId)
}

// SKU自動生成
export function generateSKU(categoryId: string, subcategoryId?: string, productName?: string): string {
  const category = getCategoryById(categoryId)
  if (!category) return 'UNKNOWN'
  
  let prefix = category.skuPrefix
  
  if (subcategoryId) {
    const subcategory = getSubcategoryById(categoryId, subcategoryId)
    if (subcategory) {
      prefix = subcategory.skuPrefix
    }
  }
  
  // 商品名から英数字のみ抽出して最大4文字
  let productCode = ''
  if (productName) {
    productCode = productName
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 4)
      .padEnd(4, 'X')
  } else {
    productCode = 'XXXX'
  }
  
  // タイムスタンプで一意性を保証
  const timestamp = Date.now().toString().slice(-4)
  
  return `${prefix}-${productCode}-${timestamp}`
}