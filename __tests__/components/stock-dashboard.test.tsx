import { render, screen, waitFor } from "@testing-library/react";
import StockDashboard from "@/components/stock-dashboard";
import { fetchStockData } from "@/lib/server/api";
import { webSocketService } from "@/lib/server/websocket-service";
import jest from "jest"; // Import jest to declare the variable

// Mock the API and WebSocket service
jest.mock("@/lib/api", () => ({
  fetchStockData: jest.fn(),
}));

jest.mock("@/lib/websocket-service", () => ({
  webSocketService: {
    initialize: jest.fn(),
    updateSymbols: jest.fn(),
    close: jest.fn(),
  },
}));

// Mock the store
jest.mock("@/lib/store", () => {
  const actualStore = jest.requireActual("@/lib/store");
  return {
    useStockStore: actualStore.useStockStore,
  };
});

// Mock child components
jest.mock("@/components/stock-header", () => ({
  StockHeader: () => <div data-testid="stock-header">Stock Header</div>,
}));

jest.mock("@/components/watchlist-sidebar", () => ({
  WatchlistSidebar: () => (
    <div data-testid="watchlist-sidebar">Watchlist Sidebar</div>
  ),
}));

jest.mock("@/components/portfolio-table", () => ({
  PortfolioTable: () => (
    <div data-testid="portfolio-table">Portfolio Table</div>
  ),
}));

jest.mock("@/components/stock-tabs", () => ({
  StockTabs: () => <div data-testid="stock-tabs">Stock Tabs</div>,
}));

jest.mock("@/components/chart-controls", () => ({
  ChartControls: () => <div data-testid="chart-controls">Chart Controls</div>,
}));

jest.mock("@/components/trading-view-chart", () => ({
  TradingViewChart: () => (
    <div data-testid="trading-view-chart">TradingView Chart</div>
  ),
}));

describe("StockDashboard", () => {
  // Mock stock data
  const mockStocks = [
    {
      symbol: "NVDA",
      name: "Nvidia",
      price: 450.75,
      priceChange: 15.25,
      priceChangePercent: 3.5,
      chartData: [435, 440, 445, 450.75],
    },
    {
      symbol: "AAPL",
      name: "Apple",
      price: 150.75,
      priceChange: 5.25,
      priceChangePercent: 3.6,
      chartData: [145, 147, 149, 150.75],
    },
    {
      symbol: "TSLA",
      name: "Tesla",
      price: 250.5,
      priceChange: -10.25,
      priceChangePercent: -3.9,
      chartData: [260, 255, 252, 250.5],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful API response
    (fetchStockData as jest.Mock).mockResolvedValue(mockStocks);

    // Mock window.isClient
    Object.defineProperty(window, "isClient", {
      writable: true,
      value: true,
    });
  });

  it("renders loading state initially", () => {
    // Act
    render(<StockDashboard />);

    // Assert
    expect(screen.getByText("Loading stock data...")).toBeInTheDocument();
  });

  it("renders dashboard components after loading", async () => {
    // Act
    render(<StockDashboard />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(
        screen.queryByText("Loading stock data...")
      ).not.toBeInTheDocument();
    });

    // Assert
    expect(screen.getByTestId("stock-header")).toBeInTheDocument();
    expect(screen.getByTestId("watchlist-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("stock-tabs")).toBeInTheDocument();
    expect(screen.getByTestId("chart-controls")).toBeInTheDocument();
    expect(screen.getByTestId("trading-view-chart")).toBeInTheDocument();
    expect(screen.getByTestId("portfolio-table")).toBeInTheDocument();
  });

  it("initializes WebSocket service with stock symbols", async () => {
    // Act
    render(<StockDashboard />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(
        screen.queryByText("Loading stock data...")
      ).not.toBeInTheDocument();
    });

    // Assert
    expect(webSocketService.initialize).toHaveBeenCalledWith(
      expect.arrayContaining(["NVDA", "AAPL", "TSLA", "MSFT", "AMZN"])
    );
  });

  it("cleans up WebSocket service on unmount", async () => {
    // Act
    const { unmount } = render(<StockDashboard />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(
        screen.queryByText("Loading stock data...")
      ).not.toBeInTheDocument();
    });

    // Unmount the component
    unmount();

    // Assert
    expect(webSocketService.close).toHaveBeenCalled();
  });

  it("handles API errors gracefully", async () => {
    // Arrange
    (fetchStockData as jest.Mock).mockRejectedValue(new Error("API error"));

    // Act
    render(<StockDashboard />);

    // Wait for loading to complete (it should still finish even with an error)
    await waitFor(() => {
      expect(
        screen.queryByText("Loading stock data...")
      ).not.toBeInTheDocument();
    });

    // Assert - should render the dashboard with empty data
    expect(screen.getByTestId("stock-header")).toBeInTheDocument();
  });
});
