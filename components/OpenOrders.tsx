import React, { useEffect, useState } from "react";
import { useUserOrders } from "../hooks/useUserOrders";

export default function OpenOrders() {
  const { orders, fetchUserOrders } = useUserOrders();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchUserOrders();
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="text-gray-400">Loading open orders...</div>;
  }

  return (
    <div className="p-4 bg-gray-800 rounded-md border border-gray-700">
      <h2 className="text-lg font-semibold mb-3">Open Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-400">No open orders</p>
      ) : (
        <ul>
          {orders.map((o, i) => (
            <li key={i} className="flex justify-between py-1">
              <span>{o.symbol}</span>
              <span>{o.side}</span>
              <span>{o.price}</span>
              <span>{o.amount}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
