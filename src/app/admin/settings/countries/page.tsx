"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SettingsService } from '@/lib/settings/SettingsService'
import { CountrySpecificCosts } from '@/types/settings'

export default function CountrySettingsPage() {
  const router = useRouter()
  const [countries, setCountries] = useState<CountrySpecificCosts[]>([])
  const [defaultCountryCode, setDefaultCountryCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingCountry, setEditingCountry] = useState<CountrySpecificCosts | null>(null)
  const [showForm, setShowForm] = useState(false)

  // データの読み込み
  const loadData = () => {
    setLoading(true)
    try {
      const settings = SettingsService.getSettings()
      
      // 安全にデータを取得
      const countrySpecificCosts = settings?.fees?.countrySpecificCosts || []
      const defaultCountryCode = settings?.fees?.defaultCountryCode || ''
      
      setCountries(countrySpecificCosts)
      setDefaultCountryCode(defaultCountryCode)
      
      console.log('国別設定読み込み完了:', { 
        count: countrySpecificCosts.length, 
        defaultCountryCode,
        countries: countrySpecificCosts.map(c => `${c.countryName}(${c.countryCode})`)
      })
    } catch (error) {
      console.error('国別設定の読み込みに失敗:', error)
      // エラーの場合は空配列を設定
      setCountries([])
      setDefaultCountryCode('')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 安全な初期化
    try {
      loadData()
    } catch (error) {
      console.error('初期化エラー:', error)
      setLoading(false)
    }
  }, [])

  // 新規追加フォームの初期化（日本→中央アジア輸出の標準的な値を設定）
  const handleAddNew = () => {
    setEditingCountry({
      id: '',
      countryCode: '',
      countryName: '',
      currency: '',
      isActive: true,
      packagingMaterials: {
        smallBox: 150,          // 小箱（〜1kg商品用）
        mediumBox: 300,         // 中箱（1-5kg商品用）
        largeBox: 500,          // 大箱（5-10kg商品用）
        bubbleWrap: 80,         // プチプチ（1m²あたり）
        tape: 120,              // 梱包テープ（1巻）
        fragileStickers: 25,    // 壊れ物シール（1枚）
        customsDeclaration: 200 // 税関申告書作成費
      },
      taxes: {
        vatRate: 18.0,          // 標準VAT率（中央アジア平均）
        customsDutyRate: 10.0,  // 標準関税率（化粧品・日用品）
        importTaxRate: 5.0,     // 輸入税率
        environmentalTaxFlat: 300 // 環境税（固定額）
      },
      fees: {
        handlingFeeFlat: 800,     // 取扱手数料（1件あたり）
        administrativeFeeRate: 2.0, // 事務手数料率（商品価値の%）
        documentCreationFee: 1500,  // 書類作成費（インボイス、パッキングリスト等）
        inspectionFeeFlat: 600,     // 税関検査料
        brokerageFeeRate: 1.5       // 通関業者仲介手数料率
      },
      additional: {
        insuranceRate: 2.0,           // 国際輸送保険料率
        minimumInsuranceAmount: 1000, // 最低保険料
        storageFeePerDay: 200,        // 倉庫保管料（1日）
        translationFeePerDocument: 3000, // 書類翻訳料（1書類）
        certificationFee: 5000        // 原産地証明書等の認証料
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: 'admin'
    })
    setShowForm(true)
  }

  // 編集フォームの初期化
  const handleEdit = (country: CountrySpecificCosts) => {
    setEditingCountry({ ...country })
    setShowForm(true)
  }

  // フォームの保存
  const handleSave = () => {
    if (!editingCountry) return

    if (!editingCountry.countryName.trim() || !editingCountry.countryCode.trim()) {
      alert('国名と国コードは必須です')
      return
    }

    try {
      const settings = SettingsService.getSettings()
      let updatedCountries = [...(settings.fees.countrySpecificCosts || [])]

      if (editingCountry.id) {
        // 更新
        const index = updatedCountries.findIndex(c => c.id === editingCountry.id)
        if (index !== -1) {
          updatedCountries[index] = { ...editingCountry, updatedAt: new Date() }
        }
      } else {
        // 新規追加
        const newCountry = { 
          ...editingCountry, 
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
        updatedCountries.push(newCountry)
      }

      const success = SettingsService.updateSettings('fees', { 
        countrySpecificCosts: updatedCountries 
      })

      if (success) {
        loadData()
        setShowForm(false)
        setEditingCountry(null)
        alert(editingCountry.id ? '国別設定を更新しました' : '国別設定を追加しました')
      } else {
        alert('保存に失敗しました')
      }
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存中にエラーが発生しました')
    }
  }

  // 削除
  const handleDelete = (countryId: string) => {
    if (confirm('この国の設定を削除しますか？')) {
      try {
        const settings = SettingsService.getSettings()
        const updatedCountries = (settings.fees.countrySpecificCosts || [])
          .filter(c => c.id !== countryId)
        
        const success = SettingsService.updateSettings('fees', { 
          countrySpecificCosts: updatedCountries 
        })

        if (success) {
          loadData()
          alert('国別設定を削除しました')
        } else {
          alert('削除に失敗しました')
        }
      } catch (error) {
        console.error('削除エラー:', error)
        alert('削除中にエラーが発生しました')
      }
    }
  }

  // デフォルト国の変更
  const handleDefaultCountryChange = (countryCode: string) => {
    const success = SettingsService.updateSettings('fees', { defaultCountryCode: countryCode })
    if (success) {
      setDefaultCountryCode(countryCode)
      alert('デフォルト国を変更しました')
    } else {
      alert('変更に失敗しました')
    }
  }

  // アクティブ状態の切り替え
  const handleToggleActive = (countryId: string, isActive: boolean) => {
    try {
      const settings = SettingsService.getSettings()
      const updatedCountries = (settings.fees.countrySpecificCosts || []).map(c => 
        c.id === countryId ? { ...c, isActive, updatedAt: new Date() } : c
      )
      
      const success = SettingsService.updateSettings('fees', { 
        countrySpecificCosts: updatedCountries 
      })

      if (success) {
        loadData()
      } else {
        alert('変更に失敗しました')
      }
    } catch (error) {
      console.error('変更エラー:', error)
      alert('変更中にエラーが発生しました')
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
          <h1 className="text-3xl font-bold">国別コスト設定</h1>
          <p className="text-muted-foreground">国ごとの梱包材料費、税金、手数料などの詳細設定</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          新しい国を追加
        </button>
      </div>

      {/* デフォルト国設定 */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">デフォルト国</h3>
        <select
          value={defaultCountryCode}
          onChange={(e) => handleDefaultCountryChange(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-md"
        >
          <option value="">選択してください</option>
          {countries.filter(c => c.isActive).map(country => (
            <option key={country.id} value={country.countryCode}>
              {country.countryName} ({country.countryCode})
            </option>
          ))}
        </select>
      </div>

      {/* 国別設定一覧 */}
      <div className="bg-white border rounded-lg">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">国別設定一覧</h3>
        </div>
        <div className="divide-y">
          {countries.map((country) => (
            <div key={country.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${country.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <h4 className="font-semibold text-lg">{country.countryName}</h4>
                    <p className="text-muted-foreground">コード: {country.countryCode} / 通貨: {country.currency}</p>
                  </div>
                  {country.countryCode === defaultCountryCode && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      デフォルト
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(country.id, !country.isActive)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      country.isActive 
                        ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {country.isActive ? '無効化' : '有効化'}
                  </button>
                  <button
                    onClick={() => handleEdit(country)}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(country.id)}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>

              {/* コスト概要 */}
              <div className="ml-7 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <h5 className="font-medium text-sm mb-2">税金・関税</h5>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>VAT: {country.taxes.vatRate}%</div>
                    <div>関税: {country.taxes.customsDutyRate}%</div>
                    <div>輸入税: {country.taxes.importTaxRate}%</div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <h5 className="font-medium text-sm mb-2">梱包材料費</h5>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>小箱: {country.packagingMaterials.smallBox.toLocaleString()}円</div>
                    <div>中箱: {country.packagingMaterials.mediumBox.toLocaleString()}円</div>
                    <div>大箱: {country.packagingMaterials.largeBox.toLocaleString()}円</div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <h5 className="font-medium text-sm mb-2">手数料</h5>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>取扱手数料: {country.fees.handlingFeeFlat.toLocaleString()}円</div>
                    <div>書類作成費: {country.fees.documentCreationFee.toLocaleString()}円</div>
                    <div>検査料: {country.fees.inspectionFeeFlat.toLocaleString()}円</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {countries.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              国別設定が登録されていません
            </div>
          )}
        </div>
      </div>

      {/* 編集フォーム（モーダル風） */}
      {showForm && editingCountry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[95vh] overflow-y-auto m-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {editingCountry.id ? '国別設定を編集' : '新しい国を追加'}
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
                <h4 className="text-sm font-medium text-blue-800 mb-2">📋 日本からの輸出に必要な情報について</h4>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>• <strong>梱包材料費</strong>: 日本での梱包作業に必要な資材コスト</p>
                  <p>• <strong>税金・関税</strong>: 輸入国での税関手続きで発生する税金（VAT、関税、輸入税等）</p>
                  <p>• <strong>手数料</strong>: 通関業者、税関検査、書類作成等の手数料</p>
                  <p>• <strong>その他</strong>: 保険料、保管料、翻訳料、認証料等の追加コスト</p>
                </div>
              </div>

              {/* 基本情報 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">国名 *</label>
                  <input
                    type="text"
                    value={editingCountry.countryName}
                    onChange={(e) => setEditingCountry({ ...editingCountry, countryName: e.target.value })}
                    className="border rounded px-3 py-2 w-full"
                    placeholder="例: タジキスタン"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">輸出先国の正式名称</div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">国コード *</label>
                  <input
                    type="text"
                    value={editingCountry.countryCode}
                    onChange={(e) => setEditingCountry({ ...editingCountry, countryCode: e.target.value.toUpperCase() })}
                    className="border rounded px-3 py-2 w-full"
                    placeholder="例: TJ"
                    maxLength={2}
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">ISO 3166-1 alpha-2コード</div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">通貨コード</label>
                  <input
                    type="text"
                    value={editingCountry.currency}
                    onChange={(e) => setEditingCountry({ ...editingCountry, currency: e.target.value.toUpperCase() })}
                    className="border rounded px-3 py-2 w-full"
                    placeholder="例: TJS"
                    maxLength={3}
                  />
                  <div className="text-xs text-gray-500 mt-1">現地通貨（ISO 4217コード）</div>
                </div>
              </div>

              {/* 梱包材料費 */}
              <div>
                <h4 className="text-lg font-semibold mb-3">📦 梱包材料費 (円) - 日本での梱包作業費</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">小箱（〜1kg用）</label>
                    <input
                      type="number"
                      value={editingCountry.packagingMaterials.smallBox}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        packagingMaterials: { ...editingCountry.packagingMaterials, smallBox: Number(e.target.value) }
                      })}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">化粧品小物、アクセサリー等</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">中箱（1-5kg用）</label>
                    <input
                      type="number"
                      value={editingCountry.packagingMaterials.mediumBox}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        packagingMaterials: { ...editingCountry.packagingMaterials, mediumBox: Number(e.target.value) }
                      })}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">スキンケアセット、健康食品等</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">大箱（5-10kg用）</label>
                    <input
                      type="number"
                      value={editingCountry.packagingMaterials.largeBox}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        packagingMaterials: { ...editingCountry.packagingMaterials, largeBox: Number(e.target.value) }
                      })}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">大容量商品、複数商品セット等</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">プチプチ(1m²)</label>
                    <input
                      type="number"
                      value={editingCountry.packagingMaterials.bubbleWrap}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        packagingMaterials: { ...editingCountry.packagingMaterials, bubbleWrap: Number(e.target.value) }
                      })}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">衝撃保護材</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">梱包テープ(1巻)</label>
                    <input
                      type="number"
                      value={editingCountry.packagingMaterials.tape}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        packagingMaterials: { ...editingCountry.packagingMaterials, tape: Number(e.target.value) }
                      })}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">箱封止用</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">壊れ物シール(1枚)</label>
                    <input
                      type="number"
                      value={editingCountry.packagingMaterials.fragileStickers}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        packagingMaterials: { ...editingCountry.packagingMaterials, fragileStickers: Number(e.target.value) }
                      })}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">ガラス製品、精密機器等</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">税関申告書作成</label>
                    <input
                      type="number"
                      value={editingCountry.packagingMaterials.customsDeclaration}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        packagingMaterials: { ...editingCountry.packagingMaterials, customsDeclaration: Number(e.target.value) }
                      })}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">CN22/CN23作成・添付費用</div>
                  </div>
                </div>
              </div>

              {/* 税金・関税 */}
              <div>
                <h4 className="text-lg font-semibold mb-3">💰 税金・関税 - 輸入国での税関手続き費用</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">VAT率 (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingCountry.taxes.vatRate}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        taxes: { ...editingCountry.taxes, vatRate: Number(e.target.value) }
                      })}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">付加価値税（商品価値+関税に課税）</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">関税率 (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingCountry.taxes.customsDutyRate}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        taxes: { ...editingCountry.taxes, customsDutyRate: Number(e.target.value) }
                      })}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">HSコードに基づく関税（CIF価格に課税）</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">輸入税率 (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingCountry.taxes.importTaxRate}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        taxes: { ...editingCountry.taxes, importTaxRate: Number(e.target.value) }
                      })}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">特別輸入税（国により異なる）</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">環境税 (円)</label>
                    <input
                      type="number"
                      value={editingCountry.taxes.environmentalTaxFlat}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        taxes: { ...editingCountry.taxes, environmentalTaxFlat: Number(e.target.value) }
                      })}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">包装材・リサイクル関連税（固定額）</div>
                  </div>
                </div>
              </div>

              {/* 手数料 */}
              <div>
                <h4 className="text-lg font-semibold mb-3">📋 手数料 - 通関・手続き関連費用</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">取扱手数料 (円)</label>
                    <input
                      type="number"
                      value={editingCountry.fees.handlingFeeFlat}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        fees: { ...editingCountry.fees, handlingFeeFlat: Number(e.target.value) }
                      })}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">基本取扱手数料（1件あたり固定）</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">事務手数料率 (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingCountry.fees.administrativeFeeRate}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        fees: { ...editingCountry.fees, administrativeFeeRate: Number(e.target.value) }
                      })}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">事務処理費（商品価値に対する%）</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">書類作成費 (円)</label>
                    <input
                      type="number"
                      value={editingCountry.fees.documentCreationFee}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        fees: { ...editingCountry.fees, documentCreationFee: Number(e.target.value) }
                      })}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">インボイス・パッキングリスト作成</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">税関検査料 (円)</label>
                    <input
                      type="number"
                      value={editingCountry.fees.inspectionFeeFlat}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        fees: { ...editingCountry.fees, inspectionFeeFlat: Number(e.target.value) }
                      })}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">開梱検査・X線検査等</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">通関業者手数料率 (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingCountry.fees.brokerageFeeRate}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        fees: { ...editingCountry.fees, brokerageFeeRate: Number(e.target.value) }
                      })}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">現地通関業者への仲介手数料</div>
                  </div>
                </div>
              </div>

              {/* その他のコスト */}
              <div>
                <h4 className="text-lg font-semibold mb-3">🔧 その他のコスト - 付帯サービス・特殊手続き費用</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">国際輸送保険料率 (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingCountry.additional.insuranceRate}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        additional: { ...editingCountry.additional, insuranceRate: Number(e.target.value) }
                      })}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">CIF価格に対する保険料率</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">最低保険料 (円)</label>
                    <input
                      type="number"
                      value={editingCountry.additional.minimumInsuranceAmount}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        additional: { ...editingCountry.additional, minimumInsuranceAmount: Number(e.target.value) }
                      })}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">低額商品の最低保険料</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">倉庫保管料(日額・円)</label>
                    <input
                      type="number"
                      value={editingCountry.additional.storageFeePerDay}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        additional: { ...editingCountry.additional, storageFeePerDay: Number(e.target.value) }
                      })}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">現地倉庫・税関保管料</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">書類翻訳料(1通・円)</label>
                    <input
                      type="number"
                      value={editingCountry.additional.translationFeePerDocument}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        additional: { ...editingCountry.additional, translationFeePerDocument: Number(e.target.value) }
                      })}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">現地語への書類翻訳費用</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">各種認証料 (円)</label>
                    <input
                      type="number"
                      value={editingCountry.additional.certificationFee}
                      onChange={(e) => setEditingCountry({
                        ...editingCountry,
                        additional: { ...editingCountry.additional, certificationFee: Number(e.target.value) }
                      })}
                      className="border rounded px-3 py-2 w-full"
                    />
                    <div className="text-xs text-gray-500 mt-1">原産地証明書・品質証明書等</div>
                  </div>
                </div>
              </div>

              {/* アクティブ設定 */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingCountry.isActive}
                    onChange={(e) => setEditingCountry({ ...editingCountry, isActive: e.target.checked })}
                  />
                  <span className="text-sm font-medium">アクティブ</span>
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
                disabled={!editingCountry.countryName.trim() || !editingCountry.countryCode.trim()}
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