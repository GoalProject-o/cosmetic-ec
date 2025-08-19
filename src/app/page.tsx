import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">TJ-Cosmetics Integrated System</h1>
        <p className="text-lg text-muted-foreground">ECサイト連携統合管理システム</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>管理者機能</CardTitle>
            <CardDescription>
              商品管理、価格計算、設定管理などの管理者向け機能
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/admin/products" className="block">
                <Button className="w-full">商品管理</Button>
              </Link>
              <Link href="/admin/orders" className="block">
                <Button variant="outline" className="w-full">注文管理</Button>
              </Link>
              <Link href="/admin/settings" className="block">
                <Button variant="outline" className="w-full">設定</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>代表者機能</CardTitle>
            <CardDescription>
              商品カタログ、注文、カート機能などの代表者向け機能
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/catalog" className="block">
                <Button className="w-full">商品カタログ</Button>
              </Link>
              <Link href="/cart" className="block">
                <Button variant="outline" className="w-full">カート</Button>
              </Link>
              <Link href="/orders" className="block">
                <Button variant="outline" className="w-full">注文履歴</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}