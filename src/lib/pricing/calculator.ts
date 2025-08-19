// 価格計算ライブラリ
// 設定システム連携による動的価格計算

import { SettingsService } from '@/lib/settings/SettingsService'

export interface PricingInputs {
  // 商品情報
  purchasePrice: number        // 仕入価格（円）
  weight: number              // 重量（kg）
  dimensions?: {
    length: number            // 長さ（cm）
    width: number             // 幅（cm）  
    height: number            // 高さ（cm）
  }
  quantity: number            // 数量
  profitMargin?: number       // 利益率（%）- 未指定時は設定のデフォルトを使用
  shippingMethod: 'air' | 'sea' | 'ems' | 'dhl' | 'international_parcel'
  destinationCountry?: string // 配送先国コード（例: TJ, UZ, KZ, KG）
  packageSize?: 'small' | 'medium' | 'large' // 梱包サイズ
}

export interface ShippingRate {
  air: number                    // 航空便 (円/kg)
  sea: number                    // 船便 (円/kg) 
  ems: number                    // EMS (円/kg)
  dhl: number                    // DHL (円/kg)
  international_parcel: number   // 国際小包 (円/kg) - 20kg/39,800円基準
}

export interface PricingBreakdown {
  // 基本コスト
  productCost: number                    // 商品原価
  domesticShipping: number              // 国内配送料
  packingMaterials: number              // 梱包材料費
  
  // 国際輸送
  internationalShipping: number         // 国際配送料
  insurance: number                     // 保険料
  
  // 関税・税金
  cifPrice: number                      // CIF価格
  customsDuty: number                   // 関税
  vat: number                          // VAT
  importTax: number                    // 輸入税
  environmentalTax: number             // 環境税
  
  // 手数料（国別詳細）
  handlingFee: number                  // 取扱手数料
  administrativeFee: number            // 事務手数料
  documentCreationFee: number          // 書類作成費
  inspectionFee: number                // 検査料
  brokerageFee: number                 // 仲介手数料
  storageFee: number                   // 保管料
  translationFee: number               // 翻訳料
  certificationFee: number             // 認証料
  
  // レガシー手数料（互換性のため残す）
  processingFee: number                // 事務手数料
  documentFee: number                  // 書類作成費
  riskBuffer: number                   // リスクバッファ
  exchangeMargin: number               // 為替マージン
  profitAmount: number                 // 利益額
  
  // 最終価格
  totalCost: number                    // 総コスト
  sellingPrice: number                 // 販売価格
  profitMargin: number                 // 利益率
}

export interface PricingResult {
  inputs: PricingInputs
  breakdown: PricingBreakdown
  shippingComparison: ShippingComparison[]
  volumeWeight: number
  applicableWeight: number
  timestamp: Date
}

export interface ShippingComparison {
  method: string
  cost: number
  days: string
  totalPrice: number
  recommended: boolean
}

/**
 * 動的に設定を取得する関数
 * 設定システムから現在の設定値を取得し、フォールバック値を提供
 */
