"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchYieldData } from "@/lib/data-service"
import { BarChart2, X, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export function InfoPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [metrics, setMetrics] = useState({
    lastUpdated: "Never",
    protocolCount: 0,
    totalTvl: 0,
    avgApy: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await fetchYieldData()
        const totalTvl = data.reduce((sum, pool) => sum + pool.tvlUsd, 0)
        const avgApy = data.reduce((sum, pool) => sum + pool.apy, 0) / (data.length || 1)

        setMetrics({
          lastUpdated: new Date().toLocaleTimeString(),
          protocolCount: data.length,
          totalTvl,
          avgApy,
        })
      } catch (error) {
        console.error("Error loading metrics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMetrics()
  }, [])

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-4 right-4 rounded-full bg-orange-600 hover:bg-orange-700 shadow-lg z-50"
        onClick={() => setIsOpen(true)}
      >
        <Info className="h-5 w-5" />
      </Button>

      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-50 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full max-w-sm bg-[#1a1c25] shadow-xl z-50 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-orange-500" />
            <h2 className="font-semibold">System Information</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <Card className="bg-[#232530] border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Rootstock Data Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-gray-400">Loading metrics...</div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">Protocols Tracked</p>
                    <p className="text-xl font-medium">{metrics.protocolCount}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">Total TVL</p>
                    <p className="text-xl font-medium">${(metrics.totalTvl / 1_000_000).toFixed(2)}M</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">Average APY</p>
                    <p className="text-xl font-medium">{metrics.avgApy.toFixed(2)}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">Last Updated</p>
                    <p className="text-xl font-medium">{metrics.lastUpdated}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-sm text-gray-400">
            <p className="mb-2">About Rootstock:</p>
            <ul className="space-y-1 list-disc pl-5">
              <li>Smart contract platform secured by Bitcoin</li>
              <li>Uses merged mining with Bitcoin</li>
              <li>EVM compatible for Ethereum-like smart contracts</li>
              <li>Data provided by DeFiLlama API</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
