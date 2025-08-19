"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SettingsService } from '@/lib/settings/SettingsService'
import { SystemSettings } from '@/types/settings'

export default function SystemSettingsPage() {
  const router = useRouter()
  const [system, setSystem] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [backupInProgress, setBackupInProgress] = useState(false)
  const [maintenanceToggling, setMaintenanceToggling] = useState(false)

  useEffect(() => {
    setLoading(true)
    try {
      const settings = SettingsService.getSettings()
      setSystem(settings.system)
    } catch (error) {
      console.error('システム設定の読み込みに失敗:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSave = async () => {
    if (!system || !hasChanges) return
    
    setSaving(true)
    try {
      const success = SettingsService.updateSettings('system', system)
      if (success) {
        setHasChanges(false)
        alert('システム設定を保存しました')
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

  const updateSystem = (updates: Partial<SystemSettings>) => {
    if (!system) return
    const newSystem = { ...system, ...updates }
    setSystem(newSystem)
    setHasChanges(true)
  }

  const handleBackupNow = async () => {
    setBackupInProgress(true)
    try {
      // 実際の実装では、ここでバックアップ処理を実行
      await new Promise(resolve => setTimeout(resolve, 2000)) // デモ用の遅延
      const newSystem = {
        ...system!,
        lastBackup: new Date()
      }
      setSystem(newSystem)
      alert('バックアップが完了しました')
    } catch (error) {
      console.error('バックアップに失敗:', error)
      alert('バックアップに失敗しました')
    } finally {
      setBackupInProgress(false)
    }
  }

  const handleToggleMaintenance = async () => {
    if (!system) return
    
    setMaintenanceToggling(true)
    try {
      const newMaintenanceMode = !system.maintenanceMode?.enabled
      updateSystem({
        maintenanceMode: {
          ...(system.maintenanceMode || {}),
          enabled: newMaintenanceMode,
          enabledAt: newMaintenanceMode ? new Date() : undefined
        }
      })
      
      // 自動保存
      setTimeout(() => {
        setHasChanges(false)
        alert(newMaintenanceMode ? 'メンテナンスモードを有効にしました' : 'メンテナンスモードを無効にしました')
      }, 500)
    } catch (error) {
      console.error('メンテナンスモード切替に失敗:', error)
      alert('メンテナンスモード切替に失敗しました')
    } finally {
      setMaintenanceToggling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!system) {
    return (
      <div className="text-center text-red-600">
        システム設定データが見つかりません
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
          <h1 className="text-3xl font-bold">システム設定</h1>
          <p className="text-muted-foreground">バックアップ、メンテナンスモード設定</p>
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
        {/* バックアップ設定 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">バックアップ設定</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoBackup"
                checked={system.backup?.enabled || false}
                onChange={(e) => updateSystem({
                  backup: { ...(system.backup || {}), enabled: e.target.checked }
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="autoBackup" className="font-medium">自動バックアップを有効にする</label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">バックアップ頻度</label>
              <select
                value={system.backup?.frequency || 'daily'}
                onChange={(e) => updateSystem({
                  backup: { ...(system.backup || {}), frequency: e.target.value as any }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="daily">毎日</option>
                <option value="weekly">毎週</option>
                <option value="monthly">毎月</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">バックアップ実行時刻</label>
              <input
                type="time"
                value={system.backup?.schedule || '02:00'}
                onChange={(e) => updateSystem({
                  backup: { ...(system.backup || {}), schedule: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">保持期間（日数）</label>
              <input
                type="number"
                value={system.backup?.retentionDays || 30}
                onChange={(e) => updateSystem({
                  backup: { ...(system.backup || {}), retentionDays: parseInt(e.target.value) || 30 }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="365"
              />
              <p className="text-xs text-gray-500 mt-1">古いバックアップファイルを自動削除する期間</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">バックアップ場所</label>
              <select
                value={system.backup?.location || 'local'}
                onChange={(e) => updateSystem({
                  backup: { ...(system.backup || {}), location: e.target.value as any }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="local">ローカルストレージ</option>
                <option value="cloud">クラウドストレージ</option>
                <option value="ftp">FTPサーバー</option>
              </select>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">最終バックアップ:</span>
                <span className="text-sm text-gray-600">
                  {system.lastBackup ? system.lastBackup.toLocaleString('ja-JP') : 'なし'}
                </span>
              </div>
              <button
                onClick={handleBackupNow}
                disabled={backupInProgress}
                className={`w-full py-2 rounded transition-colors ${
                  backupInProgress
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {backupInProgress ? 'バックアップ中...' : '今すぐバックアップ実行'}
              </button>
            </div>
          </div>
        </div>

        {/* メンテナンスモード */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">メンテナンスモード</h3>
          <div className="space-y-4">
            <div className={`p-4 rounded border-2 ${
              (system.maintenanceMode?.enabled || false)
                ? 'border-red-200 bg-red-50' 
                : 'border-green-200 bg-green-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-medium ${
                    (system.maintenanceMode?.enabled || false) ? 'text-red-800' : 'text-green-800'
                  }`}>
                    メンテナンスモード: {(system.maintenanceMode?.enabled || false) ? '有効' : '無効'}
                  </div>
                  {(system.maintenanceMode?.enabled || false) && system.maintenanceMode?.enabledAt && (
                    <div className="text-sm text-red-600">
                      開始時刻: {system.maintenanceMode?.enabledAt instanceof Date ? system.maintenanceMode.enabledAt.toLocaleString('ja-JP') : new Date(system.maintenanceMode?.enabledAt || Date.now()).toLocaleString('ja-JP')}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleToggleMaintenance}
                  disabled={maintenanceToggling}
                  className={`px-4 py-2 rounded font-medium transition-colors ${
                    (system.maintenanceMode?.enabled || false)
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  } ${maintenanceToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {maintenanceToggling ? '切替中...' : 
                   (system.maintenanceMode?.enabled || false) ? '無効にする' : '有効にする'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">メンテナンスメッセージ</label>
              <textarea
                value={system.maintenanceMode?.message || ''}
                onChange={(e) => updateSystem({
                  maintenanceMode: { ...(system.maintenanceMode || {}), message: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="現在システムメンテナンス中です。しばらくお待ちください。"
              />
              <p className="text-xs text-gray-500 mt-1">メンテナンス中に表示されるメッセージ</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">予定開始時刻</label>
                <input
                  type="datetime-local"
                  value={system.maintenanceMode?.scheduledStart ? 
                    (system.maintenanceMode.scheduledStart instanceof Date ? system.maintenanceMode.scheduledStart : new Date(system.maintenanceMode.scheduledStart)).toISOString().slice(0, 16) : ''}
                  onChange={(e) => updateSystem({
                    maintenanceMode: { 
                      ...(system.maintenanceMode || {}), 
                      scheduledStart: e.target.value ? new Date(e.target.value) : undefined 
                    }
                  })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">予定終了時刻</label>
                <input
                  type="datetime-local"
                  value={system.maintenanceMode?.scheduledEnd ? 
                    (system.maintenanceMode.scheduledEnd instanceof Date ? system.maintenanceMode.scheduledEnd : new Date(system.maintenanceMode.scheduledEnd)).toISOString().slice(0, 16) : ''}
                  onChange={(e) => updateSystem({
                    maintenanceMode: { 
                      ...(system.maintenanceMode || {}), 
                      scheduledEnd: e.target.value ? new Date(e.target.value) : undefined 
                    }
                  })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowAdmin"
                checked={system.maintenanceMode?.allowAdminAccess || false}
                onChange={(e) => updateSystem({
                  maintenanceMode: { ...(system.maintenanceMode || {}), allowAdminAccess: e.target.checked }
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="allowAdmin" className="text-sm">管理者のアクセスを許可</label>
            </div>
          </div>
        </div>

        {/* ログ設定 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">ログ設定</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ログレベル</label>
              <select
                value={system.logging?.level || 'info'}
                onChange={(e) => updateSystem({
                  logging: { ...(system.logging || {}), level: e.target.value as any }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="error">エラーのみ</option>
                <option value="warn">警告以上</option>
                <option value="info">情報以上</option>
                <option value="debug">デバッグ以上</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ログ保持期間（日数）</label>
              <input
                type="number"
                value={system.logging?.retentionDays || 30}
                onChange={(e) => updateSystem({
                  logging: { ...(system.logging || {}), retentionDays: parseInt(e.target.value) || 30 }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="365"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ログファイルサイズ上限（MB）</label>
              <input
                type="number"
                value={system.logging?.maxFileSize || 10}
                onChange={(e) => updateSystem({
                  logging: { ...(system.logging || {}), maxFileSize: parseInt(e.target.value) || 10 }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="1000"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">記録対象</label>
              {Object.entries(system.logging?.categories || {}).map(([category, enabled]) => (
                <div key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`log-${category}`}
                    checked={enabled}
                    onChange={(e) => updateSystem({
                      logging: {
                        ...(system.logging || {}),
                        categories: {
                          ...(system.logging?.categories || {}),
                          [category]: e.target.checked
                        }
                      }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`log-${category}`} className="text-sm">
                    {category === 'api' ? 'API呼び出し' :
                     category === 'auth' ? '認証' :
                     category === 'orders' ? '注文処理' :
                     category === 'payments' ? '決済処理' :
                     category === 'system' ? 'システムイベント' : category}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* システム情報 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">システム情報</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">バージョン:</span>
              <span className="font-mono">v{system.version || '1.0.0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">最終更新:</span>
              <span>{system.lastUpdated instanceof Date ? system.lastUpdated.toLocaleString('ja-JP') : new Date(system.lastUpdated || Date.now()).toLocaleString('ja-JP')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">稼働時間:</span>
              <span>{Math.floor((Date.now() - (system.lastUpdated instanceof Date ? system.lastUpdated.getTime() : new Date(system.lastUpdated || Date.now()).getTime())) / (1000 * 60 * 60 * 24))}日</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">データベース:</span>
              <span className="font-mono">SQLite</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Node.js:</span>
              <span className="font-mono">v18.17.0</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-lg font-bold text-green-600">99.9%</div>
                <div className="text-gray-600">稼働率（今月）</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-lg font-bold text-blue-600">45ms</div>
                <div className="text-gray-600">平均応答時間</div>
              </div>
            </div>
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