function getPricingConfig() {
  try {
    const settings = SettingsService.getSettings()
    
    // 配送料率を動的に構築
    const shippingRates: ShippingRate = {
      air: 2800,   // デフォルト値
      sea: 800,
      ems: 3200,
      dhl: 4500,
      international_parcel: 1990  // 20kg/39,800円 = 1,990円/kg
    }
    
    // 配送業者設定から料金を取得
    settings.shipping.carriers.forEach(carrier => {
      carrier.services.forEach(service => {
        if (service.isActive && service.rates.length > 0) {
          // 最初の料金設定を使用（簡略化）
          const rate = service.rates[0]
          const pricePerKg = rate.price / rate.weightMax  // kg単価を計算
          
          switch (carrier.code.toLowerCase()) {
            case 'air':
            case 'airmail':
              shippingRates.air = pricePerKg
              break
            case 'surface':
            case 'sea':
              shippingRates.sea = pricePerKg
              break
            case 'ems':
              shippingRates.ems = pricePerKg
              break
            case 'dhl':
              shippingRates.dhl = pricePerKg
              break
            case 'international_parcel':
            case 'international':
            case 'parcel':
              shippingRates.international_parcel = pricePerKg  // 設定から動的取得
              break
          }
        }
      })
    })
    
    return {
      shippingRates,
      fees: {
        domesticShippingRate: settings.fees.domestic.shippingRate,
        packingMaterialsRate: settings.fees.domestic.packingMaterialsRate,
        insuranceRate: settings.fees.international.insuranceRate,
        customsDutyRate: settings.fees.international.customsDutyRate,
        vatRate: settings.fees.international.vatRate,
        customsFeeFlat: settings.fees.international.customsFeeFlat,
        processingFeeRate: settings.fees.processing.processingFeeRate,
        documentFeeFlat: settings.fees.processing.documentFeeFlat,
        riskBufferRate: settings.fees.processing.riskBufferRate,
        exchangeMarginRate: 0.02, // 固定値（簡略化）
      },
      exchangeRate: {
        usdToJpy: settings.exchange.rates.USDJPY,
        tjsToJpy: settings.exchange.rates.TJSJPY * 100, // TJS/JPYからの変換
      },
      volumeWeightDivisor: settings.pricing.volumeWeightDivisor,
    }
  } catch (error) {
    console.error('設定の取得に失敗、デフォルト値を使用:', error)
    // フォールバック値
    return {
      shippingRates: {
        air: 2800,
        sea: 800,
        ems: 3200,
        dhl: 4500,
        international_parcel: 1990  // 20kg/39,800円 = 1,990円/kg
      } as ShippingRate,
      fees: {
        domesticShippingRate: 0.05,
        packingMaterialsRate: 0.03,
        insuranceRate: 0.015,
        customsDutyRate: 0.08,
        vatRate: 0.12,
        customsFeeFlat: 500,
        processingFeeRate: 0.02,
        documentFeeFlat: 300,
        riskBufferRate: 0.05,
        exchangeMarginRate: 0.02,
      },
      exchangeRate: {
        usdToJpy: 150,
        tjsToJpy: 14,
      },
      volumeWeightDivisor: 5000,
    }
  }
}

/**
 * 容積重量を計算
 */
export function calculateVolumeWeight(
  length: number, 
  width: number, 
  height: number
): number {
  const config = getPricingConfig()
  return (length * width * height) / config.volumeWeightDivisor
}

/**
 * 適用重量を計算（実重量と容積重量の大きい方）
 */
export function calculateApplicableWeight(
  actualWeight: number,
  volumeWeight: number
): number {
  return Math.max(actualWeight, volumeWeight)
}

/**
 * 端数処理を適用
 */
function applyRoundingRule(price: number): number {
  try {
    const settings = SettingsService.getSettings()
    const rule = settings.pricing.roundingRule
    
    switch (rule) {
      case 'floor':
        return Math.floor(price)
      case 'ceil':
        return Math.ceil(price)
      case 'round':
      default:
        return Math.round(price)
    }
  } catch {
    // フォールバック: 四捨五入
    return Math.round(price)
  }
}

/**
 * 国別コスト設定を取得
 */
function getCountrySpecificCosts(countryCode?: string) {
  try {
    const settings = SettingsService.getSettings()
    const defaultCountryCode = countryCode || settings.fees.defaultCountryCode
    
    const countryCosts = settings.fees.countrySpecificCosts.find(
      c => c.countryCode === defaultCountryCode && c.isActive
    )
    
    return countryCosts || settings.fees.countrySpecificCosts.find(c => c.isActive)
  } catch {
    return null
  }
}

/**
 * 価格計算のメイン関数
 * 設定システムから動的に設定値を取得し、国別コスト設定を統合
 */
