"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TajikistanHomePage() {
  const router = useRouter()

  useEffect(() => {
    // 自動的にダッシュボードにリダイレクト
    // 実際の実装では、認証状態をチェックしてログインページに送るかダッシュボードに送るかを決める
    router.push('/country/tajikistan/dashboard')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-6xl mb-4">🇹🇯</div>
        <h1 className="text-2xl font-bold mb-2">タジキスタン管理システム</h1>
        <p className="text-gray-600 mb-4">Системаи идоракунии Тоҷикистон</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">ダッシュボードを読み込んでいます...</p>
      </div>
    </div>
  )
}