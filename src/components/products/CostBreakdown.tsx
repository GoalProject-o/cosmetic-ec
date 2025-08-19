"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PricingResult, exportPricingResult } from '@/lib/pricing/calculator'

interface CostBreakdownProps {
  pricingResult: PricingResult | null
}

interface CostItem {
  name: string
  value: number
  percentage: number
  color: string
  category: 'cost' | 'tax' | 'fee' | 'profit'
}

export function CostBreakdown({ pricingResult }: CostBreakdownProps) {
  const [activeTab, setActiveTab] = useState<'breakdown' | 'comparison' | 'export'>('breakdown')

  if (!pricingResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>コスト詳細</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            価格計算を実行してください
          </div>
        </CardContent>
      </Card>
    )
  }

  const { breakdown } = pricingResult

  // コスト項目の定義
  const costItems: CostItem[] = [
    {
      name: '商品原価',
      value: breakdown.productCost,
      percentage: (breakdown.productCost / breakdown.sellingPrice) * 100,
      color: '#ef4444',
      category: 'cost'
    },
    {
      name: '国内配送',
      value: breakdown.domesticShipping,
      percentage: (breakdown.domesticShipping / breakdown.sellingPrice) * 100,
      color: '#f97316',
      category: 'cost'
    },
    {
      name: '梱包材料',
      value: breakdown.packingMaterials,
      percentage: (breakdown.packingMaterials / breakdown.sellingPrice) * 100,
      color: '#f59e0b',
      category: 'cost'
    },
    {
      name: '国際配送',
      value: breakdown.internationalShipping,
      percentage: (breakdown.internationalShipping / breakdown.sellingPrice) * 100,
      color: '#eab308',
      category: 'cost'
    },
    {
      name: '保険料',
      value: breakdown.insurance,
      percentage: (breakdown.insurance / breakdown.sellingPrice) * 100,
      color: '#84cc16',
      category: 'cost'
    },
    {
      name: '関税',
      value: breakdown.customsDuty,
      percentage: (breakdown.customsDuty / breakdown.sellingPrice) * 100,
      color: '#22c55e',
      category: 'tax'
    },
    {
      name: 'VAT',
      value: breakdown.vat,
      percentage: (breakdown.vat / breakdown.sellingPrice) * 100,
      color: '#10b981',
      category: 'tax'
    },
    {
      name: '通関手数料',
      value: breakdown.customsFee,
      percentage: (breakdown.customsFee / breakdown.sellingPrice) * 100,
      color: '#06b6d4',
      category: 'fee'
    },
    {
      name: '事務手数料',
      value: breakdown.processingFee,
      percentage: (breakdown.processingFee / breakdown.sellingPrice) * 100,
      color: '#0ea5e9',
      category: 'fee'
    },
    {
      name: '書類作成費',
      value: breakdown.documentFee,
      percentage: (breakdown.documentFee / breakdown.sellingPrice) * 100,
      color: '#3b82f6',
      category: 'fee'
    },
    {
      name: 'リスクバッファ',
      value: breakdown.riskBuffer,
      percentage: (breakdown.riskBuffer / breakdown.sellingPrice) * 100,
      color: '#6366f1',
      category: 'fee'
    },
    {
      name: '為替マージン',
      value: breakdown.exchangeMargin,
      percentage: (breakdown.exchangeMargin / breakdown.sellingPrice) * 100,
      color: '#8b5cf6',
      category: 'fee'
    },
    {
      name: '利益',
      value: breakdown.profitAmount,
      percentage: (breakdown.profitAmount / breakdown.sellingPrice) * 100,
      color: '#a855f7',
      category: 'profit'
    }
  ]

  // カテゴリー別集計
  const categoryTotals = {
    cost: costItems.filter(item => item.category === 'cost').reduce((sum, item) => sum + item.value, 0),
    tax: costItems.filter(item => item.category === 'tax').reduce((sum, item) => sum + item.value, 0),
    fee: costItems.filter(item => item.category === 'fee').reduce((sum, item) => sum + item.value, 0),
    profit: costItems.filter(item => item.category === 'profit').reduce((sum, item) => sum + item.value, 0)
  }

  const handleExportJSON = () => {
    const jsonData = exportPricingResult(pricingResult)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pricing-result-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopyJSON = () => {
    const jsonData = exportPricingResult(pricingResult)
    navigator.clipboard.writeText(jsonData).then(() => {
      alert('JSONデータをクリップボードにコピーしました')
    }).catch(() => {
      alert('クリップボードへのコピーに失敗しました')
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>コスト詳細分析</CardTitle>
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('breakdown')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'breakdown' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                内訳
              </button>
              <button
                onClick={() => setActiveTab('comparison')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'comparison' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                配送比較
              </button>
              <button
                onClick={() => setActiveTab('export')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'export' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                エクスポート
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {activeTab === 'breakdown' && (
            <div className="space-y-6">
              {/* 円グラフ風の表示 */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">コスト構成</h4>
                  <div className="space-y-2">
                    {costItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            ¥{Math.round(item.value).toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">カテゴリー別集計</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium text-red-700">基本コスト</span>
                      <span className="text-red-700 font-bold">
                        ¥{Math.round(categoryTotals.cost).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-green-700">関税・税金</span>
                      <span className="text-green-700 font-bold">
                        ¥{Math.round(categoryTotals.tax).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-blue-700">手数料</span>
                      <span className="text-blue-700 font-bold">
                        ¥{Math.round(categoryTotals.fee).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium text-purple-700">利益</span>
                      <span className="text-purple-700 font-bold">
                        ¥{Math.round(categoryTotals.profit).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* サマリー */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm text-gray-600">総コスト</div>
                    <div className="text-lg font-bold">
                      ¥{Math.round(breakdown.totalCost).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">利益率</div>
                    <div className="text-lg font-bold text-green-600">
                      {breakdown.profitMargin}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">販売価格</div>
                    <div className="text-xl font-bold text-blue-600">
                      ¥{Math.round(breakdown.sellingPrice).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comparison' && (
            <div className="space-y-4">
              <h4 className="font-medium">配送方法別価格比較</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">配送方法</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">配送料</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">配送日数</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">総価格</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">推奨</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingResult.shippingComparison.map((shipping, index) => (
                      <tr key={index} className={shipping.recommended ? 'bg-blue-50' : ''}>
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          {shipping.method}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right">
                          ¥{Math.round(shipping.cost).toLocaleString()}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {shipping.days}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-bold">
                          ¥{Math.round(shipping.totalPrice).toLocaleString()}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {shipping.recommended ? (
                            <span className="text-blue-600 font-bold">✓</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <h4 className="font-medium">計算結果のエクスポート</h4>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium mb-2">計算サマリー</h5>
                  <div className="text-sm space-y-1">
                    <div>計算日時: {pricingResult.timestamp.toLocaleString('ja-JP')}</div>
                    <div>商品重量: {pricingResult.inputs.weight} kg</div>
                    <div>容積重量: {pricingResult.volumeWeight.toFixed(3)} kg</div>
                    <div>適用重量: {pricingResult.applicableWeight.toFixed(3)} kg</div>
                    <div>配送方法: {pricingResult.inputs.shippingMethod}</div>
                    <div>利益率: {pricingResult.inputs.profitMargin}%</div>
                    <div>最終価格: ¥{Math.round(breakdown.sellingPrice).toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={handleExportJSON}
                    className="flex-1"
                  >
                    JSONファイルでダウンロード
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleCopyJSON}
                    className="flex-1"
                  >
                    JSONをクリップボードにコピー
                  </Button>
                </div>

                <div className="text-xs text-gray-500">
                  ※ エクスポートされるJSONには計算の詳細情報がすべて含まれます
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}