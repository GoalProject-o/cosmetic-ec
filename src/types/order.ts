export type OrderStatus = 
  | 'draft'
  | 'pending_inventory'
  | 'inventory_confirmed'
  | 'awaiting_payment'
  | 'payment_confirmed'
  | 'purchasing'
  | 'packaging'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface Order {
  id: string
  orderNumber: string
  representativeId: string
  status: OrderStatus
  items: OrderItem[]
  pricing: {
    subtotal: number
    shippingCost: number
    taxes: number
    fees: number
    discount: number
    total: number
    currency: 'USD'
  }
  shipping: {
    method: string
    estimatedDays: string
    trackingNumber?: string
    address: ShippingAddress
  }
  payment: {
    method: 'bank_transfer' | 'crypto'
    status: 'pending' | 'paid' | 'failed'
    paidAt?: Date
    invoiceUrl?: string
  }
  timeline: OrderTimeline[]
  notes: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  sku: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  pricingCalculationId: string
  notes?: string
}

export interface OrderTimeline {
  status: OrderStatus
  timestamp: Date
  userId: string
  notes?: string
}

export interface ShippingAddress {
  name: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}