"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SettingsService } from '@/lib/settings/SettingsService'
import { CountryShippingSettings } from '@/types/settings'
import { 
  Globe, 
  Truck, 
  CreditCard, 
  Bell, 
  Shield, 
  Users,
  MapPin,
  DollarSign,
  Clock,
  AlertTriangle
} from 'lucide-react'

export default function TajikistanSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [countrySettings, setCountrySettings] = useState<CountryShippingSettings | null>(null)
  const [activeTab, setActiveTab] = useState('shipping')

  // タブ設定
  const tabs = [
    { id: 'shipping', name: '配送設定', icon: Truck, description: 'タジキスタン向け配送業者・料金設定' },
    { id: 'payment', name: '支払い設定', icon: CreditCard, description: '決済方法・通貨設定' },
    { id: 'notifications', name: '通知設定', icon: Bell, description: '各種通知・アラート設定' },
    { id: 'localization', name: 'ローカライズ', icon: Globe, description: '言語・通貨・時間設定' },
    { id: 'customers', name: '顧客管理', icon: Users, description: 'タジキスタン顧客の設定' },
    { id: 'security', name: 'セキュリティ', icon: Shield, description: 'アクセス権限・セキュリティ設定' },
  ]

  const countryInfo = {
    name: 'タジキスタン',
    nameLocal: 'Тоҷикистон',
    flag: '🇹🇯',
    code: 'TJ',
    currency: 'TJS',
    language: 'タジク語',
    languageCode: 'tg',
    timezone: 'Asia/Dushanbe',
    capital: 'ドゥシャンベ',
    capitalLocal: 'Душанбе'
  }

  useEffect(() => {
    const loadSettings = () => {
      setLoading(true)
      try {
        const settings = SettingsService.getCountryShippingSetting('TJ')
        setCountrySettings(settings)
      } catch (error) {
        console.error('タジキスタン設定の読み込みに失敗:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{countryInfo.flag}</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">タジキスタン設定</h1>
            <p className="text-sm text-gray-600">
              {countryInfo.nameLocal} • {countryInfo.capital} ({countryInfo.capitalLocal})
            </p>
          </div>
        </div>
      </div>

      {/* 国情報サマリー */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-sm text-blue-600">地域</div>
              <div className="font-medium">{countryInfo.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-sm text-blue-600">通貨</div>
              <div className="font-medium">{countryInfo.currency}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-sm text-blue-600">言語</div>
              <div className="font-medium">{countryInfo.language}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-sm text-blue-600">タイムゾーン</div>
              <div className="font-medium">{countryInfo.timezone}</div>
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* タブコンテンツ */}
      <div className="mt-6">
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  タジキスタン向け配送設定
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  日本からタジキスタンへの配送業者と料金設定を管理します
                </p>
              </div>
              
              <div className="p-6">
                {countrySettings ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">配送業者数</h4>
                        <p className="text-sm text-gray-600">設定済みの配送業者</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {countrySettings.carriers.length}
                        </div>
                        <div className="text-sm text-gray-500">
                          アクティブ: {countrySettings.carriers.filter(c => c.isActive).length}
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h5 className="font-medium mb-2">デフォルト配送業者</h5>
                      {countrySettings.defaultCarrierId ? (
                        <div>
                          {(() => {
                            const defaultCarrier = countrySettings.carriers.find(
                              c => c.id === countrySettings.defaultCarrierId
                            )
                            return defaultCarrier ? (
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{defaultCarrier.name}</div>
                                  <div className="text-sm text-gray-600">
                                    コード: {defaultCarrier.code}
                                  </div>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${
                                  defaultCarrier.isActive ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                              </div>
                            ) : (
                              <div className="text-yellow-600 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                デフォルト配送業者が見つかりません
                              </div>
                            )
                          })()}
                        </div>
                      ) : (
                        <div className="text-red-600 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          デフォルト配送業者が設定されていません
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => router.push('/admin/settings/shipping')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        配送設定を管理 →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                    <h4 className="font-medium text-gray-900 mb-2">配送設定が見つかりません</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      タジキスタン向けの配送設定が作成されていません。
                    </p>
                    <button
                      onClick={() => router.push('/admin/settings/shipping')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      配送設定を作成
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                支払い・通貨設定
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-8 w-8 mx-auto mb-3" />
                <p>タジキスタン向け決済設定</p>
                <p className="text-sm mt-1">開発中...</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                通知・アラート設定
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-3" />
                <p>タジキスタン向け通知設定</p>
                <p className="text-sm mt-1">開発中...</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'localization' && (
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                ローカライゼーション設定
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">表示言語</label>
                  <select className="w-full border rounded-lg px-3 py-2">
                    <option value="ja">日本語</option>
                    <option value="tg">タジク語 (Тоҷикӣ)</option>
                    <option value="ru">ロシア語 (Русский)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">通貨表示</label>
                  <select className="w-full border rounded-lg px-3 py-2">
                    <option value="JPY">日本円 (JPY)</option>
                    <option value="TJS">タジキスタン・ソモニ (TJS)</option>
                    <option value="USD">米ドル (USD)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">タイムゾーン</label>
                  <select className="w-full border rounded-lg px-3 py-2">
                    <option value="Asia/Dushanbe">ドゥシャンベ (Asia/Dushanbe)</option>
                    <option value="Asia/Tokyo">東京 (Asia/Tokyo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">日付形式</label>
                  <select className="w-full border rounded-lg px-3 py-2">
                    <option value="ja-JP">2024年8月18日</option>
                    <option value="tg-TJ">18.08.2024</option>
                    <option value="en-US">08/18/2024</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                タジキスタン顧客管理設定
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-3" />
                <p>顧客管理設定</p>
                <p className="text-sm mt-1">開発中...</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                セキュリティ・アクセス設定
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">アカウント情報</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">アカウント名:</span>
                      <span className="font-medium">タジキスタン代表者</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">メールアドレス:</span>
                      <span className="font-medium">tajikistan@example.com</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">権限レベル:</span>
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">国別管理者</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">アクセス範囲:</span>
                      <span className="font-medium">タジキスタン関連データのみ</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">セキュリティ設定</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">二段階認証</div>
                        <div className="text-sm text-gray-600">SMS・メールによる認証</div>
                      </div>
                      <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        無効
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">パスワード強度</div>
                        <div className="text-sm text-gray-600">現在のパスワード強度</div>
                      </div>
                      <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        普通
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">最終ログイン</div>
                        <div className="text-sm text-gray-600">前回のアクセス日時</div>
                      </div>
                      <div className="font-medium text-sm">
                        {new Date().toLocaleString('ja-JP')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}