export function calculatePricing(inputs: PricingInputs): PricingResult {
  const config = getPricingConfig()
  const countryCosts = getCountrySpecificCosts(inputs.destinationCountry)
  
  // 利益率を設定から取得（未指定時）
  const effectiveProfitMargin = inputs.profitMargin ?? (() => {
    try {
      const settings = SettingsService.getSettings()
      return settings.pricing.defaultProfitMargin
    } catch {
      return 30 // フォールバック
    }
  })()
  
  // 容積重量計算
  const volumeWeight = inputs.dimensions 
    ? calculateVolumeWeight(
        inputs.dimensions.length,
        inputs.dimensions.width,
        inputs.dimensions.height
      )
    : 0
  
  // 適用重量計算
  const applicableWeight = calculateApplicableWeight(inputs.weight, volumeWeight)
  
  // 基本コスト計算
  const productCost = inputs.purchasePrice * inputs.quantity
  const domesticShipping = productCost * config.fees.domesticShippingRate
  
  // 梱包材料費計算（国別設定を使用）
  let packingMaterials = productCost * config.fees.packingMaterialsRate // フォールバック
  if (countryCosts && inputs.packageSize) {
    const sizeKey = `${inputs.packageSize}Box` as keyof typeof countryCosts.packagingMaterials
    packingMaterials = countryCosts.packagingMaterials[sizeKey] || 
                      countryCosts.packagingMaterials.mediumBox + // デフォルト中箱
                      countryCosts.packagingMaterials.bubbleWrap * 0.5 + // プチプチ0.5m²
                      countryCosts.packagingMaterials.tape +
                      countryCosts.packagingMaterials.customsDeclaration
  }
  
  // 国際配送料計算
  const shippingRate = config.shippingRates[inputs.shippingMethod]
  const internationalShipping = applicableWeight * shippingRate
  
  // CIF価格計算
  const cifPrice = productCost + domesticShipping + packingMaterials + internationalShipping
  
  // 保険料計算（国別設定を優先）
  let insurance = cifPrice * config.fees.insuranceRate // フォールバック
  if (countryCosts) {
    insurance = Math.max(
      cifPrice * (countryCosts.additional.insuranceRate / 100),
      countryCosts.additional.minimumInsuranceAmount
    )
  }
  const adjustedCifPrice = cifPrice + insurance
  
  // 関税・税金計算（国別設定を優先）
  let customsDuty = adjustedCifPrice * config.fees.customsDutyRate
  let vat = (adjustedCifPrice + customsDuty) * config.fees.vatRate
  let importTax = 0
  let environmentalTax = 0
  
  if (countryCosts) {
    customsDuty = adjustedCifPrice * (countryCosts.taxes.customsDutyRate / 100)
    vat = (adjustedCifPrice + customsDuty) * (countryCosts.taxes.vatRate / 100)
    importTax = adjustedCifPrice * (countryCosts.taxes.importTaxRate / 100)
    environmentalTax = countryCosts.taxes.environmentalTaxFlat
  }
  
  // 手数料計算（国別詳細設定を優先）
  let handlingFee = 0
  let administrativeFee = 0
  let documentCreationFee = 0
  let inspectionFee = 0
  let brokerageFee = 0
  let storageFee = 0
  let translationFee = 0
  let certificationFee = 0
  
  if (countryCosts) {
    handlingFee = countryCosts.fees.handlingFeeFlat
    administrativeFee = adjustedCifPrice * (countryCosts.fees.administrativeFeeRate / 100)
    documentCreationFee = countryCosts.fees.documentCreationFee
    inspectionFee = countryCosts.fees.inspectionFeeFlat
    brokerageFee = adjustedCifPrice * (countryCosts.fees.brokerageFeeRate / 100)
    storageFee = countryCosts.additional.storageFeePerDay * 3 // デフォルト3日
    translationFee = countryCosts.additional.translationFeePerDocument * 2 // デフォルト2書類
    certificationFee = countryCosts.additional.certificationFee
  }
  
  // レガシー手数料（互換性のため）
  const processingFee = adjustedCifPrice * config.fees.processingFeeRate
  const documentFee = config.fees.documentFeeFlat
  const riskBuffer = adjustedCifPrice * config.fees.riskBufferRate
  const exchangeMargin = adjustedCifPrice * config.fees.exchangeMarginRate
  
  // 総コスト
  const totalCost = adjustedCifPrice + customsDuty + vat + importTax + environmentalTax +
                   handlingFee + administrativeFee + documentCreationFee + inspectionFee + 
                   brokerageFee + storageFee + translationFee + certificationFee +
                   processingFee + documentFee + riskBuffer + exchangeMargin
  
  // 利益額と販売価格（設定から取得した利益率を使用）
  const profitAmount = totalCost * (effectiveProfitMargin / 100)
  const rawSellingPrice = totalCost + profitAmount
  
  // 端数処理を適用
  const sellingPrice = applyRoundingRule(rawSellingPrice)
  
  // 配送方法比較
  const shippingComparison = generateShippingComparison(inputs, applicableWeight, adjustedCifPrice, effectiveProfitMargin)
  
  const breakdown: PricingBreakdown = {
    productCost,
    domesticShipping,
    packingMaterials,
    internationalShipping,
    insurance,
    cifPrice: adjustedCifPrice,
    customsDuty,
    vat,
    importTax,
    environmentalTax,
    handlingFee,
    administrativeFee,
    documentCreationFee,
    inspectionFee,
    brokerageFee,
    storageFee,
    translationFee,
    certificationFee,
    // レガシー互換性
    processingFee,
    documentFee,
    riskBuffer,
    exchangeMargin,
    profitAmount,
    totalCost,
    sellingPrice,
    profitMargin: effectiveProfitMargin
  }
  
  return {
    inputs,
    breakdown,
    shippingComparison,
    volumeWeight,
    applicableWeight,
    timestamp: new Date()
  }
}

