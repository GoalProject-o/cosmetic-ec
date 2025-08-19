"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SettingsService } from '@/lib/settings/SettingsService'
import { ExchangeRateSettings } from '@/types/settings'

export default function ExchangeSettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<ExchangeRateSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingRates, setEditingRates] = useState({
    USDJPY: 0,
    TJSJPY: 0
  })
  const [editingMargins, setEditingMargins] = useState({
    USDJPY: 0,
    TJSJPY: 0
  })
  const [autoUpdate, setAutoUpdate] = useState(false)
  const [updateInterval, setUpdateInterval] = useState(60)

  // データの読み込み
  const loadData = () => {
    setLoading(true)
    try {
      const systemSettings = SettingsService.getSettings()
      const exchangeSettings = systemSettings.exchange
      setSettings(exchangeSettings)
      setEditingRates(exchangeSettings.rates)
      setEditingMargins(exchangeSettings.margins)
      setAutoUpdate(exchangeSettings.autoUpdate)
      setUpdateInterval(exchangeSettings.updateInterval)
    } catch (error) {
      console.error('為替設定の読み込みに失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // 設定の保存
  const handleSave = async () => {
    if (!settings) return

    // バリデーション
    if (editingRates.USDJPY <= 0 || editingRates.TJSJPY <= 0) {
      alert('為替レートは正の値である必要があります')
      return
    }

    if (editingMargins.USDJPY < 0 || editingMargins.TJSJPY < 0) {
      alert('マージンは0以上である必要があります')
      return
    }

    if (updateInterval < 1 || updateInterval > 1440) {
      alert('更新間隔は1分から1440分の間で設定してください')
      return
    }

    setSaving(true)
    try {
      const updatedSettings: Partial<ExchangeRateSettings> = {
        rates: editingRates,
        margins: editingMargins,
        autoUpdate,
        updateInterval,
        lastUpdated: new Date(),
        source: 'manual'
      }

      const success = SettingsService.updateSettings('exchange', updatedSettings)
      if (success) {
        loadData()
        alert('為替設定を保存しました')
      } else {
        alert('保存に失敗しました')
      }
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存中にエラーが発生しました')
    } finally {
      setSaving(false)
    }
  }

  // リセット
  const handleReset = () => {
    if (!settings) return
    setEditingRates(settings.rates)
    setEditingMargins(settings.margins)
    setAutoUpdate(settings.autoUpdate)
    setUpdateInterval(settings.updateInterval)
  }

  // 現在の実効レート計算
  const getEffectiveRate = (currency: 'USDJPY' | 'TJSJPY') => {
    const baseRate = editingRates[currency]
    const margin = editingMargins[currency]
    return baseRate * (1 + margin / 100)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!settings) {
    return <div>設定の読み込みに失敗しました</div>
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
          <h1 className="text-3xl font-bold">為替レート設定</h1>
          <p className="text-muted-foreground">通貨の為替レート、マージン設定</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            disabled={saving}
          >
            リセット
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>

      {/* 現在の設定表示 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground">最終更新</div>
          <div className="text-lg font-semibold text-blue-600">
            {settings.lastUpdated.toLocaleString('ja-JP')}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground">更新方法</div>
          <div className="text-lg font-semibold text-green-600">
            {settings.source === 'manual' ? '手動更新' : 'API自動更新'}
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-muted-foreground">自動更新間隔</div>
          <div className="text-lg font-semibold text-purple-600">
            {settings.updateInterval}分
          </div>
        </div>
      </div>

      {/* 為替レート設定 */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-6">基準為替レート</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* USD/JPY */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg flex items-center gap-2">
              🇺🇸→🇯🇵 USD/JPY
            </h4>
            
            <div>
              <label className="block text-sm font-medium mb-1">基準レート</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={editingRates.USDJPY}
                  onChange={(e) => setEditingRates({
                    ...editingRates,
                    USDJPY: parseFloat(e.target.value) || 0
                  })}
                  className="border rounded px-3 py-2 flex-1"
                  step="0.01"
                  min="0"
                />
                <span className="text-sm text-muted-foreground">円</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">マージン</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={editingMargins.USDJPY}
                  onChange={(e) => setEditingMargins({
                    ...editingMargins,
                    USDJPY: parseFloat(e.target.value) || 0
                  })}
                  className="border rounded px-3 py-2 flex-1"
                  step="0.1"
                  min="0"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-muted-foreground">実効レート</div>
              <div className="text-xl font-bold text-green-600">
                ¥{getEffectiveRate('USDJPY').toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                基準レート + マージン{editingMargins.USDJPY}%
              </div>
            </div>
          </div>

          {/* TJS/JPY */}
          <div className="space-y-4">
            <h4 className="font-medium text-lg flex items-center gap-2">
              🇹🇯→🇯🇵 TJS/JPY
            </h4>
            
            <div>
              <label className="block text-sm font-medium mb-1">基準レート</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={editingRates.TJSJPY}
                  onChange={(e) => setEditingRates({
                    ...editingRates,
                    TJSJPY: parseFloat(e.target.value) || 0
                  })}
                  className="border rounded px-3 py-2 flex-1"
                  step="0.001"
                  min="0"
                />
                <span className="text-sm text-muted-foreground">円</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">マージン</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={editingMargins.TJSJPY}
                  onChange={(e) => setEditingMargins({
                    ...editingMargins,
                    TJSJPY: parseFloat(e.target.value) || 0
                  })}
                  className="border rounded px-3 py-2 flex-1"
                  step="0.1"
                  min="0"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-sm text-muted-foreground">実効レート</div>
              <div className="text-xl font-bold text-green-600">
                ¥{getEffectiveRate('TJSJPY').toFixed(4)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                基準レート + マージン{editingMargins.TJSJPY}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 自動更新設定 */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">自動更新設定</h3>
        
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoUpdate}
                onChange={(e) => setAutoUpdate(e.target.checked)}
              />
              <span className="font-medium">自動更新を有効にする</span>
            </label>
            <p className="text-sm text-muted-foreground mt-1">
              有効にすると、指定した間隔で外部APIから為替レートを自動取得します
            </p>
          </div>
          
          {autoUpdate && (
            <div>
              <label className="block text-sm font-medium mb-1">更新間隔</label>
              <div className="flex items-center gap-2">
                <select
                  value={updateInterval}
                  onChange={(e) => setUpdateInterval(parseInt(e.target.value))}
                  className="border rounded px-3 py-2"
                >
                  <option value={15}>15分</option>
                  <option value={30}>30分</option>
                  <option value={60}>1時間</option>
                  <option value={360}>6時間</option>
                  <option value={720}>12時間</option>
                  <option value={1440}>24時間</option>
                </select>
                <span className="text-sm text-muted-foreground">ごと</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 為替レート履歴 */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">為替レート変更履歴</h3>
        <div className="space-y-2">
          {SettingsService.getHistory()
            .filter(entry => entry.category === 'exchange')
            .slice(0, 10)
            .map((entry) => (
            <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div>
                <span className="font-medium">{entry.field}</span>
                {entry.oldValue && entry.newValue && (
                  <span className="text-muted-foreground ml-2">
                    {JSON.stringify(entry.oldValue)} → {JSON.stringify(entry.newValue)}
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {entry.changedAt.toLocaleString('ja-JP')}
              </div>
            </div>
          ))}
          {SettingsService.getHistory().filter(entry => entry.category === 'exchange').length === 0 && (
            <div className="text-muted-foreground text-center py-4">
              為替レートの変更履歴がありません
            </div>
          )}
        </div>
      </div>

      {/* ヘルプ情報 */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="text-sm">
          <h4 className="font-medium text-yellow-800 mb-2">💡 設定のヒント</h4>
          <ul className="space-y-1 text-yellow-700">
            <li>• マージンは利益やリスクヘッジのために基準レートに上乗せされる割合です</li>
            <li>• 実効レートが価格計算で使用されます</li>
            <li>• 自動更新を有効にする場合は、外部API連携が必要です</li>
            <li>• 為替レートの変更は既存の価格計算に影響します</li>
          </ul>
        </div>
      </div>
    </div>
  )
}