import { useEffect, useState, useRef } from "react";
import { getClient } from "../utils/rpc"; // Cosmos gRPC/RPC
import { subscribeTradesWS, subscribeCandlesWS } from "../utils/ws"; // WebSocket utils

export interface Trade {
  price: number;
  amount: number;
  side: "buy" | "sell";
  timestamp: number;
}

export interface Candle {
  time: number; // unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
}

export function useMarket(symbol: string) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [candles, setCandles] = useState<Candle[]>([]);

  const tradesSub = useRef<WebSocket | null>(null);
  const candlesSub = useRef<WebSocket | null>(null);

  // Subscribe to trades via WebSocket (fast updates)
  const subscribeTrades = () => {
    if (!symbol) return;

    if (tradesSub.current) tradesSub.current.close();

    tradesSub.current = subscribeTradesWS(symbol, (newTrade: Trade) => {
      setTrades(prev => [newTrade, ...prev].slice(0, 100)); // keep latest 100 trades
    });
  };

  // Subscribe to candlestick updates via WebSocket (fast updates)
  const subscribeCandles = () => {
    if (!symbol) return;

    if (candlesSub.current) candlesSub.current.close();

    candlesSub.current = subscribeCandlesWS(symbol, (newCandle: Candle) => {
      setCandles(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.time === newCandle.time) {
          updated[updated.length - 1] = newCandle;
        } else {
          updated.push(newCandle);
        }
        return updated.slice(-200); // keep last 200 candles
      });
    });
  };

  // Load initial trades & candles from RPC/gRPC
  useEffect(() => {
    if (!symbol) return;

    const loadInitialData = async () => {
      try {
        const client = await getClient();

        // Example gRPC call to get recent trades
        const tradesRes: Trade[] = await client.queryContractSmart(
          process.env.NEXT_PUBLIC_MARKET_CONTRACT!,
          { get_recent_trades: { symbol } }
        );
        setTrades(tradesRes);

        // Example gRPC call to get OHLC candles
        const candlesRes: Candle[] = await client.queryContractSmart(
          process.env.NEXT_PUBLIC_MARKET_CONTRACT!,
          { get_ohlc: { symbol } }
        );
        setCandles(candlesRes);
      } catch (err) {
        console.error("Failed to load initial market data", err);
      }
    };

    loadInitialData();

    return () => {
      if (tradesSub.current) tradesSub.current.close();
      if (candlesSub.current) candlesSub.current.close();
    };
  }, [symbol]);

  return { trades, candles, subscribeTrades, subscribeCandles };
}
