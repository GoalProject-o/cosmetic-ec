"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PricingInputs, PricingResult, calculatePricing, testFaceMaskCalculation } from '@/lib/pricing/calculator'
import { SettingsService } from '@/lib/settings/SettingsService'
import { ProductStorage } from '@/lib/storage/productStorage'
import { ProductCore, ProductPhysical, ProductPurchase, ProductListItem, CountryPricing } from '@/types'

interface PricingCalculatorProps {
  basicData: Partial<ProductCore>
  physicalData: Partial<ProductPhysical>
  purchaseData: Partial<ProductPurchase>
  onPricingResult: (result: PricingResult | null) => void
}

export function PricingCalculator({ 
  basicData, 
  physicalData, 
  purchaseData, 
  onPricingResult 
}: PricingCalculatorProps) {
  // 設定から初期利益率を取得
  const getDefaultProfitMargin = () => {
    try {
      const settings = SettingsService.getSettings()
      return settings.pricing.defaultProfitMargin
    } catch {
      return 30 // フォールバック
    }
  }

  const [inputs, setInputs] = useState<PricingInputs>({
    purchasePrice: purchaseData.purchasePrice || 0,
    weight: physicalData.weight || 0,
    dimensions: physicalData.dimensions,
    quantity: 1,
    profitMargin: getDefaultProfitMargin(),
    shippingMethod: 'international_parcel'
  })
  
  const [pricingResult, setPricingResult] = useState<PricingResult | null>(null)
  const [countryPricing, setCountryPricing] = useState<CountryPricing[]>([])
  const [selectedCountry, setSelectedCountry] = useState('TJ') // デフォルトはタジキスタン
  const [isCalculating, setIsCalculating] = useState(false)
  const [autoCalculate, setAutoCalculate] = useState(true)

  // 商品データが変更されたときに入力値を更新
  useEffect(() => {
    setInputs(prev => ({
      ...prev,
      purchasePrice: purchaseData.purchasePrice || prev.purchasePrice,
      weight: physicalData.weight || prev.weight,
      dimensions: physicalData.dimensions || prev.dimensions
    }))
  }, [purchaseData.purchasePrice, physicalData.weight, physicalData.dimensions])

  // 自動計算が有効で入力値が変更されたら再計算
  useEffect(() => {
    if (autoCalculate && inputs.purchasePrice > 0 && inputs.weight > 0) {
      handleCalculate()
    }
  }, [inputs, autoCalculate, selectedCountry]) // selectedCountryも依存関係に追加

  const handleInputChange = (field: keyof PricingInputs, value: any) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCalculate = async () => {
    if (!inputs.purchasePrice || !inputs.weight) {
      alert('仕入価格と重量を入力してください')
      return
    }

    setIsCalculating(true)
    
    try {
      // 少し遅延を入れてリアルタイム感を演出
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 新しい20kgパッケージベースの計算を使用
      const tempProduct: ProductListItem = {
        id: 'temp',
        sku: 'TEMP',
        name: basicData.name || { ja: 'テスト商品', ru: '', tg: '' },
        category: {
          id: 'temp',
          name: 'テスト',
          hsCode: '0000.00.00',
          tariffRate: 0
        },
        brand: basicData.brand || '',
        manufacturer: '',
        status: 'draft',
        purchasePrice: inputs.purchasePrice,
        weight: inputs.weight,
        images: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // 国別価格を計算
      const newCountryPricing = ProductStorage.calculateCountryPricing(tempProduct)
      setCountryPricing(newCountryPricing)
      
      // 選択された国の価格を取得（カスタム利益率適用）
      const selectedCountryData = newCountryPricing.find(cp => cp.countryCode === selectedCountry)
      
      if (selectedCountryData) {
        // ユーザー指定の利益率で価格を再計算
        const baseCost = selectedCountryData.calculatedPrice / (1 + selectedCountryData.profitMargin / 100) // 元のコスト逆算
        const customSellingPrice = Math.ceil(baseCost / (1 - inputs.profitMargin / 100)) // カスタム利益率適用
        
        // 新しい形式の結果を旧形式に変換
        const result: PricingResult = {
          inputs,
          breakdown: {
            itemCost: inputs.purchasePrice,
            domesticShipping: Math.ceil(inputs.purchasePrice * 0.03),
            internationalShipping: selectedCountryData.shippingCost,
            insurance: 0, // 計算結果に含まれる
            customsDuty: 0, // selectedCountryData.totalTaxesに含まれる
            vat: 0, // selectedCountryData.totalTaxesに含まれる
            handlingFee: 0, // 計算結果に含まれる
            totalTaxes: selectedCountryData.totalTaxes,
            totalCost: baseCost,
            profitMargin: inputs.profitMargin,
            profitAmount: customSellingPrice - baseCost,
            sellingPrice: customSellingPrice
          },
          volumeWeight: inputs.weight, // 簡略化
          applicableWeight: inputs.weight,
          recommendations: []
        }
        
        setPricingResult(result)
        onPricingResult(result)
      } else {
        // フォールバック：旧システム使用
        const result = calculatePricing(inputs)
        setPricingResult(result)
        onPricingResult(result)
      }
    } catch (error) {
      console.error('価格計算エラー:', error)
      alert('価格計算中にエラーが発生しました')
    } finally {
      setIsCalculating(false)
    }
  }

  const handleTestFaceMask = () => {
    const result = testFaceMaskCalculation()
    setInputs(result.inputs)
    setPricingResult(result)
    onPricingResult(result)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <CardTitle>価格計算</CardTitle>
        <div className="flex space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={handleTestFaceMask}
          >
            顔パック例で試す
          </Button>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={autoCalculate}
              onChange={(e) => setAutoCalculate(e.target.checked)}
              className="rounded"
            />
            <span>自動計算</span>
          </label>
        </div>
      </div>

      {/* 基本設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">計算設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                仕入価格 (円) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="660"
                value={inputs.purchasePrice || ''}
                onChange={(e) => handleInputChange('purchasePrice', Number(e.target.value))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                数量 <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                placeholder="1"
                value={inputs.quantity}
                onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                配送方法 <span className="text-red-500">*</span>
              </label>
              <select
                value={inputs.shippingMethod}
                onChange={(e) => handleInputChange('shippingMethod', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 bg-white"
              >
                <option value="international_parcel">国際小包 (7-21日) - 20kg/¥39,800</option>
                <option value="air">航空便 (7-10日)</option>
                <option value="sea">船便 (30-45日)</option>
                <option value="ems">EMS (5-7日)</option>
                <option value="dhl">DHL (3-5日)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                計算対象国
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 bg-white"
              >
                <option value="TJ">🇹🇯 タジキスタン</option>
                <option value="UZ">🇺🇿 ウズベキスタン</option>
                <option value="KZ">🇰🇿 カザフスタン</option>
              </select>
            </div>
          </div>

          {/* 利益率設定 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">
                利益率: {inputs.profitMargin}%
              </label>
              <span className="text-xs text-muted-foreground">
                設定デフォルト: {getDefaultProfitMargin()}%
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={inputs.profitMargin}
                onChange={(e) => handleInputChange('profitMargin', Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${inputs.profitMargin}%, #e5e7eb ${inputs.profitMargin}%, #e5e7eb 100%)`
                }}
              />
              <Input
                type="number"
                min="10"
                max="100"
                value={inputs.profitMargin}
                onChange={(e) => handleInputChange('profitMargin', Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 商品情報確認 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">商品情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">商品名:</span>
              <div className="font-medium">{basicData.name?.ja || '未入力'}</div>
            </div>
            <div>
              <span className="text-gray-600">重量:</span>
              <div className="font-medium">
                {Math.round((inputs.weight || 0) * 1000)} g 
                <span className="text-xs text-gray-500 ml-1">({inputs.weight} kg)</span>
              </div>
            </div>
            <div>
              <span className="text-gray-600">サイズ:</span>
              <div className="font-medium">
                {inputs.dimensions
                  ? `${inputs.dimensions.length} × ${inputs.dimensions.width} × ${inputs.dimensions.height} cm`
                  : '未入力'
                }
              </div>
            </div>
            <div>
              <span className="text-gray-600">容積重量:</span>
              <div className="font-medium">
                {Math.round((pricingResult?.volumeWeight || 0) * 1000)} g
                <span className="text-xs text-gray-500 ml-1">({(pricingResult?.volumeWeight || 0).toFixed(3)} kg)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 設定情報表示 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">適用設定値</CardTitle>
          <p className="text-sm text-muted-foreground">価格計算に使用される現在の設定値</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {(() => {
              try {
                const settings = SettingsService.getSettings()
                return (
                  <>
                    <div>
                      <span className="text-gray-600">デフォルト利益率:</span>
                      <div className="font-medium">{settings.pricing.defaultProfitMargin}%</div>
                    </div>
                    <div>
                      <span className="text-gray-600">容積重量係数:</span>
                      <div className="font-medium">÷ {settings.pricing.volumeWeightDivisor}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">端数処理:</span>
                      <div className="font-medium">
                        {settings.pricing.roundingRule === 'ceil' ? '切り上げ' : 
                         settings.pricing.roundingRule === 'floor' ? '切り捨て' : '四捨五入'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">USD/JPY レート:</span>
                      <div className="font-medium">¥{settings.exchange.rates.USDJPY}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">関税率:</span>
                      <div className="font-medium">{(settings.fees.international.customsDutyRate * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="text-gray-600">VAT率:</span>
                      <div className="font-medium">{(settings.fees.international.vatRate * 100).toFixed(1)}%</div>
                    </div>
                  </>
                )
              } catch {
                return (
                  <div className="col-span-2 text-center text-muted-foreground">
                    設定の読み込みに失敗しました
                  </div>
                )
              }
            })()}
          </div>
        </CardContent>
      </Card>

      {/* 20kgパッケージベース配送コスト計算詳細 */}
      {pricingResult && inputs.shippingMethod === 'international_parcel' && countryPricing.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">配送コスト詳細計算（20kgパッケージベース）</CardTitle>
            <p className="text-sm text-muted-foreground">ユーザー指定の正しい計算方式：20kgパッケージに入る個数で送料を按分</p>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              {(() => {
                const maxPackageWeight = 20 // kg
                const packageShippingCost = 39800 // 円
                const itemWeight = inputs.weight // kg
                const itemsPerPackage = Math.floor(maxPackageWeight / itemWeight)
                const shippingCostPerItem = Math.ceil(packageShippingCost / itemsPerPackage)
                
                return (
                  <>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">基準パッケージ:</span>
                        <div className="text-blue-900">20kg = ¥39,800</div>
                        <div className="text-blue-900">商品重量: {(itemWeight * 1000).toFixed(0)}g ({itemWeight}kg)</div>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">パッケージ容量:</span>
                        <div className="text-blue-900">
                          20kg ÷ {itemWeight}kg = {itemsPerPackage}個
                        </div>
                        <div className="text-blue-900 font-semibold">
                          1個あたり送料: ¥{shippingCostPerItem.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-blue-300">
                      <div className="text-center">
                        <span className="text-blue-700 font-medium">計算式: </span>
                        <span className="text-blue-900">
                          ¥39,800 ÷ {itemsPerPackage}個 = 
                        </span>
                        <span className="text-blue-900 font-bold text-lg ml-1">
                          ¥{shippingCostPerItem.toLocaleString()}/個
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 text-center mt-2">
                        ※ 20kgパッケージに入る商品個数で送料を按分する方式
                      </div>
                    </div>
                  </>
                )
              })()
              }
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 国別価格表示 */}
      {countryPricing.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">国別価格計算結果</CardTitle>
            <p className="text-sm text-muted-foreground">各国向けの税金・関税・送料込み価格（利益率{inputs.profitMargin}%適用）</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {countryPricing.map((country) => (
                <div 
                  key={country.countryCode} 
                  className={`p-4 border rounded-lg ${
                    selectedCountry === country.countryCode 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  } transition-colors cursor-pointer`}
                  onClick={() => setSelectedCountry(country.countryCode)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">
                      {country.countryCode === 'TJ' ? '🇹🇯' : 
                       country.countryCode === 'UZ' ? '🇺🇿' : 
                       country.countryCode === 'KZ' ? '🇰🇿' : '🌍'}
                    </span>
                    <span className="font-medium">{country.countryName}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ¥{country.calculatedPrice.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      送料¥{country.shippingCost.toLocaleString()} + 税¥{country.totalTaxes.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      利益率 {country.profitMargin}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 計算実行ボタン */}
      {!autoCalculate && (
        <div className="text-center">
          <Button 
            onClick={handleCalculate}
            disabled={isCalculating || !inputs.purchasePrice || !inputs.weight}
            className="w-full md:w-auto px-8"
          >
            {isCalculating ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                計算中...
              </div>
            ) : (
              '価格を計算'
            )}
          </Button>
        </div>
      )}

      {/* 計算結果プレビュー */}
      {pricingResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">計算結果プレビュー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">総コスト</div>
                <div className="text-xl font-bold text-blue-600">
                  ¥{Math.round(pricingResult.breakdown.totalCost).toLocaleString()}
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600">利益額</div>
                <div className="text-xl font-bold text-green-600">
                  ¥{Math.round(pricingResult.breakdown.profitAmount).toLocaleString()}
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600">販売価格</div>
                <div className="text-2xl font-bold text-purple-600">
                  ¥{Math.round(pricingResult.breakdown.sellingPrice).toLocaleString()}
                </div>
              </div>
            </div>
            
            {/* 顔パック例の表示 */}
            {inputs.purchasePrice === 660 && pricingResult && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center">
                  <span className="text-blue-600 font-medium">顔パック例の計算結果:</span>
                  <span className="ml-2 text-blue-800 font-bold">
                    ¥{Math.round(pricingResult.breakdown.sellingPrice).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}