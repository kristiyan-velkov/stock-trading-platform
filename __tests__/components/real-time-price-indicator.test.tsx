import { render, screen, act } from "@testing-library/react"
import { RealTimePriceIndicator } from "@/components/real-time-price-indicator"
import jest from "jest" // Import jest to declare the variable

// Mock timers
jest.useFakeTimers()

describe("RealTimePriceIndicator", () => {
  it("renders the price correctly", () => {
    // Act
    render(<RealTimePriceIndicator price={150.75} priceChange={5.25} />)

    // Assert
    expect(screen.getByText("$150.75")).toBeInTheDocument()
    expect(screen.getByText("$150.75")).toHaveClass("text-green-500")
  })

  it("applies green color for positive price change", () => {
    // Act
    render(<RealTimePriceIndicator price={150.75} priceChange={5.25} />)

    // Assert
    const priceElement = screen.getByText("$150.75")
    expect(priceElement).toHaveClass("text-green-500")
  })

  it("applies red color for negative price change", () => {
    // Act
    render(<RealTimePriceIndicator price={150.75} priceChange={-5.25} />)

    // Assert
    const priceElement = screen.getByText("$150.75")
    expect(priceElement).toHaveClass("text-red-500")
  })

  it("shows update animation when price changes", () => {
    // Arrange
    const { rerender, container } = render(<RealTimePriceIndicator price={150.75} priceChange={5.25} />)

    // Act - update with a higher price
    rerender(<RealTimePriceIndicator price={155.75} priceChange={10.25} />)

    // Assert - should have green background for price increase
    const indicatorDiv = container.firstChild as HTMLElement
    expect(indicatorDiv).toHaveClass("bg-green-100")

    // Fast-forward timers to clear animation
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    // Animation should be cleared
    expect(indicatorDiv).not.toHaveClass("bg-green-100")
  })

  it("shows red background for price decrease", () => {
    // Arrange
    const { rerender, container } = render(<RealTimePriceIndicator price={150.75} priceChange={5.25} />)

    // Act - update with a lower price
    rerender(<RealTimePriceIndicator price={145.75} priceChange={-5.25} />)

    // Assert - should have red background for price decrease
    const indicatorDiv = container.firstChild as HTMLElement
    expect(indicatorDiv).toHaveClass("bg-red-100")
  })

  it("handles NaN values gracefully", () => {
    // Act
    render(<RealTimePriceIndicator price={Number.NaN} priceChange={Number.NaN} />)

    // Assert
    expect(screen.getByText("$0.00")).toBeInTheDocument()
  })
})
