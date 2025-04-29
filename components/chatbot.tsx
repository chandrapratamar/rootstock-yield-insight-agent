"use client"

import { useChat } from "ai/react"
import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, RefreshCw, BarChart2 } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import { InfoPanel } from "./info-panel"

export function Chatbot() {
  const [refreshingData, setRefreshingData] = useState(false)
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload } = useChat({
    api: "/api/chat",
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleRefreshData = async () => {
    setRefreshingData(true)

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "system", content: "Refresh data cache" }],
          forceRefresh: true,
        }),
      })

      if (messages.length > 0) {
        reload()
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setRefreshingData(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    if (inputRef.current) {
      inputRef.current.value = suggestion
      handleInputChange({ target: { value: suggestion } } as any)
      setTimeout(() => {
        handleSubmit(new Event("submit") as any)
      }, 100)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0f1117]">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-orange-500" />
            <h1 className="font-semibold text-lg">Rootstock Yield Insight Agent</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 hover:bg-gray-800"
            onClick={handleRefreshData}
            disabled={refreshingData}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshingData && "animate-spin")} />
            Refresh Data
          </Button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)] text-center p-8">
              <Bot className="h-16 w-16 mb-6 text-orange-500 opacity-80" />
              <h2 className="text-2xl font-medium mb-4">Welcome to Rootstock Yield Insight Agent</h2>
              <p className="max-w-md text-gray-400 mb-8 text-lg">
                Ask me about yield opportunities on Rootstock. I can provide APY comparisons, TVL data, and performance
                insights.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
                <Button
                  variant="outline"
                  className="justify-start text-left border-gray-700 hover:bg-gray-800 p-4 h-auto"
                  onClick={() => handleSuggestionClick("Which protocol has the highest APY on Rootstock?")}
                >
                  Highest APY protocols?
                </Button>
                <Button
                  variant="outline"
                  className="justify-start text-left border-gray-700 hover:bg-gray-800 p-4 h-auto"
                  onClick={() => handleSuggestionClick("Compare yield opportunities on Rootstock")}
                >
                  Compare yield opportunities
                </Button>
                <Button
                  variant="outline"
                  className="justify-start text-left border-gray-700 hover:bg-gray-800 p-4 h-auto"
                  onClick={() => handleSuggestionClick("Which protocol has the most TVL on Rootstock?")}
                >
                  Highest TVL protocol?
                </Button>
                <Button
                  variant="outline"
                  className="justify-start text-left border-gray-700 hover:bg-gray-800 p-4 h-auto"
                  onClick={() => handleSuggestionClick("What are the lowest risk yield opportunities on Rootstock?")}
                >
                  Low risk opportunities
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-6 px-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn("mb-6 max-w-4xl mx-auto", message.role === "user" ? "text-white" : "text-gray-100")}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "rounded-full p-2 flex-shrink-0 mt-1",
                        message.role === "user" ? "bg-blue-600" : "bg-orange-600",
                      )}
                    >
                      {message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 space-y-2 overflow-hidden">
                      <div className="prose prose-invert max-w-none">
                        {message.role === "user" ? (
                          <p className="text-lg">{message.content}</p>
                        ) : (
                          <ReactMarkdown
                            components={{
                              h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                              h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
                              h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
                              h4: ({ node, ...props }) => <h4 className="text-base font-bold mt-3 mb-1" {...props} />,
                              p: ({ node, ...props }) => <p className="mb-4 text-base" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4" {...props} />,
                              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                              a: ({ node, ...props }) => <a className="text-orange-400 hover:underline" {...props} />,
                              blockquote: ({ node, ...props }) => (
                                <blockquote className="border-l-4 border-gray-600 pl-4 italic my-4" {...props} />
                              ),
                              code: ({ node, inline, ...props }) =>
                                inline ? (
                                  <code className="bg-gray-800 px-1 py-0.5 rounded text-sm" {...props} />
                                ) : (
                                  <code
                                    className="block bg-gray-800 p-3 rounded-md text-sm overflow-x-auto my-4"
                                    {...props}
                                  />
                                ),
                              table: ({ node, ...props }) => (
                                <div className="my-6 rounded-md border border-gray-700 overflow-hidden">
                                  <table className="min-w-full border-collapse" {...props} />
                                </div>
                              ),
                              thead: ({ node, ...props }) => <thead className="bg-gray-800" {...props} />,
                              tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-700" {...props} />,
                              tr: ({ node, ...props }) => (
                                <tr className="border-b border-gray-700 last:border-0" {...props} />
                              ),
                              th: ({ node, ...props }) => (
                                <th
                                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border-r border-gray-700 last:border-0"
                                  {...props}
                                />
                              ),
                              td: ({ node, ...props }) => (
                                <td className="px-6 py-4 text-sm border-r border-gray-700 last:border-0" {...props} />
                              ),
                              hr: ({ node, ...props }) => <hr className="my-6 border-gray-700" {...props} />,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="mb-6 max-w-4xl mx-auto">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full p-2 flex-shrink-0 mt-1 bg-orange-600">
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    </div>
                    <div className="flex-1 py-2">
                      <p className="text-gray-400">Analyzing data...</p>
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="mb-6 max-w-4xl mx-auto p-4 rounded-lg bg-red-500/10 text-red-400">
                  Error: {error.message}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 bg-[#0f1117]">
        <div className="container mx-auto max-w-4xl px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about Rootstock yield opportunities..."
              className="flex-1 bg-[#1a1c25] border-gray-700 focus-visible:ring-orange-500 py-6 text-base"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="bg-orange-600 hover:bg-orange-700">
              <Send className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Data provided by DeFiLlama API. Updated every 15 minutes.
          </p>
        </div>
      </div>

      {/* Info Panel */}
      <InfoPanel />
    </div>
  )
}
