export interface Trade {
  price: number;
  amount: number;
  side: "buy" | "sell";
  timestamp: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

/**
 * Subscribe to trades via WebSocket for a given symbol.
 * Returns a WebSocket instance.
 */
export function subscribeTradesWS(symbol: string, onMessage: (trade: Trade) => void): WebSocket {
  // Replace with your actual market WS URL
  const ws = new WebSocket(`wss://hypernova.market/ws/trades/${symbol}`);

  ws.onopen = () => {
    console.log(`[WS Trades] Connected for ${symbol}`);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      // Assuming data format: { price, amount, side, timestamp }
      onMessage(data as Trade);
    } catch (err) {
      console.error("Failed to parse trade WS message", err);
    }
  };

  ws.onclose = () => {
    console.log(`[WS Trades] Disconnected for ${symbol}`);
  };

  ws.onerror = (err) => {
    console.error(`[WS Trades] Error for ${symbol}`, err);
  };

  return ws;
}

/**
 * Subscribe to candlestick updates via WebSocket for a given symbol.
 * Returns a WebSocket instance.
 */
export function subscribeCandlesWS(symbol: string, onMessage: (candle: Candle) => void): WebSocket {
  // Replace with your actual market WS URL
  const ws = new WebSocket(`wss://hypernova.market/ws/candles/${symbol}`);

  ws.onopen = () => {
    console.log(`[WS Candles] Connected for ${symbol}`);
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      // Assuming data format: { time, open, high, low, close }
      onMessage(data as Candle);
    } catch (err) {
      console.error("Failed to parse candle WS message", err);
    }
  };

  ws.onclose = () => {
    console.log(`[WS Candles] Disconnected for ${symbol}`);
  };

  ws.onerror = (err) => {
    console.error(`[WS Candles] Error for ${symbol}`, err);
  };

  return ws;
}
