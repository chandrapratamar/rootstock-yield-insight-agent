"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function DebugData() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [testQuery, setTestQuery] = useState("What are the best yield opportunities on Bifrost?")
  const [testResults, setTestResults] = useState<any>(null)
  const [isTestingQuery, setIsTestingQuery] = useState(false)

  const fetchDebugData = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/debug-data")

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Error fetching debug data:", error)
      setData({ error: String(error) })
    } finally {
      setIsLoading(false)
    }
  }

  const testQuerySearch = async () => {
    setIsTestingQuery(true)

    try {
      const response = await fetch("/api/test-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: testQuery }),
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      const result = await response.json()
      setTestResults(result)
    } catch (error) {
      console.error("Error testing query:", error)
      setTestResults({ error: String(error) })
    } finally {
      setIsTestingQuery(false)
    }
  }

  return (
    <Card className="w-full border border-gray-800 bg-gray-900/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Debug Data</span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDebugData}
            disabled={isLoading}
            className="border-gray-700 hover:bg-gray-800"
          >
            {isLoading ? "Loading..." : "Fetch Data"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data ? (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full justify-between p-2">
                <span>{data.protocols ? `${data.protocols.length} protocols found` : "No data"}</span>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 p-3 bg-gray-800 rounded-md text-sm overflow-auto max-h-96">
                <pre>{JSON.stringify(data, null, 2)}</pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <div className="text-gray-400 text-sm">Click "Fetch Data" to see what data is being used by the agent</div>
        )}

        <div className="pt-2 border-t border-gray-800">
          <h3 className="text-sm font-medium mb-2">Test Query Retrieval</h3>
          <div className="flex gap-2 mb-2">
            <Input
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="Enter a test query..."
              className="flex-1 bg-gray-800 border-gray-700"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={testQuerySearch}
              disabled={isTestingQuery || !testQuery.trim()}
              className="border-gray-700 hover:bg-gray-800"
            >
              <Search className="h-4 w-4 mr-1" />
              Test
            </Button>
          </div>

          {testResults && (
            <div className="mt-2 p-3 bg-gray-800 rounded-md text-sm overflow-auto max-h-96">
              <h4 className="font-medium mb-1">Retrieved Documents:</h4>
              <pre>{JSON.stringify(testResults.results, null, 2)}</pre>

              <h4 className="font-medium mt-3 mb-1">Generated Context:</h4>
              <pre className="whitespace-pre-wrap">{testResults.context}</pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
