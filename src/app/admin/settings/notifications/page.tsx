"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SettingsService } from '@/lib/settings/SettingsService'
import { NotificationSettings } from '@/types/settings'

export default function NotificationSettingsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const [testWebhook, setTestWebhook] = useState('')

  useEffect(() => {
    setLoading(true)
    try {
      const settings = SettingsService.getSettings()
      setNotifications(settings.notifications)
    } catch (error) {
      console.error('通知設定の読み込みに失敗:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSave = async () => {
    if (!notifications || !hasChanges) return
    
    setSaving(true)
    try {
      const success = SettingsService.updateSettings('notifications', notifications)
      if (success) {
        setHasChanges(false)
        alert('通知設定を保存しました')
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

  const updateNotifications = (updates: Partial<NotificationSettings>) => {
    if (!notifications) return
    const newNotifications = { ...notifications, ...updates }
    setNotifications(newNotifications)
    setHasChanges(true)
  }

  const handleTestEmail = async () => {
    if (!testEmail) {
      alert('テスト用メールアドレスを入力してください')
      return
    }
    
    try {
      // 実際の実装では、ここでテストメールを送信
      alert(`テストメールを ${testEmail} に送信しました（デモ）`)
    } catch (error) {
      alert('テストメールの送信に失敗しました')
    }
  }

  const handleTestWebhook = async () => {
    if (!testWebhook) {
      alert('テスト用WebhookURLを入力してください')
      return
    }
    
    try {
      // 実際の実装では、ここでテストWebhookを送信
      alert(`テストWebhookを ${testWebhook} に送信しました（デモ）`)
    } catch (error) {
      alert('テストWebhookの送信に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!notifications) {
    return (
      <div className="text-center text-red-600">
        通知設定データが見つかりません
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
          <h1 className="text-3xl font-bold">通知設定</h1>
          <p className="text-muted-foreground">メール通知、Webhook設定</p>
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
        {/* メール通知設定 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">メール通知設定</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="emailEnabled"
                checked={notifications.email.enabled}
                onChange={(e) => updateNotifications({
                  email: { ...notifications.email, enabled: e.target.checked }
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="emailEnabled" className="font-medium">メール通知を有効にする</label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">SMTPサーバー</label>
              <input
                type="text"
                value={notifications.email.smtpServer}
                onChange={(e) => updateNotifications({
                  email: { ...notifications.email, smtpServer: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="smtp.gmail.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">ポート</label>
                <input
                  type="number"
                  value={notifications.email.port}
                  onChange={(e) => updateNotifications({
                    email: { ...notifications.email, port: parseInt(e.target.value) || 587 }
                  })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <input
                  type="checkbox"
                  id="secure"
                  checked={notifications.email.secure}
                  onChange={(e) => updateNotifications({
                    email: { ...notifications.email, secure: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="secure" className="text-sm">SSL/TLS</label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ユーザー名</label>
              <input
                type="text"
                value={notifications.email.username}
                onChange={(e) => updateNotifications({
                  email: { ...notifications.email, username: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="your-email@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">パスワード</label>
              <input
                type="password"
                value={notifications.email.password}
                onChange={(e) => updateNotifications({
                  email: { ...notifications.email, password: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="アプリパスワードまたはSMTPパスワード"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">送信者名</label>
              <input
                type="text"
                value={notifications.email.fromName}
                onChange={(e) => updateNotifications({
                  email: { ...notifications.email, fromName: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="タジク化粧品"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">送信者メールアドレス</label>
              <input
                type="email"
                value={notifications.email.fromEmail}
                onChange={(e) => updateNotifications({
                  email: { ...notifications.email, fromEmail: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="noreply@tajikcosmetics.com"
              />
            </div>
          </div>
        </div>

        {/* Webhook設定 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Webhook設定</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="webhookEnabled"
                checked={notifications.webhook.enabled}
                onChange={(e) => updateNotifications({
                  webhook: { ...notifications.webhook, enabled: e.target.checked }
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="webhookEnabled" className="font-medium">Webhookを有効にする</label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Webhook URL</label>
              <input
                type="url"
                value={notifications.webhook.url}
                onChange={(e) => updateNotifications({
                  webhook: { ...notifications.webhook, url: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://your-app.com/webhook"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">シークレット（オプション）</label>
              <input
                type="password"
                value={notifications.webhook.secret}
                onChange={(e) => updateNotifications({
                  webhook: { ...notifications.webhook, secret: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Webhook検証用のシークレット"
              />
              <p className="text-xs text-gray-500 mt-1">HMAC-SHA256署名の生成に使用されます</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">タイムアウト（秒）</label>
              <input
                type="number"
                value={notifications.webhook.timeout}
                onChange={(e) => updateNotifications({
                  webhook: { ...notifications.webhook, timeout: parseInt(e.target.value) || 30 }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="5"
                max="300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">リトライ回数</label>
              <input
                type="number"
                value={notifications.webhook.retries}
                onChange={(e) => updateNotifications({
                  webhook: { ...notifications.webhook, retries: parseInt(e.target.value) || 3 }
                })}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="10"
              />
            </div>
          </div>
        </div>

        {/* 通知イベント設定 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">通知イベント設定</h3>
          <div className="space-y-3">
            {Object.entries(notifications.events || {}).map(([event, config]) => (
              <div key={event} className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium text-sm">
                    {event === 'newOrder' ? '新規注文' :
                     event === 'orderStatusChange' ? '注文ステータス変更' :
                     event === 'priceAlert' ? '価格アラート' :
                     event === 'lowStock' ? '在庫不足' :
                     event === 'systemError' ? 'システムエラー' : event}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`${event}-email`}
                      checked={config?.email || false}
                      onChange={(e) => updateNotifications({
                        events: {
                          ...(notifications.events || {}),
                          [event]: { ...(config || {}), email: e.target.checked }
                        }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`${event}-email`} className="text-xs">メール</label>
                    <input
                      type="checkbox"
                      id={`${event}-webhook`}
                      checked={config?.webhook || false}
                      onChange={(e) => updateNotifications({
                        events: {
                          ...(notifications.events || {}),
                          [event]: { ...(config || {}), webhook: e.target.checked }
                        }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor={`${event}-webhook`} className="text-xs">Webhook</label>
                  </div>
                </div>
                <input
                  type="text"
                  value={(config?.recipients || []).join(', ')}
                  onChange={(e) => updateNotifications({
                    events: {
                      ...(notifications.events || {}),
                      [event]: {
                        ...(config || {}),
                        recipients: e.target.value.split(',').map(email => email.trim()).filter(email => email)
                      }
                    }
                  })}
                  className="w-full p-2 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="通知先メールアドレス（カンマ区切り）"
                />
              </div>
            ))}
          </div>
        </div>

        {/* テスト機能 */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">テスト機能</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">テスト用メールアドレス</label>
              <div className="flex space-x-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="test@example.com"
                />
                <button
                  onClick={handleTestEmail}
                  disabled={!notifications.email.enabled}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  送信
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">テスト用Webhook URL</label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={testWebhook}
                  onChange={(e) => setTestWebhook(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://webhook.site/your-unique-url"
                />
                <button
                  onClick={handleTestWebhook}
                  disabled={!notifications.webhook.enabled}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  送信
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded text-xs">
              <div className="font-medium mb-1">テストペイロードサンプル:</div>
              <pre className="text-gray-600 whitespace-pre-wrap">
{`{
  "event": "test",
  "timestamp": "${new Date().toISOString()}",
  "data": {
    "message": "This is a test notification",
    "source": "Tajik Cosmetics System"
  }
}`}
              </pre>
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