import { NextResponse } from "next/server"
import type { Stock } from "@/lib/types"

const TWELVE_DATA_API_KEY = "8139b37a79f04b97b11872ba75411c60"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get("symbols")?.split(",") || ["AAPL", "MSFT", "GOOGL"]

  try {
    // Fetch data from Twelve Data API
    const pricePromises = symbols.map((symbol) =>
      fetch(`https://api.twelvedata.com/price?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`).then((res) =>
        res.json(),
      ),
    )

    const priceResponses = await Promise.all(pricePromises)

    // Process the data
    const stocks: Stock[] = symbols.map((symbol, index) => {
      const priceData = priceResponses[index]

      // Default values in case API fails
      let price = 100

      // Extract price if available
      if (priceData && !priceData.error) {
        price = Number.parseFloat(priceData.price)
      }

      // For demo purposes, we'll generate mock change data
      const priceChange = (Math.random() * 10 - 5) * (price / 100)
      const priceChangePercent = (priceChange / price) * 100

      return {
        symbol,
        name: getStockName(symbol),
        price,
        priceChange,
        priceChangePercent,
        chartData: generateMockChartData(30),
        shares: index < 2 ? Number.parseFloat((Math.random() * 20).toFixed(6)) : 0,
        averagePrice: index < 2 ? price * (0.8 + Math.random() * 0.4) : 0,
      }
    })

    return NextResponse.json({ stocks })
  } catch (error) {
    console.error("Error fetching stock data:", error)
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
  }
}

function getStockName(symbol: string): string {
  const stockNames: Record<string, string> = {
    NVDA: "Nvidia",
    AAPL: "Apple",
    TSLA: "Tesla",
    MSFT: "Microsoft",
    AMZN: "Amazon",
    GOOGL: "Google",
    META: "Meta",
    NFLX: "Netflix",
  }

  return stockNames[symbol] || symbol
}

function generateMockChartData(points: number): number[] {
  const data = []
  let value = 100 + Math.random() * 100

  for (let i = 0; i < points; i++) {
    // Random price movement
    value = value * (0.98 + Math.random() * 0.04)
    data.push(value)
  }

  return data
}
