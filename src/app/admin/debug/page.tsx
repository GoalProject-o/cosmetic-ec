"use client"

import { useState, useEffect } from 'react'
import { SettingsService } from '@/lib/settings/SettingsService'

export default function DebugPage() {
  const [settings, setSettings] = useState<any>(null)
  const [localStorageData, setLocalStorageData] = useState<string>('')

  useEffect(() => {
    try {
      // 現在の設定を取得
      const currentSettings = SettingsService.getSettings()
      setSettings(currentSettings)

      // LocalStorageの生データを安全に取得
      const rawData = localStorage.getItem('tj-cosmetics-settings')
      if (rawData) {
        try {
          // JSONの妥当性を確認
          JSON.parse(rawData)
          setLocalStorageData(rawData)
        } catch (parseError) {
          setLocalStorageData('不正なJSONデータ: ' + rawData.substring(0, 200) + '...')
          console.error('LocalStorageのJSONが不正です:', parseError)
        }
      } else {
        setLocalStorageData('なし')
      }
    } catch (error) {
      console.error('デバッグページ初期化エラー:', error)
      setLocalStorageData('エラーが発生しました: ' + error.message)
    }
  }, [])

  const clearLocalStorage = () => {
    localStorage.removeItem('tj-cosmetics-settings')
    localStorage.removeItem('tj-cosmetics-settings-history')
    alert('LocalStorageをクリアしました。ページを再読み込みしてください。')
    window.location.reload()
  }

  const forceDefaults = () => {
    SettingsService.forceDefaultSettings()
    alert('デフォルト設定を強制適用しました。ページを再読み込みしてください。')
    window.location.reload()
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">設定デバッグページ</h1>
      
      <div className="flex gap-4">
        <button
          onClick={clearLocalStorage}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          LocalStorage クリア
        </button>
        <button
          onClick={forceDefaults}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          デフォルト設定強制適用
        </button>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">国別設定の状況</h3>
        {settings && (
          <div className="space-y-2">
            <div>
              <strong>国別設定の数:</strong> {settings.fees?.countrySpecificCosts?.length || 0}
            </div>
            <div>
              <strong>デフォルト国コード:</strong> {settings.fees?.defaultCountryCode || 'なし'}
            </div>
            <div>
              <strong>タジキスタン存在:</strong> {
                settings.fees?.countrySpecificCosts?.some((c: any) => c.countryCode === 'TJ') ? 'あり' : 'なし'
              }
            </div>
            {settings.fees?.countrySpecificCosts?.length > 0 && (
              <div>
                <strong>登録済み国:</strong>
                <ul className="list-disc list-inside ml-4">
                  {settings.fees.countrySpecificCosts.map((country: any) => (
                    <li key={country.id}>
                      {country.countryName} ({country.countryCode}) - {country.isActive ? 'アクティブ' : '非アクティブ'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">LocalStorage 生データ</h3>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
          {(() => {
            if (localStorageData === 'なし') {
              return 'LocalStorageにデータが存在しません'
            }
            if (localStorageData.startsWith('不正なJSONデータ') || localStorageData.startsWith('エラーが発生しました')) {
              return localStorageData
            }
            try {
              return JSON.stringify(JSON.parse(localStorageData), null, 2)
            } catch {
              return '表示エラー: ' + localStorageData.substring(0, 500)
            }
          })()}
        </pre>
      </div>
    </div>
  )
}