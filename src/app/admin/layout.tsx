import Link from 'next/link'
import ErrorBoundary from '@/components/ui/error-boundary'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              TJ-Cosmetics Admin
            </Link>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <Link
                href="/admin/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ダッシュボード
              </Link>
              <Link
                href="/admin/reports"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                レポート
              </Link>
              <Link
                href="/admin/products"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                商品管理
              </Link>
              <Link
                href="/admin/settings"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                設定
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto py-4 sm:py-6">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  )
}