/**
 * 配送方法比較テーブルを生成
 */
function generateShippingComparison(
  inputs: PricingInputs,
  applicableWeight: number,
  baseCost: number,
  profitMargin: number
): ShippingComparison[] {
  const methods: Array<{
    method: keyof ShippingRate
    name: string
    days: string
  }> = [
    { method: 'international_parcel', name: '国際小包', days: '7-21日' },
    { method: 'air', name: '航空便', days: '7-10日' },
    { method: 'sea', name: '船便', days: '30-45日' },
    { method: 'ems', name: 'EMS', days: '5-7日' },
    { method: 'dhl', name: 'DHL', days: '3-5日' }
  ]
  
  const config = getPricingConfig()
  
  return methods.map(({ method, name, days }) => {
    const shippingCost = applicableWeight * config.shippingRates[method]
    const totalPrice = baseCost + shippingCost + (baseCost * (profitMargin / 100))
    
    return {
      method: name,
      cost: shippingCost,
      days,
      totalPrice,
      recommended: method === inputs.shippingMethod
    }
  })
}

/**
 * 計算結果をJSONでエクスポート
 */
export function exportPricingResult(result: PricingResult): string {
  return JSON.stringify(result, null, 2)
}

/**
 * 顔パック例の計算テスト用関数
 */
export function testFaceMaskCalculation(): PricingResult {
  const inputs: PricingInputs = {
    purchasePrice: 660,       // 660円
    weight: 0.4,              // 400g = 0.4kg
    dimensions: {
      length: 20,             // 20cm
      width: 15,              // 15cm  
      height: 2               // 2cm
    },
    quantity: 1,
    profitMargin: 30,         // 30%（標準的な利益率）
    shippingMethod: 'international_parcel'
  }
  
  return calculatePricing(inputs)
}