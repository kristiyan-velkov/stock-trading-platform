import { useStockStore } from "@/store";

const TWELVE_DATA_API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY ?? "";

if (!TWELVE_DATA_API_KEY) {
  console.warn("Missing Twelve Data API Key for WebSocket connection.");
}

const MAX_CHART_LENGTH = 30;

class WebSocketService {
  private worker: Worker | null = null;
  private isInitialized = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 2;
  private readonly reconnectInterval = 60000;
  private lastSymbols: string[] = [];

  public initialize(symbols: string[]) {
    if (typeof window === "undefined") return;

    if (!this.isInitialized) {
      try {
        this.lastSymbols = symbols;
        this.worker = new Worker(
          new URL("./workers/stock-websocket.worker.ts", import.meta.url),
          { type: "module" }
        );
        this.worker.onmessage = this.handleWorkerMessage;
        this.worker.postMessage({ type: "init", data: { symbols } });
        this.isInitialized = true;
        console.info("WebSocket worker initialized.");
      } catch (error) {
        console.error("WebSocket worker initialization failed:", error);
        this.attemptReconnect(symbols);
      }
    } else {
      this.updateSymbols(symbols);
    }
  }

  public updateSymbols(symbols: string[]) {
    if (JSON.stringify(symbols) === JSON.stringify(this.lastSymbols)) return;
    this.lastSymbols = symbols;
    this.worker?.postMessage({ type: "update_symbols", data: { symbols } });
  }

  private handleWorkerMessage = (event: MessageEvent) => {
    const { type, data } = event.data;
    if (type === "price_update") this.updateStockPrice(data);
  };

  private updateStockPrice(data: { symbol: string; price: string }) {
    if (!data?.symbol) return;
    const store = useStockStore.getState();
    const stock = store.stocks.find((s) => s.symbol === data.symbol);
    if (!stock) return;

    const newPrice = parseFloat(data.price);
    if (isNaN(newPrice) || stock.price === 0) return;

    const priceChange = newPrice - stock.price;
    const priceChangePercent = (priceChange / stock.price) * 100;

    store.updateStock(data.symbol, {
      price: newPrice,
      priceChange,
      priceChangePercent,
      chartData: [...stock.chartData.slice(-MAX_CHART_LENGTH + 1), newPrice],
    });
  }

  private attemptReconnect(symbols: string[]) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("WebSocket reconnect limit reached.");
      this.reconnectAttempts = 0;
      return;
    }

    this.reconnectAttempts++;
    console.info(
      `Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
    );

    setTimeout(() => {
      this.isInitialized = false;
      this.initialize(symbols);
    }, this.reconnectInterval);
  }

  public close() {
    if (!this.worker) return;
    this.worker.postMessage({ type: "close" });
    this.worker.terminate();
    this.worker = null;
    this.isInitialized = false;
  }
}

export const webSocketService = new WebSocketService();
