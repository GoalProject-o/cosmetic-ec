"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SettingsService } from '@/lib/settings/SettingsService'
import { PricingSettings } from '@/types/settings'

export default function PricingSettingsPage() {
  const router = useRouter()
  const [pricing, setPricing] = useState<PricingSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [testAmount, setTestAmount] = useState(10000)

  useEffect(() => {
    setLoading(true)
    try {
      const settings = SettingsService.getSettings()
      setPricing(settings.pricing)
    } catch (error) {
      console.error('価格設定の読み込みに失敗:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSave = async () => {
    if (!pricing || !hasChanges) return
    
    setSaving(true)
    try {
      const success = SettingsService.updateSettings('pricing', pricing)
      if (success) {
        setHasChanges(false)
        alert('価格設定を保存しました')
      } else {
        alert('保存に失敗しました')
      }
    } catch (error) {
      console.error('保存に失敗:', error)
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const updatePricing = (updates: Partial<PricingSettings>) => {
    if (!pricing) return
    const newPricing = { ...pricing, ...updates }
    setPricing(newPricing)
    setHasChanges(true)
  }

  const calculateTestPrice = () => {
    if (!pricing) return 0
    
    const withMargin = testAmount * (1 + pricing.defaultProfitMargin / 100)
    const rounded = pricing.roundingMode === 'up' ? Math.ceil(withMargin) :
                   pricing.roundingMode === 'down' ? Math.floor(withMargin) :
                   Math.round(withMargin)
    
    return pricing.roundToNearest > 1 ? 
      Math.round(rounded / pricing.roundToNearest) * pricing.roundToNearest : 
      rounded
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!pricing) {
    return (
      <div className="text-center text-red-600">
        価格設定データが見つかりません
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <button
            onClick={() => router.push('/admin/settings')}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← 戻る
          </button>
          <h1 className="text-3xl font-bold">価格計算設定</h1>
          <p className="text-muted-foreground">利益率、端数処理、表示通貨の設定</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`px-4 py-2 rounded transition-colors ${
              hasChanges && !saving
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 利益率設定 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">利益率設定</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">デフォルト利益率 (%)</label>
              <input
                type="number"
                value={pricing.defaultProfitMargin}
                onChange={(e) => updatePricing({ defaultProfitMargin: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                step="0.1"
                min="0"
                max="1000"
              />
              <p className="text-xs text-gray-500 mt-1">新商品のデフォルト利益率</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">最小利益率 (%)</label>
              <input
                type="number"
                value={pricing.minimumProfitMargin}
                onChange={(e) => updatePricing({ minimumProfitMargin: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                step="0.1"
                min="0"
                max="100"
              />
              <p className="text-xs text-gray-500 mt-1">許可する最小利益率（警告表示の基準）</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">推奨利益率 (%)</label>
              <input
                type="number"
                value={pricing.targetProfitMargin}
                onChange={(e) => updatePricing({ targetProfitMargin: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                step="0.1"
                min="0"
                max="1000"
              />
              <p className="text-xs text-gray-500 mt-1">目標とする推奨利益率</p>
            </div>
          </div>
        </div>

        {/* 端数処理設定 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">端数処理設定</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">端数処理方法</label>
              <select
                value={pricing.roundingMode}
                onChange={(e) => updatePricing({ roundingMode: e.target.value as 'up' | 'down' | 'nearest' })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="up">切り上げ</option>
                <option value="down">切り下げ</option>
                <option value="nearest">四捨五入</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">価格計算時の端数処理方法</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">単位（円）</label>
              <select
                value={pricing.roundToNearest}
                onChange={(e) => updatePricing({ roundToNearest: parseInt(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={1}>1円単位</option>
                <option value={10}>10円単位</option>
                <option value={100}>100円単位</option>
                <option value={1000}>1000円単位</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">価格を丸める単位</p>
            </div>
          </div>
        </div>

        {/* 通貨表示設定 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">通貨表示設定</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">基準通貨</label>
              <select
                value={pricing.baseCurrency}
                onChange={(e) => updatePricing({ baseCurrency: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="JPY">日本円 (JPY)</option>
                <option value="USD">アメリカドル (USD)</option>
                <option value="EUR">ユーロ (EUR)</option>
                <option value="RUB">ロシアルーブル (RUB)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">価格計算の基準となる通貨</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">表示通貨</label>
              <div className="space-y-2">
                {(pricing.displayCurrencies || ['JPY']).map((currency, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <select
                      value={currency}
                      onChange={(e) => {
                        const newCurrencies = [...(pricing.displayCurrencies || ['JPY'])]
                        newCurrencies[index] = e.target.value
                        updatePricing({ displayCurrencies: newCurrencies })
                      }}
                      className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="JPY">日本円 (JPY)</option>
                      <option value="USD">アメリカドル (USD)</option>
                      <option value="EUR">ユーロ (EUR)</option>
                      <option value="RUB">ロシアルーブル (RUB)</option>
                      <option value="TJS">タジキスタンソモニ (TJS)</option>
                    </select>
                    <button
                      onClick={() => {
                        const newCurrencies = (pricing.displayCurrencies || ['JPY']).filter((_, i) => i !== index)
                        updatePricing({ displayCurrencies: newCurrencies })
                      }}
                      className="text-red-600 hover:text-red-800 p-1"
                      disabled={(pricing.displayCurrencies || ['JPY']).length <= 1}
                    >
                      削除
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newCurrencies = [...(pricing.displayCurrencies || ['JPY']), 'USD']
                    updatePricing({ displayCurrencies: newCurrencies })
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                  disabled={(pricing.displayCurrencies || ['JPY']).length >= 5}
                >
                  + 通貨を追加
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">顧客に表示する通貨（最大5つまで）</p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoUpdate"
                checked={pricing.autoUpdateRates}
                onChange={(e) => updatePricing({ autoUpdateRates: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="autoUpdate" className="text-sm">為替レートの自動更新</label>
            </div>
            <p className="text-xs text-gray-500">有効にすると、定期的に為替レートが更新されます</p>
          </div>
        </div>

        {/* 価格テスト */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">価格計算テスト</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">テスト金額（円）</label>
              <input
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(parseInt(e.target.value) || 0)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
            
            <div className="bg-gray-50 p-4 rounded border">
              <div className="text-sm text-gray-600 mb-2">計算結果:</div>
              <div className="space-y-1 text-sm">
                <div>元の金額: ¥{testAmount.toLocaleString()}</div>
                <div>利益率適用後: ¥{(testAmount * (1 + pricing.defaultProfitMargin / 100)).toLocaleString()}</div>
                <div className="font-medium text-lg">
                  最終価格: ¥{calculateTestPrice().toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  端数処理: {pricing.roundingMode === 'up' ? '切り上げ' : 
                           pricing.roundingMode === 'down' ? '切り下げ' : '四捨五入'} 
                  ({pricing.roundToNearest}円単位)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* カテゴリ別利益率設定 */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">カテゴリ別利益率設定</h3>
        <div className="space-y-3">
          {Object.entries(pricing.categorySpecificMargins || {}).map(([category, margin]) => (
            <div key={category} className="flex items-center space-x-4">
              <div className="w-40 text-sm font-medium">
                {category === 'skincare' ? 'スキンケア' :
                 category === 'makeup' ? 'メイクアップ' :
                 category === 'haircare' ? 'ヘアケア' :
                 category === 'food' ? '食品・スナック' :
                 category === 'drinks' ? '飲料' : category}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={margin}
                  onChange={(e) => updatePricing({
                    categorySpecificMargins: {
                      ...(pricing.categorySpecificMargins || {}),
                      [category]: parseFloat(e.target.value) || 0
                    }
                  })}
                  className="w-20 p-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  step="0.1"
                  min="0"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          0を設定するとデフォルト利益率が使用されます
        </p>
      </div>

      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-orange-100 border border-orange-300 text-orange-800 px-4 py-2 rounded shadow-lg">
          未保存の変更があります
        </div>
      )}
    </div>
  )
}