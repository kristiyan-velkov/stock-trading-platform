import { useStockStore } from "@/lib/store"
import type { Stock } from "@/lib/types"

// Mock stock data
const mockStocks: Stock[] = [
  {
    symbol: "AAPL",
    name: "Apple",
    price: 150,
    priceChange: 5,
    priceChangePercent: 3.33,
    chartData: [145, 147, 149, 150],
    shares: 10,
    averagePrice: 140,
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    price: 300,
    priceChange: -2,
    priceChangePercent: -0.67,
    chartData: [302, 301, 299, 300],
    shares: 5,
    averagePrice: 290,
  },
]

describe("Stock Store", () => {
  beforeEach(() => {
    // Reset the store before each test
    useStockStore.setState({
      stocks: [],
      selectedStock: null,
      portfolioValue: 0,
      currency: "USD",
    })
  })

  it("should set stocks and calculate portfolio value", () => {
    // Act
    useStockStore.getState().setStocks(mockStocks)

    // Assert
    const state = useStockStore.getState()
    expect(state.stocks).toEqual(mockStocks)

    // Portfolio value should be (10 * 150) + (5 * 300) = 1500 + 1500 = 3000
    expect(state.portfolioValue).toBeCloseTo(3000)
  })

  it("should set selected stock", () => {
    // Arrange
    const stock = mockStocks[0]

    // Act
    useStockStore.getState().setSelectedStock(stock)

    // Assert
    expect(useStockStore.getState().selectedStock).toEqual(stock)
  })

  it("should update a stock", () => {
    // Arrange
    useStockStore.getState().setStocks(mockStocks)

    // Act
    useStockStore.getState().updateStock("AAPL", { price: 160, priceChange: 10, priceChangePercent: 6.67 })

    // Assert
    const state = useStockStore.getState()
    const updatedStock = state.stocks.find((s) => s.symbol === "AAPL")

    expect(updatedStock?.price).toBe(160)
    expect(updatedStock?.priceChange).toBe(10)
    expect(updatedStock?.priceChangePercent).toBe(6.67)

    // Portfolio value should be updated: (10 * 160) + (5 * 300) = 1600 + 1500 = 3100
    expect(state.portfolioValue).toBeCloseTo(3100)
  })

  it("should update selected stock when it matches the updated stock", () => {
    // Arrange
    useStockStore.getState().setStocks(mockStocks)
    useStockStore.getState().setSelectedStock(mockStocks[0])

    // Act
    useStockStore.getState().updateStock("AAPL", { price: 160 })

    // Assert
    const state = useStockStore.getState()
    expect(state.selectedStock?.price).toBe(160)
  })

  it("should not update selected stock when it does not match the updated stock", () => {
    // Arrange
    useStockStore.getState().setStocks(mockStocks)
    useStockStore.getState().setSelectedStock(mockStocks[1])

    // Act
    useStockStore.getState().updateStock("AAPL", { price: 160 })

    // Assert
    const state = useStockStore.getState()
    expect(state.selectedStock?.price).toBe(300) // MSFT price unchanged
  })

  it("should handle NaN values when calculating portfolio value", () => {
    // Arrange
    const stocksWithNaN: Stock[] = [
      {
        ...mockStocks[0],
        price: Number.NaN,
      },
      mockStocks[1],
    ]

    // Act
    useStockStore.getState().setStocks(stocksWithNaN)

    // Assert
    // Portfolio value should be (0) + (5 * 300) = 1500
    expect(useStockStore.getState().portfolioValue).toBeCloseTo(1500)
  })
})
