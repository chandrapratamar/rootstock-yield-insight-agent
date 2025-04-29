// Types for the data
export interface YieldPool {
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
  ilRisk: string
  exposure: string
  poolMeta: string | null
  mu: number | null
  sigma: number | null
  count: number | null
  outlier: boolean
  underlyingTokens: string[] | null
  projectName?: string
  stablecoin: boolean
  audits: string | null
  url: string
  rewardTokens: string[] | null
  predictions?: {
    predictedClass: string
    predictedProbability: number
    binnedConfidence: number
  }
}

// Cache expiration in milliseconds (15 minutes)
const CACHE_EXPIRATION = 15 * 60 * 1000

// In-memory cache
let dataCache: {
  timestamp: number
  data: YieldPool[]
} | null = null

/**
 * Fetches Rootstock yield data from DeFiLlama with caching
 */
export async function fetchYieldData(forceRefresh = false): Promise<YieldPool[]> {
  // Return cached data if available and not expired
  if (!forceRefresh && dataCache && Date.now() - dataCache.timestamp < CACHE_EXPIRATION) {
    console.log("Using cached Rootstock yield data")
    return dataCache.data
  }

  console.log("Fetching fresh Rootstock yield data from DeFiLlama")

  try {
    const response = await fetch("https://yields.llama.fi/pools", {
      next: { revalidate: 900 }, // Revalidate every 15 minutes
    })

    if (!response.ok) {
      throw new Error(`DeFiLlama API returned ${response.status}`)
    }

    const responseData = await response.json()

    // Filter for Rootstock chain
    const filteredData = responseData.data.filter((pool: YieldPool) => pool.chain === "Rootstock")

    console.log(
      `Found ${filteredData.length} Rootstock yield opportunities from ${responseData.data.length} total pools`,
    )

    // Update cache
    dataCache = {
      timestamp: Date.now(),
      data: filteredData,
    }

    return filteredData
  } catch (error) {
    console.error("Error fetching Rootstock yield data:", error)

    // Return cached data if available, even if expired
    if (dataCache) {
      console.log("Returning expired cache due to fetch error")
      return dataCache.data
    }

    return []
  }
}

export const fetchLSTData = fetchYieldData
