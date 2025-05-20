import { useStockStore } from "@/lib/store"

/**
 * WebSocket service for real-time stock data
 */
class WebSocketService {
  private worker: Worker | null = null
  private isInitialized = false
  private reconnectInterval = 2000 // 2 seconds
  private maxReconnectAttempts = 5
  private reconnectAttempts = 0

  /**
   * Initialize the WebSocket worker
   * @param symbols Array of stock symbols to subscribe to
   */
  public initialize(symbols: string[]) {
    if (typeof window === "undefined") return

    if (!this.isInitialized) {
      try {
        // Get API key from environment variable
        const apiKey = process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY || ""

        // Create a new worker using a blob URL
        const workerCode = `
          const TWELVE_DATA_API_KEY = "${apiKey}";
          
          // Define the WebSocket connection
          let socket = null;
          let reconnectTimer = null;
          let symbols = [];
          let isConnecting = false;
          
          // Initialize the WebSocket connection
          function initWebSocket(stockSymbols) {
            if (isConnecting) return;
            
            isConnecting = true;
            symbols = stockSymbols;
          
            // Close existing connection if any
            if (socket) {
              socket.close();
            }
          
            // Create a new WebSocket connection
            socket = new WebSocket(\`wss://ws.twelvedata.com/v1/quotes/price?apikey=\${TWELVE_DATA_API_KEY}\`);
          
            // Connection opened
            socket.addEventListener("open", () => {
              console.log("WebSocket connection established");
              isConnecting = false;
              
              // Subscribe to stock symbols
              if (socket && socket.readyState === WebSocket.OPEN) {
                const subscribeMsg = {
                  action: "subscribe",
                  params: {
                    symbols: symbols.join(","),
                  },
                };
                socket.send(JSON.stringify(subscribeMsg));
                
                // Send a heartbeat every 30 seconds to keep the connection alive
                setInterval(() => {
                  if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ action: "heartbeat" }));
                  }
                }, 30000);
              }
            });
          
            // Listen for messages
            socket.addEventListener("message", (event) => {
              try {
                const data = JSON.parse(event.data);
          
                // Forward the data to the main thread
                self.postMessage({
                  type: "price_update",
                  data: data,
                });
              } catch (error) {
                console.error("Error parsing WebSocket message:", error);
              }
            });
          
            // Connection closed
            socket.addEventListener("close", (event) => {
              console.log("WebSocket connection closed:", event.code, event.reason);
              isConnecting = false;
          
              // Attempt to reconnect after a delay
              if (!event.wasClean) {
                if (reconnectTimer) {
                  clearTimeout(reconnectTimer);
                }
                reconnectTimer = self.setTimeout(() => {
                  initWebSocket(symbols);
                }, 2000);
              }
            });
          
            // Connection error
            socket.addEventListener("error", (error) => {
              console.error("WebSocket error:", error);
              isConnecting = false;
            });
          }
          
          // Handle messages from the main thread
          self.addEventListener("message", (event) => {
            const { type, data } = event.data;
          
            switch (type) {
              case "init":
                // Initialize WebSocket with symbols
                initWebSocket(data.symbols);
                break;
          
              case "update_symbols":
                // Update the symbols to subscribe to
                symbols = data.symbols;
          
                // Reconnect with new symbols
                if (socket && socket.readyState === WebSocket.OPEN) {
                  // Unsubscribe from current symbols
                  const unsubscribeMsg = {
                    action: "unsubscribe",
                    params: {
                      symbols: "*",
                    },
                  };
                  socket.send(JSON.stringify(unsubscribeMsg));
          
                  // Subscribe to new symbols
                  const subscribeMsg = {
                    action: "subscribe",
                    params: {
                      symbols: symbols.join(","),
                    },
                  };
                  socket.send(JSON.stringify(subscribeMsg));
                } else {
                  // If socket is not open, initialize it
                  initWebSocket(symbols);
                }
                break;
          
              case "close":
                // Close the WebSocket connection
                if (socket) {
                  socket.close();
                  socket = null;
                }
          
                // Clear reconnect timer
                if (reconnectTimer) {
                  clearTimeout(reconnectTimer);
                  reconnectTimer = null;
                }
                break;
            }
          });
        `

        const blob = new Blob([workerCode], { type: "application/javascript" })
        this.worker = new Worker(URL.createObjectURL(blob))

        // Set up message handler
        this.worker.onmessage = this.handleWorkerMessage

        // Initialize the worker with symbols
        this.worker.postMessage({
          type: "init",
          data: { symbols },
        })

        this.isInitialized = true
        console.log("WebSocket worker initialized")
      } catch (error) {
        console.error("Failed to initialize WebSocket worker:", error)
        this.attemptReconnect(symbols)
      }
    } else {
      // Update symbols if already initialized
      this.updateSymbols(symbols)
    }
  }

  /**
   * Update the symbols to subscribe to
   * @param symbols Array of stock symbols
   */
  public updateSymbols(symbols: string[]) {
    if (!this.worker) return

    this.worker.postMessage({
      type: "update_symbols",
      data: { symbols },
    })
  }

  /**
   * Handle messages from the worker
   * @param event Message event
   */
  private handleWorkerMessage = (event: MessageEvent) => {
    const { type, data } = event.data

    if (type === "price_update") {
      // Update the store with the new price data
      this.updateStockPrice(data)
    }
  }

  /**
   * Update the stock price in the store
   * @param data Price data
   */
  private updateStockPrice(data: any) {
    if (!data || !data.symbol) return

    const store = useStockStore.getState()
    const { symbol } = data

    // Find the stock in the store
    const stock = store.stocks.find((s) => s.symbol === symbol)

    if (stock) {
      // Parse price and ensure it's a valid number
      let price = Number.parseFloat(data.price)
      if (isNaN(price)) {
        // If price is NaN, keep the existing price
        price = stock.price
        return // Don't update if we got an invalid price
      }

      // Calculate price change
      const priceChange = price - stock.price
      const priceChangePercent = (priceChange / stock.price) * 100

      // Update the stock with valid values
      store.updateStock(symbol, {
        price,
        priceChange: isNaN(priceChange) ? 0 : priceChange,
        priceChangePercent: isNaN(priceChangePercent) ? 0 : priceChangePercent,
        // Update chart data with the new price
        chartData: [...stock.chartData.slice(1), price],
      })
    }
  }

  /**
   * Attempt to reconnect to WebSocket
   * @param symbols Array of stock symbols
   */
  private attemptReconnect(symbols: string[]) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)

      setTimeout(() => {
        this.isInitialized = false
        this.initialize(symbols)
      }, this.reconnectInterval)
    } else {
      console.error("Max reconnect attempts reached. Giving up.")
      this.reconnectAttempts = 0
    }
  }

  /**
   * Close the WebSocket connection
   */
  public close() {
    if (this.worker) {
      this.worker.postMessage({ type: "close" })
      this.worker.terminate()
      this.worker = null
      this.isInitialized = false
    }
  }
}

// Create a singleton instance
export const webSocketService = new WebSocketService()
