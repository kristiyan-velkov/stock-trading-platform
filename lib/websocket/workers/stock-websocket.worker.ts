const TWELVE_DATA_API_KEY = (self as any).TWELVE_DATA_API_KEY as string;

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let symbols: string[] = [];
let isConnecting = false;
const reconnectDelay = 5000;

type MessageFromMain =
  | { type: "init"; data: { symbols: string[] } }
  | { type: "update_symbols"; data: { symbols: string[] } }
  | { type: "close" };

type MessageToMain = {
  type: "price_update";
  data: Record<string, any>;
};

function subscribeToSymbols() {
  if (socket?.readyState === WebSocket.OPEN && symbols.length > 0) {
    socket.send(
      JSON.stringify({
        action: "subscribe",
        params: { symbols: symbols.join(",") },
      })
    );
  }
}

function unsubscribeAllSymbols() {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({ action: "unsubscribe", params: { symbols: "*" } })
    );
  }
}

function initWebSocket(stockSymbols: string[]) {
  if (isConnecting) return;
  symbols = stockSymbols;
  isConnecting = true;
  cleanupSocket();

  socket = new WebSocket(
    `wss://ws.twelvedata.com/v1/quotes/price?apikey=${TWELVE_DATA_API_KEY}`
  );

  socket.addEventListener("open", handleOpen);
  socket.addEventListener("message", handleMessage);
  socket.addEventListener("close", handleClose);
  socket.addEventListener("error", handleError);
}

function handleOpen() {
  isConnecting = false;
  console.log("[WS] Connected");
  subscribeToSymbols();

  clearInterval(heartbeatInterval!);
  heartbeatInterval = setInterval(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: "heartbeat" }));
    }
  }, 30_000);
}

function handleMessage(event: MessageEvent<string>) {
  try {
    const data = JSON.parse(event.data);
    const message: MessageToMain = { type: "price_update", data };
    postMessage(message);
  } catch (err) {
    console.error("[WS] JSON parse error:", err);
  }
}

function handleClose(event: CloseEvent) {
  console.warn("[WS] Connection closed:", event.code, event.reason);
  isConnecting = false;
  clearInterval(heartbeatInterval!);
  heartbeatInterval = null;

  if (!event.wasClean) {
    reconnectTimer = setTimeout(() => {
      console.log("[WS] Attempting reconnect...");
      initWebSocket(symbols);
    }, reconnectDelay);
  }
}

function handleError(err: Event) {
  console.error("[WS] Error:", err);
  isConnecting = false;
}

function cleanupSocket() {
  if (socket) {
    socket.removeEventListener("open", handleOpen);
    socket.removeEventListener("message", handleMessage);
    socket.removeEventListener("close", handleClose);
    socket.removeEventListener("error", handleError);
    socket.close();
    socket = null;
  }

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

self.addEventListener("message", (event: MessageEvent<MessageFromMain>) => {
  const message = event.data;

  switch (message.type) {
    case "init":
      initWebSocket(message.data.symbols);
      break;

    case "update_symbols":
      symbols = message.data.symbols;
      if (socket?.readyState === WebSocket.OPEN) {
        unsubscribeAllSymbols();
        subscribeToSymbols();
      } else {
        initWebSocket(symbols);
      }
      break;

    case "close":
      cleanupSocket();
      break;
  }
});
