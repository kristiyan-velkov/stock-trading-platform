"use client"

import { render, screen, fireEvent } from "@testing-library/react"
import { WatchlistItem } from "@/components/watchlist-item"
import type { Stock } from "@/lib/types"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock the MiniChart component
jest.mock("@/components/mini-chart", () => ({
  MiniChart: () => <div data-testid="mini-chart" />,
}))

describe("WatchlistItem", () => {
  // Test stock data
  const mockStock: Stock = {
    symbol: "AAPL",
    name: "Apple",
    price: 150.75,
    priceChange: 5.25,
    priceChangePercent: 3.6,
    chartData: [145, 147, 149, 150.75],
  }

  const mockOnClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders stock information correctly", () => {
    // Act
    render(<WatchlistItem stock={mockStock} isSelected={false} onClick={mockOnClick} />)

    // Assert
    expect(screen.getByText("Apple")).toBeInTheDocument()
    expect(screen.getByText("AAPL")).toBeInTheDocument()
    expect(screen.getByText("$150.75")).toBeInTheDocument()
    expect(screen.getByText("+5.25")).toBeInTheDocument()
    expect(screen.getByText("(+3.60%)")).toBeInTheDocument()
    expect(screen.getByTestId("mini-chart")).toBeInTheDocument()
  })

  it("applies selected styling when isSelected is true", () => {
    // Act
    const { container } = render(<WatchlistItem stock={mockStock} isSelected={true} onClick={mockOnClick} />)

    // Assert
    // Check if the selected class is applied
    const itemDiv = container.firstChild as HTMLElement
    expect(itemDiv).toHaveClass("bg-gray-50")
  })

  it("calls onClick when clicked", () => {
    // Act
    render(<WatchlistItem stock={mockStock} isSelected={false} onClick={mockOnClick} />)

    // Find the main div and click it
    const itemDiv = screen.getByText("Apple").closest("div")?.parentElement
    fireEvent.click(itemDiv as HTMLElement)

    // Assert
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it("displays negative price change correctly", () => {
    // Arrange
    const negativeStock: Stock = {
      ...mockStock,
      priceChange: -5.25,
      priceChangePercent: -3.6,
    }

    // Act
    render(<WatchlistItem stock={negativeStock} isSelected={false} onClick={mockOnClick} />)

    // Assert
    expect(screen.getByText("-5.25")).toBeInTheDocument()
    expect(screen.getByText("(-3.60%)")).toBeInTheDocument()

    // Check for red text color
    const priceChangeElement = screen.getByText("-5.25").closest("div")
    expect(priceChangeElement).toHaveClass("text-red-500")
  })

  it("handles NaN values gracefully", () => {
    // Arrange
    const nanStock: Stock = {
      ...mockStock,
      price: Number.NaN,
      priceChange: Number.NaN,
      priceChangePercent: Number.NaN,
    }

    // Act
    render(<WatchlistItem stock={nanStock} isSelected={false} onClick={mockOnClick} />)

    // Assert
    expect(screen.getByText("$0.00")).toBeInTheDocument()
    expect(screen.getByText("0.00")).toBeInTheDocument()
    expect(screen.getByText("(0.00%)")).toBeInTheDocument()
  })
})
