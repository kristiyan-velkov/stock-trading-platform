import type { Stock } from "@/lib/types"

// Use environment variable for API key
const TWELVE_DATA_API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY || ""

/**
 * Fetch stock price data from Twelve Data API
 * @param symbols Array of stock symbols to fetch
 * @returns Array of stock data objects
 */
export async function fetchStockData(symbols: string[]): Promise<Stock[]> {
  try {
    // Create API URLs
    const priceUrls = symbols.map(
      (symbol) => `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
    )
    const quoteUrls = symbols.map(
      (symbol) => `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${TWELVE_DATA_API_KEY}`,
    )
    const timeSeriesUrls = symbols.map(
      (symbol) =>
        `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${TWELVE_DATA_API_KEY}`,
    )

    // Fetch data in parallel
    const [priceResponses, quoteResponses, timeSeriesResponses] = await Promise.all([
      Promise.all(priceUrls.map((url) => fetch(url).then((res) => res.json()))),
      Promise.all(quoteUrls.map((url) => fetch(url).then((res) => res.json()))),
      Promise.all(timeSeriesUrls.map((url) => fetch(url).then((res) => res.json()))),
    ])

    // Process and combine the data
    return symbols.map((symbol, index) => {
      const priceData = priceResponses[index]
      const quoteData = quoteResponses[index]
      const timeSeriesData = timeSeriesResponses[index]

      // Default values in case API fails
      let price = 100
      let priceChange = 0
      let priceChangePercent = 0
      let chartData: number[] = []

      // Extract price if available and valid
      if (priceData && !priceData.error && priceData.price) {
        const parsedPrice = Number.parseFloat(priceData.price)
        if (!isNaN(parsedPrice)) {
          price = parsedPrice
        }
      }

      // Extract price change and percent if available and valid
      if (quoteData && !quoteData.error) {
        const parsedChange = Number.parseFloat(quoteData.change || "0")
        const parsedPercentChange = Number.parseFloat(quoteData.percent_change || "0")

        if (!isNaN(parsedChange)) {
          priceChange = parsedChange
        }

        if (!isNaN(parsedPercentChange)) {
          priceChangePercent = parsedPercentChange
        }
      }

      // Extract chart data if available
      if (timeSeriesData && !timeSeriesData.error && timeSeriesData.values && Array.isArray(timeSeriesData.values)) {
        const validChartData = timeSeriesData.values
          .slice(0, 30)
          .map((item: any) => {
            const closeValue = Number.parseFloat(item.close || "0")
            return isNaN(closeValue) ? price : closeValue
          })
          .reverse()

        if (validChartData.length > 0) {
          chartData = validChartData
        } else {
          chartData = generateMockChartData(30, price, priceChange >= 0)
        }
      } else {
        // Generate mock chart data if API fails
        chartData = generateMockChartData(30, price, priceChange >= 0)
      }

      // Generate mock shares and average price for the first two stocks
      const shares = index < 2 ? Number.parseFloat((Math.random() * 20).toFixed(6)) : 0
      const averagePrice = index < 2 ? price * (0.8 + Math.random() * 0.4) : 0

      return {
        symbol,
        name: getStockName(symbol),
        price,
        priceChange,
        priceChangePercent,
        chartData,
        shares,
        averagePrice,
      }
    })
  } catch (error) {
    console.error("Error fetching stock data:", error)
    return []
  }
}

/**
 * Fetch historical data for charts
 * @param symbol Stock symbol
 * @param interval Time interval (e.g., "1day", "1week")
 * @returns Array of candle data objects
 */
export async function fetchHistoricalData(symbol: string, interval = "1day") {
  try {
    const response = await fetch(
      `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=200&apikey=${TWELVE_DATA_API_KEY}`,
    )
    const data = await response.json()

    if (data.error) {
      console.error("API Error:", data.error)
      return generateMockCandleData(200)
    }

    if (!data.values || data.values.length === 0) {
      return generateMockCandleData(200)
    }

    // Format the data for the chart
    return data.values
      .map((item: any) => ({
        time: item.datetime.split(" ")[0], // Format: YYYY-MM-DD
        open: Number.parseFloat(item.open),
        high: Number.parseFloat(item.high),
        low: Number.parseFloat(item.low),
        close: Number.parseFloat(item.close),
        volume: Number.parseFloat(item.volume),
      }))
      .reverse() // Reverse to get chronological order
  } catch (error) {
    console.error("Error fetching historical data:", error)
    return generateMockCandleData(200)
  }
}

/**
 * Generate mock candle data when API fails
 * @param count Number of data points to generate
 * @returns Array of candle data objects
 */
function generateMockCandleData(count: number) {
  const data = []
  const time = new Date()
  time.setDate(time.getDate() - count)

  let price = 100 + Math.random() * 100

  for (let i = 0; i < count; i++) {
    const date = new Date(time)
    date.setDate(date.getDate() + i)

    // Generate random price movement
    const change = (Math.random() - 0.5) * 5
    const open = price
    const close = price + change
    price = close

    // Generate high and low
    const high = Math.max(open, close) + Math.random() * 2
    const low = Math.min(open, close) - Math.random() * 2

    // Generate volume
    const volume = Math.round(1000000 + Math.random() * 10000000)

    data.push({
      time: date.toISOString().split("T")[0],
      open,
      high,
      low,
      close,
      volume,
    })
  }

  return data
}

/**
 * Get stock name from symbol
 * @param symbol Stock symbol
 * @returns Stock name
 */
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

/**
 * Generate mock chart data when API fails
 * @param points Number of data points to generate
 * @param currentPrice Current price to end at
 * @param isPositive Whether the trend should be positive
 * @returns Array of price points
 */
function generateMockChartData(points: number, currentPrice: number, isPositive: boolean): number[] {
  const data = []
  let value = currentPrice * 0.9 // Start at 90% of current price

  // Determine if the trend should be generally up or down
  const trendFactor = isPositive ? 1.01 : 0.99

  for (let i = 0; i < points; i++) {
    // Random price movement with a bias based on trend
    const randomFactor = 0.98 + Math.random() * 0.04
    value = value * randomFactor * trendFactor
    data.push(value)
  }

  // Ensure the last point is the current price
  data[points - 1] = currentPrice

  return data
}

/**
 * Search for stocks
 * @param query Search query
 * @returns Search results
 */
export async function searchStocks(query: string) {
  try {
    const response = await fetch(
      `https://api.twelvedata.com/symbol_search?symbol=${query}&apikey=${TWELVE_DATA_API_KEY}`,
    )
    return await response.json()
  } catch (error) {
    console.error("Error searching stocks:", error)
    return { data: [] }
  }
}
