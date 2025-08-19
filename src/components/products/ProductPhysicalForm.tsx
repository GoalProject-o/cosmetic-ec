"use client"

import { useState, useEffect } from 'react'
import { CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ProductPhysical } from '@/types'

interface ProductPhysicalFormProps {
  data: Partial<ProductPhysical>
  onChange: (data: Partial<ProductPhysical>) => void
}

interface ValidationErrors {
  [key: string]: string
}

export function ProductPhysicalForm({ data, onChange }: ProductPhysicalFormProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [volumeWeight, setVolumeWeight] = useState<number>(0)
  const [shippingWeight, setShippingWeight] = useState<number>(0)

  // 容積重量の計算 (長さ × 幅 × 高さ / 5000 for international shipping)
  const calculateVolumeWeight = (length: number, width: number, height: number): number => {
    if (length && width && height) {
      return (length * width * height) / 5000
    }
    return 0
  }

  // 適用重量の計算 (実重量と容積重量の大きい方)
  const calculateShippingWeight = (actualWeight: number, volumeWeight: number): number => {
    return Math.max(actualWeight, volumeWeight)
  }

  // バリデーション関数
  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'weight':
        if (!value || value <= 0) return '重量は0より大きい値を入力してください'
        if (value > 30) return '重量は30kg以下で入力してください'
        if (value < 0.001) return '重量は1g以上で入力してください'
        return ''
      
      case 'dimensions.length':
      case 'dimensions.width':
      case 'dimensions.height':
        if (!value || value <= 0) return 'サイズは0より大きい値を入力してください'
        if (value > 200) return 'サイズは200cm以下で入力してください'
        return ''
      
      case 'containerInfo.size':
        if (!value || value <= 0) return '容器サイズは0より大きい値を入力してください'
        if (value > 10000) return '容器サイズは10000ml以下で入力してください'
        return ''
      
      case 'containerInfo.alcoholContent':
        if (value !== undefined && value !== null) {
          if (value < 0 || value > 100) return 'アルコール含有率は0-100%で入力してください'
        }
        return ''
      
      default:
        return ''
    }
  }

  const handleInputChange = (field: string, value: any) => {
    // フィールドの値を更新
    const updatedData = { ...data }
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      if (parent === 'dimensions') {
        updatedData.dimensions = {
          ...(updatedData.dimensions || { length: 0, width: 0, height: 0 }),
          [child]: value
        }
      } else if (parent === 'containerInfo') {
        updatedData.containerInfo = {
          ...(updatedData.containerInfo || { material: 'plastic', size: 0, isDangerous: false }),
          [child]: value
        }
      }
    } else {
      updatedData[field as keyof ProductPhysical] = value
    }
    
    onChange(updatedData)
    
    // リアルタイムバリデーション
    const error = validateField(field, value)
    setErrors(prev => ({
      ...prev,
      [field]: error
    }))
  }

  // 重量とサイズが変更されたときに容積重量と適用重量を再計算
  useEffect(() => {
    const dims = data.dimensions
    if (dims) {
      const newVolumeWeight = calculateVolumeWeight(dims.length || 0, dims.width || 0, dims.height || 0)
      setVolumeWeight(newVolumeWeight)
      
      const newShippingWeight = calculateShippingWeight(data.weight || 0, newVolumeWeight)
      setShippingWeight(newShippingWeight)
      
      // 計算結果をデータに反映
      handleInputChange('volumeWeight', newVolumeWeight)
      handleInputChange('shippingWeight', newShippingWeight)
    }
  }, [data.weight, data.dimensions?.length, data.dimensions?.width, data.dimensions?.height])

  // アルコール含有率に基づく危険物判定
  useEffect(() => {
    if (data.containerInfo?.alcoholContent !== undefined) {
      const isDangerous = (data.containerInfo.alcoholContent || 0) > 24
      handleInputChange('containerInfo.isDangerous', isDangerous)
    }
  }, [data.containerInfo?.alcoholContent])

  return (
    <div className="space-y-6">{/* CardTitleは親コンポーネントで表示されるため削除 */}
      
      {/* 重量とサイズ */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            重量 (g) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            step="1"
            placeholder="50"
            value={data.weight ? Math.round(data.weight * 1000) : ''}
            onChange={(e) => handleInputChange('weight', Number(e.target.value) / 1000)}
            className={errors.weight ? 'border-red-500' : ''}
          />
          {errors.weight && (
            <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">実重量をグラムで入力してください（例：50g、100g）</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">容器材質</label>
          <select
            value={data.containerInfo?.material || 'plastic'}
            onChange={(e) => handleInputChange('containerInfo.material', e.target.value)}
            className="w-full border rounded-lg px-3 py-2 bg-white"
          >
            <option value="plastic">プラスチック</option>
            <option value="glass">ガラス</option>
            <option value="metal">金属</option>
            <option value="paper">紙</option>
          </select>
        </div>
      </div>

      {/* サイズ（長さ、幅、高さ）*/}
      <div>
        <label className="block text-sm font-medium mb-2">
          サイズ (cm) <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">長さ</label>
            <Input
              type="number"
              placeholder="10"
              value={data.dimensions?.length || ''}
              onChange={(e) => handleInputChange('dimensions.length', Number(e.target.value))}
              className={errors['dimensions.length'] ? 'border-red-500' : ''}
            />
            {errors['dimensions.length'] && (
              <p className="text-red-500 text-xs mt-1">{errors['dimensions.length']}</p>
            )}
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">幅</label>
            <Input
              type="number"
              placeholder="5"
              value={data.dimensions?.width || ''}
              onChange={(e) => handleInputChange('dimensions.width', Number(e.target.value))}
              className={errors['dimensions.width'] ? 'border-red-500' : ''}
            />
            {errors['dimensions.width'] && (
              <p className="text-red-500 text-xs mt-1">{errors['dimensions.width']}</p>
            )}
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">高さ</label>
            <Input
              type="number"
              placeholder="15"
              value={data.dimensions?.height || ''}
              onChange={(e) => handleInputChange('dimensions.height', Number(e.target.value))}
              className={errors['dimensions.height'] ? 'border-red-500' : ''}
            />
            {errors['dimensions.height'] && (
              <p className="text-red-500 text-xs mt-1">{errors['dimensions.height']}</p>
            )}
          </div>
        </div>
      </div>

      {/* 容積重量計算結果 */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="font-medium text-blue-800 mb-2">重量計算結果</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">実重量:</span>
            <div className="font-semibold">
              {Math.round((data.weight || 0) * 1000)} g
              <span className="text-xs text-gray-500 ml-1">({(data.weight || 0).toFixed(3)} kg)</span>
            </div>
          </div>
          <div>
            <span className="text-gray-600">容積重量:</span>
            <div className="font-semibold text-blue-600">
              {Math.round(volumeWeight * 1000)} g
              <span className="text-xs text-gray-500 ml-1">({volumeWeight.toFixed(3)} kg)</span>
            </div>
          </div>
          <div>
            <span className="text-gray-600">適用重量:</span>
            <div className="font-semibold text-green-600">
              {Math.round(shippingWeight * 1000)} g
              <span className="text-xs text-gray-500 ml-1">({shippingWeight.toFixed(3)} kg)</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          ※ 容積重量 = 長さ × 幅 × 高さ ÷ 5000、適用重量は実重量と容積重量の大きい方
        </p>
      </div>

      {/* 容器情報 */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            容器サイズ (ml) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="100"
            value={data.containerInfo?.size || ''}
            onChange={(e) => handleInputChange('containerInfo.size', Number(e.target.value))}
            className={errors['containerInfo.size'] ? 'border-red-500' : ''}
          />
          {errors['containerInfo.size'] && (
            <p className="text-red-500 text-sm mt-1">{errors['containerInfo.size']}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">アルコール含有率 (%)</label>
          <Input
            type="number"
            step="0.1"
            placeholder="0.0"
            value={data.containerInfo?.alcoholContent || ''}
            onChange={(e) => handleInputChange('containerInfo.alcoholContent', Number(e.target.value))}
            className={errors['containerInfo.alcoholContent'] ? 'border-red-500' : ''}
          />
          {errors['containerInfo.alcoholContent'] && (
            <p className="text-red-500 text-sm mt-1">{errors['containerInfo.alcoholContent']}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">化粧品、香水などの場合に入力</p>
        </div>
      </div>

      {/* 危険物判定結果 */}
      {data.containerInfo?.alcoholContent !== undefined && data.containerInfo?.alcoholContent > 0 && (
        <div className={`border rounded-md p-3 ${
          data.containerInfo?.isDangerous 
            ? 'bg-red-50 border-red-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center">
            <span className="font-medium mr-2">危険物判定:</span>
            {data.containerInfo?.isDangerous ? (
              <span className="text-red-600 font-semibold">危険物 (アルコール24%超)</span>
            ) : (
              <span className="text-green-600 font-semibold">非危険物</span>
            )}
          </div>
          {data.containerInfo?.isDangerous && (
            <p className="text-sm text-red-600 mt-1">
              航空便での配送に制限がかかる可能性があります
            </p>
          )}
        </div>
      )}

      {/* 保管要件 */}
      <div>
        <label className="block text-sm font-medium mb-2">保管要件</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={data.storageRequirements?.temperatureControl || false}
              onChange={(e) => handleInputChange('storageRequirements.temperatureControl', e.target.checked)}
            />
            <span className="ml-2 text-sm">温度管理が必要</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={data.storageRequirements?.humidity || false}
              onChange={(e) => handleInputChange('storageRequirements.humidity', e.target.checked)}
            />
            <span className="ml-2 text-sm">湿度管理が必要</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={data.storageRequirements?.lightProtection || false}
              onChange={(e) => handleInputChange('storageRequirements.lightProtection', e.target.checked)}
            />
            <span className="ml-2 text-sm">遮光が必要</span>
          </label>
        </div>
      </div>

      {/* 賞味期限・使用期限 */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">製品寿命 (ヶ月)</label>
          <Input
            type="number"
            placeholder="36"
            value={data.expiryInfo?.shelfLifeMonths || ''}
            onChange={(e) => handleInputChange('expiryInfo.shelfLifeMonths', Number(e.target.value))}
          />
          <p className="text-sm text-gray-500 mt-1">未開封時の保存期間</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">開封後の使用期限 (ヶ月)</label>
          <Input
            type="number"
            placeholder="12"
            value={data.expiryInfo?.afterOpeningMonths || ''}
            onChange={(e) => handleInputChange('expiryInfo.afterOpeningMonths', Number(e.target.value))}
          />
          <p className="text-sm text-gray-500 mt-1">開封後の使用期間</p>
        </div>
      </div>

      {/* エラー数表示 */}
      {Object.values(errors).filter(Boolean).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 font-medium">
            {Object.values(errors).filter(Boolean).length}件の入力エラーがあります
          </p>
        </div>
      )}
    </div>
  )
}