export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">テストページ</h1>
      <p className="text-muted-foreground">このページが正常に表示されていれば、基本的な設定は正常です。</p>
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
        <p className="text-green-800">✅ Tailwind CSS が正常に動作しています</p>
      </div>
    </div>
  )
}