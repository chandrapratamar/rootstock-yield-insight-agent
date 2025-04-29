import { NextResponse } from "next/server"
import { fetchYieldData } from "@/lib/data-service"
import { knowledgeStore } from "@/lib/knowledge-store"
import { vectorStore } from "@/lib/vector-store"

export async function GET() {
  try {
    console.log("Initializing vector store...")

    // Initialize vector store
    await vectorStore.initialize()

    // Fetch initial data
    const data = await fetchYieldData(true) // Force refresh

    // Update knowledge store
    await knowledgeStore.update(data)

    return NextResponse.json({
      success: true,
      message: `Vector store initialized with ${data.length} Rootstock protocols`,
    })
  } catch (error) {
    console.error("Error initializing vector store:", error)

    // Return a 200 status even on error to prevent client-side errors
    // Just include the error details in the response
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize vector store",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 200 }, // Use 200 instead of 500
    )
  }
}
