"use client"

import { useState, useRef } from 'react'

interface ImageUploaderProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  className?: string
}

export function ImageUploader({ 
  images, 
  onImagesChange, 
  maxImages = 10,
  className = "" 
}: ImageUploaderProps) {
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const remainingSlots = maxImages - images.length
    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    filesToProcess.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          if (result) {
            onImagesChange([...images, result])
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onImagesChange(newImages)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">商品画像</h3>
        <span className="text-sm text-gray-500">
          {images.length} / {maxImages} 枚
        </span>
      </div>

      {/* アップロードエリア */}
      {images.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-4xl text-gray-400 mb-2">📷</div>
          <p className="text-gray-600 mb-2">
            画像をドラッグ&ドロップまたはクリックして選択
          </p>
          <p className="text-xs text-gray-500">
            JPG, PNG, GIF形式 / 最大{maxImages}枚まで
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>
      )}

      {/* 画像プレビューグリッド */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square relative border rounded-lg overflow-hidden bg-gray-50">
                <img
                  src={image}
                  alt={`商品画像 ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* 画像操作ボタン */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    {index > 0 && (
                      <button
                        onClick={() => moveImage(index, index - 1)}
                        className="bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                        title="左に移動"
                      >
                        ←
                      </button>
                    )}
                    {index < images.length - 1 && (
                      <button
                        onClick={() => moveImage(index, index + 1)}
                        className="bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                        title="右に移動"
                      >
                        →
                      </button>
                    )}
                    <button
                      onClick={() => removeImage(index)}
                      className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                      title="削除"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* メイン画像インジケーター */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    メイン
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          商品画像が登録されていません
        </div>
      )}
    </div>
  )
}