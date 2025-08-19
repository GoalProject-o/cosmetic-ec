"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SettingsService } from '@/lib/settings/SettingsService'
import { SystemSettings, SettingsCategory } from '@/types/settings'

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)

  // 設定カテゴリ定義
  const categories: SettingsCategory[] = [
    {
      id: 'shipping',
      name: '配送設定',
      description: '配送業者、配送方法、配送料金の設定',
      icon: '🚚',
      lastUpdated: settings?.shipping ? new Date() : new Date(),
      hasChanges: false,
      isLocked: false
    },
    {
      id: 'exchange',
      name: '為替レート設定',
      description: '通貨の為替レート、マージン設定',
      icon: '💱',
      lastUpdated: settings?.exchange ? settings.exchange.lastUpdated : new Date(),
      hasChanges: false,
      isLocked: false
    },
    {
      id: 'fees',
      name: '手数料設定',
      description: '各種手数料、関税、VAT率の設定',
      icon: '💰',
      lastUpdated: settings?.fees ? settings.fees.updatedAt : new Date(),
      hasChanges: false,
      isLocked: false
    },
    {
      id: 'countries',
      name: '国別コスト設定',
      description: '国ごとの梱包材料費、税金、手数料の詳細設定',
      icon: '🌍',
      lastUpdated: settings?.fees ? settings.fees.updatedAt : new Date(),
      hasChanges: false,
      isLocked: false
    },
    {
      id: 'cost-analysis',
      name: 'コスト詳細分析',
      description: '国別コストの詳細分析・比較・CSVエクスポート',
      icon: '📊',
      lastUpdated: settings?.fees ? settings.fees.updatedAt : new Date(),
      hasChanges: false,
      isLocked: false
    },
    {
      id: 'pricing',
      name: '価格計算設定',
      description: '利益率、端数処理、表示通貨の設定',
      icon: '🏷️',
      lastUpdated: new Date(),
      hasChanges: false,
      isLocked: false
    },
    {
      id: 'notifications',
      name: '通知設定',
      description: 'メール通知、Webhook設定',
      icon: '🔔',
      lastUpdated: new Date(),
      hasChanges: false,
      isLocked: false
    },
    {
      id: 'system',
      name: 'システム設定',
      description: 'バックアップ、メンテナンスモード設定',
      icon: '⚙️',
      lastUpdated: settings?.system ? settings.system.lastBackup : new Date(),
      hasChanges: false,
      isLocked: false
    }
  ]

  // 設定の読み込み
  useEffect(() => {
    setLoading(true)
    try {
      const currentSettings = SettingsService.getSettings()
      setSettings(currentSettings)
    } catch (error) {
      console.error('設定の読み込みに失敗:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // カテゴリクリック
  const handleCategoryClick = (categoryId: string) => {
    router.push(`/admin/settings/${categoryId}`)
  }

  // 設定のエクスポート
  const handleExport = () => {
    try {
      const exportData = SettingsService.exportSettings()
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tajik-cosmetics-settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      alert('設定をエクスポートしました')
    } catch (error) {
      console.error('エクスポートに失敗:', error)
      alert('エクスポートに失敗しました')
    }
  }

  // 設定のインポート
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const success = SettingsService.importSettings(content)
        if (success) {
          const newSettings = SettingsService.getSettings()
          setSettings(newSettings)
          alert('設定をインポートしました')
        } else {
          alert('設定のインポートに失敗しました')
        }
      } catch (error) {
        console.error('インポートに失敗:', error)
        alert('設定ファイルが無効です')
      }
    }
    reader.readAsText(file)
    event.target.value = '' // ファイル選択をリセット
  }

  // 設定のリセット
  const handleReset = () => {
    if (confirm('すべての設定をデフォルトにリセットしますか？この操作は取り消せません。')) {
      const success = SettingsService.resetToDefaults()
      if (success) {
        const defaultSettings = SettingsService.getSettings()
        setSettings(defaultSettings)
        alert('設定をリセットしました')
      } else {
        alert('設定のリセットに失敗しました')
      }
    }
  }

  // 強制デフォルト設定適用
  const handleForceDefaults = () => {
    if (confirm('デフォルト設定を強制適用しますか？（タジキスタン設定・国際小包有効化）')) {
      const success = SettingsService.forceDefaultSettings()
      if (success) {
        const newSettings = SettingsService.getSettings()
        setSettings(newSettings)
        alert('デフォルト設定を適用しました')
        // ページを再読み込みして確実に反映
        window.location.reload()
      } else {
        alert('設定の適用に失敗しました')
      }
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
          <h1 className="text-3xl font-bold">設定管理</h1>
          <p className="text-muted-foreground">システムの各種設定を管理します</p>
        </div>
        <div className="flex gap-2">
          <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded cursor-pointer transition-colors">
            インポート
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          <button
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            エクスポート
          </button>
          <button
            onClick={handleReset}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
          >
            リセット
          </button>
        </div>
      </div>

      {/* 設定の概要 */}
      {settings && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground">アクティブな配送業者</div>
            <div className="text-2xl font-bold text-blue-600">
              {(settings.shipping?.carriers || []).filter(c => c.isActive).length}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground">為替レート更新</div>
            <div className="text-lg font-semibold text-green-600">
              {settings.exchange?.source === 'manual' ? '手動' : '自動'}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground">デフォルト利益率</div>
            <div className="text-2xl font-bold text-purple-600">
              {settings.pricing?.defaultProfitMargin || 0}%
            </div>
          </div>
        </div>
      )}

      {/* 設定カテゴリ一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`bg-white border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md hover:border-blue-300 ${
              category.isLocked ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{category.icon}</div>
              {category.hasChanges && (
                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                  変更あり
                </span>
              )}
              {category.isLocked && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  ロック中
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {category.description}
            </p>
            
            <div className="text-xs text-muted-foreground">
              最終更新: {category.lastUpdated instanceof Date ? 
                category.lastUpdated.toLocaleDateString('ja-JP') : 
                new Date(category.lastUpdated || Date.now()).toLocaleDateString('ja-JP')}
            </div>
          </div>
        ))}
      </div>

      {/* 最近の変更履歴 */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">最近の変更履歴</h3>
        <div className="space-y-2">
          {SettingsService.getHistory().slice(0, 5).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div>
                <span className="font-medium">{entry.category}</span>
                <span className="text-muted-foreground ml-2">{entry.field}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {entry.changedAt instanceof Date ? 
                  entry.changedAt.toLocaleString('ja-JP') : 
                  new Date(entry.changedAt || Date.now()).toLocaleString('ja-JP')} by {entry.changedBy}
              </div>
            </div>
          ))}
          {SettingsService.getHistory().length === 0 && (
            <div className="text-muted-foreground text-center py-4">
              変更履歴がありません
            </div>
          )}
        </div>
      </div>
    </div>
  )
}