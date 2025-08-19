"use client"

import { useState, useEffect } from 'react'
import { CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ProductCore } from '@/types'

interface ProductBasicFormProps {
  data: Partial<ProductCore>
  onChange: (data: Partial<ProductCore>) => void
}

interface ValidationErrors {
  [key: string]: string
}

// カテゴリーとHSコードのマッピング
const categoryHSMapping = {
  'cosmetics-skincare': { name: 'スキンケア', hsCode: '3304.99.00' },
  'cosmetics-makeup': { name: 'メイクアップ', hsCode: '3304.10.00' },
  'cosmetics-fragrance': { name: '香水・フレグランス', hsCode: '3303.00.00' },
  'health-supplements': { name: 'サプリメント', hsCode: '2106.90.92' },
  'health-medical': { name: '医薬品・医療機器', hsCode: '3006.70.00' },
  'food-snacks': { name: '食品・スナック', hsCode: '1905.90.45' },
  'beverages': { name: '飲料', hsCode: '2202.99.00' },
  'household': { name: '日用品', hsCode: '3401.11.00' }
}

export function ProductBasicForm({ data, onChange }: ProductBasicFormProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isValidating, setIsValidating] = useState(false)

  // リアルタイムバリデーション
  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'name.ja':
        if (!value || value.length < 2) return '商品名（日本語）は2文字以上で入力してください'
        if (value.length > 100) return '商品名は100文字以内で入力してください'
        return ''
      
      case 'name.ru':
        if (!value || value.length < 2) return 'ロシア語名は2文字以上で入力してください'
        if (value.length > 100) return 'ロシア語名は100文字以内で入力してください'
        return ''
      
      case 'sku':
        if (!value) return 'SKUは必須です'
        if (!/^[A-Z0-9-]{3,20}$/.test(value)) return 'SKUは3-20文字の英数字とハイフンで入力してください'
        return ''
      
      case 'hsCode':
        if (!value) return 'HSコードは必須です'
        if (!/^\d{4}\.\d{2}\.\d{2}$/.test(value)) return 'HSコードは0000.00.00の形式で入力してください'
        return ''
      
      case 'brand':
        if (!value) return 'ブランドは必須です'
        if (value.length > 50) return 'ブランド名は50文字以内で入力してください'
        return ''
      
      case 'manufacturer':
        if (!value) return '製造元は必須です'
        if (value.length > 50) return '製造元は50文字以内で入力してください'
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
      updatedData[parent as keyof ProductCore] = {
        ...(updatedData[parent as keyof ProductCore] as any),
        [child]: value
      }
    } else {
      updatedData[field as keyof ProductCore] = value
    }
    
    onChange(updatedData)
    
    // リアルタイムバリデーション
    setIsValidating(true)
    const error = validateField(field, value)
    setErrors(prev => ({
      ...prev,
      [field]: error
    }))
    
    setTimeout(() => setIsValidating(false), 300)
  }

  const handleCategoryChange = (categoryKey: string) => {
    const category = categoryHSMapping[categoryKey as keyof typeof categoryHSMapping]
    if (category) {
      handleInputChange('category', { name: category.name, hsCode: category.hsCode })
      handleInputChange('hsCode', category.hsCode)
    }
  }

  return (
    <div className="space-y-6">
      <CardTitle>基本情報</CardTitle>
      
      {/* SKUとステータス */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            SKU <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="PRD-001"
            value={data.sku || ''}
            onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase())}
            className={errors.sku ? 'border-red-500' : ''}
          />
          {errors.sku && (
            <p className="text-red-500 text-sm mt-1">{errors.sku}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">ステータス</label>
          <select
            value={data.status || 'draft'}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="draft">下書き</option>
            <option value="active">アクティブ</option>
            <option value="inactive">非アクティブ</option>
            <option value="discontinued">販売終了</option>
          </select>
        </div>
      </div>

      {/* 商品名 */}
      <div>
        <label className="block text-sm font-medium mb-1">
          商品名（日本語） <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="例: DHC オリーブオイル クレンジング"
          value={data.name?.ja || ''}
          onChange={(e) => handleInputChange('name.ja', e.target.value)}
          className={errors['name.ja'] ? 'border-red-500' : ''}
        />
        {errors['name.ja'] && (
          <p className="text-red-500 text-sm mt-1">{errors['name.ja']}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          商品名（ロシア語） <span className="text-red-500">*</span>
        </label>
        <Input
          placeholder="例: DHC Оливковое масло для снятия макияжа"
          value={data.name?.ru || ''}
          onChange={(e) => handleInputChange('name.ru', e.target.value)}
          className={errors['name.ru'] ? 'border-red-500' : ''}
        />
        {errors['name.ru'] && (
          <p className="text-red-500 text-sm mt-1">{errors['name.ru']}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">商品名（タジク語）</label>
        <Input
          placeholder="例: DHC равғани зайтун барои пок кардани макияж"
          value={data.name?.tg || ''}
          onChange={(e) => handleInputChange('name.tg', e.target.value)}
        />
      </div>

      {/* カテゴリーとHSコード */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            カテゴリー <span className="text-red-500">*</span>
          </label>
          <select
            value={data.category ? Object.keys(categoryHSMapping).find(key => 
              categoryHSMapping[key as keyof typeof categoryHSMapping].name === data.category?.name
            ) || '' : ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">カテゴリーを選択</option>
            {Object.entries(categoryHSMapping).map(([key, category]) => (
              <option key={key} value={key}>
                {category.name}
              </option>
            ))}
          </select>
          {data.category && (
            <p className="text-sm text-gray-600 mt-1">選択中: {data.category.name}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            HSコード <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="3304.99.00"
            value={data.hsCode || ''}
            onChange={(e) => handleInputChange('hsCode', e.target.value)}
            className={errors.hsCode ? 'border-red-500' : ''}
          />
          {errors.hsCode && (
            <p className="text-red-500 text-sm mt-1">{errors.hsCode}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">カテゴリー選択で自動設定されます</p>
        </div>
      </div>

      {/* ブランドと製造元 */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            ブランド <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="例: DHC"
            value={data.brand || ''}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            className={errors.brand ? 'border-red-500' : ''}
          />
          {errors.brand && (
            <p className="text-red-500 text-sm mt-1">{errors.brand}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            製造元 <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="例: 株式会社DHC"
            value={data.manufacturer || ''}
            onChange={(e) => handleInputChange('manufacturer', e.target.value)}
            className={errors.manufacturer ? 'border-red-500' : ''}
          />
          {errors.manufacturer && (
            <p className="text-red-500 text-sm mt-1">{errors.manufacturer}</p>
          )}
        </div>
      </div>

      {/* 商品説明 */}
      <div>
        <label className="block text-sm font-medium mb-1">商品説明（日本語）</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          placeholder="商品の特徴、効果、使用方法などを詳しく記載してください"
          value={data.description?.ja || ''}
          onChange={(e) => handleInputChange('description.ja', e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">商品説明（ロシア語）</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          placeholder="Подробное описание товара, характеристики, способ применения"
          value={data.description?.ru || ''}
          onChange={(e) => handleInputChange('description.ru', e.target.value)}
        />
      </div>

      {/* バリデーション状態表示 */}
      {isValidating && (
        <div className="text-sm text-blue-600 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          バリデーション中...
        </div>
      )}

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