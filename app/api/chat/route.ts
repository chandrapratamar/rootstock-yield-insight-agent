import { streamText } from "ai"
import { deepseek } from "@ai-sdk/deepseek"
import { NextResponse } from "next/server"
import { fetchYieldData } from "@/lib/data-service"
import { knowledgeStore } from "@/lib/knowledge-store"
import { promptBuilder } from "@/lib/prompt-builder"

// Set maximum duration for the API route
export const maxDuration = 60 // 60 seconds

export async function POST(req: Request) {
  try {
    // Parse the request
    const { messages, forceRefresh = false } = await req.json()

    // Step 1: Fetch and process data
    console.log("Fetching Rootstock yield data...")
    const yieldData = await fetchYieldData(forceRefresh)
    console.log(`Fetched ${yieldData.length} protocols`)

    // Step 2: Update the knowledge store
    await knowledgeStore.update(yieldData)

    // Step 3: Build the prompt with context
    const { messages: enhancedMessages, systemPrompt } = await promptBuilder.buildPrompt({
      messages,
      forceRefresh,
    })

    // Log a portion of the system prompt to debug
    console.log("System prompt excerpt (first 500 chars):", systemPrompt.substring(0, 500))

    // Step 4: Stream the response using DeepSeek
    const result = streamText({
      model: deepseek("deepseek-chat"),
      messages: [{ role: "system", content: systemPrompt }, ...enhancedMessages],
    })

    // Step 5: Return the streaming response
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat route:", error)

    return NextResponse.json(
      {
        error: "Failed to process your request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
