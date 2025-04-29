/**
 * Formats a number as currency
 * @param value Number to format
 * @param decimals Number of decimal places
 * @returns Formatted string
 */
export function formatCurrency(value: number, decimals = 2): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(decimals)}B`
  } else if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(decimals)}M`
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(decimals)}K`
  } else {
    return `$${value.toFixed(decimals)}`
  }
}

/**
 * Formats a percentage value
 * @param value Percentage value
 * @param decimals Number of decimal places
 * @returns Formatted string
 */
export function formatPercentage(value: number | null, decimals = 2): string {
  if (value === null) return "N/A"
  return `${value.toFixed(decimals)}%`
}

/**
 * Formats a change value with color indicator
 * @param value Change value
 * @returns Object with formatted value and color
 */
export function formatChange(value: number | null): { value: string; color: string } {
  if (value === null) return { value: "N/A", color: "text-gray-400" }

  const formatted = `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
  const color = value > 0 ? "text-green-500" : value < 0 ? "text-red-500" : "text-gray-400"

  return { value: formatted, color }
}
