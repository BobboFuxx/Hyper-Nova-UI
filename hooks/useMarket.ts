import { useState } from "react";

export function useMarket(symbol: string) {
  const [trades, setTrades] = useState<any[]>([]);

  const subscribeTrades = () => {
    // Example: Simulate live trades
    const interval = setInterval(() => {
      setTrades((prev) => [
        ...prev.slice(-19),
        {
          price: Math.random() * 50000,
          amount: Math.random(),
          side: Math.random() > 0.5 ? "buy" : "sell",
        },
      ]);
    }, 1000);
    return () => clearInterval(interval);
  };

  return { trades, subscribeTrades };
}
