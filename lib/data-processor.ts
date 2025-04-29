import type { YieldPool } from "./data-service"
import { formatCurrency, formatPercentage } from "./format-data"

/**
 * Normalizes and enhances LST data for better usage
 */
export function processLSTData(data: YieldPool[]) {
  return data.map((pool) => {
    // Calculate additional metrics
    const volatility = pool.sigma || 0
    const stability = volatility > 0 ? 1 / volatility : 100
    const apyTrend = calculateApyTrend(pool)

    // Normalize project name
    const normalizedName = normalizeProjectName(pool.project)

    return {
      ...pool,
      normalizedName,
      formattedTvl: formatCurrency(pool.tvlUsd),
      formattedApy: formatPercentage(pool.apy),
      apyTrend,
      stability,
      riskLevel: calculateRiskLevel(pool),
      tags: generateTags(pool),
    }
  })
}

/**
 * Calculates APY trend based on recent changes
 */
function calculateApyTrend(pool: YieldPool): {
  direction: "up" | "down" | "stable"
  magnitude: "strong" | "moderate" | "slight"
  value: number | null
} {
  // Use 30-day change, or 7-day if 30-day is not available
  const change = pool.apyPct30D || pool.apyPct7D || 0

  // Determine direction
  const direction = change > 0.5 ? "up" : change < -0.5 ? "down" : "stable"

  // Determine magnitude
  let magnitude: "strong" | "moderate" | "slight"
  if (Math.abs(change) > 5) {
    magnitude = "strong"
  } else if (Math.abs(change) > 2) {
    magnitude = "moderate"
  } else {
    magnitude = "slight"
  }

  return { direction, magnitude, value: change }
}

/**
 * Calculates risk level based on volatility and other factors
 */
function calculateRiskLevel(pool: YieldPool): "low" | "medium" | "high" {
  const volatility = pool.sigma || 0
  const audited = pool.audits ? true : false

  if (volatility > 0.1 || !audited) {
    return "high"
  } else if (volatility > 0.05) {
    return "medium"
  } else {
    return "low"
  }
}

/**
 * Generates relevant tags for the pool
 */
function generateTags(pool: YieldPool): string[] {
  const tags: string[] = []

  // Add chain as a tag
  tags.push(pool.chain.toLowerCase())

  // Add size tag
  if (pool.tvlUsd > 1_000_000_000) {
    tags.push("large-tvl")
  } else if (pool.tvlUsd > 100_000_000) {
    tags.push("medium-tvl")
  } else {
    tags.push("small-tvl")
  }

  // Add yield tags
  if (pool.apy > 10) {
    tags.push("high-yield")
  } else if (pool.apy > 5) {
    tags.push("medium-yield")
  } else {
    tags.push("low-yield")
  }

  // Add stability tag
  if (pool.sigma) {
    if (pool.sigma < 0.03) {
      tags.push("stable")
    } else if (pool.sigma > 0.1) {
      tags.push("volatile")
    }
  }

  return tags
}

/**
 * Normalizes project names for better display
 */
function normalizeProjectName(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .replace(/$$|$$/g, "")
}
