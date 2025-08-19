"use client"

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { CategorySalesData } from '@/types/analytics'

interface CategoryPieChartProps {
  data: CategorySalesData[]
  height?: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function CategoryPieChart({ data, height = 300 }: CategoryPieChartProps) {
  const [isMobile, setIsMobile] = useState(false)
  const formatCurrency = (value: number) => `¥${value.toLocaleString()}`

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-medium">{data.category}</p>
          <p className="text-blue-600">売上: {formatCurrency(data.sales)}</p>
          <p className="text-green-600">注文数: {data.orders}件</p>
          <p className="text-orange-600">利益率: {data.profitMargin}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ width: '100%', height: height || '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius="80%"
            innerRadius="20%"
            fill="#8884d8"
            dataKey="sales"
            label={({ category, sales }) => {
              if (isMobile) return ''
              return `${category}: ¥${sales.toLocaleString()}`
            }}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={renderCustomTooltip} />
          <Legend 
            formatter={(value, entry: any) => entry.payload?.category || value}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}