import { NextResponse } from "next/server"
import { deepseek } from "@ai-sdk/deepseek"
import { generateText } from "ai"

export async function GET() {
  try {
    // Check if DEEPSEEK_API_KEY is set
    const apiKey = process.env.DEEPSEEK_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "DEEPSEEK_API_KEY is not set" }, { status: 500 })
    }

    // Try a simple request to DeepSeek
    const result = await generateText({
      model: deepseek("deepseek-chat"),
      prompt: "Hello, are you working?",
    })

    return NextResponse.json({
      status: "success",
      message: "DeepSeek API is configured correctly",
      response: result.text.substring(0, 100) + "...", // Just show the first 100 chars
    })
  } catch (error) {
    console.error("Error checking DeepSeek API:", error)
    return NextResponse.json(
      {
        error: "Failed to connect to DeepSeek API",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
