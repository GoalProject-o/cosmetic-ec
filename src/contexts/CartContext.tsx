"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ProductStorage } from '@/lib/storage/productStorage'
import { calculatePricing, PricingInputs } from '@/lib/pricing/calculator'
import { Cart, CartItem, ShippingMethod, ShippingAddress, CartSummary, CartValidationResult } from '@/types/cart'

interface CartContextType {
  cart: Cart | null
  addToCart: (productId: string, quantity: number) => Promise<boolean>
  removeFromCart: (itemId: string) => boolean
  updateQuantity: (itemId: string, quantity: number) => boolean
  clearCart: () => void
  setShippingAddress: (address: ShippingAddress) => void
  setShippingMethod: (method: ShippingMethod) => void
  validateCart: () => CartValidationResult
  getTotalItems: () => number
  exportOrder: () => string
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'tj-cosmetics-cart'

// デフォルト配送方法
const DEFAULT_SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'air',
    name: '航空便',
    code: 'air',
    description: 'バランスの取れた配送オプション',
    estimatedDays: { min: 7, max: 14 },
    priceCalculation: 'per_kg',
    isAvailable: true
  },
  {
    id: 'sea',
    name: '船便',
    code: 'sea',
    description: '低コストだが時間がかかる配送方法',
    estimatedDays: { min: 30, max: 90 },
    priceCalculation: 'per_kg',
    isAvailable: true
  },
  {
    id: 'ems',
    name: 'EMS',
    code: 'ems',
    description: '追跡可能な国際郵便サービス',
    estimatedDays: { min: 3, max: 7 },
    priceCalculation: 'per_kg',
    isAvailable: true
  },
  {
    id: 'dhl',
    name: 'DHL Express',
    code: 'dhl',
    description: '高速国際宅配便',
    estimatedDays: { min: 1, max: 3 },
    priceCalculation: 'per_kg',
    isAvailable: true
  }
]

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // ローカルストレージからカートを読み込み
  useEffect(() => {
    loadCart()
  }, [])

  // カート変更時にローカルストレージに保存
  useEffect(() => {
    if (cart) {
      saveCart()
    }
  }, [cart])

  const loadCart = () => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Date オブジェクトを復元
        parsed.createdAt = new Date(parsed.createdAt)
        parsed.updatedAt = new Date(parsed.updatedAt)
        setCart(parsed)
      } else {
        createEmptyCart()
      }
    } catch (error) {
      console.error('カートの読み込みに失敗:', error)
      createEmptyCart()
    }
  }

  const saveCart = () => {
    if (cart) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
      } catch (error) {
        console.error('カートの保存に失敗:', error)
      }
    }
  }

  const createEmptyCart = () => {
    const newCart: Cart = {
      id: crypto.randomUUID(),
      items: [],
      summary: {
        subtotal: 0,
        totalQuantity: 0,
        totalWeight: 0,
        shippingCost: 0,
        tax: 0,
        customsDuty: 0,
        otherFees: 0,
        total: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setCart(newCart)
  }

  const calculateCartSummary = async (items: CartItem[], shippingMethod?: ShippingMethod): Promise<CartSummary> => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0)

    let shippingCost = 0
    let tax = 0
    let customsDuty = 0
    let otherFees = 0

    // 配送方法が選択されている場合、価格計算を実行
    if (shippingMethod && items.length > 0) {
      try {
        const pricingInputs: PricingInputs = {
          purchasePrice: subtotal,
          weight: totalWeight,
          quantity: totalQuantity,
          profitMargin: 0, // カート計算では利益率は含めない
          shippingMethod: shippingMethod.code
        }

        const pricingResult = calculatePricing(pricingInputs)
        shippingCost = pricingResult.breakdown.internationalShipping
        tax = pricingResult.breakdown.vat
        customsDuty = pricingResult.breakdown.customsDuty
        otherFees = pricingResult.breakdown.processingFee + pricingResult.breakdown.documentFee
      } catch (error) {
        console.error('価格計算エラー:', error)
      }
    }

    const total = subtotal + shippingCost + tax + customsDuty + otherFees

    return {
      subtotal,
      totalQuantity,
      totalWeight,
      shippingCost,
      tax,
      customsDuty,
      otherFees,
      total
    }
  }

  const updateCartSummary = async () => {
    if (!cart) return

    const summary = await calculateCartSummary(cart.items, cart.shippingMethod)
    setCart(prev => prev ? {
      ...prev,
      summary,
      updatedAt: new Date()
    } : null)
  }

  const addToCart = async (productId: string, quantity: number): Promise<boolean> => {
    if (!cart) return false

    setIsLoading(true)
    try {
      const product = ProductStorage.getProductById(productId)
      if (!product) {
        throw new Error('商品が見つかりません')
      }

      // 既存のアイテムをチェック
      const existingItemIndex = cart.items.findIndex(item => item.productId === productId)

      let newItems: CartItem[]

      if (existingItemIndex >= 0) {
        // 既存アイテムの数量を更新
        newItems = [...cart.items]
        newItems[existingItemIndex].quantity += quantity
      } else {
        // 新しいアイテムを追加
        const newItem: CartItem = {
          id: crypto.randomUUID(),
          productId,
          name: product.name,
          price: product.calculatedPrice || 0,
          quantity,
          weight: product.physical?.weight || 0,
          image: product.images?.[0],
          brand: product.brand,
          sku: product.sku,
          minOrderQuantity: 1,
          maxOrderQuantity: 1000
        }
        newItems = [...cart.items, newItem]
      }

      const summary = await calculateCartSummary(newItems, cart.shippingMethod)
      
      setCart({
        ...cart,
        items: newItems,
        summary,
        updatedAt: new Date()
      })

      return true
    } catch (error) {
      console.error('カート追加エラー:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromCart = (itemId: string): boolean => {
    if (!cart) return false

    try {
      const newItems = cart.items.filter(item => item.id !== itemId)
      
      setCart({
        ...cart,
        items: newItems,
        updatedAt: new Date()
      })

      // 非同期で summary を更新
      setTimeout(updateCartSummary, 0)
      
      return true
    } catch (error) {
      console.error('カート削除エラー:', error)
      return false
    }
  }

  const updateQuantity = (itemId: string, quantity: number): boolean => {
    if (!cart || quantity < 1) return false

    try {
      const newItems = cart.items.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )

      setCart({
        ...cart,
        items: newItems,
        updatedAt: new Date()
      })

      // 非同期で summary を更新
      setTimeout(updateCartSummary, 0)

      return true
    } catch (error) {
      console.error('数量更新エラー:', error)
      return false
    }
  }

  const clearCart = () => {
    createEmptyCart()
  }

  const setShippingAddress = (address: ShippingAddress) => {
    if (!cart) return

    setCart({
      ...cart,
      shippingAddress: address,
      updatedAt: new Date()
    })
  }

  const setShippingMethod = (method: ShippingMethod) => {
    if (!cart) return

    setCart({
      ...cart,
      shippingMethod: method,
      updatedAt: new Date()
    })

    // 配送方法変更時は summary を再計算
    setTimeout(updateCartSummary, 0)
  }

  const validateCart = (): CartValidationResult => {
    if (!cart) {
      return {
        isValid: false,
        errors: [{ field: 'cart', message: 'カートが見つかりません' }],
        warnings: []
      }
    }

    const errors: CartValidationResult['errors'] = []
    const warnings: CartValidationResult['warnings'] = []

    // アイテム数チェック
    if (cart.items.length === 0) {
      errors.push({ field: 'items', message: 'カートに商品が入っていません' })
    }

    // 各アイテムの検証
    cart.items.forEach(item => {
      if (item.quantity < item.minOrderQuantity) {
        errors.push({
          itemId: item.id,
          field: 'quantity',
          message: `${item.name.ja}の最小注文数量は${item.minOrderQuantity}個です`
        })
      }

      if (item.maxOrderQuantity && item.quantity > item.maxOrderQuantity) {
        warnings.push({
          itemId: item.id,
          field: 'quantity',
          message: `${item.name.ja}の推奨最大数量は${item.maxOrderQuantity}個です`
        })
      }
    })

    // 配送先チェック
    if (!cart.shippingAddress) {
      errors.push({ field: 'shippingAddress', message: '配送先を設定してください' })
    }

    // 配送方法チェック
    if (!cart.shippingMethod) {
      errors.push({ field: 'shippingMethod', message: '配送方法を選択してください' })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  const getTotalItems = (): number => {
    return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0
  }

  const exportOrder = (): string => {
    if (!cart) return '{}'

    const orderData = {
      orderId: crypto.randomUUID(),
      orderNumber: `TJ-${Date.now()}`,
      exportedAt: new Date().toISOString(),
      cart: {
        ...cart,
        exportNote: 'Generated by TJ-Cosmetics Representative System'
      },
      validation: validateCart()
    }

    return JSON.stringify(orderData, null, 2)
  }

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      setShippingAddress,
      setShippingMethod,
      validateCart,
      getTotalItems,
      exportOrder,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export { DEFAULT_SHIPPING_METHODS }