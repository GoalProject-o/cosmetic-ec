"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ProductRanking } from '@/types/analytics'

interface ProductBarChartProps {
  data: ProductRanking[]
  height?: number
}

export function ProductBarChart({ data, height = 300 }: ProductBarChartProps) {
  const formatCurrency = (value: number) => `¥${value.toLocaleString()}`

  const chartData = data.map(product => ({
    name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
    fullName: product.name,
    totalSold: product.totalSold,
    totalRevenue: product.totalRevenue,
    brand: product.brand,
    profitMargin: product.profitMargin
  }))

  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded shadow max-w-xs">
          <p className="font-medium text-sm">{data.fullName}</p>
          <p className="text-xs text-gray-600 mb-2">{data.brand}</p>
          <p className="text-blue-600 text-sm">販売数: {data.totalSold}個</p>
          <p className="text-green-600 text-sm">売上: {formatCurrency(data.totalRevenue)}</p>
          <p className="text-orange-600 text-sm">利益率: {data.profitMargin}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ width: '100%', height: height || '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={10}
            tick={{ fontSize: 10 }}
            interval={0}
          />
          <YAxis 
            tickFormatter={(value) => value.toLocaleString()}
            fontSize={11}
            tick={{ fontSize: 10 }}
            width={60}
          />
          <Tooltip content={renderCustomTooltip} />
          <Legend 
            formatter={(value: string) => value === 'totalSold' ? '販売数' : '売上'}
          />
          <Bar 
            dataKey="totalSold" 
            fill="#8884d8" 
            name="販売数"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}