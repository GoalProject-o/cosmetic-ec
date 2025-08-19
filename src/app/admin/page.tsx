import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">管理画面ダッシュボード</h1>
        <p className="text-muted-foreground">TJ-Cosmetics 統合システム管理</p>
      </div>

      {/* 概要統計 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">登録商品数</CardTitle>
            <div className="text-2xl font-bold">156</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              +12 今月
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">保留中注文</CardTitle>
            <div className="text-2xl font-bold">23</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              処理待ち
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">在庫アラート</CardTitle>
            <div className="text-2xl font-bold">5</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              要確認
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今月売上</CardTitle>
            <div className="text-2xl font-bold">$12,450</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              +8.2% 前月比
            </p>
          </CardContent>
        </Card>
      </div>

      {/* クイックアクション */}
      <Card>
        <CardHeader>
          <CardTitle>クイックアクション</CardTitle>
          <CardDescription>よく使用される機能へのショートカット</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/admin/products/register">
              <Button className="w-full h-20 text-left flex-col items-start justify-center">
                <div className="font-semibold">商品登録</div>
                <div className="text-sm opacity-70">新しい商品を登録</div>
              </Button>
            </Link>
            
            <Link href="/admin/products">
              <Button variant="outline" className="w-full h-20 text-left flex-col items-start justify-center">
                <div className="font-semibold">商品管理</div>
                <div className="text-sm opacity-70">商品一覧・編集</div>
              </Button>
            </Link>
            
            <Link href="/admin/products/pricing">
              <Button variant="outline" className="w-full h-20 text-left flex-col items-start justify-center">
                <div className="font-semibold">価格計算</div>
                <div className="text-sm opacity-70">価格シミュレーション</div>
              </Button>
            </Link>
            
            <Button variant="outline" className="w-full h-20 text-left flex-col items-start justify-center" disabled>
              <div className="font-semibold">注文管理</div>
              <div className="text-sm opacity-70">注文処理・追跡</div>
            </Button>
            
            <Button variant="outline" className="w-full h-20 text-left flex-col items-start justify-center" disabled>
              <div className="font-semibold">在庫管理</div>
              <div className="text-sm opacity-70">在庫確認・調整</div>
            </Button>
            
            <Button variant="outline" className="w-full h-20 text-left flex-col items-start justify-center" disabled>
              <div className="font-semibold">設定</div>
              <div className="text-sm opacity-70">システム設定</div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 最近のアクティビティ */}
      <Card>
        <CardHeader>
          <CardTitle>最近のアクティビティ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">新商品「DHC オリーブオイル クレンジング」が登録されました</p>
                <p className="text-xs text-muted-foreground">2時間前</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">注文 #ORD-001 の価格計算が完了しました</p>
                <p className="text-xs text-muted-foreground">4時間前</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">商品カテゴリ「化粧品」のHSコードが更新されました</p>
                <p className="text-xs text-muted-foreground">1日前</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm">在庫アラート: 「資生堂 アネッサ」の在庫が少なくなっています</p>
                <p className="text-xs text-muted-foreground">2日前</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}