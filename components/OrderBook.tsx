import React, { useEffect, useState } from "react";
import { useOrderbook } from "../hooks/useOrderbook";

interface OrderBookProps {
  symbol: string;
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
  }, [symbol]);

  if (loading) {
    return <div className="text-gray-400">Loading orderbook...</div>;
  }

  return (
    <div className="p-4 bg-gray-800 rounded-md border border-gray-700">
      <h2 className="text-lg font-semibold mb-3">Order Book ({symbol})</h2>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <h3 className="text-sm text-gray-400">Bids</h3>
          <ul>
            {orders.bids.map((o, i) => (
              <li key={i} className="flex justify-between py-1">
                <span>{o.price}</span>
                <span>{o.amount}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm text-gray-400">Asks</h3>
          <ul>
            {orders.asks.map((o, i) => (
              <li key={i} className="flex justify-between py-1">
                <span>{o.price}</span>
                <span>{o.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
