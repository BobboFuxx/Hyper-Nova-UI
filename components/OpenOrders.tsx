import { useUserOrders } from "../hooks/useUserOrders";

export default function OpenOrders() {
  const { orders, loading, cancelOrder } = useUserOrders();

  if (loading) {
    return <div className="p-4 text-gray-400">Loading open orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="p-4 bg-gray-900 rounded-md border border-gray-700 text-gray-400">
        No open orders
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-900 rounded-md border border-gray-700">
      <h2 className="text-lg font-semibold mb-3">Open Orders</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 border-b border-gray-700">
            <th className="text-left py-2">Symbol</th>
            <th className="text-left py-2">Side</th>
            <th className="text-right py-2">Price</th>
            <th className="text-right py-2">Amount</th>
            <th className="text-right py-2">Status</th>
            <th className="text-right py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-gray-800">
              <td className="py-2">{order.symbol}</td>
              <td
                className={`py-2 ${
                  order.side === "buy" ? "text-green-400" : "text-red-400"
                }`}
              >
                {order.side.toUpperCase()}
              </td>
              <td className="py-2 text-right">{order.price}</td>
              <td className="py-2 text-right">{order.amount}</td>
              <td className="py-2 text-right">{order.status}</td>
              <td className="py-2 text-right">
                <button
                  onClick={() => cancelOrder(order.id)}
                  className="text-sm bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white"
                >
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
