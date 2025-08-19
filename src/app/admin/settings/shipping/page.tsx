"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SettingsService } from '@/lib/settings/SettingsService'
import { ShippingCarrier, ShippingService, ShippingRate, CountryShippingSettings } from '@/types/settings'

interface SimpleCarrierForm {
  id: string
  name: string
  code: string
  logo?: string
  isActive: boolean
  // シンプル料金設定
  maxWeight: number
  price: number
  estimatedDaysMin: number
  estimatedDaysMax: number
  description: string
}

export default function ShippingSettingsPage() {
  const router = useRouter()
  const [carriers, setCarriers] = useState<ShippingCarrier[]>([])
  const [defaultCarrierId, setDefaultCarrierId] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingCarrier, setEditingCarrier] = useState<SimpleCarrierForm | null>(null)
  const [showForm, setShowForm] = useState(false)
  // 国別設定関連
  const [countrySettings, setCountrySettings] = useState<CountryShippingSettings[]>([])
  const [selectedCountry, setSelectedCountry] = useState('')
  const [currentCountrySetting, setCurrentCountrySetting] = useState<CountryShippingSettings | null>(null)

  // データの読み込み
  const loadData = () => {
    setLoading(true)
    try {
      const settings = SettingsService.getSettings()
      const countrySettingsList = SettingsService.getCountryShippingSettings()
      setCountrySettings(countrySettingsList)
      
      // デフォルト国を選択
      const defaultCountryCode = settings.shipping.defaultCountryCode || 'TJ'
      setSelectedCountry(defaultCountryCode)
      
      // 選択された国の配送業者を取得
      const currentSetting = countrySettingsList.find(c => c.countryCode === defaultCountryCode && c.isActive)
      setCurrentCountrySetting(currentSetting || null)
      
      if (currentSetting) {
        setCarriers(currentSetting.carriers)
        setDefaultCarrierId(currentSetting.defaultCarrierId)
      } else {
        setCarriers([])
        setDefaultCarrierId('')
      }
    } catch (error) {
      console.error('配送設定の読み込みに失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  // 国の変更処理
  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode)
    const countrySetting = countrySettings.find(c => c.countryCode === countryCode)
    setCurrentCountrySetting(countrySetting || null)
    
    if (countrySetting) {
      setCarriers(countrySetting.carriers)
      setDefaultCarrierId(countrySetting.defaultCarrierId)
    } else {
      setCarriers([])
      setDefaultCarrierId('')
    }
  }

  // 設定をリセットして最新のデフォルト設定を適用
  const handleResetToDefaults = () => {
    if (confirm('設定をデフォルトにリセットしますか？すべての国の配送設定がデフォルト状態になります。')) {
      try {
        // 強制的にデフォルト設定を適用
        SettingsService.forceDefaultSettings()
        loadData()
        alert('デフォルト設定を適用しました')
      } catch (error) {
        console.error('リセットエラー:', error)
        alert('リセットに失敗しました')
      }
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // 新規追加フォームの初期化
  const handleAddNew = () => {
    setEditingCarrier({
      id: '',
      name: '',
      code: '',
      logo: '',
      isActive: true,
      maxWeight: 20, // デフォルト20kg
      price: 39800,  // デフォルト39,800円
      estimatedDaysMin: 7,
      estimatedDaysMax: 21,
      description: 'タジキスタンまでの国際配送'
    })
    setShowForm(true)
  }

  // 編集フォームの初期化
  const handleEdit = (carrier: ShippingCarrier) => {
    // 既存のキャリアデータをシンプルフォームに変換
    const mainService = carrier.services[0] || {
      rates: [{ price: 0, weightMax: 20 }],
      estimatedDays: { min: 7, max: 21 },
      description: ''
    }
    
    setEditingCarrier({
      id: carrier.id,
      name: carrier.name,
      code: carrier.code,
      logo: carrier.logo || '',
      isActive: carrier.isActive,
      maxWeight: mainService.rates[0]?.weightMax || 20,
      price: mainService.rates[0]?.price || 39800,
      estimatedDaysMin: mainService.estimatedDays.min,
      estimatedDaysMax: mainService.estimatedDays.max,
      description: mainService.description || ''
    })
    setShowForm(true)
  }

  // フォームの保存
  const handleSave = () => {
    if (!editingCarrier) return

    if (!editingCarrier.name.trim() || !editingCarrier.code.trim()) {
      alert('業者名と業者コードは必須です')
      return
    }

    if (editingCarrier.maxWeight <= 0 || editingCarrier.price <= 0) {
      alert('最大重量と価格は0より大きい値を入力してください')
      return
    }

    try {
      // シンプルフォームから正式なShippingCarrier形式に変換
      const fullCarrier: ShippingCarrier = {
        id: editingCarrier.id || crypto.randomUUID(),
        name: editingCarrier.name,
        code: editingCarrier.code,
        logo: editingCarrier.logo,
        isActive: editingCarrier.isActive,
        services: [
          {
            id: editingCarrier.id ? `${editingCarrier.id}-service` : crypto.randomUUID(),
            carrierId: editingCarrier.id || crypto.randomUUID(),
            name: `${editingCarrier.name}標準`,
            code: `${editingCarrier.code}_STD`,
            rateType: 'per_kg',
            rates: [
              {
                id: crypto.randomUUID(),
                serviceId: editingCarrier.id ? `${editingCarrier.id}-service` : crypto.randomUUID(),
                weightMin: 0,
                weightMax: editingCarrier.maxWeight,
                price: editingCarrier.price,
                currency: 'JPY'
              }
            ],
            estimatedDays: {
              min: editingCarrier.estimatedDaysMin,
              max: editingCarrier.estimatedDaysMax
            },
            isActive: editingCarrier.isActive,
            description: editingCarrier.description
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      let success = false
      
      if (editingCarrier.id) {
        // 更新
        success = SettingsService.updateShippingCarrier(editingCarrier.id, fullCarrier, selectedCountry)
      } else {
        // 新規追加
        success = SettingsService.addShippingCarrier(fullCarrier, selectedCountry)
      }

      if (success) {
        loadData()
        setShowForm(false)
        setEditingCarrier(null)
        alert(editingCarrier.id ? '配送業者を更新しました' : '配送業者を追加しました')
      } else {
        alert('保存に失敗しました')
      }
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存中にエラーが発生しました')
    }
  }

  // 削除
  const handleDelete = (carrierId: string) => {
    if (confirm('この配送業者を削除しますか？関連する設定もすべて削除されます。')) {
      const success = SettingsService.deleteShippingCarrier(carrierId, selectedCountry)
      if (success) {
        loadData()
        alert('配送業者を削除しました')
      } else {
        alert('削除に失敗しました')
      }
    }
  }

  // デフォルト配送業者の変更
  const handleDefaultCarrierChange = (carrierId: string) => {
    if (currentCountrySetting) {
      const success = SettingsService.updateCountryShippingSetting(selectedCountry, { defaultCarrierId: carrierId })
      if (success) {
        setDefaultCarrierId(carrierId)
        loadData() // データを再読み込み
        alert('デフォルト配送業者を変更しました')
      } else {
        alert('変更に失敗しました')
      }
    }
  }

  // アクティブ状態の切り替え
  const handleToggleActive = (carrierId: string, isActive: boolean) => {
    const success = SettingsService.updateShippingCarrier(carrierId, { isActive }, selectedCountry)
    if (success) {
      loadData()
    } else {
      alert('変更に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-start">
        <div>
          <button 
            onClick={() => router.push('/admin/settings')}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← 設定管理に戻る
          </button>
          <h1 className="text-3xl font-bold">配送設定</h1>
          <p className="text-muted-foreground">国別の配送業者、配送方法、配送料金の設定</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleResetToDefaults}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
          >
            デフォルト設定に戻す
          </button>
          <button
            onClick={handleAddNew}
            disabled={!currentCountrySetting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded transition-colors"
          >
            新しい配送業者を追加
          </button>
        </div>
      </div>

      {/* 国選択 */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">🌍 配送対象国の選択</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">配送対象国を選択してください</label>
            <select
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="border rounded px-3 py-2 w-full max-w-md"
            >
              <option value="">国を選択...</option>
              {countrySettings.map(country => (
                <option key={country.countryCode} value={country.countryCode}>
                  {country.countryName} ({country.countryCode})
                  {country.isActive ? '' : ' - 無効'}
                </option>
              ))}
            </select>
          </div>
          
          {currentCountrySetting && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-800">
                    {currentCountrySetting.countryName} 向け配送設定
                  </h4>
                  <p className="text-sm text-blue-600">
                    配送業者数: {currentCountrySetting.carriers.length}件 
                    | アクティブ: {currentCountrySetting.carriers.filter(c => c.isActive).length}件
                    {currentCountrySetting.defaultCarrierId && 
                      ` | デフォルト: ${currentCountrySetting.carriers.find(c => c.id === currentCountrySetting.defaultCarrierId)?.name || '未設定'}`
                    }
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${currentCountrySetting.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
            </div>
          )}
          
          {!currentCountrySetting && selectedCountry && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-medium">⚠️ 選択した国の配送設定が見つかりません</p>
              <p className="text-sm text-yellow-600 mt-1">
                この国向けの配送設定を作成するか、管理者にお問い合わせください。
              </p>
            </div>
          )}
        </div>
      </div>

      {/* デフォルト配送業者設定 */}
      {currentCountrySetting && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            {currentCountrySetting.countryName} のデフォルト配送業者
          </h3>
          <select
            value={defaultCarrierId}
            onChange={(e) => handleDefaultCarrierChange(e.target.value)}
            className="border rounded px-3 py-2 w-full max-w-md"
            disabled={carriers.filter(c => c.isActive).length === 0}
          >
            <option value="">選択してください</option>
            {carriers.filter(c => c.isActive).map(carrier => (
              <option key={carrier.id} value={carrier.id}>
                {carrier.name} ({carrier.code})
              </option>
            ))}
          </select>
          {carriers.filter(c => c.isActive).length === 0 && (
            <p className="text-sm text-gray-500 mt-2">アクティブな配送業者がありません</p>
          )}
        </div>
      )}

      {/* 配送業者一覧 */}
      {currentCountrySetting ? (
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">
              {currentCountrySetting.countryName} 向け配送業者一覧
            </h3>
          </div>
          <div className="divide-y">
            {carriers.map((carrier) => (
            <div key={carrier.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${carrier.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <h4 className="font-semibold text-lg">{carrier.name}</h4>
                    <p className="text-muted-foreground">コード: {carrier.code}</p>
                  </div>
                  {carrier.id === defaultCarrierId && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      デフォルト
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(carrier.id, !carrier.isActive)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      carrier.isActive 
                        ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {carrier.isActive ? '無効化' : '有効化'}
                  </button>
                  <button
                    onClick={() => handleEdit(carrier)}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(carrier.id)}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>

              {/* 料金情報の表示 */}
              <div className="ml-7">
                <h5 className="font-medium mb-2">料金情報</h5>
                {carrier.services.length > 0 && carrier.services[0].rates.length > 0 ? (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-gray-600">最大重量</div>
                        <div className="font-semibold text-lg">{carrier.services[0].rates[0].weightMax}kg</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">配送料金</div>
                        <div className="font-semibold text-lg text-blue-600">¥{carrier.services[0].rates[0].price.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">配送日数</div>
                        <div className="font-semibold text-lg">{carrier.services[0].estimatedDays.min}〜{carrier.services[0].estimatedDays.max}日</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">1kgあたり</div>
                        <div className="font-semibold text-lg text-green-600">
                          ¥{Math.round(carrier.services[0].rates[0].price / carrier.services[0].rates[0].weightMax).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* 計算例 */}
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="text-xs text-blue-700 mb-2">💡 計算例（重量別配送費）</div>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                        <div className="text-blue-600">
                          <span className="font-medium">10g:</span> ¥{Math.round((carrier.services[0].rates[0].price * 0.01) / carrier.services[0].rates[0].weightMax).toLocaleString()}
                        </div>
                        <div className="text-blue-600">
                          <span className="font-medium">60g:</span> ¥{Math.round((carrier.services[0].rates[0].price * 0.06) / carrier.services[0].rates[0].weightMax).toLocaleString()}
                        </div>
                        <div className="text-blue-600">
                          <span className="font-medium">100g:</span> ¥{Math.round((carrier.services[0].rates[0].price * 0.1) / carrier.services[0].rates[0].weightMax).toLocaleString()}
                        </div>
                        <div className="text-blue-600">
                          <span className="font-medium">400g:</span> ¥{Math.round((carrier.services[0].rates[0].price * 0.4) / carrier.services[0].rates[0].weightMax).toLocaleString()}
                        </div>
                        <div className="text-blue-600">
                          <span className="font-medium">1kg:</span> ¥{Math.round(carrier.services[0].rates[0].price / carrier.services[0].rates[0].weightMax).toLocaleString()}
                        </div>
                        <div className="text-blue-600">
                          <span className="font-medium">3kg:</span> ¥{Math.round((carrier.services[0].rates[0].price * 3) / carrier.services[0].rates[0].weightMax).toLocaleString()}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-blue-600 opacity-75">
                        化粧品・小物商品に多い10g-100g帯もカバー
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">料金情報が設定されていません</div>
                )}
              </div>
            </div>
          ))}
            {carriers.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                {currentCountrySetting.countryName} 向けの配送業者が登録されていません
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-8">
          <div className="text-center text-muted-foreground">
            <h3 className="text-lg font-semibold mb-2">配送対象国を選択してください</h3>
            <p>上記の国選択ドロップダウンから配送対象国を選択すると、その国向けの配送業者一覧が表示されます。</p>
          </div>
        </div>
      )}

      {/* 編集フォーム（モーダル風） */}
      {showForm && editingCarrier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {editingCarrier.id ? `配送業者を編集` : `新しい配送業者を追加`}
                {currentCountrySetting && (
                  <span className="text-sm text-blue-600 font-normal ml-2">
                    ({currentCountrySetting.countryName} 向け)
                  </span>
                )}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* ヘルプテキスト */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">📋 配送料金の設定について</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>• <strong>最大重量・価格</strong>: 例）20kg で 39,800円の場合、60g商品の配送費は 約119円になります</p>
                  <p>• <strong>計算方法</strong>: （商品重量 ÷ 最大重量）× 配送料金 = 商品別配送費</p>
                  <p>• <strong>比例計算</strong>: 商品の重量に比例して配送費が商品価格に転嫁されます</p>
                  <p>• <strong>小物商品対応</strong>: 10g-100g帯の化粧品・アクセサリー等の小物商品にも対応</p>
                </div>
              </div>

              {/* 基本情報 */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">業者名 *</label>
                    <input
                      type="text"
                      value={editingCarrier.name}
                      onChange={(e) => setEditingCarrier({ ...editingCarrier, name: e.target.value })}
                      className="border rounded px-3 py-2 w-full"
                      placeholder="例: 国際小包"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">業者コード *</label>
                    <input
                      type="text"
                      value={editingCarrier.code}
                      onChange={(e) => setEditingCarrier({ ...editingCarrier, code: e.target.value.toUpperCase() })}
                      className="border rounded px-3 py-2 w-full"
                      placeholder="例: INT_PARCEL"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">説明</label>
                  <input
                    type="text"
                    value={editingCarrier.description}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, description: e.target.value })}
                    className="border rounded px-3 py-2 w-full"
                    placeholder="例: タジキスタンまでの国際配送"
                  />
                </div>
              </div>

              {/* 料金設定 */}
              <div>
                <h4 className="text-lg font-semibold mb-3">📦 料金設定</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">最大重量 (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={editingCarrier.maxWeight}
                      onChange={(e) => setEditingCarrier({ ...editingCarrier, maxWeight: Number(e.target.value) })}
                      className="border rounded px-3 py-2 w-full"
                      placeholder="20"
                      required
                    />
                    <div className="text-xs text-gray-500 mt-1">この重量まで一律料金で配送</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">配送料金 (円) *</label>
                    <input
                      type="number"
                      min="1"
                      value={editingCarrier.price}
                      onChange={(e) => setEditingCarrier({ ...editingCarrier, price: Number(e.target.value) })}
                      className="border rounded px-3 py-2 w-full"
                      placeholder="39800"
                      required
                    />
                    <div className="text-xs text-gray-500 mt-1">最大重量までの配送料金</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">配送日数（最短）</label>
                    <input
                      type="number"
                      min="1"
                      value={editingCarrier.estimatedDaysMin}
                      onChange={(e) => setEditingCarrier({ ...editingCarrier, estimatedDaysMin: Number(e.target.value) })}
                      className="border rounded px-3 py-2 w-full"
                      placeholder="7"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">配送日数（最長）</label>
                    <input
                      type="number"
                      min="1"
                      value={editingCarrier.estimatedDaysMax}
                      onChange={(e) => setEditingCarrier({ ...editingCarrier, estimatedDaysMax: Number(e.target.value) })}
                      className="border rounded px-3 py-2 w-full"
                      placeholder="21"
                    />
                  </div>
                </div>
              </div>

              {/* 計算プレビュー */}
              {editingCarrier.maxWeight > 0 && editingCarrier.price > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-800 mb-3">💡 計算プレビュー（リアルタイム）</h4>
                  
                  {/* 小物商品向け */}
                  <div className="mb-4">
                    <div className="text-xs text-green-700 mb-2 font-medium">🎀 化粧品・小物商品</div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center bg-white rounded p-2">
                        <div className="text-xs text-green-600">10g</div>
                        <div className="font-semibold text-green-800 text-sm">
                          ¥{Math.round((editingCarrier.price * 0.01) / editingCarrier.maxWeight).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center bg-white rounded p-2">
                        <div className="text-xs text-green-600">60g</div>
                        <div className="font-semibold text-green-800 text-sm">
                          ¥{Math.round((editingCarrier.price * 0.06) / editingCarrier.maxWeight).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center bg-white rounded p-2">
                        <div className="text-xs text-green-600">100g</div>
                        <div className="font-semibold text-green-800 text-sm">
                          ¥{Math.round((editingCarrier.price * 0.1) / editingCarrier.maxWeight).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 一般商品向け */}
                  <div>
                    <div className="text-xs text-green-700 mb-2 font-medium">📦 一般商品</div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center bg-white rounded p-2">
                        <div className="text-xs text-green-600">400g</div>
                        <div className="font-semibold text-green-800 text-sm">
                          ¥{Math.round((editingCarrier.price * 0.4) / editingCarrier.maxWeight).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center bg-white rounded p-2">
                        <div className="text-xs text-green-600">1kg</div>
                        <div className="font-semibold text-green-800 text-sm">
                          ¥{Math.round(editingCarrier.price / editingCarrier.maxWeight).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center bg-white rounded p-2">
                        <div className="text-xs text-green-600">3kg</div>
                        <div className="font-semibold text-green-800 text-sm">
                          ¥{Math.round((editingCarrier.price * 3) / editingCarrier.maxWeight).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-green-700 mt-3 text-center border-t border-green-200 pt-2">
                    <span className="font-medium">基準料金:</span> 1kgあたり ¥{Math.round(editingCarrier.price / editingCarrier.maxWeight).toLocaleString()} 
                    <span className="ml-3 opacity-75">| 最小料金(10g): ¥{Math.round((editingCarrier.price * 0.01) / editingCarrier.maxWeight).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* アクティブ設定 */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingCarrier.isActive}
                    onChange={(e) => setEditingCarrier({ ...editingCarrier, isActive: e.target.checked })}
                  />
                  <span className="text-sm font-medium">アクティブ（この配送業者を有効にする）</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={!editingCarrier.name.trim() || !editingCarrier.code.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}