"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatPercentage, formatChange } from "@/lib/format-data"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface LSTDataCardProps {
  data: {
    chain: string
    project: string
    symbol: string
    tvlUsd: number
    apyBase: number
    apyReward: number | null
    apy: number
    apyPct1D: number | null
    apyPct7D: number | null
    apyPct30D: number | null
  }
}

export function LSTDataCard({ data }: LSTDataCardProps) {
  const { project, symbol, tvlUsd, apy, apyPct7D } = data

  // Format the project name for display
  const formatProjectName = (name: string) => {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Get trend icon based on 7-day change
  const getTrendIcon = () => {
    if (!apyPct7D) return <Minus className="h-4 w-4 text-gray-400" />
    if (apyPct7D > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (apyPct7D < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const change7d = formatChange(apyPct7D)

  return (
    <Card className="overflow-hidden border border-gray-800 bg-gray-900/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>
            {formatProjectName(project)} ({symbol})
          </span>
          <div className="flex items-center gap-1 text-sm font-normal">
            {getTrendIcon()}
            <span className={change7d.color}>{change7d.value}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <p className="text-xs text-gray-400">TVL</p>
            <p className="text-lg font-medium">{formatCurrency(tvlUsd)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-400">APY</p>
            <p className="text-lg font-medium">{formatPercentage(apy)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
