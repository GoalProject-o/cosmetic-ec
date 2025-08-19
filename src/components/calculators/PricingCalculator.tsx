"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { PricingResult, ShippingOption, VolumePricing } from '@/types'

interface PricingInputs {
  purchasePrice: number
  weight: number
  shippingMethod: string
  profitMargin: number
  quantity: number
}

export function PricingCalculator() {
  const [inputs, setInputs] = useState<PricingInputs>({
    purchasePrice: 0,
    weight: 0,
    shippingMethod: 'standard',
    profitMargin: 30,
    quantity: 1
  })

  const [result, setResult] = useState<PricingResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const calculatePrice = async () => {
    setIsCalculating(true)
    
    // モックの価格計算ロジック
    const domesticShipping = inputs.weight * 500
    const internationalShipping = inputs.weight * 1200 + inputs.quantity * 300
    const insurance = inputs.purchasePrice * 0.01
    const customsDuty = inputs.purchasePrice * 0.05
    const vat = (inputs.purchasePrice + customsDuty) * 0.12
    const processingFee = 2000
    const documentFee = 1500
    const riskBuffer = inputs.purchasePrice * 0.03
    const exchangeMargin = inputs.purchasePrice * 0.02
    
    const totalCost = inputs.purchasePrice + 
                     domesticShipping + 
                     internationalShipping + 
                     insurance + 
                     customsDuty + 
                     vat + 
                     processingFee + 
                     documentFee + 
                     riskBuffer + 
                     exchangeMargin

    const profitAmount = totalCost * (inputs.profitMargin / 100)
    const sellingPrice = totalCost + profitAmount

    const mockResult: PricingResult = {
      productId: 'mock-product',
      calculationId: `calc-${Date.now()}`,
      timestamp: new Date(),
      inputs,
      breakdown: {
        productCost: inputs.purchasePrice,
        domesticShipping,
        packingMaterials: 200,
        internationalShipping,
        insurance,
        cifPrice: inputs.purchasePrice + domesticShipping + internationalShipping,
        customsDuty,
        vat,
        customsFee: 500,
        processingFee,
        documentFee,
        riskBuffer,
        exchangeMargin,
        totalCost,
        profitAmount,
        sellingPrice: Math.round(sellingPrice)
      },
      shippingComparison: [
        {
          carrierId: 'ems',
          serviceId: 'standard',
          cost: internationalShipping,
          deliveryDays: '7-10',
          totalPrice: sellingPrice,
          recommended: true
        }
      ],
      volumePricing: [
        {
          minQuantity: 1,
          maxQuantity: 9,
          unitPrice: sellingPrice,
          totalPrice: sellingPrice * inputs.quantity,
          discountRate: 0
        },
        {
          minQuantity: 10,
          maxQuantity: 49,
          unitPrice: sellingPrice * 0.95,
          totalPrice: sellingPrice * 0.95 * inputs.quantity,
          discountRate: 5
        },
        {
          minQuantity: 50,
          maxQuantity: 999,
          unitPrice: sellingPrice * 0.9,
          totalPrice: sellingPrice * 0.9 * inputs.quantity,
          discountRate: 10
        }
      ],
      isActive: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24時間後
    }

    setTimeout(() => {
      setResult(mockResult)
      setIsCalculating(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* 入力フォーム */}
      <Card>
        <CardHeader>
          <CardTitle>価格計算パラメータ</CardTitle>
          <CardDescription>計算に必要な情報を入力してください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">仕入価格 (円)</label>
              <Input 
                type="number" 
                placeholder="1500" 
                value={inputs.purchasePrice || ''}
                onChange={(e) => setInputs(prev => ({ 
                  ...prev, 
                  purchasePrice: Number(e.target.value) 
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">重量 (kg)</label>
              <Input 
                type="number" 
                step="0.01"
                placeholder="0.5" 
                value={inputs.weight || ''}
                onChange={(e) => setInputs(prev => ({ 
                  ...prev, 
                  weight: Number(e.target.value) 
                }))}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">配送方法</label>
              <Select 
                value={inputs.shippingMethod}
                onChange={(e) => setInputs(prev => ({ 
                  ...prev, 
                  shippingMethod: e.target.value 
                }))}
              >
                <option value="standard">標準配送</option>
                <option value="express">速達配送</option>
                <option value="economy">エコノミー配送</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">利益率 (%)</label>
              <Input 
                type="number" 
                placeholder="30" 
                value={inputs.profitMargin || ''}
                onChange={(e) => setInputs(prev => ({ 
                  ...prev, 
                  profitMargin: Number(e.target.value) 
                }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">計算数量</label>
            <Input 
              type="number" 
              placeholder="1" 
              value={inputs.quantity || ''}
              onChange={(e) => setInputs(prev => ({ 
                ...prev, 
                quantity: Number(e.target.value) 
              }))}
            />
          </div>

          <Button 
            onClick={calculatePrice} 
            disabled={isCalculating || !inputs.purchasePrice || !inputs.weight}
            className="w-full"
          >
            {isCalculating ? '計算中...' : '価格を計算'}
          </Button>
        </CardContent>
      </Card>

      {/* 計算結果 */}
      {result && (
        <div className="space-y-6">
          {/* 価格内訳 */}
          <Card>
            <CardHeader>
              <CardTitle>価格内訳</CardTitle>
              <CardDescription>詳細なコスト構成</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>商品原価</span>
                  <span>¥{result.breakdown.productCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>国内配送費</span>
                  <span>¥{result.breakdown.domesticShipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>国際配送費</span>
                  <span>¥{result.breakdown.internationalShipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>保険料</span>
                  <span>¥{result.breakdown.insurance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>関税</span>
                  <span>¥{result.breakdown.customsDuty.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT</span>
                  <span>¥{result.breakdown.vat.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>処理手数料</span>
                  <span>¥{result.breakdown.processingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>書類手数料</span>
                  <span>¥{result.breakdown.documentFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>リスクバッファー</span>
                  <span>¥{result.breakdown.riskBuffer.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>為替マージン</span>
                  <span>¥{result.breakdown.exchangeMargin.toLocaleString()}</span>
                </div>
                <hr />
                <div className="flex justify-between font-medium">
                  <span>総コスト</span>
                  <span>¥{result.breakdown.totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>利益 ({inputs.profitMargin}%)</span>
                  <span>¥{result.breakdown.profitAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>販売価格</span>
                  <span>¥{result.breakdown.sellingPrice.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ボリューム価格 */}
          <Card>
            <CardHeader>
              <CardTitle>ボリューム価格表</CardTitle>
              <CardDescription>数量別の価格設定</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.volumePricing.map((pricing, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                    <span className="text-sm">
                      {pricing.minQuantity}-{pricing.maxQuantity === 999 ? '∞' : pricing.maxQuantity}個
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        ¥{pricing.unitPrice.toLocaleString()}/個
                      </div>
                      {pricing.discountRate > 0 && (
                        <div className="text-xs text-green-600">
                          {pricing.discountRate}% OFF
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}