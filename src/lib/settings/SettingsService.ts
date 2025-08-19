// 設定管理サービス
import { 
  SystemSettings, 
  ShippingCarrier,
  CountryShippingSettings,
  ExchangeRateSettings,
  FeeSettings,
  PricingSettings,
  NotificationSettings,
  SettingsHistory,
  SettingsValidationResult 
} from '@/types/settings'

export class SettingsService {
  private static readonly SETTINGS_KEY = 'tj-cosmetics-settings'
  private static readonly HISTORY_KEY = 'tj-cosmetics-settings-history'

  // デフォルト設定
  private static getDefaultSettings(): SystemSettings {
    return {
      shipping: {
        carriers: [],
        defaultCarrierId: '',
        // 国別配送設定
        countrySettings: [
          {
            id: 'tajikistan-shipping',
            countryCode: 'TJ',
            countryName: 'タジキスタン',
            isActive: true,
            defaultCarrierId: 'tj-international-parcel',
            carriers: [
              {
                id: 'tj-international-parcel',
                name: '国際小包（タジキスタン向け）',
                code: 'TJ_INT_PARCEL',
                isActive: true,
                services: [
                  {
                    id: 'tj-int-parcel-standard',
                    carrierId: 'tj-international-parcel',
                    name: '国際小包標準',
                    code: 'TJ_INT_PARCEL_STD',
                    rateType: 'per_kg',
                    rates: [
                      { id: 'tj-int-parcel-1', serviceId: 'tj-int-parcel-standard', weightMin: 0, weightMax: 20, price: 39800, currency: 'JPY' },
                      { id: 'tj-int-parcel-2', serviceId: 'tj-int-parcel-standard', weightMin: 20, weightMax: 30, price: 59800, currency: 'JPY' }
                    ],
                    estimatedDays: { min: 7, max: 21 },
                    isActive: true,
                    description: '日本からタジキスタンへの国際小包配送（20kg まで 39,800円）'
                  }
                ],
                createdAt: new Date(),
                updatedAt: new Date()
              },
              {
                id: 'tj-ems',
                name: 'EMS（タジキスタン向け）',
                code: 'TJ_EMS',
                isActive: false,
                services: [
                  {
                    id: 'tj-ems-standard',
                    carrierId: 'tj-ems',
                    name: 'EMS標準',
                    code: 'TJ_EMS_STD',
                    rateType: 'per_kg',
                    rates: [
                      { id: 'tj-ems-1', serviceId: 'tj-ems-standard', weightMin: 0, weightMax: 1, price: 3200, currency: 'JPY' },
                      { id: 'tj-ems-2', serviceId: 'tj-ems-standard', weightMin: 1, weightMax: 5, price: 4500, currency: 'JPY' }
                    ],
                    estimatedDays: { min: 3, max: 7 },
                    isActive: false,
                    description: 'タジキスタン向け追跡可能な国際郵便サービス'
                  }
                ],
                createdAt: new Date(),
                updatedAt: new Date()
              }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'uzbekistan-shipping',
            countryCode: 'UZ',
            countryName: 'ウズベキスタン',
            isActive: false,
            defaultCarrierId: 'uz-international-parcel',
            carriers: [
              {
                id: 'uz-international-parcel',
                name: '国際小包（ウズベキスタン向け）',
                code: 'UZ_INT_PARCEL',
                isActive: true,
                services: [
                  {
                    id: 'uz-int-parcel-standard',
                    carrierId: 'uz-international-parcel',
                    name: '国際小包標準',
                    code: 'UZ_INT_PARCEL_STD',
                    rateType: 'per_kg',
                    rates: [
                      { id: 'uz-int-parcel-1', serviceId: 'uz-int-parcel-standard', weightMin: 0, weightMax: 20, price: 35800, currency: 'JPY' }
                    ],
                    estimatedDays: { min: 7, max: 21 },
                    isActive: true,
                    description: '日本からウズベキスタンへの国際小包配送'
                  }
                ],
                createdAt: new Date(),
                updatedAt: new Date()
              }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        defaultCountryCode: 'TJ'
      },
      exchange: {
        rates: {
          USDJPY: 150.0,
          TJSJPY: 0.014
        },
        margins: {
          USDJPY: 2.0,
          TJSJPY: 3.0
        },
        autoUpdate: false,
        lastUpdated: new Date(),
        source: 'manual',
        updateInterval: 60
      },
      fees: {
        processingFeeRate: 2.5,
        minimumFee: 500,
        maximumFee: 10000,
        customsDutyRates: {
          tajikistan: 8.0,
          russia: 12.0,
          kyrgyzstan: 10.0,
          kazakhstan: 15.0,
          uzbekistan: 12.0
        },
        vatRates: {
          tajikistan: 18.0,
          russia: 20.0,
          kyrgyzstan: 12.0,
          kazakhstan: 12.0,
          uzbekistan: 15.0
        },
        specialFees: {
          hazardousMaterialsFee: 1500,
          refrigeratedShippingFee: 2000,
          expeditedShippingFee: 3000,
          insuranceFeeRate: 1.5
        },
        // 国別詳細コスト設定
        countrySpecificCosts: [
          {
            id: 'tajikistan-costs',
            countryCode: 'TJ',
            countryName: 'タジキスタン',
            currency: 'TJS',
            isActive: true,
            packagingMaterials: {
              smallBox: 150,
              mediumBox: 300,
              largeBox: 500,
              bubbleWrap: 80,
              tape: 120,
              fragileStickers: 25,
              customsDeclaration: 200
            },
            taxes: {
              vatRate: 18.0,
              customsDutyRate: 8.0,
              importTaxRate: 5.0,
              environmentalTaxFlat: 300
            },
            fees: {
              handlingFeeFlat: 800,
              administrativeFeeRate: 2.0,
              documentCreationFee: 1500,
              inspectionFeeFlat: 600,
              brokerageFeeRate: 1.5
            },
            additional: {
              insuranceRate: 2.0,
              minimumInsuranceAmount: 1000,
              storageFeePerDay: 200,
              translationFeePerDocument: 3000,
              certificationFee: 5000
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            updatedBy: 'system'
          },
          {
            id: 'uzbekistan-costs',
            countryCode: 'UZ',
            countryName: 'ウズベキスタン',
            currency: 'UZS',
            isActive: false,
            packagingMaterials: {
              smallBox: 140,
              mediumBox: 280,
              largeBox: 450,
              bubbleWrap: 75,
              tape: 110,
              fragileStickers: 22,
              customsDeclaration: 180
            },
            taxes: {
              vatRate: 15.0,
              customsDutyRate: 12.0,
              importTaxRate: 4.0,
              environmentalTaxFlat: 250
            },
            fees: {
              handlingFeeFlat: 750,
              administrativeFeeRate: 2.2,
              documentCreationFee: 1400,
              inspectionFeeFlat: 550,
              brokerageFeeRate: 1.8
            },
            additional: {
              insuranceRate: 2.2,
              minimumInsuranceAmount: 900,
              storageFeePerDay: 180,
              translationFeePerDocument: 2800,
              certificationFee: 4500
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            updatedBy: 'system'
          },
          {
            id: 'kazakhstan-costs',
            countryCode: 'KZ',
            countryName: 'カザフスタン',
            currency: 'KZT',
            isActive: false,
            packagingMaterials: {
              smallBox: 160,
              mediumBox: 320,
              largeBox: 550,
              bubbleWrap: 85,
              tape: 130,
              fragileStickers: 28,
              customsDeclaration: 220
            },
            taxes: {
              vatRate: 12.0,
              customsDutyRate: 15.0,
              importTaxRate: 6.0,
              environmentalTaxFlat: 350
            },
            fees: {
              handlingFeeFlat: 900,
              administrativeFeeRate: 2.5,
              documentCreationFee: 1600,
              inspectionFeeFlat: 700,
              brokerageFeeRate: 2.0
            },
            additional: {
              insuranceRate: 2.5,
              minimumInsuranceAmount: 1200,
              storageFeePerDay: 220,
              translationFeePerDocument: 3200,
              certificationFee: 5500
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            updatedBy: 'system'
          },
          {
            id: 'kyrgyzstan-costs',
            countryCode: 'KG',
            countryName: 'キルギス',
            currency: 'KGS',
            isActive: false,
            packagingMaterials: {
              smallBox: 135,
              mediumBox: 270,
              largeBox: 430,
              bubbleWrap: 70,
              tape: 105,
              fragileStickers: 20,
              customsDeclaration: 170
            },
            taxes: {
              vatRate: 12.0,
              customsDutyRate: 10.0,
              importTaxRate: 3.5,
              environmentalTaxFlat: 200
            },
            fees: {
              handlingFeeFlat: 700,
              administrativeFeeRate: 1.8,
              documentCreationFee: 1300,
              inspectionFeeFlat: 500,
              brokerageFeeRate: 1.3
            },
            additional: {
              insuranceRate: 1.8,
              minimumInsuranceAmount: 800,
              storageFeePerDay: 160,
              translationFeePerDocument: 2500,
              certificationFee: 4000
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            updatedBy: 'system'
          }
        ],
        defaultCountryCode: 'TJ',
        updatedAt: new Date()
      },
      pricing: {
        defaultProfitMargin: 30,
        minimumProfitMargin: 10,
        targetProfitMargin: 35,
        roundingMode: 'up',
        roundToNearest: 100,
        baseCurrency: 'JPY',
        displayCurrencies: ['JPY', 'USD', 'RUB'],
        autoUpdateRates: true,
        categorySpecificMargins: {
          skincare: 35,
          makeup: 40,
          haircare: 30,
          food: 25,
          drinks: 20
        }
      },
      notifications: {
        email: {
          enabled: false,
          smtpServer: 'smtp.gmail.com',
          port: 587,
          secure: true,
          username: '',
          password: '',
          fromName: 'タジク化粧品',
          fromEmail: 'noreply@tajikcosmetics.com'
        },
        webhook: {
          enabled: false,
          url: '',
          secret: '',
          timeout: 30,
          retries: 3
        },
        events: {
          newOrder: { email: true, webhook: true, recipients: [] },
          orderStatusChange: { email: true, webhook: true, recipients: [] },
          priceAlert: { email: true, webhook: false, recipients: [] },
          lowStock: { email: true, webhook: false, recipients: [] },
          systemError: { email: true, webhook: true, recipients: [] }
        }
      },
      system: {
        version: '1.0.0',
        lastUpdated: new Date(),
        lastBackup: new Date(),
        backup: {
          enabled: true,
          frequency: 'daily',
          schedule: '02:00',
          retentionDays: 30,
          location: 'local'
        },
        maintenanceMode: {
          enabled: false,
          message: '現在システムメンテナンス中です。しばらくお待ちください。',
          allowAdminAccess: true,
          scheduledStart: undefined,
          scheduledEnd: undefined,
          enabledAt: undefined
        },
        logging: {
          level: 'info',
          retentionDays: 30,
          maxFileSize: 10,
          categories: {
            api: true,
            auth: true,
            orders: true,
            payments: true,
            system: true
          }
        }
      },
      updatedAt: new Date()
    }
  }

  // 設定取得
  static getSettings(): SystemSettings {
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY)
      if (stored && stored.trim()) {
        try {
          const parsed = JSON.parse(stored)
          return this.deserializeDates(parsed)
        } catch (parseError) {
          console.error('LocalStorageのJSON解析に失敗（破損データを削除）:', parseError)
          // 破損したデータを削除
          localStorage.removeItem(this.SETTINGS_KEY)
        }
      }
    } catch (error) {
      console.error('設定の取得に失敗:', error)
    }
    
    // デフォルト設定を返す
    const defaultSettings = this.getDefaultSettings()
    
    // デフォルト設定を保存
    try {
      this.saveSettings(defaultSettings)
    } catch (saveError) {
      console.warn('デフォルト設定の保存に失敗:', saveError)
    }
    
    return defaultSettings
  }

  // 設定保存
  static saveSettings(settings: SystemSettings): boolean {
    try {
      settings.updatedAt = new Date()
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings))
      return true
    } catch (error) {
      console.error('設定の保存に失敗:', error)
      return false
    }
  }

  // 部分的な設定更新
  static updateSettings<K extends keyof SystemSettings>(
    category: K,
    updates: Partial<SystemSettings[K]>,
    userId: string = 'system'
  ): boolean {
    try {
      const current = this.getSettings()
      const oldValue = current[category]
      const newValue = { ...current[category], ...updates }
      
      current[category] = newValue as SystemSettings[K]
      current.updatedAt = new Date()
      
      // 変更履歴を記録
      this.addHistory({
        id: crypto.randomUUID(),
        category,
        field: 'bulk_update',
        oldValue,
        newValue,
        changedBy: userId,
        changedAt: new Date()
      })
      
      return this.saveSettings(current)
    } catch (error) {
      console.error('設定の更新に失敗:', error)
      return false
    }
  }

  // 配送業者管理
  static getShippingCarriers(countryCode?: string): ShippingCarrier[] {
    const settings = this.getSettings()
    
    if (countryCode) {
      const countrySetting = settings.shipping.countrySettings.find(c => c.countryCode === countryCode && c.isActive)
      return countrySetting ? countrySetting.carriers : []
    }
    
    // デフォルト国の配送業者を返す
    const defaultCountrySetting = settings.shipping.countrySettings.find(
      c => c.countryCode === settings.shipping.defaultCountryCode && c.isActive
    )
    return defaultCountrySetting ? defaultCountrySetting.carriers : settings.shipping.carriers
  }

  // 国別配送設定管理
  static getCountryShippingSettings(): CountryShippingSettings[] {
    return this.getSettings().shipping.countrySettings
  }

  static getCountryShippingSetting(countryCode: string): CountryShippingSettings | null {
    const settings = this.getSettings().shipping.countrySettings
    return settings.find(c => c.countryCode === countryCode) || null
  }

  static addCountryShippingSetting(countrySetting: Omit<CountryShippingSettings, 'id' | 'createdAt' | 'updatedAt'>): boolean {
    const settings = this.getSettings()
    const newSetting: CountryShippingSettings = {
      ...countrySetting,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    settings.shipping.countrySettings.push(newSetting)
    return this.saveSettings(settings)
  }

  static updateCountryShippingSetting(countryCode: string, updates: Partial<CountryShippingSettings>): boolean {
    const settings = this.getSettings()
    const index = settings.shipping.countrySettings.findIndex(c => c.countryCode === countryCode)
    
    if (index === -1) return false
    
    settings.shipping.countrySettings[index] = {
      ...settings.shipping.countrySettings[index],
      ...updates,
      updatedAt: new Date()
    }
    
    return this.saveSettings(settings)
  }

  static addShippingCarrier(carrier: Omit<ShippingCarrier, 'id' | 'createdAt' | 'updatedAt'>, countryCode?: string): boolean {
    const settings = this.getSettings()
    const newCarrier: ShippingCarrier = {
      ...carrier,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    if (countryCode) {
      const countryIndex = settings.shipping.countrySettings.findIndex(c => c.countryCode === countryCode)
      if (countryIndex === -1) return false
      
      settings.shipping.countrySettings[countryIndex].carriers.push(newCarrier)
    } else {
      // デフォルト国に追加
      const defaultCountryIndex = settings.shipping.countrySettings.findIndex(
        c => c.countryCode === settings.shipping.defaultCountryCode
      )
      if (defaultCountryIndex !== -1) {
        settings.shipping.countrySettings[defaultCountryIndex].carriers.push(newCarrier)
      } else {
        settings.shipping.carriers.push(newCarrier)
      }
    }
    
    return this.saveSettings(settings)
  }

  static updateShippingCarrier(carrierId: string, updates: Partial<ShippingCarrier>, countryCode?: string): boolean {
    const settings = this.getSettings()
    
    if (countryCode) {
      const countryIndex = settings.shipping.countrySettings.findIndex(c => c.countryCode === countryCode)
      if (countryIndex === -1) return false
      
      const carrierIndex = settings.shipping.countrySettings[countryIndex].carriers.findIndex(c => c.id === carrierId)
      if (carrierIndex === -1) return false
      
      settings.shipping.countrySettings[countryIndex].carriers[carrierIndex] = {
        ...settings.shipping.countrySettings[countryIndex].carriers[carrierIndex],
        ...updates,
        updatedAt: new Date()
      }
    } else {
      // すべての国の配送業者から検索
      for (const countrySetting of settings.shipping.countrySettings) {
        const carrierIndex = countrySetting.carriers.findIndex(c => c.id === carrierId)
        if (carrierIndex !== -1) {
          countrySetting.carriers[carrierIndex] = {
            ...countrySetting.carriers[carrierIndex],
            ...updates,
            updatedAt: new Date()
          }
          return this.saveSettings(settings)
        }
      }
      
      // 旧形式のcarriersからも検索
      const index = settings.shipping.carriers.findIndex(c => c.id === carrierId)
      if (index === -1) return false
      
      settings.shipping.carriers[index] = {
        ...settings.shipping.carriers[index],
        ...updates,
        updatedAt: new Date()
      }
    }
    
    return this.saveSettings(settings)
  }

  static deleteShippingCarrier(carrierId: string, countryCode?: string): boolean {
    const settings = this.getSettings()
    
    if (countryCode) {
      const countryIndex = settings.shipping.countrySettings.findIndex(c => c.countryCode === countryCode)
      if (countryIndex === -1) return false
      
      const countrySetting = settings.shipping.countrySettings[countryIndex]
      countrySetting.carriers = countrySetting.carriers.filter(c => c.id !== carrierId)
      
      // デフォルトキャリアが削除された場合は別のアクティブなキャリアに変更
      if (countrySetting.defaultCarrierId === carrierId) {
        const activeCarrier = countrySetting.carriers.find(c => c.isActive)
        countrySetting.defaultCarrierId = activeCarrier?.id || ''
      }
    } else {
      // すべての国の配送業者から削除
      for (const countrySetting of settings.shipping.countrySettings) {
        countrySetting.carriers = countrySetting.carriers.filter(c => c.id !== carrierId)
        
        if (countrySetting.defaultCarrierId === carrierId) {
          const activeCarrier = countrySetting.carriers.find(c => c.isActive)
          countrySetting.defaultCarrierId = activeCarrier?.id || ''
        }
      }
      
      // 旧形式のcarriersからも削除
      settings.shipping.carriers = settings.shipping.carriers.filter(c => c.id !== carrierId)
      
      if (settings.shipping.defaultCarrierId === carrierId) {
        const activeCarrier = settings.shipping.carriers.find(c => c.isActive)
        settings.shipping.defaultCarrierId = activeCarrier?.id || ''
      }
    }
    
    return this.saveSettings(settings)
  }

  // 為替レート管理
  static updateExchangeRates(rates: Partial<ExchangeRateSettings['rates']>): boolean {
    return this.updateSettings('exchange', {
      rates: { ...this.getSettings().exchange.rates, ...rates },
      lastUpdated: new Date()
    })
  }

  // 手数料設定管理
  static updateFeeSettings(fees: Partial<FeeSettings>): boolean {
    return this.updateSettings('fees', {
      ...fees,
      updatedAt: new Date()
    })
  }

  // 価格設定管理
  static updatePricingSettings(pricing: Partial<PricingSettings>): boolean {
    return this.updateSettings('pricing', pricing)
  }

  // 通知設定管理
  static updateNotificationSettings(notifications: Partial<NotificationSettings>): boolean {
    return this.updateSettings('notifications', notifications)
  }

  // バリデーション
  static validateSettings(settings: Partial<SystemSettings>): SettingsValidationResult {
    const errors: { field: string; message: string }[] = []
    const warnings: { field: string; message: string }[] = []

    // 為替レートの検証
    if (settings.exchange?.rates) {
      if (settings.exchange.rates.USDJPY <= 0) {
        errors.push({ field: 'exchange.rates.USDJPY', message: '為替レート（USD/JPY）は正の値である必要があります' })
      }
      if (settings.exchange.rates.TJSJPY <= 0) {
        errors.push({ field: 'exchange.rates.TJSJPY', message: '為替レート（TJS/JPY）は正の値である必要があります' })
      }
    }

    // 利益率の検証
    if (settings.pricing) {
      const { defaultProfitMargin, minimumProfitMargin, maximumProfitMargin } = settings.pricing
      
      if (minimumProfitMargin !== undefined && minimumProfitMargin < 0) {
        errors.push({ field: 'pricing.minimumProfitMargin', message: '最低利益率は0以上である必要があります' })
      }
      
      if (maximumProfitMargin !== undefined && maximumProfitMargin > 200) {
        warnings.push({ field: 'pricing.maximumProfitMargin', message: '最高利益率が200%を超えています' })
      }
      
      if (defaultProfitMargin !== undefined && minimumProfitMargin !== undefined && maximumProfitMargin !== undefined) {
        if (defaultProfitMargin < minimumProfitMargin || defaultProfitMargin > maximumProfitMargin) {
          errors.push({ field: 'pricing.defaultProfitMargin', message: 'デフォルト利益率は最低利益率と最高利益率の間である必要があります' })
        }
      }
    }

    // 配送業者の検証
    if (settings.shipping?.carriers) {
      const activeCarriers = settings.shipping.carriers.filter(c => c.isActive)
      if (activeCarriers.length === 0) {
        warnings.push({ field: 'shipping.carriers', message: 'アクティブな配送業者がありません' })
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // 設定のリセット
  static resetToDefaults(): boolean {
    try {
      localStorage.removeItem(this.SETTINGS_KEY)
      localStorage.removeItem(this.HISTORY_KEY)
      return true
    } catch (error) {
      console.error('設定のリセットに失敗:', error)
      return false
    }
  }

  // 強制デフォルト設定適用（開発用）
  static forceDefaultSettings(): boolean {
    try {
      const defaultSettings = this.getDefaultSettings()
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(defaultSettings))
      return true
    } catch (error) {
      console.error('デフォルト設定の適用に失敗:', error)
      return false
    }
  }

  // 設定のエクスポート
  static exportSettings(): string {
    const settings = this.getSettings()
    return JSON.stringify({
      version: '1.0.0',
      exportedAt: new Date(),
      exportedBy: 'user',
      settings,
      checksum: this.generateChecksum(settings)
    }, null, 2)
  }

  // 設定のインポート
  static importSettings(jsonData: string): boolean {
    try {
      const backup = JSON.parse(jsonData)
      
      // バックアップファイルの検証
      if (!backup.settings || !backup.version) {
        throw new Error('無効なバックアップファイルです')
      }
      
      // チェックサム検証
      const calculatedChecksum = this.generateChecksum(backup.settings)
      if (backup.checksum !== calculatedChecksum) {
        console.warn('チェックサムが一致しません。データが破損している可能性があります')
      }
      
      // 設定の検証
      const validation = this.validateSettings(backup.settings)
      if (!validation.isValid) {
        throw new Error(`設定が無効です: ${validation.errors.map(e => e.message).join(', ')}`)
      }
      
      return this.saveSettings(backup.settings)
    } catch (error) {
      console.error('設定のインポートに失敗:', error)
      return false
    }
  }

  // 変更履歴管理
  private static addHistory(entry: SettingsHistory): void {
    try {
      const history = this.getHistory()
      history.unshift(entry)
      
      // 最新の100件のみ保持
      const trimmed = history.slice(0, 100)
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(trimmed))
    } catch (error) {
      console.error('変更履歴の保存に失敗:', error)
    }
  }

  static getHistory(): SettingsHistory[] {
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY)
      if (stored) {
        return JSON.parse(stored).map((entry: any) => ({
          ...entry,
          changedAt: new Date(entry.changedAt)
        }))
      }
    } catch (error) {
      console.error('変更履歴の取得に失敗:', error)
    }
    return []
  }

  // ユーティリティメソッド
  private static deserializeDates(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj
    
    if (obj instanceof Array) {
      return obj.map(item => this.deserializeDates(item))
    }
    
    const result: any = {}
    for (const key in obj) {
      const value = obj[key]
      
      // 日付フィールドの復元
      if ((key.endsWith('At') || key.includes('Date')) && typeof value === 'string') {
        result[key] = new Date(value)
      } else if (typeof value === 'object') {
        result[key] = this.deserializeDates(value)
      } else {
        result[key] = value
      }
    }
    
    return result
  }

  private static generateChecksum(data: any): string {
    // 簡易チェックサム生成（実装用途では暗号学的ハッシュを使用推奨）
    const str = JSON.stringify(data, Object.keys(data).sort())
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 32bit整数に変換
    }
    return hash.toString(36)
  }
}