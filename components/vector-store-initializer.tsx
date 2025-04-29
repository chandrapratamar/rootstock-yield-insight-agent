"use client"

import { useEffect, useState } from "react"

export function VectorStoreInitializer() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  useEffect(() => {
    const initVectorStore = async () => {
      try {
        setStatus("loading")
        const response = await fetch("/api/init-vector-store")

        if (!response.ok) {
          console.warn(`Vector store initialization returned status ${response.status}`)
          // Don't throw an error, just log a warning and continue
        }

        setStatus("success")
      } catch (error) {
        console.error("Error initializing vector store:", error)
        setStatus("error")
        // Don't rethrow the error, just log it and continue
      }
    }

    initVectorStore()
  }, [])

  // This component doesn't render anything visible
  return null
}
