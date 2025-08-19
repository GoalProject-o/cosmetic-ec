import { Inter } from 'next/font/google'
import Link from 'next/link'
import { Settings, Package, BarChart3, ShoppingCart, Users, LogOut, Home } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'タジキスタン管理システム',
  description: 'タジキスタン代表者向け管理ダッシュボード',
}

const navigation = [
  { name: 'ダッシュボード', href: '/country/tajikistan/dashboard', icon: Home },
  { name: '商品管理', href: '/country/tajikistan/products', icon: Package },
  { name: '注文管理', href: '/country/tajikistan/orders', icon: ShoppingCart },
  { name: '顧客管理', href: '/country/tajikistan/customers', icon: Users },
  { name: '分析・レポート', href: '/country/tajikistan/analytics', icon: BarChart3 },
  { name: '設定', href: '/country/tajikistan/settings', icon: Settings },
]

export default function TajikistanLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-gray-50`}>
        <div className="min-h-screen flex">
          {/* サイドバー */}
          <div className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200">
            {/* ヘッダー */}
            <div className="flex items-center gap-3 p-6 border-b border-gray-200">
              <span className="text-2xl">🇹🇯</span>
              <div>
                <h1 className="text-lg font-semibold">タジキスタン</h1>
                <p className="text-xs text-gray-500">Тоҷикистон</p>
              </div>
            </div>

            {/* ナビゲーション */}
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>

              {/* 区切り線 */}
              <div className="my-6 border-t border-gray-200" />

              {/* ユーザー情報 */}
              <div className="space-y-2">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  アカウント情報
                </div>
                <div className="px-3 py-2 text-sm">
                  <div className="font-medium text-gray-900">タジキスタン代表者</div>
                  <div className="text-xs text-gray-500">tajikistan@example.com</div>
                </div>
                <Link
                  href="/auth/logout"
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  ログアウト
                </Link>
              </div>
            </nav>

            {/* フッター */}
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                <div className="mb-1">Version 1.0.0</div>
                <div>© 2024 タジキスタン管理システム</div>
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="flex-1 flex flex-col">
            {/* モバイル用ヘッダー */}
            <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇹🇯</span>
                  <span className="font-semibold">タジキスタン管理</span>
                </div>
                <button className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* ページコンテンツ */}
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}