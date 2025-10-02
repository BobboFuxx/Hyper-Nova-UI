import React, { useEffect, useState, useMemo } from "react";
import { useOrderbook } from "../hooks/useOrderbook";

interface OrderBookProps {
  symbol: string;
}

interface Order {
  price: number;
  amount: number;
}

export default function OrderBook({ symbol }: OrderBookProps) {
  const { orders, fetchOrderbook } = useOrderbook(symbol);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchOrderbook();
      setLoading(false);
    };
    load();

    // auto-refresh every 5s
    const interval = setInterval(fetchOrderbook, 5000);
    return () => clearInterval(interval);
  }, [symbol, fetchOrderbook]);

  const maxBidAmount = useMemo(
    () => Math.max(...orders.bids.map((o: Order) => o.amount), 1),
    [orders.bids]
  );
  const maxAskAmount = useMemo(
    () => Math.max(...orders.asks.map((o: Order) => o.amount), 1),
    [orders.asks]
  );

  if (loading) {
    return <div className="text-gray-400">Loading orderbook...</div>;
  }

  return (
    <div className="p-4 bg-gray-900 rounded-md border border-gray-700">
      <h2 className="text-lg font-semibold mb-3">Order Book ({symbol})</h2>
      <div className="grid grid-cols-2 gap-4 text-sm font-mono">
        {/* Bids */}
        <div>
          <h3 className="text-xs text-green-400 mb-1">Bids</h3>
          <ul className="space-y-1">
            {orders.bids.slice(0, 12).map((o: Order, i: number) => (
              <li
                key={`bid-${i}`}
                className="relative flex justify-between px-1 py-0.5 rounded cursor-pointer hover:opacity-80"
              >
                {/* depth bar */}
                <span
                  className="absolute left-0 top-0 h-full bg-green-500/20 -z-10 rounded"
                  style={{
                    width: `${(o.amount / maxBidAmount) * 100}%`,
                  }}
                />
                <span className="text-green-400">{o.price.toFixed(2)}</span>
                <span className="text-gray-200">{o.amount.toFixed(4)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Asks */}
        <div>
          <h3 className="text-xs text-red-400 mb-1">Asks</h3>
          <ul className="space-y-1">
            {orders.asks.slice(0, 12).map((o: Order, i: number) => (
              <li
                key={`ask-${i}`}
                className="relative flex justify-between px-1 py-0.5 rounded cursor-pointer hover:opacity-80"
              >
                {/* depth bar */}
                <span
                  className="absolute right-0 top-0 h-full bg-red-500/20 -z-10 rounded"
                  style={{
                    width: `${(o.amount / maxAskAmount) * 100}%`,
                  }}
                />
                <span className="text-red-400">{o.price.toFixed(2)}</span>
                <span className="text-gray-200">{o.amount.toFixed(4)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
