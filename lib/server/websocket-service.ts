import { useStockStore } from "@/store";

const TWELVE_DATA_API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY ?? "";

if (!TWELVE_DATA_API_KEY) {
  console.warn("Missing Twelve Data API Key for WebSocket connection.");
}

class WebSocketService {
  private worker: Worker | null = null;
  private isInitialized = false;
  private reconnectAttempts = 0;
  private readonly reconnectInterval = 60000;
  private readonly maxReconnectAttempts = 2;

  public initialize(symbols: string[]) {
    if (typeof window === "undefined") return;

    if (!this.isInitialized) {
      try {
        const blob = new Blob([createWorkerScript(TWELVE_DATA_API_KEY)], {
          type: "application/javascript",
        });

        this.worker = new Worker(URL.createObjectURL(blob));
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
    this.worker?.postMessage({
      type: "update_symbols",
      data: { symbols },
    });
  }

  private handleWorkerMessage = (event: MessageEvent) => {
    const { type, data } = event.data;
    if (type === "price_update") this.updateStockPrice(data);
  };

  private updateStockPrice(data: any) {
    if (!data?.symbol) return;

    const store = useStockStore.getState();
    const stock = store.stocks.find((s) => s.symbol === data.symbol);
    if (!stock) return;

    const newPrice = parseFloat(data.price);
    if (isNaN(newPrice)) return;

    const priceChange = newPrice - stock.price;
    const priceChangePercent = (priceChange / stock.price) * 100;

    store.updateStock(data.symbol, {
      price: newPrice,
      priceChange: isNaN(priceChange) ? 0 : priceChange,
      priceChangePercent: isNaN(priceChangePercent) ? 0 : priceChangePercent,
      chartData: [...stock.chartData.slice(1), newPrice],
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

function createWorkerScript(apiKey: string): string {
  return `
    const TWELVE_DATA_API_KEY = "${apiKey}";
    let socket = null;
    let reconnectTimer = null;
    let symbols = [];
    let isConnecting = false;

    function initWebSocket(stockSymbols) {
      if (isConnecting) return;

      isConnecting = true;
      symbols = stockSymbols;
      if (socket) socket.close();

      socket = new WebSocket(\`wss://ws.twelvedata.com/v1/quotes/price?apikey=\${TWELVE_DATA_API_KEY}\`);

      socket.addEventListener("open", () => {
        isConnecting = false;
        const msg = {
          action: "subscribe",
          params: { symbols: symbols.join(",") },
        };
        socket.send(JSON.stringify(msg));
        setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ action: "heartbeat" }));
          }
        }, 30000);
      });

      socket.addEventListener("message", (event) => {
        try {
          const data = JSON.parse(event.data);
          self.postMessage({ type: "price_update", data });
        } catch (err) {
          console.error("WebSocket JSON parse error:", err);
        }
      });

      socket.addEventListener("close", (event) => {
        isConnecting = false;
        if (!event.wasClean) {
          reconnectTimer = self.setTimeout(() => initWebSocket(symbols), 2000);
        }
      });

      socket.addEventListener("error", (err) => {
        console.error("WebSocket error:", err);
        isConnecting = false;
      });
    }

    self.addEventListener("message", (event) => {
      const { type, data } = event.data;

      switch (type) {
        case "init":
          initWebSocket(data.symbols);
          break;

        case "update_symbols":
          symbols = data.symbols;
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ action: "unsubscribe", params: { symbols: "*" } }));
            socket.send(JSON.stringify({ action: "subscribe", params: { symbols: symbols.join(",") } }));
          } else {
            initWebSocket(symbols);
          }
          break;

        case "close":
          if (socket) socket.close();
          if (reconnectTimer) clearTimeout(reconnectTimer);
          break;
      }
    });
  `;
}

export const webSocketService = new WebSocketService();
