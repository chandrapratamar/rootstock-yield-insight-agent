"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DebugInfo() {
  const [apiStatus, setApiStatus] = useState<string>("Not tested")
  const [apiResponse, setApiResponse] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const testApiConnection = async () => {
    setIsLoading(true)
    setApiStatus("Testing...")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello, can you hear me?" }],
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API returned ${response.status}: ${errorText}`)
      }

      // For streaming responses, we just check if the connection works
      setApiStatus("Connection successful")
      setApiResponse("API connection is working properly")
    } catch (error) {
      console.error("API test failed:", error)
      setApiStatus("Connection failed")
      setApiResponse(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testDataFetch = async () => {
    setIsLoading(true)
    setApiStatus("Testing data fetch...")

    try {
      const response = await fetch("https://yields.llama.fi/pools")

      if (!response.ok) {
        throw new Error(`DeFiLlama API returned ${response.status}`)
      }

      const data = await response.json()
      setApiStatus("Data fetch successful")
      setApiResponse(`Found ${data.data.length} pools in DeFiLlama API`)
    } catch (error) {
      console.error("Data fetch failed:", error)
      setApiStatus("Data fetch failed")
      setApiResponse(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full border border-gray-800 bg-gray-900/50">
      <CardHeader>
        <CardTitle>Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <span>API Status:</span>
            <span
              className={
                apiStatus === "Connection successful" || apiStatus === "Data fetch successful"
                  ? "text-green-500"
                  : apiStatus === "Testing..." || apiStatus === "Testing data fetch..." || apiStatus === "Not tested"
                    ? "text-yellow-500"
                    : "text-red-500"
              }
            >
              {apiStatus}
            </span>
          </div>
          {apiResponse && (
            <div className="mt-2 p-3 bg-gray-800 rounded-md text-sm overflow-auto max-h-40">
              <pre>{apiResponse}</pre>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={testApiConnection} disabled={isLoading} variant="outline">
            Test API Connection
          </Button>
          <Button onClick={testDataFetch} disabled={isLoading} variant="outline">
            Test Data Fetch
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
