import { webSocketService } from "@/lib/websocket/websocket-service";
import { useStockStore } from "@/store";

jest.mock("@/store", () => ({
  useStockStore: {
    getState: jest.fn(),
  },
}));

const mockPostMessage = jest.fn();
const mockTerminate = jest.fn();

class MockWorker {
  onmessage: ((event: any) => void) | null = null;
  constructor(_: string) {
    // Required to match the Worker interface
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage({ data: {} });
      }
    }, 0);
  }
  postMessage = mockPostMessage;
  terminate = mockTerminate;
}
global.Worker = MockWorker as any;

beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => "blob://mock-worker.js");
});

beforeEach(() => {
  jest.clearAllMocks();

  jest.spyOn(console, "warn").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "info").mockImplementation(() => {});

  (useStockStore.getState as jest.Mock).mockReturnValue({
    stocks: [
      {
        symbol: "AAPL",
        price: 100,
        chartData: Array(30).fill(100),
      },
    ],
    updateStock: jest.fn(),
  });
});

describe("WebSocketService", () => {
  it("initializes worker and sends init message", () => {
    webSocketService.initialize(["AAPL"]);
    expect(mockPostMessage).toHaveBeenCalledWith({
      type: "init",
      data: { symbols: ["AAPL"] },
    });
  });

  it("sends update_symbols message when already initialized", () => {
    webSocketService.initialize(["AAPL"]);
    webSocketService.initialize(["GOOG"]);
    expect(mockPostMessage).toHaveBeenCalledWith({
      type: "update_symbols",
      data: { symbols: ["GOOG"] },
    });
  });

  it("handles price_update message and updates stock", () => {
    webSocketService.initialize(["AAPL"]);

    const mockPriceUpdate = {
      data: { symbol: "AAPL", price: "110" },
      type: "price_update",
    };

    // simulate message from worker
    (webSocketService as any).handleWorkerMessage({ data: mockPriceUpdate });

    const store = useStockStore.getState();
    expect(store.updateStock).toHaveBeenCalledWith("AAPL", {
      price: 110,
      priceChange: 10,
      priceChangePercent: 10,
      chartData: [...Array(29).fill(100), 110],
    });
  });

  it("ignores update if symbol is not in the store", () => {
    (useStockStore.getState as jest.Mock).mockReturnValue({
      stocks: [],
      updateStock: jest.fn(),
    });

    webSocketService.initialize(["MSFT"]);
    const mockMessage = {
      data: { symbol: "MSFT", price: "200" },
      type: "price_update",
    };
    (webSocketService as any).handleWorkerMessage({ data: mockMessage });

    const store = useStockStore.getState();
    expect(store.updateStock).not.toHaveBeenCalled();
  });

  it("closes the worker correctly", () => {
    webSocketService.initialize(["AAPL"]);
    webSocketService.close();

    expect(mockPostMessage).toHaveBeenCalledWith({ type: "close" });
    expect(mockTerminate).toHaveBeenCalled();
  });
});
