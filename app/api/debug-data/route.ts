import { NextResponse } from "next/server"
import { fetchYieldData } from "@/lib/data-service"
import { knowledgeStore } from "@/lib/knowledge-store"

export async function GET() {
  try {
    // Fetch the latest data
    const data = await fetchYieldData()

    // Get sample context for a query
    await knowledgeStore.update(data)
    const sampleContext = await knowledgeStore.getContextForQuery("What are the best yield opportunities on Rootstock?")

    return NextResponse.json({
      totalProtocols: data.length,
      protocols: data.map((p) => ({
        project: p.project,
        symbol: p.symbol,
        apy: p.apy,
        tvlUsd: p.tvlUsd,
        exposure: p.exposure,
        ilRisk: p.ilRisk,
      })),
      sampleContext: sampleContext,
    })
  } catch (error) {
    console.error("Error in debug data route:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch debug data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
