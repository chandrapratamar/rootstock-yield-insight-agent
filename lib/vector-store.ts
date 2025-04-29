import type { YieldPool } from "./data-service"

// Define the document structure
interface Document {
  id: string
  content: string
  metadata: Record<string, any>
  // Instead of storing actual vectors, we'll use keywords for matching
  keywords: string[]
}

// Simple in-memory vector store compatible with serverless environments
export class VectorStore {
  private documents: Document[] = []
  private initialized = false

  /**
   * Initialize the vector store
   */
  async initialize() {
    if (this.initialized) return
    this.initialized = true
    console.log("In-memory store initialized")
    return true
  }

  /**
   * Add documents to the vector store
   */
  async addDocuments(documents: Document[]) {
    if (!this.initialized) await this.initialize()

    // Replace existing documents with the same ID
    const existingIds = new Set(this.documents.map((d) => d.id))

    for (const doc of documents) {
      if (existingIds.has(doc.id)) {
        // Replace existing document
        const index = this.documents.findIndex((d) => d.id === doc.id)
        this.documents[index] = doc
      } else {
        // Add new document
        this.documents.push(doc)
      }
    }

    console.log(`Added ${documents.length} documents to in-memory store`)
    return true
  }

  /**
   * Search for similar documents using keyword matching
   */
  async similaritySearch(query: string, k = 5): Promise<Document[]> {
    if (!this.initialized) await this.initialize()

    // Normalize query
    const normalizedQuery = query.toLowerCase()

    // Extract keywords from query
    const queryWords = normalizedQuery
      .split(/\s+/)
      .filter((word) => word.length > 3) // Only consider words with 4+ characters
      .map((word) => word.replace(/[^\w]/g, "")) // Remove non-alphanumeric characters

    // Score documents based on keyword matches
    const scoredDocs = this.documents.map((doc) => {
      let score = 0

      // Check for exact project matches first (highest priority)
      if (doc.metadata.project && normalizedQuery.includes(doc.metadata.project.toLowerCase())) {
        score += 10
      }

      // Check for symbol matches
      if (doc.metadata.symbol && normalizedQuery.includes(doc.metadata.symbol.toLowerCase())) {
        score += 8
      }

      // Check for exposure type matches
      if (doc.metadata.exposure && normalizedQuery.includes(doc.metadata.exposure.toLowerCase())) {
        score += 5
      }

      // Check for IL risk matches
      if (doc.metadata.ilRisk && normalizedQuery.includes(doc.metadata.ilRisk.toLowerCase())) {
        score += 5
      }

      // Check for keyword matches
      for (const word of queryWords) {
        if (doc.keywords.some((kw) => kw.includes(word))) {
          score += 1
        }
      }

      return { doc, score }
    })

    // Sort by score and take top k
    return scoredDocs
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map((item) => item.doc)
  }

  /**
   * Clear all documents
   */
  async clear() {
    this.documents = []
    console.log("In-memory store cleared")
    return true
  }
}

// Create and export a singleton instance
export const vectorStore = new VectorStore()

/**
 * Process yield data into documents for the vector store
 */
