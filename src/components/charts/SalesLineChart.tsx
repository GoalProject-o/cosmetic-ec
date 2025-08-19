"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { SalesTrendData } from '@/types/analytics'

interface SalesLineChartProps {
  data: SalesTrendData[]
  height?: number
}

export function SalesLineChart({ data, height = 300 }: SalesLineChartProps) {
  const formatCurrency = (value: number) => `¥${value.toLocaleString()}`
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
  }

  return (
    <div style={{ width: '100%', height: height || '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            fontSize={12}
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            tickFormatter={formatCurrency}
            fontSize={12}
            tick={{ fontSize: 11 }}
            width={80}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [
              name === 'sales' || name === 'profit' ? formatCurrency(value) : value,
              name === 'sales' ? '売上' : name === 'profit' ? '利益' : '注文数'
            ]}
            labelFormatter={(dateStr: string) => `日付: ${formatDate(dateStr)}`}
          />
          <Legend 
            formatter={(value: string) => 
              value === 'sales' ? '売上' : value === 'profit' ? '利益' : '注文数'
            }
          />
          <Line 
            type="monotone" 
            dataKey="sales" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="profit" 
            stroke="#82ca9d" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}