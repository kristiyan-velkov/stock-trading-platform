import { fetchStockData, fetchHistoricalData } from "@/lib/api"
import jest from "jest"

// Mock the fetch function
global.fetch = jest.fn()

describe("API Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("fetchStockData", () => {
    it("should fetch stock data for given symbols", async () => {
      // Arrange
      const mockSymbols = ["AAPL", "MSFT"]

      // Mock successful API responses
      const mockPriceResponse = { price: "150.00" }
      const mockQuoteResponse = {
        change: "5.00",
        percent_change: "3.33",
      }
      const mockTimeSeriesResponse = {
        values: [
          { close: "150.00", datetime: "2023-01-01" },
          { close: "145.00", datetime: "2023-01-02" },
        ],
      }

      // Setup fetch mock to return different responses for different URLs
      ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes("price")) {
          return Promise.resolve({
            json: () => Promise.resolve(mockPriceResponse),
          })
        } else if (url.includes("quote")) {
          return Promise.resolve({
            json: () => Promise.resolve(mockQuoteResponse),
          })
        } else if (url.includes("time_series")) {
          return Promise.resolve({
            json: () => Promise.resolve(mockTimeSeriesResponse),
          })
        }
        return Promise.reject(new Error("Unknown URL"))
      })

      // Act
      const result = await fetchStockData(mockSymbols)

      // Assert
      expect(result.length).toBe(2)
      expect(result[0].symbol).toBe("AAPL")
      expect(result[0].price).toBe(150)
      expect(result[0].priceChange).toBe(5)
      expect(result[0].priceChangePercent).toBe(3.33)
      expect(result[0].chartData.length).toBeGreaterThan(0)

      // Verify fetch was called with correct URLs
      expect(global.fetch).toHaveBeenCalledTimes(6) // 2 symbols * 3 API calls per symbol
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("price?symbol=AAPL"))
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("quote?symbol=AAPL"))
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("time_series?symbol=AAPL"))
    })

    it("should handle API errors gracefully", async () => {
      // Arrange
      const mockSymbols = ["AAPL"]

      // Mock API error responses
      ;(global.fetch as jest.Mock).mockImplementation(() => {
        return Promise.resolve({
          json: () => Promise.resolve({ error: "API error" }),
        })
      })

      // Act
      const result = await fetchStockData(mockSymbols)

      // Assert
      expect(result.length).toBe(1)
      expect(result[0].symbol).toBe("AAPL")
      // Should use default values when API fails
      expect(result[0].price).toBe(100)
      expect(result[0].chartData.length).toBeGreaterThan(0)
    })

    it("should handle network errors gracefully", async () => {
      // Arrange
      const mockSymbols = ["AAPL"]

      // Mock network error
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"))

      // Act
      const result = await fetchStockData(mockSymbols)

      // Assert
      expect(result).toEqual([])
    })
  })

  describe("fetchHistoricalData", () => {
    it("should fetch historical data for a given symbol and interval", async () => {
      // Arrange
      const mockSymbol = "AAPL"
      const mockInterval = "1day"

      // Mock successful API response
      const mockResponse = {
        values: [
          {
            datetime: "2023-01-01",
            open: "145.00",
            high: "152.00",
            low: "144.00",
            close: "150.00",
            volume: "1000000",
          },
          {
            datetime: "2023-01-02",
            open: "150.00",
            high: "155.00",
            low: "149.00",
            close: "153.00",
            volume: "1200000",
          },
        ],
      }
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve(mockResponse),
      })

      // Act
      const result = await fetchHistoricalData(mockSymbol, mockInterval)

      // Assert
      expect(result.length).toBe(2)
      expect(result[0].time).toBe("2023-01-02") // Note: data is reversed
      expect(result[0].open).toBe(150)
      expect(result[0].high).toBe(155)
      expect(result[0].low).toBe(149)
      expect(result[0].close).toBe(153)
      expect(result[0].volume).toBe(1200000)

      // Verify fetch was called with correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`time_series?symbol=${mockSymbol}&interval=${mockInterval}`),
      )
    })

    it("should generate mock data when API returns an error", async () => {
      // Arrange
      const mockSymbol = "AAPL"

      // Mock API error
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ error: "API error" }),
      })

      // Act
      const result = await fetchHistoricalData(mockSymbol)

      // Assert
      expect(result.length).toBe(200) // Default mock data size
      expect(result[0]).toHaveProperty("time")
      expect(result[0]).toHaveProperty("open")
      expect(result[0]).toHaveProperty("high")
      expect(result[0]).toHaveProperty("low")
      expect(result[0]).toHaveProperty("close")
      expect(result[0]).toHaveProperty("volume")
    })

    it("should generate mock data when API returns empty values", async () => {
      // Arrange
      const mockSymbol = "AAPL"

      // Mock empty API response
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ values: [] }),
      })

      // Act
      const result = await fetchHistoricalData(mockSymbol)

      // Assert
      expect(result.length).toBe(200) // Default mock data size
    })
  })
})
