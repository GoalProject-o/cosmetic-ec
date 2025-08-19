// カート機能の型定義

export interface CartItem {
  id: string
  productId: string
  name: {
    ja: string
    ru: string
  }
  price: number
  quantity: number
  weight: number // 単位重量（kg）
  image?: string
  brand: string
  sku: string
  minOrderQuantity: number
  maxOrderQuantity?: number
}

export interface ShippingAddress {
  id: string
  name: string
  company?: string
  country: string
  state?: string
  city: string
  postalCode: string
  address1: string
  address2?: string
  phone: string
  email: string
  isDefault: boolean
}

export interface ShippingMethod {
  id: string
  name: string
  code: 'air' | 'sea' | 'ems' | 'dhl'
  description: string
  estimatedDays: {
    min: number
    max: number
  }
  priceCalculation: 'per_kg' | 'flat' | 'zone_based'
  isAvailable: boolean
}

export interface CartSummary {
  subtotal: number           // 商品合計
  totalQuantity: number      // 総数量
  totalWeight: number        // 総重量（kg）
  shippingCost: number      // 配送料
  tax: number               // 税金
  customsDuty: number       // 関税
  otherFees: number         // その他手数料
  total: number             // 総合計
}

export interface Cart {
  id: string
  items: CartItem[]
  shippingAddress?: ShippingAddress
  shippingMethod?: ShippingMethod
  summary: CartSummary
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem extends CartItem {
  unitPrice: number         // 注文時の単価
  lineTotal: number         // 行合計
}

export interface Order {
  id: string
  orderNumber: string
  status: 'draft' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: OrderItem[]
  shippingAddress: ShippingAddress
  shippingMethod: ShippingMethod
  summary: CartSummary
  notes?: string
  createdAt: Date
  updatedAt: Date
  estimatedDelivery?: Date
}

export interface CartValidationResult {
  isValid: boolean
  errors: {
    itemId?: string
    field: string
    message: string
  }[]
  warnings: {
    itemId?: string
    field: string
    message: string
  }[]
}