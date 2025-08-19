export interface PricingResult {
  productId: string
  calculationId: string
  timestamp: Date
  
  inputs: {
    purchasePrice: number
    weight: number
    shippingMethod: string
    profitMargin: number
    quantity: number
  }
  
  breakdown: {
    productCost: number
    domesticShipping: number
    packingMaterials: number
    internationalShipping: number
    insurance: number
    cifPrice: number
    customsDuty: number
    vat: number
    customsFee: number
    processingFee: number
    documentFee: number
    riskBuffer: number
    exchangeMargin: number
    totalCost: number
    profitAmount: number
    sellingPrice: number
  }
  
  shippingComparison: ShippingOption[]
  volumePricing: VolumePricing[]
  isActive: boolean
  expiresAt: Date
}

export interface ShippingOption {
  carrierId: string
  serviceId: string
  cost: number
  deliveryDays: string
  totalPrice: number
  recommended: boolean
}

export interface VolumePricing {
  minQuantity: number
  maxQuantity: number
  unitPrice: number
  totalPrice: number
  discountRate: number
}

export interface PriceCalculationRequest {
  productId: string
  quantity?: number
  shippingMethod?: string
  profitMargin?: number
  representativeId?: string
}

export interface PriceCalculationResponse {
  success: boolean
  data: PricingResult
  alternatives: ShippingOption[]
  warnings: string[]
  cacheExpiry: Date
}