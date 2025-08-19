// 国別ダッシュボードデータ管理サービス

import { SettingsService } from '@/lib/settings/SettingsService'

export interface CountryDashboardData {
  countryCode: string
  countryName: string
  totalSales: number
  totalOrders: number
  totalProducts: number
  averageOrderValue: number
  topSellingProducts: Array<{
    productId: string
    name: string
    sku: string
    brand: string
    totalSold: number
    totalRevenue: number
    profitMargin: number
  }>
  recentOrders: Array<{
    id: string
    orderNumber: string
    customerName: string
    amount: number
    items: number
    status: string
    createdAt: Date
    destination: string
  }>
  salesTrend: Array<{
    date: string
    sales: number
    orders: number
    profit: number
  }>
}

export interface GlobalDashboardData {
  totalSales: number
  totalOrders: number
  totalProducts: number
  averageOrderValue: number
  countries: CountryDashboardData[]
  topCountriesBySales: Array<{
    countryCode: string
    countryName: string
    flag: string
    totalSales: number
    totalOrders: number
    growth: number
  }>
}

export class CountryDashboardService {
  // 利用可能な国リストを取得
  static getAvailableCountries(): Array<{
    code: string
    name: string
    flag: string
    currency: string
  }> {
    try {
      const settings = SettingsService.getSettings()
      const countries = settings.fees.countrySpecificCosts || []
      
      const countryList = [
        { code: 'ALL', name: '全ての国', flag: '🌍', currency: 'JPY' },
        ...countries
          .filter(country => country.isActive)
          .map(country => ({
            code: country.countryCode,
            name: country.countryName,
            flag: this.getCountryFlag(country.countryCode),
            currency: country.currency
          }))
      ]

      return countryList
    } catch (error) {
      console.error('国リスト取得エラー:', error)
      return [
        { code: 'ALL', name: '全ての国', flag: '🌍', currency: 'JPY' },
        { code: 'TJ', name: 'タジキスタン', flag: '🇹🇯', currency: 'TJS' },
        { code: 'UZ', name: 'ウズベキスタン', flag: '🇺🇿', currency: 'UZS' }
      ]
    }
  }

  // 国フラグを取得
  private static getCountryFlag(countryCode: string): string {
    const flags: Record<string, string> = {
      'TJ': '🇹🇯',
      'UZ': '🇺🇿',
      'KZ': '🇰🇿',
      'KG': '🇰🇬',
      'RU': '🇷🇺',
      'TR': '🇹🇷'
    }
    return flags[countryCode] || '🏳️'
  }

  // グローバルダッシュボードデータを生成
  static getGlobalDashboardData(): GlobalDashboardData {
    // サンプルデータ（実際の実装では実データを使用）
    const countries = this.getAvailableCountries().slice(1) // 'ALL'を除く

    const countryData: CountryDashboardData[] = countries.map(country => ({
      countryCode: country.code,
      countryName: country.name,
      totalSales: Math.floor(Math.random() * 500000) + 100000,
      totalOrders: Math.floor(Math.random() * 100) + 20,
      totalProducts: Math.floor(Math.random() * 50) + 10,
      averageOrderValue: Math.floor(Math.random() * 5000) + 3000,
      topSellingProducts: this.generateSampleProducts(country.code),
      recentOrders: this.generateSampleOrders(country.code, country.name),
      salesTrend: this.generateSalesTrend()
    }))

    const totalSales = countryData.reduce((sum, country) => sum + country.totalSales, 0)
    const totalOrders = countryData.reduce((sum, country) => sum + country.totalOrders, 0)
    const totalProducts = Math.max(...countryData.map(c => c.totalProducts))
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

    return {
      totalSales,
      totalOrders,
      totalProducts,
      averageOrderValue,
      countries: countryData,
      topCountriesBySales: countryData
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 5)
        .map(country => ({
          countryCode: country.countryCode,
          countryName: country.countryName,
          flag: this.getCountryFlag(country.countryCode),
          totalSales: country.totalSales,
          totalOrders: country.totalOrders,
          growth: Math.floor(Math.random() * 50) - 10 // -10% to +40%
        }))
    }
  }

  // 特定国のダッシュボードデータを取得
  static getCountryDashboardData(countryCode: string): CountryDashboardData | null {
    const globalData = this.getGlobalDashboardData()
    return globalData.countries.find(c => c.countryCode === countryCode) || null
  }

  // サンプル商品データを生成
  private static generateSampleProducts(countryCode: string) {
    const products = [
      { base: 'DHC フォースコリー', brand: 'DHC' },
      { base: '資生堂 エリクシール', brand: '資生堂' },
      { base: 'SK-II フェイシャル', brand: 'SK-II' },
      { base: 'ポーラ リンクルショット', brand: 'ポーラ' },
      { base: 'コーセー 雪肌精', brand: 'コーセー' }
    ]

    return products.slice(0, 3).map((product, index) => ({
      productId: `${countryCode}-${index + 1}`,
      name: product.base,
      sku: `${countryCode}-SKU-${index + 1}`,
      brand: product.brand,
      totalSold: Math.floor(Math.random() * 50) + 10,
      totalRevenue: Math.floor(Math.random() * 200000) + 50000,
      profitMargin: Math.floor(Math.random() * 20) + 25
    }))
  }

  // サンプル注文データを生成
  private static generateSampleOrders(countryCode: string, countryName: string) {
    const names = [
      'アフマド・ラヒモフ', 'ファリダ・カリモワ', 'ダウド・ナザロフ',
      'ムハマド・ユスポフ', 'グルナラ・アブドラエワ'
    ]

    return Array.from({ length: 3 }, (_, index) => ({
      id: `${countryCode}-order-${index + 1}`,
      orderNumber: `${countryCode}-2024-${String(index + 1).padStart(3, '0')}`,
      customerName: names[index % names.length],
      amount: Math.floor(Math.random() * 20000) + 5000,
      items: Math.floor(Math.random() * 5) + 1,
      status: ['confirmed', 'shipped', 'delivered'][Math.floor(Math.random() * 3)],
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // 過去7日間
      destination: countryName
    }))
  }

  // 売上トレンドデータを生成
  private static generateSalesTrend() {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - index))
      
      return {
        date: date.toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 50000) + 20000,
        orders: Math.floor(Math.random() * 15) + 5,
        profit: Math.floor(Math.random() * 15000) + 6000
      }
    })
  }

  // 通貨フォーマット
  static formatCurrency(amount: number, countryCode: string = 'ALL'): string {
    if (countryCode === 'ALL' || countryCode === 'JP') {
      return `¥${amount.toLocaleString()}`
    }

    const currencies: Record<string, { symbol: string, rate: number }> = {
      'TJ': { symbol: 'TJS', rate: 14.0 }, // 1円 = 14TJS
      'UZ': { symbol: 'UZS', rate: 130.0 }, // 1円 = 130UZS
      'KZ': { symbol: 'KZT', rate: 3.2 }, // 1円 = 3.2KZT
      'KG': { symbol: 'KGS', rate: 0.6 }, // 1円 = 0.6KGS
    }

    const currency = currencies[countryCode]
    if (currency) {
      const convertedAmount = Math.round(amount * currency.rate)
      return `${convertedAmount.toLocaleString()} ${currency.symbol}`
    }

    return `¥${amount.toLocaleString()}`
  }
}