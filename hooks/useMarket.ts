import { useEffect, useState } from "react";
import { fetchCandles, subscribeTradesMulti } from "../lib/rpcFetcher";

interface Trade {
  price: number;
  amount: number;
  side: "buy" | "sell";
  timestamp: number;
}

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export function useMarket(marketId: string | undefined) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [candles, setCandles] = useState<Candle[]>([]);

  // Load historical candles
  useEffect(() => {
    if (!marketId) return;
    (async () => {
      try {
        const [chain, market] = marketId.split(":");
        const data = await fetchCandles(chain, market);
        setCandles(data);
      } catch (err) {
        console.error("Failed to fetch candles:", err);
      }
    })();
  }, [marketId]);

  // Subscribe to live trades
  const subscribeTrades = () => {
    if (!marketId) return;
    const [chain, market] = marketId.split(":");

    return subscribeTradesMulti(chain, market, (trade: Trade) => {
      setTrades((prev) => [trade, ...prev].slice(0, 100)); // keep last 100
    });
  };

  return { trades, candles, subscribeTrades };
}
