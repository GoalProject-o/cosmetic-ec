// 設定管理システムの型定義

// 配送業者設定
export interface ShippingCarrier {
  id: string
  name: string
  code: string
  logo?: string
  isActive: boolean
  services: ShippingService[]
  createdAt: Date
  updatedAt: Date
}

export interface ShippingService {
  id: string
  carrierId: string
  name: string
  code: string
  rateType: 'per_kg' | 'flat' | 'zone_based'
  rates: ShippingRate[]
  estimatedDays: {
    min: number
    max: number
  }
  isActive: boolean
  description?: string
}

export interface ShippingRate {
  id: string
  serviceId: string
  weightMin: number
  weightMax: number
  zone?: string
  price: number
  currency: 'JPY' | 'USD'
}

// 為替レート設定
export interface ExchangeRateSettings {
  rates: {
    USDJPY: number
    TJSJPY: number
  }
  margins: {
    USDJPY: number  // パーセント
    TJSJPY: number  // パーセント
  }
  autoUpdate: boolean
  lastUpdated: Date
  source: 'manual' | 'api'
  updateInterval: number // 分単位
}

// 国別コスト設定
export interface CountrySpecificCosts {
  id: string
  countryCode: string
  countryName: string
  currency: string
  isActive: boolean
  
  // 梱包材料費
  packagingMaterials: {
    smallBox: number           // 小箱
    mediumBox: number         // 中箱  
    largeBox: number          // 大箱
    bubbleWrap: number        // プチプチ（1m²あたり）
    tape: number              // テープ（1巻あたり）
    fragileStickers: number   // 壊れ物シール（1枚あたり）
    customsDeclaration: number // 税関申告書
  }
  
  // 税金・関税
  taxes: {
    vatRate: number           // VAT率（%）
    customsDutyRate: number   // 関税率（%）
    importTaxRate: number     // 輸入税率（%）
    environmentalTaxFlat: number // 環境税（固定額）
  }
  
  // 手数料
  fees: {
    handlingFeeFlat: number      // 取扱手数料（固定額）
    administrativeFeeRate: number // 事務手数料率（%）
    documentCreationFee: number   // 書類作成費（固定額）
    inspectionFeeFlat: number     // 検査料（固定額）
    brokerageFeeRate: number      // 仲介手数料率（%）
  }
  
  // その他のコスト
  additional: {
    insuranceRate: number         // 保険料率（%）
    minimumInsuranceAmount: number // 最低保険料
    storageFeePerDay: number      // 保管料（1日あたり）
    translationFeePerDocument: number // 翻訳料（1書類あたり）
    certificationFee: number      // 認証料
  }
  
  createdAt: Date
  updatedAt: Date
  updatedBy: string
}

// 手数料設定（旧バージョンとの互換性維持）
export interface FeeSettings {
  // 従来の設定（互換性のため維持）
  processingFeeRate: number
  minimumFee: number
  maximumFee: number
  
  // 国別設定に移行
  customsDutyRates: Record<string, number>
  vatRates: Record<string, number>
  specialFees: {
    hazardousMaterialsFee: number
    refrigeratedShippingFee: number
    expeditedShippingFee: number
    insuranceFeeRate: number
  }
  
  // 国別詳細コスト設定
  countrySpecificCosts: CountrySpecificCosts[]
  defaultCountryCode: string
  
  updatedAt: Date
}

// 価格計算設定
export interface PricingSettings {
  defaultProfitMargin: number     // デフォルト利益率
  minimumProfitMargin: number     // 最低利益率
  maximumProfitMargin: number     // 最高利益率
  volumeWeightDivisor: number     // 容積重量計算係数
  roundingRule: 'floor' | 'ceil' | 'round'  // 端数処理
  displayCurrency: 'JPY' | 'USD' | 'TJS'    // 表示通貨
}

// 通知設定
export interface NotificationSettings {
  email: {
    enabled: boolean
    address: string
    priceChangeThreshold: number  // 価格変動通知の閾値（%）
  }
  webhook: {
    enabled: boolean
    url: string
    events: string[]
  }
}

// 国別配送設定
export interface CountryShippingSettings {
  id: string
  countryCode: string
  countryName: string
  isActive: boolean
  carriers: ShippingCarrier[]
  defaultCarrierId: string
  createdAt: Date
  updatedAt: Date
}

// システム設定の統合型
export interface SystemSettings {
  shipping: {
    carriers: ShippingCarrier[]
    defaultCarrierId: string
    // 国別配送設定
    countrySettings: CountryShippingSettings[]
    defaultCountryCode: string
  }
  exchange: ExchangeRateSettings
  fees: FeeSettings
  pricing: PricingSettings
  notifications: NotificationSettings
  system: {
    version: string
    lastBackup: Date
    maintenanceMode: boolean
  }
  updatedAt: Date
}

// 設定変更履歴
export interface SettingsHistory {
  id: string
  category: keyof SystemSettings
  field: string
  oldValue: any
  newValue: any
  changedBy: string
  changedAt: Date
  reason?: string
}

// 設定カテゴリー情報
export interface SettingsCategory {
  id: keyof SystemSettings
  name: string
  description: string
  icon: string
  lastUpdated: Date
  hasChanges: boolean
  isLocked: boolean
}

// 設定のインポート/エクスポート
export interface SettingsBackup {
  version: string
  exportedAt: Date
  exportedBy: string
  settings: SystemSettings
  checksum: string
}

// API レスポンス型
export interface SettingsApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
  timestamp: Date
}

// バリデーション結果
export interface SettingsValidationResult {
  isValid: boolean
  errors: {
    field: string
    message: string
  }[]
  warnings: {
    field: string
    message: string
  }[]
}