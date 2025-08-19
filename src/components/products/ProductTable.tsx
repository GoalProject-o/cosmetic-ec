"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ProductListItem, ProductFilter, ProductSort, Pagination } from '@/types/product'
import Link from 'next/link'

interface ProductTableProps {
  products: ProductListItem[]
  pagination: Pagination
  filter: ProductFilter
  sort: ProductSort
  selectedProducts: string[]
  onFilterChange: (filter: ProductFilter) => void
  onSortChange: (sort: ProductSort) => void
  onPageChange: (page: number) => void
  onSelectionChange: (productIds: string[]) => void
  onEdit: (productId: string) => void
  onDuplicate: (productId: string) => void
  onDelete: (productId: string) => void
}

export function ProductTable({
  products,
  pagination,
  filter,
  sort,
  selectedProducts,
  onFilterChange,
  onSortChange,
  onPageChange,
  onSelectionChange,
  onEdit,
  onDuplicate,
  onDelete
}: ProductTableProps) {
  const [showFilters, setShowFilters] = useState(false)

  // ステータス表示用の設定
  const statusConfig = {
    draft: { label: '下書き', color: 'text-gray-600 bg-gray-100' },
    active: { label: 'アクティブ', color: 'text-green-600 bg-green-100' },
    inactive: { label: '非アクティブ', color: 'text-yellow-600 bg-yellow-100' },
    discontinued: { label: '販売終了', color: 'text-red-600 bg-red-100' }
  }

  // 全選択/全解除
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(products.map(p => p.id))
    } else {
      onSelectionChange([])
    }
  }

  // 個別選択
  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedProducts, productId])
    } else {
      onSelectionChange(selectedProducts.filter(id => id !== productId))
    }
  }

  // ソート変更
  const handleSort = (field: ProductSort['field']) => {
    const newDirection = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc'
    onSortChange({ field, direction: newDirection })
  }

  // ソートアイコン
  const getSortIcon = (field: ProductSort['field']) => {
    if (sort.field !== field) return '↕'
    return sort.direction === 'asc' ? '↑' : '↓'
  }

  return (
    <div className="space-y-4">
      {/* 検索・フィルター */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>商品一覧</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                フィルター {showFilters ? '隠す' : '表示'}
              </Button>
              <Link href="/admin/products/register">
                <Button size="sm">新規商品登録</Button>
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* 基本検索 */}
          <div className="mb-4">
            <Input
              placeholder="商品名、SKU、ブランドで検索..."
              value={filter.search || ''}
              onChange={(e) => onFilterChange({ ...filter, search: e.target.value })}
              className="max-w-md"
            />
          </div>

          {/* 詳細フィルター */}
          {showFilters && (
            <div className="grid md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1">ステータス</label>
                <Select
                  value={filter.status || ''}
                  onChange={(e) => onFilterChange({ ...filter, status: e.target.value as any })}
                >
                  <option value="">全て</option>
                  <option value="draft">下書き</option>
                  <option value="active">アクティブ</option>
                  <option value="inactive">非アクティブ</option>
                  <option value="discontinued">販売終了</option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">カテゴリー</label>
                <Select
                  value={filter.category || ''}
                  onChange={(e) => onFilterChange({ ...filter, category: e.target.value })}
                >
                  <option value="">全て</option>
                  <option value="スキンケア">スキンケア</option>
                  <option value="メイクアップ">メイクアップ</option>
                  <option value="香水・フレグランス">香水・フレグランス</option>
                  <option value="サプリメント">サプリメント</option>
                  <option value="食品・スナック">食品・スナック</option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">ブランド</label>
                <Input
                  placeholder="ブランド名"
                  value={filter.brand || ''}
                  onChange={(e) => onFilterChange({ ...filter, brand: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">価格範囲</label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="最小"
                    value={filter.priceRange?.min || ''}
                    onChange={(e) => onFilterChange({
                      ...filter,
                      priceRange: {
                        min: Number(e.target.value) || 0,
                        max: filter.priceRange?.max || 999999
                      }
                    })}
                  />
                  <Input
                    type="number"
                    placeholder="最大"
                    value={filter.priceRange?.max || ''}
                    onChange={(e) => onFilterChange({
                      ...filter,
                      priceRange: {
                        min: filter.priceRange?.min || 0,
                        max: Number(e.target.value) || 999999
                      }
                    })}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 選択中の商品数と一括操作 */}
      {selectedProducts.length > 0 && (
        <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-md">
          <span className="text-blue-700">
            {selectedProducts.length}件の商品が選択されています
          </span>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              一括編集
            </Button>
            <Button size="sm" variant="outline">
              価格再計算
            </Button>
            <Button size="sm" variant="outline" className="text-red-600">
              削除
            </Button>
          </div>
        </div>
      )}

      {/* テーブル */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="p-3 text-left">
                    <input
                      type="checkbox"
                      checked={products.length > 0 && selectedProducts.length === products.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded"
                    />
                  </th>
                  <th className="p-3 text-left">画像</th>
                  <th 
                    className="p-3 text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    商品名 {getSortIcon('name')}
                  </th>
                  <th 
                    className="p-3 text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('category')}
                  >
                    カテゴリー {getSortIcon('category')}
                  </th>
                  <th 
                    className="p-3 text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('brand')}
                  >
                    ブランド {getSortIcon('brand')}
                  </th>
                  <th 
                    className="p-3 text-right cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('purchasePrice')}
                  >
                    仕入価格 {getSortIcon('purchasePrice')}
                  </th>
                  <th 
                    className="p-3 text-right cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('calculatedPrice')}
                  >
                    販売価格 {getSortIcon('calculatedPrice')}
                  </th>
                  <th className="p-3 text-center">ステータス</th>
                  <th 
                    className="p-3 text-left cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('updatedAt')}
                  >
                    更新日 {getSortIcon('updatedAt')}
                  </th>
                  <th className="p-3 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-gray-500">
                      商品が見つかりません。
                      <Link href="/admin/products/register" className="text-blue-600 hover:underline ml-2">
                        新規登録する
                      </Link>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                          className="rounded"
                        />
                      </td>
                      <td className="p-3">
                        {product.images.length > 0 ? (
                          <img
                            src={product.images[0].url}
                            alt={product.images[0].alt}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                            <span className="text-gray-400 text-xs">画像</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{product.name.ja}</div>
                          <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm">{product.category.name}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm">{product.brand}</span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="font-medium">¥{product.purchasePrice.toLocaleString()}</span>
                      </td>
                      <td className="p-3 text-right">
                        {product.calculatedPrice ? (
                          <div className="space-y-1">
                            <span className="font-medium text-green-600">
                              ¥{product.calculatedPrice.toLocaleString()}
                            </span>
                            {product.countryPricing && product.countryPricing.length > 0 && (
                              <div className="text-xs text-gray-500">
                                <div className="font-medium mb-1">国別価格 (税・送料込)</div>
                                <div className="max-h-20 overflow-y-auto space-y-1">
                                  {product.countryPricing.map((cp) => (
                                    <div key={cp.countryCode} className="flex justify-between items-center">
                                      <span className="font-medium text-blue-600">{cp.countryCode}:</span>
                                      <div className="text-right">
                                        <div className="font-medium">¥{cp.calculatedPrice.toLocaleString()}</div>
                                        <div className="text-xs text-gray-400">
                                          送料¥{cp.shippingCost.toLocaleString()} 税¥{cp.totalTaxes.toLocaleString()}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">未計算</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[product.status].color}`}>
                          {statusConfig[product.status].label}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-gray-500">
                          {product.updatedAt.toLocaleDateString('ja-JP')}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEdit(product.id)}
                          >
                            編集
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDuplicate(product.id)}
                          >
                            複製
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => onDelete(product.id)}
                          >
                            削除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ページネーション */}
      {pagination.totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                全{pagination.total}件中 {((pagination.page - 1) * pagination.limit) + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}件を表示
              </div>
              
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => onPageChange(pagination.page - 1)}
                >
                  前へ
                </Button>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === pagination.totalPages || 
                    Math.abs(page - pagination.page) <= 2
                  )
                  .map((page, index, array) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && array[index - 1] < page - 1 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <Button
                        size="sm"
                        variant={page === pagination.page ? "default" : "outline"}
                        onClick={() => onPageChange(page)}
                      >
                        {page}
                      </Button>
                    </div>
                  ))}
                
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => onPageChange(pagination.page + 1)}
                >
                  次へ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}