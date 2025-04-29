import { NextResponse } from "next/server"
import { fetchLSTData } from "@/lib/data-service"
import { knowledgeStore } from "@/lib/knowledge-store"
import { vectorStore } from "@/lib/vector-store"

export async function POST(req: Request) {
  try {
    const { query } = await req.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Make sure data is loaded
    const data = await fetchLSTData()
    await knowledgeStore.update(data)

    // Get search results
    const results = await vectorStore.similaritySearch(query, 5)

    // Get context
    const context = await knowledgeStore.getContextForQuery(query)

    return NextResponse.json({
      query,
      results: results.map((r) => ({
        id: r.id,
        metadata: r.metadata,
        contentPreview: r.content.substring(0, 100) + "...",
      })),
      context,
    })
  } catch (error) {
    console.error("Error in test query:", error)

    return NextResponse.json(
      {
        error: "Failed to process test query",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
