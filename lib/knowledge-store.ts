import type { YieldPool } from "./data-service"
import { vectorStore, processYieldDataForVectorStore } from "./vector-store"
import { formatCurrency, formatPercentage } from "./format-data"

/**
 * Represents a RAG (Retrieval Augmented Generation) knowledge store
 * to organize and retrieve Rootstock yield data for AI prompts
 */
export class YieldKnowledgeStore {
  private rawData: YieldPool[] = []
  private lastUpdated = 0

  /**
   * Updates the knowledge store with new data
   */
  async update(rawData: YieldPool[]) {
    try {
      this.rawData = rawData
      this.lastUpdated = Date.now()

      // Process data for vector store
      const documents = await processYieldDataForVectorStore(rawData)

      // Clear existing data and add new documents
      await vectorStore.clear()
      await vectorStore.addDocuments(documents)

      console.log(`Updated knowledge store with ${rawData.length} Rootstock protocols`)
    } catch (error) {
      console.error("Error updating knowledge store:", error)
      // Continue even if there's an error - we'll fall back to basic filtering
    }
  }

  /**
   * Gets the relevant context for a query
   */
  async getContextForQuery(query: string): Promise<string> {
    try {
      // Perform similarity search
      const results = await vectorStore.similaritySearch(query, 5)

      // Format results into context
      let context = `## Retrieved Information\n\n`

      // Group results by type
      const protocolResults = results.filter((r) => r.metadata.type === "protocol")
      const categoryResults = results.filter((r) => r.metadata.type === "category")
      const projectResults = results.filter((r) => r.metadata.type === "project")

      // Add protocol details
      if (protocolResults.length > 0) {
        context += `### Protocol Details\n\n`
        for (const result of protocolResults) {
          context += result.content + "\n\n"
        }
      }

      // Add category information
      if (categoryResults.length > 0) {
        context += `### Market Overview\n\n`
        for (const result of categoryResults) {
          context += result.content + "\n\n"
        }
      }

      // Add project information
      if (projectResults.length > 0) {
        context += `### Project Information\n\n`
        for (const result of projectResults) {
          context += result.content + "\n\n"
        }
      }

      // If no results found, provide a general overview
      if (results.length === 0) {
        context += this.getGeneralOverview()
      }

      return context
    } catch (error) {
      console.error("Error getting context for query:", error)
      // Fall back to a general overview if there's an error
      return this.getGeneralOverview()
    }
  }

  /**
   * Gets a general overview of the market
   */
  private getGeneralOverview(): string {
    let overview = `### Rootstock Market Overview\n\n`

    // Top APY protocols
    const topApy = [...this.rawData].sort((a, b) => b.apy - a.apy).slice(0, 5)
    overview += `Top Performing Protocols by APY:\n`
    for (const protocol of topApy) {
      overview += `- ${protocol.project} (${protocol.symbol}): ${formatPercentage(protocol.apy)} APY, TVL: ${formatCurrency(protocol.tvlUsd)}\n`
    }

    overview += `\n`

    // Top TVL protocols
    const topTvl = [...this.rawData].sort((a, b) => b.tvlUsd - a.tvlUsd).slice(0, 5)
    overview += `Largest Protocols by TVL:\n`
    for (const protocol of topTvl) {
      overview += `- ${protocol.project} (${protocol.symbol}): ${formatCurrency(protocol.tvlUsd)} TVL, APY: ${formatPercentage(protocol.apy)}\n`
    }

    // Add information about exposure types
    const exposureTypes = [...new Set(this.rawData.map((p) => p.exposure))]
    if (exposureTypes.length > 0) {
      overview += `\n### Exposure Types\n\n`
      for (const exposure of exposureTypes) {
        const protocolsWithExposure = this.rawData.filter((p) => p.exposure === exposure)
        overview += `- ${exposure}: ${protocolsWithExposure.length} protocols\n`
      }
    }

    // Add information about IL risk
    const ilRiskTypes = [...new Set(this.rawData.map((p) => p.ilRisk))]
    if (ilRiskTypes.length > 0) {
      overview += `\n### Impermanent Loss Risk Categories\n\n`
      for (const risk of ilRiskTypes) {
        const protocolsWithRisk = this.rawData.filter((p) => p.ilRisk === risk)
        overview += `- ${risk}: ${protocolsWithRisk.length} protocols\n`
      }
    }

    return overview
  }

  /**
   * Gets data for a specific project
   */
  getProjectData(projectName: string) {
    const normalized = projectName.toLowerCase()
    return this.rawData.filter(
      (pool) => pool.project.toLowerCase().includes(normalized) || pool.projectName?.toLowerCase().includes(normalized),
    )
  }
}

// Create and export a singleton instance
export const knowledgeStore = new YieldKnowledgeStore()
