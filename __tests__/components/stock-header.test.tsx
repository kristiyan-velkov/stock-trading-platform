import { render, screen } from "@testing-library/react";
import { StockHeader } from "@/components/stock-header";
import { useStockStore } from "@/store";
import jest from "jest"; // Declare the jest variable

// Mock the store
jest.mock("@/lib/store", () => ({
  useStockStore: jest.fn(),
}));

describe("StockHeader", () => {
  beforeEach(() => {
    // Mock the store hook
    (useStockStore as jest.Mock).mockReturnValue({
      portfolioValue: 1234.56,
      currency: "USD",
    });
  });

  it("renders the header with portfolio value", () => {
    // Act
    render(<StockHeader />);

    // Assert
    expect(screen.getByText("Invest")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
    expect(screen.getByText("1234.56")).toBeInTheDocument();
  });

  it("formats the portfolio value correctly", () => {
    // Arrange
    (useStockStore as jest.Mock).mockReturnValue({
      portfolioValue: 9876.54,
      currency: "EUR",
    });

    // Act
    render(<StockHeader />);

    // Assert
    expect(screen.getByText("EUR")).toBeInTheDocument();
    expect(screen.getByText("9876.54")).toBeInTheDocument();
  });

  it("handles zero portfolio value", () => {
    // Arrange
    (useStockStore as jest.Mock).mockReturnValue({
      portfolioValue: 0,
      currency: "USD",
    });

    // Act
    render(<StockHeader />);

    // Assert
    expect(screen.getByText("0.00")).toBeInTheDocument();
  });
});
