// Define the WebSocket connection
let socket = null;
let reconnectTimer = null;
let symbols = [];

// Initialize the WebSocket connection
function initWebSocket(stockSymbols) {
  symbols = stockSymbols;

  // Close existing connection if any
  if (socket) {
    socket.close();
  }

  // Create a new WebSocket connection
  socket = new WebSocket(
    `wss://ws.twelvedata.com/v1/quotes/price?apikey=${process.env.NEXT_PUBLIC_TWELVE_DATA_API_KEY}`
  );

  // Connection opened
  socket.addEventListener("open", () => {
    console.log("WebSocket connection established");

    // Subscribe to stock symbols
    if (socket && socket.readyState === WebSocket.OPEN) {
      const subscribeMsg = {
        action: "subscribe",
        params: {
          symbols: symbols.join(","),
        },
      };
      socket.send(JSON.stringify(subscribeMsg));
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

    // Attempt to reconnect after a delay
    if (!event.wasClean) {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      reconnectTimer = self.setTimeout(() => {
        initWebSocket(symbols);
      }, 5000);
    }
  });

  // Connection error
  socket.addEventListener("error", (error) => {
    console.error("WebSocket error:", error);
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
