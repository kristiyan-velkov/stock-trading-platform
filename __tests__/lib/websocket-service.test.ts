import { webSocketService } from "@/lib/server/websocket-service";
import { useStockStore } from "@/store";
import type { Stock } from "@/lib/types";
import jest from "jest"; // Declare the jest variable

// Mock the Worker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  postMessage = jest.fn();
  terminate = jest.fn();
}

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => "mock-url");

// Mock the store
jest.mock("@/lib/store", () => ({
  useStockStore: {
    getState: jest.fn(),
  },
}));

describe("WebSocket Service", () => {
  let mockWorker: MockWorker;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create a new mock worker
    mockWorker = new MockWorker();

    // Mock Worker constructor to return our mock
    global.Worker = jest.fn(() => mockWorker) as unknown as typeof Worker;

    // Mock store state
    const mockStocks: Stock[] = [
      {
        symbol: "AAPL",
        name: "Apple",
        price: 150,
        priceChange: 5,
        priceChangePercent: 3.33,
        chartData: [145, 147, 149, 150],
      },
      {
        symbol: "MSFT",
        name: "Microsoft",
        price: 300,
        priceChange: -2,
        priceChangePercent: -0.67,
        chartData: [302, 301, 299, 300],
      },
    ];

    const mockUpdateStock = jest.fn();
    (useStockStore.getState as jest.Mock).mockReturnValue({
      stocks: mockStocks,
      updateStock: mockUpdateStock,
    });
  });

  afterEach(() => {
    // Clean up
    webSocketService.close();
  });

  it("should initialize the WebSocket worker with symbols", () => {
    // Arrange
    const symbols = ["AAPL", "MSFT"];

    // Act
    webSocketService.initialize(symbols);

    // Assert
    expect(global.Worker).toHaveBeenCalled();
    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      type: "init",
      data: { symbols },
    });
  });

  it("should update symbols", () => {
    // Arrange
    webSocketService.initialize(["AAPL"]);
    const newSymbols = ["AAPL", "MSFT", "GOOGL"];

    // Act
    webSocketService.updateSymbols(newSymbols);

    // Assert
    expect(mockWorker.postMessage).toHaveBeenCalledWith({
      type: "update_symbols",
      data: { symbols: newSymbols },
    });
  });

  it("should close the WebSocket connection", () => {
    // Arrange
    webSocketService.initialize(["AAPL"]);

    // Act
    webSocketService.close();

    // Assert
    expect(mockWorker.postMessage).toHaveBeenCalledWith({ type: "close" });
    expect(mockWorker.terminate).toHaveBeenCalled();
  });

  it("should update stock price when receiving a price update message", () => {
    // Arrange
    webSocketService.initialize(["AAPL"]);
    const mockUpdateStock = useStockStore.getState().updateStock;

    // Simulate a message from the worker
    const mockMessage = {
      data: {
        type: "price_update",
        data: {
          symbol: "AAPL",
          price: "155.00",
        },
      },
    };

    // Act
    // Trigger the onmessage handler
    if (mockWorker.onmessage) {
      mockWorker.onmessage(mockMessage as unknown as MessageEvent);
    }

    // Assert
    expect(mockUpdateStock).toHaveBeenCalledWith("AAPL", {
      price: 155,
      priceChange: 5, // 155 - 150
      priceChangePercent: expect.any(Number),
      chartData: expect.arrayContaining([155]), // Should include the new price
    });
  });

  it("should handle invalid price data gracefully", () => {
    // Arrange
    webSocketService.initialize(["AAPL"]);
    const mockUpdateStock = useStockStore.getState().updateStock;

    // Simulate a message with invalid price
    const mockMessage = {
      data: {
        type: "price_update",
        data: {
          symbol: "AAPL",
          price: "invalid",
        },
      },
    };

    // Act
    if (mockWorker.onmessage) {
      mockWorker.onmessage(mockMessage as unknown as MessageEvent);
    }

    // Assert
    expect(mockUpdateStock).not.toHaveBeenCalled(); // Should not update with invalid data
  });
});
