"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ShippingAnalysis } from '@/types/analytics'

interface ShippingAnalysisChartProps {
  data: ShippingAnalysis[]
  height?: number
}

export function ShippingAnalysisChart({ data, height = 300 }: ShippingAnalysisChartProps) {
  const formatCurrency = (value: number) => `¥${value.toLocaleString()}`

  const chartData = data.map(item => ({
    method: item.method.toUpperCase(),
    totalCost: item.totalCost,
    totalOrders: item.totalOrders,
    averageCost: item.averageCost,
    averageDeliveryDays: item.averageDeliveryDays
  }))

  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">総コスト: {formatCurrency(data.totalCost)}</p>
          <p className="text-green-600">注文数: {data.totalOrders}件</p>
          <p className="text-orange-600">平均コスト: {formatCurrency(data.averageCost)}</p>
          <p className="text-purple-600">平均配送日数: {data.averageDeliveryDays}日</p>
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
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="method" 
            fontSize={11}
            tick={{ fontSize: 10 }}
          />
          <YAxis 
            yAxisId="cost"
            orientation="left"
            tickFormatter={formatCurrency}
            fontSize={11}
            tick={{ fontSize: 10 }}
            width={70}
          />
          <YAxis 
            yAxisId="orders"
            orientation="right"
            tickFormatter={(value) => `${value}件`}
            fontSize={11}
            tick={{ fontSize: 10 }}
            width={50}
          />
          <Tooltip content={renderCustomTooltip} />
          <Legend 
            formatter={(value: string) => {
              switch(value) {
                case 'totalCost': return '総コスト'
                case 'totalOrders': return '注文数'
                default: return value
              }
            }}
          />
          <Bar 
            yAxisId="cost"
            dataKey="totalCost" 
            fill="#8884d8" 
            name="総コスト"
          />
          <Bar 
            yAxisId="orders"
            dataKey="totalOrders" 
            fill="#82ca9d" 
            name="注文数"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}