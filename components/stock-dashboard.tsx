"use client"

import { useState, useEffect, useRef } from "react"
import { useStockStore } from "@/lib/store"
import { StockHeader } from "@/components/stock-header"
import { WatchlistSidebar } from "@/components/watchlist-sidebar"
import { PortfolioTable } from "@/components/portfolio-table"
import { StockTabs } from "@/components/stock-tabs"
import { ChartControls } from "@/components/chart-controls"
import { fetchStockData } from "@/lib/api"
import { webSocketService } from "@/lib/websocket-service"
import type { Stock } from "@/lib/types"
import { TradingViewChart } from "@/components/trading-view-chart"
import { Loader2 } from "lucide-react"

export default function StockDashboard() {
  const { stocks, selectedStock, setStocks, setSelectedStock } = useStockStore()
  const [isLoading, setIsLoading] = useState(true)
  const symbolsRef = useRef<string[]>([])
  const [isClient, setIsClient] = useState(false)
  const [chartInterval, setChartInterval] = useState("D")
  const [tabStocks, setTabStocks] = useState<Stock[]>([])
  const [error, setError] = useState<string | null>(null)

  // Check if we're in the browser
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initial data loading effect - runs only once
  useEffect(() => {
    if (!isClient) return

    const loadInitialData = async () => {
      setIsLoading(true)
      try {
        const stockSymbols = ["NVDA", "AAPL", "TSLA", "MSFT", "AMZN"]
        symbolsRef.current = stockSymbols

        const stockData = await fetchStockData(stockSymbols)

        if (stockData.length > 0) {
          // Ensure all stock data has valid numbers
          const validatedStocks = stockData.map((stock) => ({
            ...stock,
            price: isNaN(stock.price) ? 0 : stock.price,
            priceChange: isNaN(stock.priceChange) ? 0 : stock.priceChange,
            priceChangePercent: isNaN(stock.priceChangePercent) ? 0 : stock.priceChangePercent,
            shares: isNaN(stock.shares || 0) ? 0 : stock.shares || 0,
            averagePrice: isNaN(stock.averagePrice || 0) ? 0 : stock.averagePrice || 0,
          }))

          setStocks(validatedStocks)

          // Set Tesla as default selected stock
          const defaultStock = validatedStocks.find((s) => s.symbol === "TSLA") || validatedStocks[0]
          setSelectedStock(defaultStock)

          // Initialize tabs with the first three stocks
          setTabStocks([
            validatedStocks.find((s) => s.symbol === "NVDA") || validatedStocks[0],
            validatedStocks.find((s) => s.symbol === "AAPL") || validatedStocks[1],
            validatedStocks.find((s) => s.symbol === "TSLA") || validatedStocks[2],
          ])

          // Initialize WebSocket after getting initial data
          webSocketService.initialize(stockSymbols)
        }
      } catch (error) {
        console.error("Failed to load stock data:", error)
        setError("Failed to load stock data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()

    // Clean up WebSocket on unmount
    return () => {
      webSocketService.close()
    }
  }, [isClient, setStocks, setSelectedStock])

  // Update WebSocket symbols when stocks change
  useEffect(() => {
    if (!isClient || stocks.length === 0) return

    const symbols = stocks.map((stock) => stock.symbol)
    symbolsRef.current = symbols
    webSocketService.updateSymbols(symbols)
  }, [isClient, stocks])

  // Fallback polling mechanism in case WebSocket fails
  useEffect(() => {
    if (!isClient) return

    const intervalId = setInterval(async () => {
      try {
        // Use the ref value instead of stocks directly
        const symbols = symbolsRef.current
        if (symbols.length > 0) {
          const updatedData = await fetchStockData(symbols)

          if (updatedData.length > 0) {
            // Validate the data
            const validatedStocks = updatedData.map((stock) => ({
              ...stock,
              price: isNaN(stock.price) ? 0 : stock.price,
              priceChange: isNaN(stock.priceChange) ? 0 : stock.priceChange,
              priceChangePercent: isNaN(stock.priceChangePercent) ? 0 : stock.priceChangePercent,
              shares: isNaN(stock.shares || 0) ? 0 : stock.shares || 0,
              averagePrice: isNaN(stock.averagePrice || 0) ? 0 : stock.averagePrice || 0,
            }))

            setStocks(validatedStocks)

            // Update tab stocks with fresh data
            setTabStocks((prevTabStocks) =>
              prevTabStocks.map((tabStock) => {
                const updatedStock = validatedStocks.find((s) => s.symbol === tabStock.symbol)
                return updatedStock || tabStock
              }),
            )
          }
        }
      } catch (error) {
        console.error("Failed to update stock data:", error)
      }
    }, 10000) // Update every 10 seconds as fallback

    return () => clearInterval(intervalId)
  }, [isClient, setStocks])

  const handleSelectStock = (stock: Stock) => {
    setSelectedStock(stock)

    // If the stock is not already in tabs, add it
    if (!tabStocks.some((s) => s.symbol === stock.symbol)) {
      // Limit to 5 tabs maximum
      if (tabStocks.length >= 5) {
        setTabStocks([...tabStocks.slice(1), stock])
      } else {
        setTabStocks([...tabStocks, stock])
      }
    }
  }

  const handleRemoveStock = (stockToRemove: Stock) => {
    // Don't allow removing the last tab
    if (tabStocks.length <= 1) {
      return
    }

    // Remove the stock from tabs
    const newTabStocks = tabStocks.filter((stock) => stock.symbol !== stockToRemove.symbol)

    // If we're removing the currently selected stock, select another one
    if (selectedStock?.symbol === stockToRemove.symbol && newTabStocks.length > 0) {
      setSelectedStock(newTabStocks[newTabStocks.length - 1])
    }

    // Update tabs
    setTabStocks(newTabStocks)
  }

  const handleIntervalChange = (interval: string) => {
    setChartInterval(interval)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Loading stock data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen" role="alert">
        <div className="bg-destructive/10 text-destructive p-6 rounded-md max-w-md text-center">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <StockHeader />
      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        <aside className="w-full md:w-80 flex-shrink-0 border-b md:border-b-0 md:border-r">
          <WatchlistSidebar stocks={stocks} selectedStock={selectedStock} onSelectStock={handleSelectStock} />
        </aside>
        <main className="flex-1 flex flex-col overflow-hidden">
          <nav aria-label="Stock tabs">
            <StockTabs
              stocks={stocks}
              selectedStock={selectedStock}
              onSelectStock={handleSelectStock}
              onRemoveStock={handleRemoveStock}
              tabStocks={tabStocks}
            />
          </nav>
          <section className="flex-1 p-4 overflow-hidden">
            <div className="h-full flex flex-col">
              <ChartControls onIntervalChange={handleIntervalChange} currentInterval={chartInterval} />
              <div className="flex-1 overflow-hidden" aria-live="polite">
                {isClient && selectedStock && (
                  <TradingViewChart
                    symbol={selectedStock.symbol}
                    interval={chartInterval}
                    aria-label={`${selectedStock.name} stock chart with ${chartInterval} interval`}
                  />
                )}
              </div>
            </div>
          </section>
          <section aria-label="Portfolio holdings">
            <PortfolioTable stocks={stocks} />
          </section>
        </main>
      </div>
    </div>
  )
}
