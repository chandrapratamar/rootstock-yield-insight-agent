"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { fetchYieldData } from "@/lib/data-service"

export function SystemMetrics() {
  const [metrics, setMetrics] = useState({
    lastUpdated: "Never",
    protocolCount: 0,
    totalTvl: 0,
    avgApy: 0,
    dataAge: "Unknown",
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await fetchYieldData()

        // Calculate metrics
        const totalTvl = data.reduce((sum, pool) => sum + pool.tvlUsd, 0)
        const avgApy = data.reduce((sum, pool) => sum + pool.apy, 0) / (data.length || 1)

        setMetrics({
          lastUpdated: new Date().toLocaleTimeString(),
          protocolCount: data.length,
          totalTvl,
          avgApy,
          dataAge: "Fresh", // This would come from cache timestamp in a real implementation
        })
      } catch (error) {
        console.error("Error loading metrics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMetrics()

    // Refresh metrics every 5 minutes
    const interval = setInterval(loadMetrics, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="border border-gray-800 bg-gray-900/50 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Rootstock Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="data">
          <TabsList className="bg-gray-800 w-full">
            <TabsTrigger value="data" className="flex-1">
              Data
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex-1">
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="mt-4 space-y-4">
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
                  <p className="text-xs text-gray-400">Data Age</p>
                  <p className="text-xl font-medium">{metrics.dataAge}</p>
                </div>
              </div>
            )}
            <div className="text-xs text-gray-500 mt-2">Last updated: {metrics.lastUpdated}</div>
          </TabsContent>

          <TabsContent value="performance" className="mt-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-gray-400">Cache Status</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <p>Active</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400">Avg Response Time</p>
                <p>2.4s</p> {/* This would be dynamically calculated in a real implementation */}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400">RAG Efficiency</p>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: "85%" }}></div>
                </div>
                <p className="text-xs text-right">85%</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
