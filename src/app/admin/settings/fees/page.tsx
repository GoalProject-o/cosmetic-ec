"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SettingsService } from '@/lib/settings/SettingsService'
import { FeeSettings } from '@/types/settings'

export default function FeesSettingsPage() {
  const router = useRouter()
  const [fees, setFees] = useState<FeeSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setLoading(true)
    try {
      const settings = SettingsService.getSettings()
      setFees(settings.fees)
    } catch (error) {
      console.error('手数料設定の読み込みに失敗:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSave = async () => {
    if (!fees || !hasChanges) return
    
    setSaving(true)
    try {
      const success = SettingsService.updateSettings('fees', fees)
      if (success) {
        setHasChanges(false)
        alert('手数料設定を保存しました')
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

  const updateFees = (updates: Partial<FeeSettings>) => {
    if (!fees) return
    const newFees = { ...fees, ...updates }
    setFees(newFees)
    setHasChanges(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!fees) {
    return (
      <div className="text-center text-red-600">
        手数料設定データが見つかりません
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
          <h1 className="text-3xl font-bold">手数料設定</h1>
          <p className="text-muted-foreground">各種手数料、関税、VAT率の設定</p>
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
        {/* 基本手数料設定 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">基本手数料</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">処理手数料 (%)</label>
              <input
                type="number"
                value={fees.processingFeeRate || 0}
                onChange={(e) => updateFees({ processingFeeRate: parseFloat(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                step="0.1"
                min="0"
                max="100"
              />
              <p className="text-xs text-gray-500 mt-1">注文金額に対する処理手数料率</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">最小手数料 (¥)</label>
              <input
                type="number"
                value={fees.minimumFee || 0}
                onChange={(e) => updateFees({ minimumFee: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">1回の注文あたりの最小手数料</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">最大手数料 (¥)</label>
              <input
                type="number"
                value={fees.maximumFee || 0}
                onChange={(e) => updateFees({ maximumFee: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">1回の注文あたりの最大手数料（0で無制限）</p>
            </div>
          </div>
        </div>

        {/* 国別関税設定 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">国別関税設定</h3>
          <div className="space-y-4">
            {Object.entries(fees.customsDutyRates || {}).map(([country, rate]) => (
              <div key={country}>
                <label className="block text-sm font-medium mb-1">
                  {country === 'tajikistan' ? 'タジキスタン' : 
                   country === 'russia' ? 'ロシア' :
                   country === 'kyrgyzstan' ? 'キルギス' :
                   country === 'kazakhstan' ? 'カザフスタン' :
                   country === 'uzbekistan' ? 'ウズベキスタン' : country} (%)
                </label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => updateFees({ 
                    customsDutyRates: {
                      ...(fees.customsDutyRates || {}),
                      [country]: parseFloat(e.target.value) || 0
                    }
                  })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* VAT設定 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">VAT設定</h3>
          <div className="space-y-4">
            {Object.entries(fees.vatRates || {}).map(([country, rate]) => (
              <div key={country}>
                <label className="block text-sm font-medium mb-1">
                  {country === 'tajikistan' ? 'タジキスタン' : 
                   country === 'russia' ? 'ロシア' :
                   country === 'kyrgyzstan' ? 'キルギス' :
                   country === 'kazakhstan' ? 'カザフスタン' :
                   country === 'uzbekistan' ? 'ウズベキスタン' : country} (%)
                </label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => updateFees({ 
                    vatRates: {
                      ...(fees.vatRates || {}),
                      [country]: parseFloat(e.target.value) || 0
                    }
                  })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 特別手数料設定 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">特別手数料</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">危険物手数料 (¥)</label>
              <input
                type="number"
                value={fees.specialFees?.hazardousMaterialsFee || 0}
                onChange={(e) => updateFees({ 
                  specialFees: {
                    ...(fees.specialFees || {}),
                    hazardousMaterialsFee: parseInt(e.target.value) || 0
                  }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">危険物を含む商品の追加手数料</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">冷蔵・冷凍手数料 (¥)</label>
              <input
                type="number"
                value={fees.specialFees?.refrigeratedShippingFee || 0}
                onChange={(e) => updateFees({ 
                  specialFees: {
                    ...(fees.specialFees || {}),
                    refrigeratedShippingFee: parseInt(e.target.value) || 0
                  }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">冷蔵・冷凍商品の追加手数料</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">急送手数料 (¥)</label>
              <input
                type="number"
                value={fees.specialFees?.expeditedShippingFee || 0}
                onChange={(e) => updateFees({ 
                  specialFees: {
                    ...(fees.specialFees || {}),
                    expeditedShippingFee: parseInt(e.target.value) || 0
                  }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">急送配送の追加手数料</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">保険手数料率 (%)</label>
              <input
                type="number"
                value={fees.specialFees?.insuranceFeeRate || 0}
                onChange={(e) => updateFees({ 
                  specialFees: {
                    ...(fees.specialFees || {}),
                    insuranceFeeRate: parseFloat(e.target.value) || 0
                  }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                step="0.01"
                min="0"
                max="10"
              />
              <p className="text-xs text-gray-500 mt-1">商品価値に対する保険手数料率</p>
            </div>
          </div>
        </div>
      </div>

      {/* 設定プレビュー */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-blue-800">設定プレビュー</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-3 rounded border">
            <div className="font-medium text-blue-700">基本手数料</div>
            <div>処理手数料: {fees.processingFeeRate || 0}%</div>
            <div>最小: ¥{(fees.minimumFee || 0).toLocaleString()}</div>
            <div>最大: {(fees.maximumFee || 0) > 0 ? `¥${(fees.maximumFee || 0).toLocaleString()}` : '無制限'}</div>
          </div>
          <div className="bg-white p-3 rounded border">
            <div className="font-medium text-green-700">関税率（平均）</div>
            <div>{Object.values(fees.customsDutyRates || {}).reduce((a, b) => a + b, 0) / Math.max(Object.keys(fees.customsDutyRates || {}).length, 1)}%</div>
          </div>
          <div className="bg-white p-3 rounded border">
            <div className="font-medium text-orange-700">VAT率（平均）</div>
            <div>{Object.values(fees.vatRates || {}).reduce((a, b) => a + b, 0) / Math.max(Object.keys(fees.vatRates || {}).length, 1)}%</div>
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-orange-100 border border-orange-300 text-orange-800 px-4 py-2 rounded shadow-lg">
          未保存の変更があります
        </div>
      )}
    </div>
  )
}