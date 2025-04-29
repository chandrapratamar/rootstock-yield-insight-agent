"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatPercentage, formatChange } from "@/lib/format-data"

interface LSTComparisonProps {
  protocols: Array<{
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
    apyMean30d: number | null
  }>
}

export function LSTComparison({ protocols }: LSTComparisonProps) {
  // Format the project name for display
  const formatProjectName = (name: string) => {
    return name
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="rounded-lg border border-gray-800 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-900/70 hover:bg-gray-900/70">
            <TableHead>Protocol</TableHead>
            <TableHead className="text-right">TVL</TableHead>
            <TableHead className="text-right">APY</TableHead>
            <TableHead className="text-right">7d Change</TableHead>
            <TableHead className="text-right">30d Avg</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {protocols.map((protocol) => {
            const change7d = formatChange(protocol.apyPct7D)

            return (
              <TableRow key={protocol.project} className="hover:bg-gray-800/50">
                <TableCell className="font-medium">
                  {formatProjectName(protocol.project)}
                  <span className="text-xs text-gray-400 ml-1">({protocol.symbol})</span>
                </TableCell>
                <TableCell className="text-right">{formatCurrency(protocol.tvlUsd)}</TableCell>
                <TableCell className="text-right">{formatPercentage(protocol.apy)}</TableCell>
                <TableCell className={`text-right ${change7d.color}`}>{change7d.value}</TableCell>
                <TableCell className="text-right">
                  {protocol.apyMean30d ? formatPercentage(protocol.apyMean30d) : "N/A"}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
