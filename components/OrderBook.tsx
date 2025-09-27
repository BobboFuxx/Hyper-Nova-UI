import { useOrderbook } from "../hooks/useOrderbook";

export default function OrderBook() {
  const { bids, asks, loading } = useOrderbook();

  if (loading) {
    return <div className="p-4 text-gray-400">Loading orderbook...</div>;
  }

  return (
    <div className="p-4 bg-gray-900 rounded-md border border-gray-700">
      <h2 className="text-lg font-semibold mb-3">Order Book</h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Bids (Buy side) */}
        <div>
          <h3 className="text-green-400 font-medium mb-2">Bids</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-1">Price</th>
                <th className="text-right py-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bids.map((bid, i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="py-1 text-green-400">{bid.price}</td>
                  <td className="py-1 text-right">{bid.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Asks (Sell side) */}
        <div>
          <h3 className="text-red-400 font-medium mb-2">Asks</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left py-1">Price</th>
                <th className="text-right py-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {asks.map((ask, i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="py-1 text-red-400">{ask.price}</td>
                  <td className="py-1 text-right">{ask.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
