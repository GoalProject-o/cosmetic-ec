// ローカルストレージを使用した商品データ管理ライブラリ

import { ProductListItem, ProductFilter, ProductSort, Pagination, CountryPricing } from '@/types/product'
import { PricingResult, calculatePricing, PricingInputs } from '@/lib/pricing/calculator'
import { SettingsService } from '@/lib/settings/SettingsService'

const STORAGE_KEY = 'tj-cosmetics-products'
const PRICING_RESULTS_KEY = 'tj-cosmetics-pricing-results'

export class ProductStorage {
  // 商品データの保存
  static saveProduct(product: ProductListItem): void {
    const products = this.getAllProducts()
    const existingIndex = products.findIndex(p => p.id === product.id)
    
    if (existingIndex >= 0) {
      products[existingIndex] = { ...product, updatedAt: new Date() }
    } else {
      products.push(product)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  }

  // 全商品データの取得
  static getAllProducts(): ProductListItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return []
      
      const products = JSON.parse(data) as ProductListItem[]
      return products.map(product => ({
        ...product,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt)
      }))
    } catch (error) {
      console.error('Failed to load products:', error)
      return []
    }
  }

  // 商品IDで検索
  static getProductById(id: string): ProductListItem | null {
    const products = this.getAllProducts()
    return products.find(p => p.id === id) || null
  }

  // 商品の削除
  static deleteProduct(id: string): boolean {
    const products = this.getAllProducts()
    const filteredProducts = products.filter(p => p.id !== id)
    
    if (filteredProducts.length !== products.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredProducts))
      return true
    }
    return false
  }

  // 複数商品の削除
  static deleteProducts(ids: string[]): number {
    const products = this.getAllProducts()
    const filteredProducts = products.filter(p => !ids.includes(p.id))
    const deletedCount = products.length - filteredProducts.length
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredProducts))
    return deletedCount
  }

  // フィルター・ソート・ページネーション付きで商品取得
  static getFilteredProducts(
    filter: ProductFilter = {},
    sort: ProductSort = { field: 'updatedAt', direction: 'desc' },
    pagination: Omit<Pagination, 'total' | 'totalPages'> = { page: 1, limit: 10 }
  ): { products: ProductListItem[], pagination: Pagination } {
    let products = this.getAllProducts()

    // フィルタリング
    if (filter.search) {
      const searchLower = filter.search.toLowerCase()
      products = products.filter(product => 
        product.name.ja.toLowerCase().includes(searchLower) ||
        product.name.ru.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.brand.toLowerCase().includes(searchLower) ||
        product.manufacturer.toLowerCase().includes(searchLower)
      )
    }

    if (filter.category) {
      products = products.filter(product => 
        product.category.name === filter.category
      )
    }

    if (filter.status) {
      products = products.filter(product => product.status === filter.status)
    }

    if (filter.brand) {
      products = products.filter(product => product.brand === filter.brand)
    }

    if (filter.priceRange) {
      products = products.filter(product => {
        const price = product.calculatedPrice || product.purchasePrice
        return price >= filter.priceRange!.min && price <= filter.priceRange!.max
      })
    }

    // ソート
    products.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sort.field) {
        case 'name':
          aValue = a.name.ja
          bValue = b.name.ja
          break
        case 'category':
          aValue = a.category.name
          bValue = b.category.name
          break
        case 'brand':
          aValue = a.brand
          bValue = b.brand
          break
        case 'purchasePrice':
          aValue = a.purchasePrice
          bValue = b.purchasePrice
          break
        case 'calculatedPrice':
          aValue = a.calculatedPrice || 0
          bValue = b.calculatedPrice || 0
          break
        case 'createdAt':
          aValue = a.createdAt
          bValue = b.createdAt
          break
        case 'updatedAt':
          aValue = a.updatedAt
          bValue = b.updatedAt
          break
        default:
          aValue = a.updatedAt
          bValue = b.updatedAt
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1
      return 0
    })

    // ページネーション
    const total = products.length
    const totalPages = Math.ceil(total / pagination.limit)
    const startIndex = (pagination.page - 1) * pagination.limit
    const endIndex = startIndex + pagination.limit
    const paginatedProducts = products.slice(startIndex, endIndex)

    return {
      products: paginatedProducts,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages
      }
    }
  }

  // 価格計算結果の保存
  static savePricingResult(productId: string, result: PricingResult): void {
    const results = this.getAllPricingResults()
    results[productId] = result
    localStorage.setItem(PRICING_RESULTS_KEY, JSON.stringify(results))
  }

  // 価格計算結果の取得
  static getPricingResult(productId: string): PricingResult | null {
    const results = this.getAllPricingResults()
    return results[productId] || null
  }

  // 全価格計算結果の取得
  static getAllPricingResults(): Record<string, PricingResult> {
    try {
      const data = localStorage.getItem(PRICING_RESULTS_KEY)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('Failed to load pricing results:', error)
      return {}
    }
  }

  // ステータス別の商品数を取得
  static getProductStats(): Record<string, number> {
    const products = this.getAllProducts()
    const stats: Record<string, number> = {
      total: products.length,
      draft: 0,
      active: 0,
      inactive: 0,
      discontinued: 0
    }

    products.forEach(product => {
      stats[product.status] = (stats[product.status] || 0) + 1
    })

    return stats
  }

  // カテゴリー別の商品数を取得
  static getCategoryStats(): Record<string, number> {
    const products = this.getAllProducts()
    const stats: Record<string, number> = {}

    products.forEach(product => {
      const categoryName = product.category.name
      stats[categoryName] = (stats[categoryName] || 0) + 1
    })

    return stats
  }

  // ブランド一覧を取得
  static getAllBrands(): string[] {
    const products = this.getAllProducts()
    const brands = [...new Set(products.map(p => p.brand))]
    return brands.sort()
  }

  // カテゴリー一覧を取得
  static getAllCategories(): string[] {
    const products = this.getAllProducts()
    const categories = [...new Set(products.map(p => p.category.name))]
    return categories.sort()
  }

  // データのエクスポート
  static exportData(): string {
    const data = {
      products: this.getAllProducts(),
      pricingResults: this.getAllPricingResults(),
      exportedAt: new Date().toISOString()
    }
    return JSON.stringify(data, null, 2)
  }

  // データのインポート
  static importData(jsonData: string): { success: boolean, message: string } {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.products && Array.isArray(data.products)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.products))
      }
      
      if (data.pricingResults) {
        localStorage.setItem(PRICING_RESULTS_KEY, JSON.stringify(data.pricingResults))
      }

      return { success: true, message: 'データのインポートが完了しました' }
    } catch (error) {
      return { success: false, message: 'データのインポートに失敗しました: ' + (error as Error).message }
    }
  }

  // 全データの削除
  static clearAllData(): void {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(PRICING_RESULTS_KEY)
  }

  // 商品の国別価格を計算（1個あたり）
  static calculateCountryPricing(product: ProductListItem): CountryPricing[] {
    try {
      const settings = SettingsService.getSettings()
      const countries = settings.fees.countrySpecificCosts || []
      
      const countryPricing: CountryPricing[] = []

      for (const country of countries) {
        if (!country.isActive) continue

        // 商品1個あたりの価格計算
        const pricing = this.calculateSingleItemPrice(product, country, settings)
        
        if (pricing) {
          countryPricing.push(pricing)
        }
      }

      return countryPricing
    } catch (error) {
      console.error('国別価格計算エラー:', error)
      return []
    }
  }

  // 商品1個あたりの価格を正確に計算（20kgパッケージベース）
  private static calculateSingleItemPrice(product: ProductListItem, country: any, settings: any): CountryPricing | null {
    try {
      // === 基本情報 ===
      const itemCost = product.purchasePrice // 商品原価
      const weightInKg = product.weight || 0.2 // 重量（kg）デフォルト200g

      // === 国際小包計算（20kgパッケージベース） ===
      const maxPackageWeightKg = 20 // 国際小包の上限重量
      const packageShippingCost = 39800 // 20kgパッケージの送料
      
      // 20kgパッケージに入る商品個数を計算
      const itemsPerPackage = Math.floor(maxPackageWeightKg / weightInKg)
      
      // 1個あたりの送料を計算
      const shippingCostPerItem = Math.ceil(packageShippingCost / itemsPerPackage)

      // === 国内費用（1個あたり） ===
      const domesticShippingCost = Math.ceil(itemCost * 0.03) // 3%
      
      // 梱包材料費（20kgパッケージ分を商品個数で割る）
      const packageMaterialCost = (country.packagingMaterials?.largeBox || 300) + // 大箱
                                  (country.packagingMaterials?.bubbleWrap || 50) * 2 + // 2m²
                                  (country.packagingMaterials?.tape || 30) * 3 + // 3巻
                                  (country.packagingMaterials?.fragileStickers || 20) * 2 + // 2枚
                                  (country.packagingMaterials?.customsDeclaration || 100) // 税関申告書
      
      const packagingCostPerItem = Math.ceil(packageMaterialCost / itemsPerPackage)

      // === 基本コスト（商品原価 + 国内配送 + 梱包材料 + 国際送料） ===
      const basicCost = itemCost + domesticShippingCost + packagingCostPerItem + shippingCostPerItem

      // === 保険料（基本コストに対して） ===
      const insuranceRate = (country.additional?.insuranceRate || 1.5) / 100
      const minInsurancePerItem = Math.ceil((country.additional?.minimumInsuranceAmount || 500) / itemsPerPackage)
      const insuranceCost = Math.max(Math.ceil(basicCost * insuranceRate), minInsurancePerItem)

      // === CIF価格 ===
      const cifPrice = basicCost + insuranceCost

      // === 税金計算（商品価格ベース） ===
      const vatRate = (country.taxes?.vatRate || 12) / 100           // VAT 12%
      const customsDutyRate = (country.taxes?.customsDutyRate || 8) / 100  // 関税 8%
      const importTaxRate = (country.taxes?.importTaxRate || 3) / 100       // 輸入税 3%
      const environmentalTaxPerItem = Math.ceil((country.taxes?.environmentalTaxFlat || 100) / itemsPerPackage)

      // 税金は商品価格（CIF価格）に対して計算
      const customsDuty = Math.ceil(cifPrice * customsDutyRate)
      const vat = Math.ceil((cifPrice + customsDuty) * vatRate)
      const importTax = Math.ceil(cifPrice * importTaxRate)
      
      const totalTaxes = customsDuty + vat + importTax + environmentalTaxPerItem

      // === 手数料計算（商品価格ベース + 固定費を按分） ===
      const handlingFeePerItem = Math.ceil((country.fees?.handlingFeeFlat || 500) / itemsPerPackage)
      const adminFeeRate = (country.fees?.administrativeFeeRate || 1.5) / 100
      const adminFee = Math.ceil(cifPrice * adminFeeRate)
      const documentFeePerItem = Math.ceil((country.fees?.documentCreationFee || 300) / itemsPerPackage)
      const inspectionFeePerItem = Math.ceil((country.fees?.inspectionFeeFlat || 200) / itemsPerPackage)
      const brokerageFeeRate = (country.fees?.brokerageFeeRate || 1) / 100
      const brokerageFee = Math.ceil(cifPrice * brokerageFeeRate)

      const totalFees = handlingFeePerItem + adminFee + documentFeePerItem + inspectionFeePerItem + brokerageFee

      // === その他費用（按分） ===
      const storageFeePerDay = country.additional?.storageFeePerDay || 50
      const storageDays = 3 // 標準3日間
      const storageFeePerItem = Math.ceil((storageFeePerDay * storageDays) / itemsPerPackage)
      const translationFeePerItem = Math.ceil((country.additional?.translationFeePerDocument || 500) / itemsPerPackage)
      const certificationFeePerItem = Math.ceil((country.additional?.certificationFee || 800) / itemsPerPackage)

      const otherCosts = storageFeePerItem + translationFeePerItem + certificationFeePerItem

      // === 総コスト計算 ===
      const totalCost = cifPrice + totalTaxes + totalFees + otherCosts

      // === 販売価格計算（利益率30%） ===
      const targetProfitMargin = 30
      const sellingPrice = totalCost / (1 - targetProfitMargin / 100)
      
      // 小数点以下切り上げ
      const finalSellingPrice = Math.ceil(sellingPrice)

      // デバッグ用ログ（タジキスタンのみ）
      if (country.countryCode === 'TJ') {
        console.log(`\n=== ${product.name.ja} - ${country.countryName} 価格計算（20kgパッケージベース） ===`)
        console.log(`商品重量: ${weightInKg}kg`)
        console.log(`20kgパッケージに入る個数: ${itemsPerPackage}個`)
        console.log(`パッケージ送料: ¥${packageShippingCost.toLocaleString()}`)
        console.log(`1個あたり送料: ¥${shippingCostPerItem}`)
        console.log(`---`)
        console.log(`商品原価: ¥${itemCost}`)
        console.log(`国内配送: ¥${domesticShippingCost}`)
        console.log(`梱包費(按分): ¥${packagingCostPerItem}`)
        console.log(`国際送料: ¥${shippingCostPerItem}`)
        console.log(`保険料: ¥${insuranceCost}`)
        console.log(`CIF価格: ¥${cifPrice}`)
        console.log(`---`)
        console.log(`関税(${(customsDutyRate*100).toFixed(1)}%): ¥${customsDuty}`)
        console.log(`VAT(${(vatRate*100).toFixed(1)}%): ¥${vat}`)
        console.log(`輸入税(${(importTaxRate*100).toFixed(1)}%): ¥${importTax}`)
        console.log(`環境税(按分): ¥${environmentalTaxPerItem}`)
        console.log(`税金合計: ¥${totalTaxes}`)
        console.log(`---`)
        console.log(`手数料合計: ¥${totalFees}`)
        console.log(`その他費用: ¥${otherCosts}`)
        console.log(`総コスト: ¥${totalCost}`)
        console.log(`販売価格(利益率${targetProfitMargin}%): ¥${finalSellingPrice}`)
        console.log(`=====================================\n`)
      }

      return {
        countryCode: country.countryCode,
        countryName: country.countryName,
        calculatedPrice: finalSellingPrice,
        profitMargin: targetProfitMargin,
        totalTaxes,
        shippingCost: shippingCostPerItem,
        lastUpdated: new Date()
      }

    } catch (error) {
      console.error(`${country.countryName}の価格計算エラー:`, error)
      return null
    }
  }

  // 商品に国別価格情報を追加して保存
  static saveProductWithCountryPricing(product: ProductListItem): void {
    const countryPricing = this.calculateCountryPricing(product)
    const productWithPricing = { ...product, countryPricing }
    this.saveProduct(productWithPricing)
  }

  // 全商品の国別価格を再計算
  static recalculateAllCountryPricing(): void {
    const products = this.getAllProducts()
    products.forEach(product => {
      const countryPricing = this.calculateCountryPricing(product)
      product.countryPricing = countryPricing
      
      // 基本のcalculatedPriceもタジキスタン価格に合わせる
      const tajikPricing = countryPricing.find(cp => cp.countryCode === 'TJ')
      if (tajikPricing) {
        product.calculatedPrice = tajikPricing.calculatedPrice
        product.profitMargin = tajikPricing.profitMargin
      }
      
      this.saveProduct(product)
    })
  }

  // 特定国のみの商品リストを取得（国別ダッシュボード用）
  static getProductsForCountry(countryCode: string): ProductListItem[] {
    const products = this.getAllProducts()
    return products.map(product => ({
      ...product,
      // 指定国の価格情報のみ表示
      calculatedPrice: product.countryPricing?.find(cp => cp.countryCode === countryCode)?.calculatedPrice || product.calculatedPrice,
      profitMargin: product.countryPricing?.find(cp => cp.countryCode === countryCode)?.profitMargin || product.profitMargin
    }))
  }
}