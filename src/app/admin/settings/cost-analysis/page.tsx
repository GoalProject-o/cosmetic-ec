"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SettingsService } from '@/lib/settings/SettingsService'
import { ProductStorage } from '@/lib/storage/productStorage'
import { CountrySpecificCosts } from '@/types/settings'
import { ProductListItem } from '@/types/product'

interface CostAnalysisData {
  country: CountrySpecificCosts
  totalPackaging: number
  totalTaxes: number
  totalFees: number
  totalAdditional: number
  grandTotal: number
  shippingDetails?: {
    itemsPerPackage: number
    shippingCostPerItem: number
    packageMaterialCost: number
    packagingCostPerItem: number
  }
  comparisonData?: {
    percentage: number
    isHigher: boolean
    comparedTo: string
  }
}

export default function CostAnalysisPage() {
  const router = useRouter()
  const [countries, setCountries] = useState<CountrySpecificCosts[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [analysisData, setAnalysisData] = useState<CostAnalysisData[]>([])
  const [loading, setLoading] = useState(true)
  const [sampleValues, setSampleValues] = useState({
    productValue: 1000, // 商品仕入価格（円）
    weight: 0.4, // 重量（kg） - 400gの例
    boxSize: 'mediumBox', // 箱サイズ
    fragileItems: 1, // 壊れ物シールの枚数
    documentsCount: 2, // 書類数
    storageDays: 3 // 保管日数
  })

  // データの読み込み
  useEffect(() => {
    setLoading(true)
    try {
      const settings = SettingsService.getSettings()
      const countryData = settings.fees.countrySpecificCosts || []
      setCountries(countryData)
      
      // デフォルトで最初の3つの国を選択
      const defaultSelected = countryData.slice(0, 3).map(c => c.id)
      setSelectedCountries(defaultSelected)
    } catch (error) {
      console.error('国別設定の読み込みに失敗:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // コスト分析の計算（20kgパッケージベースシステム使用）
  useEffect(() => {
    if (selectedCountries.length === 0 || countries.length === 0) return

    const analysisResults: CostAnalysisData[] = selectedCountries.map(countryId => {
      const country = countries.find(c => c.id === countryId)
      if (!country) return null

      // サンプル商品を作成
      const sampleProduct: ProductListItem = {
        id: 'sample-analysis',
        sku: 'SAMPLE-001',
        name: { ja: 'コスト分析サンプル', ru: '', tg: '' },
        category: {
          id: 'cosmetics',
          name: '化粧品',
          hsCode: '3304.99.00',
          tariffRate: 8
        },
        brand: 'サンプル',
        manufacturer: 'テスト',
        status: 'active',
        purchasePrice: sampleValues.productValue,
        weight: sampleValues.weight,
        images: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // 20kgパッケージベースの国別価格計算を使用
      const countryPricings = ProductStorage.calculateCountryPricing(sampleProduct)
      const targetCountryPricing = countryPricings.find(cp => cp.countryCode === country.countryCode)

      if (targetCountryPricing) {
        // 20kgパッケージベースの計算結果を使用
        const maxPackageWeight = 20 // kg
        const packageShippingCost = 39800 // 円
        const itemsPerPackage = Math.floor(maxPackageWeight / sampleValues.weight)
        const shippingCostPerItem = Math.ceil(packageShippingCost / itemsPerPackage)
        
        // 梱包費用はパッケージ単位で計算して按分
        const packageMaterialCost = (
          (country.packagingMaterials?.[sampleValues.boxSize as keyof typeof country.packagingMaterials] || 300) +
          ((country.packagingMaterials?.bubbleWrap || 50) * 2) +
          ((country.packagingMaterials?.tape || 30) * 3) +
          ((country.packagingMaterials?.fragileStickers || 20) * sampleValues.fragileItems) +
          (country.packagingMaterials?.customsDeclaration || 100)
        )
        const packagingCostPerItem = Math.ceil(packageMaterialCost / itemsPerPackage)

        return {
          country,
          totalPackaging: packagingCostPerItem,
          totalTaxes: targetCountryPricing.totalTaxes,
          totalFees: 0, // 手数料は税金に含まれる
          totalAdditional: 0, // その他の費用も税金に含まれる
          grandTotal: targetCountryPricing.calculatedPrice,
          shippingDetails: {
            itemsPerPackage,
            shippingCostPerItem,
            packageMaterialCost,
            packagingCostPerItem
          }
        }
      } else {
        // フォールバック：旧システム
        const packagingCost = 
          (country.packagingMaterials?.[sampleValues.boxSize as keyof typeof country.packagingMaterials] || 0) +
          ((country.packagingMaterials?.bubbleWrap || 0) * 0.5) +
          (country.packagingMaterials?.tape || 0) +
          ((country.packagingMaterials?.fragileStickers || 0) * sampleValues.fragileItems) +
          (country.packagingMaterials?.customsDeclaration || 0)

        const taxesCost = 
          (sampleValues.productValue * (country.taxes?.vatRate || 0) / 100) +
          (sampleValues.productValue * (country.taxes?.customsDutyRate || 0) / 100) +
          (sampleValues.productValue * (country.taxes?.importTaxRate || 0) / 100) +
          (country.taxes?.environmentalTaxFlat || 0)

        const feesCost = 
          (country.fees?.handlingFeeFlat || 0) +
          (sampleValues.productValue * (country.fees?.administrativeFeeRate || 0) / 100) +
          (country.fees?.documentCreationFee || 0) +
          (country.fees?.inspectionFeeFlat || 0) +
          (sampleValues.productValue * (country.fees?.brokerageFeeRate || 0) / 100)

        const additionalCost = 
          Math.max((sampleValues.productValue * (country.additional?.insuranceRate || 0) / 100), (country.additional?.minimumInsuranceAmount || 0)) +
          ((country.additional?.storageFeePerDay || 0) * sampleValues.storageDays) +
          ((country.additional?.translationFeePerDocument || 0) * sampleValues.documentsCount) +
          (country.additional?.certificationFee || 0)

        return {
          country,
          totalPackaging: packagingCost,
          totalTaxes: taxesCost,
          totalFees: feesCost,
          totalAdditional: additionalCost,
          grandTotal: packagingCost + taxesCost + feesCost + additionalCost
        }
      }
    }).filter(Boolean) as CostAnalysisData[]

    // 比較データの追加（最低コストと比較）
    if (analysisResults.length > 1) {
      const minCost = Math.min(...analysisResults.map(r => r.grandTotal))
      analysisResults.forEach(result => {
        if (result.grandTotal > minCost) {
          const diff = ((result.grandTotal - minCost) / minCost) * 100
          result.comparisonData = {
            percentage: diff,
            isHigher: true,
            comparedTo: '最低コスト'
          }
        }
      })
    }

    setAnalysisData(analysisResults)
  }, [selectedCountries, countries, sampleValues])

  // 国の選択切り替え
  const handleCountryToggle = (countryId: string) => {
    setSelectedCountries(prev => 
      prev.includes(countryId) 
        ? prev.filter(id => id !== countryId)
        : [...prev, countryId]
    )
  }

  // CSVエクスポート
  const handleExportCSV = () => {
    const headers = [
      '国名', '国コード', '梱包材料費', '税金・関税', '手数料', 'その他コスト', '合計コスト'
    ]
    
    const csvContent = [
      headers.join(','),
      ...analysisData.map(data => [
        data.country.countryName,
        data.country.countryCode,
        data.totalPackaging,
        data.totalTaxes,
        data.totalFees,
        data.totalAdditional,
        data.grandTotal
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `cost-analysis-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
          <h1 className="text-3xl font-bold">コスト詳細分析</h1>
          <p className="text-muted-foreground">国別のコスト構造を詳細に分析・比較します</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={analysisData.length === 0}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
        >
          CSVエクスポート
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左サイドバー: 設定パネル */}
        <div className="space-y-4">
          {/* サンプル値設定 */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">分析パラメータ</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">商品価値 (円)</label>
                <input
                  type="number"
                  value={sampleValues.productValue}
                  onChange={(e) => setSampleValues(prev => ({ ...prev, productValue: Number(e.target.value) }))}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">重量 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={sampleValues.weight}
                  onChange={(e) => setSampleValues(prev => ({ ...prev, weight: Number(e.target.value) }))}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">箱サイズ</label>
                <select
                  value={sampleValues.boxSize}
                  onChange={(e) => setSampleValues(prev => ({ ...prev, boxSize: e.target.value }))}
                  className="border rounded px-3 py-2 w-full"
                >
                  <option value="smallBox">小箱</option>
                  <option value="mediumBox">中箱</option>
                  <option value="largeBox">大箱</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">壊れ物シール枚数</label>
                <input
                  type="number"
                  min="0"
                  value={sampleValues.fragileItems}
                  onChange={(e) => setSampleValues(prev => ({ ...prev, fragileItems: Number(e.target.value) }))}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">書類数</label>
                <input
                  type="number"
                  min="1"
                  value={sampleValues.documentsCount}
                  onChange={(e) => setSampleValues(prev => ({ ...prev, documentsCount: Number(e.target.value) }))}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">保管日数</label>
                <input
                  type="number"
                  min="0"
                  value={sampleValues.storageDays}
                  onChange={(e) => setSampleValues(prev => ({ ...prev, storageDays: Number(e.target.value) }))}
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
            </div>
          </div>

          {/* 国選択 */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">比較対象国 ({selectedCountries.length})</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {countries.map(country => (
                <label key={country.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedCountries.includes(country.id)}
                    onChange={() => handleCountryToggle(country.id)}
                    disabled={!country.isActive}
                  />
                  <span className={`text-sm ${!country.isActive ? 'text-gray-400' : ''}`}>
                    {country.countryName} ({country.countryCode})
                  </span>
                  {!country.isActive && (
                    <span className="text-xs text-gray-400">非アクティブ</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* メインコンテンツ: 分析結果 */}
        <div className="lg:col-span-2 space-y-4">
          {/* サマリーカード */}
          {analysisData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">最低総コスト</div>
                <div className="text-2xl font-bold text-blue-600">
                  ¥{Math.min(...analysisData.map(d => d.grandTotal)).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {analysisData.find(d => d.grandTotal === Math.min(...analysisData.map(a => a.grandTotal)))?.country.countryName}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">最高総コスト</div>
                <div className="text-2xl font-bold text-red-600">
                  ¥{Math.max(...analysisData.map(d => d.grandTotal)).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {analysisData.find(d => d.grandTotal === Math.max(...analysisData.map(a => a.grandTotal)))?.country.countryName}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">コスト差</div>
                <div className="text-2xl font-bold text-green-600">
                  ¥{(Math.max(...analysisData.map(d => d.grandTotal)) - Math.min(...analysisData.map(d => d.grandTotal))).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {((Math.max(...analysisData.map(d => d.grandTotal)) - Math.min(...analysisData.map(d => d.grandTotal))) / Math.min(...analysisData.map(d => d.grandTotal)) * 100).toFixed(1)}% 差
                </div>
              </div>
            </div>
          )}

          {/* 詳細分析テーブル */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">コスト詳細比較</h3>
            </div>
            {analysisData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">国</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">梱包材料</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">税金・関税</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">手数料</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">その他</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">合計</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">比較</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analysisData.map((data, index) => (
                      <tr key={data.country.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{data.country.countryName}</div>
                          <div className="text-sm text-gray-500">{data.country.countryCode}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          ¥{data.totalPackaging.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          ¥{data.totalTaxes.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          ¥{data.totalFees.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          ¥{data.totalAdditional.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-semibold">
                          ¥{data.grandTotal.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                          {data.comparisonData ? (
                            <span className="text-red-600">
                              +{data.comparisonData.percentage.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-green-600">最低</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                比較対象国を選択してください
              </div>
            )}
          </div>

          {/* 詳細内訳 */}
          {analysisData.length > 0 && (
            <div className="space-y-4">
              {analysisData.map(data => (
                <div key={data.country.id} className="bg-white border rounded-lg p-6">
                  <h4 className="text-lg font-semibold mb-4">
                    {data.country.countryName} 詳細内訳
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      (合計: ¥{data.grandTotal.toLocaleString()})
                    </span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm text-blue-600">梱包材料費 (¥{data.totalPackaging.toLocaleString()})</h5>
                      <div className="text-xs space-y-1">
                        <div>箱: ¥{(data.country.packagingMaterials?.[sampleValues.boxSize as keyof typeof data.country.packagingMaterials] || 0).toLocaleString()}</div>
                        <div>プチプチ: ¥{((data.country.packagingMaterials?.bubbleWrap || 0) * 0.5).toLocaleString()}</div>
                        <div>テープ: ¥{(data.country.packagingMaterials?.tape || 0).toLocaleString()}</div>
                        <div>シール: ¥{((data.country.packagingMaterials?.fragileStickers || 0) * sampleValues.fragileItems).toLocaleString()}</div>
                        <div>申告書: ¥{(data.country.packagingMaterials?.customsDeclaration || 0).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm text-red-600">税金・関税 (¥{data.totalTaxes.toLocaleString()})</h5>
                      <div className="text-xs space-y-1">
                        <div>VAT: ¥{(sampleValues.productValue * (data.country.taxes?.vatRate || 0) / 100).toLocaleString()}</div>
                        <div>関税: ¥{(sampleValues.productValue * (data.country.taxes?.customsDutyRate || 0) / 100).toLocaleString()}</div>
                        <div>輸入税: ¥{(sampleValues.productValue * (data.country.taxes?.importTaxRate || 0) / 100).toLocaleString()}</div>
                        <div>環境税: ¥{(data.country.taxes?.environmentalTaxFlat || 0).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm text-purple-600">手数料 (¥{data.totalFees.toLocaleString()})</h5>
                      <div className="text-xs space-y-1">
                        <div>取扱: ¥{(data.country.fees?.handlingFeeFlat || 0).toLocaleString()}</div>
                        <div>事務: ¥{(sampleValues.productValue * (data.country.fees?.administrativeFeeRate || 0) / 100).toLocaleString()}</div>
                        <div>書類: ¥{(data.country.fees?.documentCreationFee || 0).toLocaleString()}</div>
                        <div>検査: ¥{(data.country.fees?.inspectionFeeFlat || 0).toLocaleString()}</div>
                        <div>仲介: ¥{(sampleValues.productValue * (data.country.fees?.brokerageFeeRate || 0) / 100).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm text-green-600">その他 (¥{data.totalAdditional.toLocaleString()})</h5>
                      <div className="text-xs space-y-1">
                        <div>保険: ¥{Math.max((sampleValues.productValue * (data.country.additional?.insuranceRate || 0) / 100), (data.country.additional?.minimumInsuranceAmount || 0)).toLocaleString()}</div>
                        <div>保管: ¥{((data.country.additional?.storageFeePerDay || 0) * sampleValues.storageDays).toLocaleString()}</div>
                        <div>翻訳: ¥{((data.country.additional?.translationFeePerDocument || 0) * sampleValues.documentsCount).toLocaleString()}</div>
                        <div>認証: ¥{(data.country.additional?.certificationFee || 0).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}