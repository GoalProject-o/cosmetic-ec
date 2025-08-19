import { PricingCalculator } from '@/components/calculators/PricingCalculator'

export default function ProductPricingPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">価格計算</h1>
        <p className="text-muted-foreground">商品の価格を詳細に計算します</p>
      </div>
      
      <PricingCalculator />
    </div>
  )
}