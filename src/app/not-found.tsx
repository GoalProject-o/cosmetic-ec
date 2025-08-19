"use client"

import Link from 'next/link'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-8">
          <div className="text-8xl font-bold text-indigo-600 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            ページが見つかりません
          </h1>
          <p className="text-gray-600">
            お探しのページは存在しないか、移動された可能性があります。
          </p>
        </div>

        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-flex items-center justify-center space-x-2 w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Home className="h-5 w-5" />
            <span>ホームに戻る</span>
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center space-x-2 w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>前のページに戻る</span>
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            以下のページから目的のコンテンツを探してください：
          </p>
          <div className="grid grid-cols-1 gap-2">
            <Link 
              href="/admin"
              className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
            >
              管理者ページ
            </Link>
            <Link 
              href="/admin/dashboard"
              className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
            >
              ダッシュボード
            </Link>
            <Link 
              href="/admin/reports"
              className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
            >
              レポート
            </Link>
            <Link 
              href="/admin/products"
              className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
            >
              商品管理
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}