export interface ProductCore {
  id: string
  sku: string
  name: {
    ja: string
    ru: string
    tg?: string
  }
  description: {
    ja: string
    ru: string
    tg?: string
  }
  category: ProductCategory
  hsCode: string
  brand: string
  manufacturer: string
  images: ProductImage[]
  status: 'draft' | 'active' | 'inactive' | 'discontinued'
  createdAt: Date
  updatedAt: Date
}

export interface ProductCategory {
  id: string
  name: string
  hsCode: string
  tariffRate: number
  parentId?: string
}

export interface ProductImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
  order: number
}

export interface ProductPhysical {
  productId: string
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  volumeWeight: number
  shippingWeight: number
  containerInfo: {
    material: 'glass' | 'plastic' | 'metal' | 'paper'
    size: number
    isDangerous: boolean
    alcoholContent?: number
  }
  storageRequirements: {
    temperatureControl: boolean
    humidity: boolean
    lightProtection: boolean
  }
  expiryInfo: {
    shelfLifeMonths: number
    afterOpeningMonths?: number
  }
}

export interface ProductPurchase {
  productId: string
  supplier: {
    name: string
    type: 'donki' | 'matsumoto' | 'amazon' | 'other'
    location: string
  }
  purchasePrice: number
  minimumOrderQuantity: number
  leadTimeDays: number
  availability: 'in_stock' | 'limited' | 'pre_order' | 'discontinued'
  lastPurchaseDate?: Date
  averagePurchasePrice: number
  notes: string
}

// 国別価格情報
export interface CountryPricing {
  countryCode: string
  countryName: string
  calculatedPrice: number
  profitMargin: number
  totalTaxes: number
  shippingCost: number
  lastUpdated: Date
}

// 商品一覧表示用の統合型
export interface ProductListItem {
  id: string
  sku: string
  name: {
    ja: string
    ru: string
    tg?: string
  }
  category: ProductCategory
  brand: string
  manufacturer: string
  status: 'draft' | 'active' | 'inactive' | 'discontinued'
  purchasePrice: number
  calculatedPrice?: number
  profitMargin?: number
  weight: number
  images: ProductImage[]
  countryPricing?: CountryPricing[]  // 国別価格情報
  createdAt: Date
  updatedAt: Date
}

// 商品フィルター用の型
export interface ProductFilter {
  search?: string
  category?: string
  status?: ProductCore['status']
  brand?: string
  priceRange?: {
    min: number
    max: number
  }
}

// ソート設定
export interface ProductSort {
  field: 'name' | 'category' | 'brand' | 'purchasePrice' | 'calculatedPrice' | 'createdAt' | 'updatedAt'
  direction: 'asc' | 'desc'
}

// ページネーション
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// 一括操作用の型
export interface BulkAction {
  type: 'delete' | 'updateStatus' | 'recalculatePrice' | 'export'
  productIds: string[]
  params?: Record<string, any>
}