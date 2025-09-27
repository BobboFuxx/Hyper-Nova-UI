// Multi-chain RPC + gRPC/WebSocket fetchers

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Trade {
  price: number;
  amount: number;
  side: "buy" | "sell";
  timestamp: number;
}

// ---------- Fetch historical candles ----------
export async function fetchCandles(chain: string, market: string): Promise<Candle[]> {
  if (chain === "cosmos") {
    // TODO: Replace with direct gRPC if available
    const res = await fetch(`${process.env.NEXT_PUBLIC_COSMOS_LCD}/candles?market=${market}`);
    return await res.json();
  }

  if (chain === "ethereum") {
    // Example REST endpoint from subgraph / DEX API
    const res = await fetch(`${process.env.NEXT_PUBLIC_ETH_API}/candles?pair=${market}`);
    return await res.json();
  }

  if (chain === "solana") {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SOLANA_API}/candles?market=${market}`);
    return await res.json();
  }

  return [];
}

// ---------- Subscribe to trades (multi-chain) ----------
export function subscribeTradesMulti(chain: string, market: string, onTrade: (t: Trade) => void) {
  if (chain === "ethereum") {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_ETH_WS}`);
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === "trade" && data.market === market) {
        onTrade(data);
      }
    };
    return () => ws.close();
  }

  if (chain === "cosmos") {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_COSMOS_WS}`);
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.event === "new_trade" && data.market === market) {
        onTrade(data.trade);
      }
    };
    return () => ws.close();
  }

  if (chain === "solana") {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_SOLANA_WS}`);
    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.type === "trade" && data.market === market) {
        onTrade(data);
      }
    };
    return () => ws.close();
  }

  return () => {};
}