export async function processYieldDataForVectorStore(yieldData: YieldPool[]) {
  const documents: Document[] = []

  // Process each protocol into a document
  for (const pool of yieldData) {
    // Generate keywords for matching
    const keywords = [
      pool.project.toLowerCase(),
      pool.symbol.toLowerCase(),
      "rootstock",
      "rsk",
      "bitcoin",
      "yield",
      "apy",
      "tvl",
      pool.exposure.toLowerCase(),
      pool.ilRisk.toLowerCase(),
      pool.stablecoin ? "stablecoin" : "volatile",
      ...(pool.predictions ? [pool.predictions.predictedClass.toLowerCase()] : []),
    ]

    // Create a detailed document about the protocol
    const content = `
Protocol: ${pool.project}
Symbol: ${pool.symbol}
Chain: Rootstock
APY: ${pool.apy.toFixed(2)}%
Base APY: ${pool.apyBase !== null ? pool.apyBase.toFixed(2) + "%" : "N/A"}
Reward APY: ${pool.apyReward !== null ? pool.apyReward.toFixed(2) + "%" : "N/A"}
TVL: $${pool.tvlUsd.toLocaleString()}
1-Day APY Change: ${pool.apyPct1D !== null ? pool.apyPct1D.toFixed(2) + "%" : "N/A"}
7-Day APY Change: ${pool.apyPct7D !== null ? pool.apyPct7D.toFixed(2) + "%" : "N/A"}
30-Day APY Change: ${pool.apyPct30D !== null ? pool.apyPct30D.toFixed(2) + "%" : "N/A"}
30-Day Mean APY: ${pool.apyMean30d !== null ? pool.apyMean30d.toFixed(2) + "%" : "N/A"}
Exposure: ${pool.exposure}
IL Risk: ${pool.ilRisk}
Stablecoin: ${pool.stablecoin ? "Yes" : "No"}
${pool.predictions ? `Prediction: ${pool.predictions.predictedClass} (${pool.predictions.predictedProbability}% confidence)` : ""}
`

    documents.push({
      id: `protocol-${pool.project}-${pool.symbol}`,
      content,
      metadata: {
        type: "protocol",
        project: pool.project,
        symbol: pool.symbol,
        exposure: pool.exposure,
        ilRisk: pool.ilRisk,
        apy: pool.apy,
        tvlUsd: pool.tvlUsd,
        stablecoin: pool.stablecoin,
      },
      keywords,
    })
  }

  // Create category documents for high-level queries
  // Top APY protocols
  const topApyProtocols = [...yieldData].sort((a, b) => b.apy - a.apy).slice(0, 5)
  documents.push({
    id: "category-top-apy",
    content: `
Top Performing Rootstock Protocols by APY:
${topApyProtocols.map((p) => `- ${p.project} (${p.symbol}): ${p.apy.toFixed(2)}% APY, TVL: $${p.tvlUsd.toLocaleString()}, Exposure: ${p.exposure}, IL Risk: ${p.ilRisk}`).join("\n")}
`,
    metadata: {
      type: "category",
      category: "top-apy",
    },
    keywords: ["top", "best", "highest", "apy", "yield", "performance", "performing"],
  })

  // Top TVL protocols
  const topTvlProtocols = [...yieldData].sort((a, b) => b.tvlUsd - a.tvlUsd).slice(0, 5)
  documents.push({
    id: "category-top-tvl",
    content: `
Largest Rootstock Protocols by TVL:
${topTvlProtocols.map((p) => `- ${p.project} (${p.symbol}): $${p.tvlUsd.toLocaleString()} TVL, APY: ${p.apy.toFixed(2)}%, Exposure: ${p.exposure}, IL Risk: ${p.ilRisk}`).join("\n")}
`,
    metadata: {
      type: "category",
      category: "top-tvl",
    },
    keywords: ["top", "largest", "biggest", "tvl", "value", "locked", "size"],
  })

  // Exposure type documents
  const exposureTypes = [...new Set(yieldData.map((p) => p.exposure))]
  for (const exposure of exposureTypes) {
    const exposureProtocols = yieldData.filter((p) => p.exposure === exposure)
    documents.push({
      id: `exposure-${exposure}`,
      content: `
Rootstock protocols with ${exposure} exposure:
${exposureProtocols.map((p) => `- ${p.project} (${p.symbol}): ${p.apy.toFixed(2)}% APY, TVL: $${p.tvlUsd.toLocaleString()}, IL Risk: ${p.ilRisk}`).join("\n")}
`,
      metadata: {
        type: "category",
        category: "exposure",
        exposure,
      },
      keywords: [exposure.toLowerCase(), "exposure", "risk", "type"],
    })
  }

  // IL Risk type documents
  const ilRiskTypes = [...new Set(yieldData.map((p) => p.ilRisk))]
  for (const risk of ilRiskTypes) {
    const riskProtocols = yieldData.filter((p) => p.ilRisk === risk)
    documents.push({
      id: `il-risk-${risk}`,
      content: `
Rootstock protocols with ${risk} impermanent loss risk:
${riskProtocols.map((p) => `- ${p.project} (${p.symbol}): ${p.apy.toFixed(2)}% APY, TVL: $${p.tvlUsd.toLocaleString()}, Exposure: ${p.exposure}`).join("\n")}
`,
      metadata: {
        type: "category",
        category: "il-risk",
        ilRisk: risk,
      },
      keywords: [risk.toLowerCase(), "impermanent", "loss", "risk", "il"],
    })
  }

  // Project-specific documents
  const projects = [...new Set(yieldData.map((p) => p.project))]
  for (const project of projects) {
    const projectProtocols = yieldData.filter((p) => p.project === project)

    // Add project-specific keywords
    const projectKeywords = [
      project.toLowerCase(),
      ...projectProtocols.map((p) => p.symbol.toLowerCase()),
      "project",
      "protocol",
    ]

    // Create a document for each project
    documents.push({
      id: `project-${project}`,
      content: `
${project} protocols on Rootstock:
${projectProtocols.map((p) => `- ${p.symbol}: ${p.apy.toFixed(2)}% APY, TVL: $${p.tvlUsd.toLocaleString()}, Exposure: ${p.exposure}, IL Risk: ${p.ilRisk}`).join("\n")}
`,
      metadata: {
        type: "project",
        project,
      },
      keywords: projectKeywords,
    })
  }

  return documents
}
