import { useState } from "react";
import { useWallet } from "../hooks/useWallet";
import { executeTrade } from "../lib/api";

export default function TradeForm() {
  const { address, connected, connect } = useWallet();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) {
      setMessage("Please connect your wallet first.");
      return;
    }
    if (!amount || !price) {
      setMessage("Please enter amount and price.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const tx = await executeTrade({
        address,
        side,
        amount: parseFloat(amount),
        price: parseFloat(price),
      });

      setMessage(`Trade executed! Tx: ${tx}`);
      setAmount("");
      setPrice("");
    } catch (err: any) {
      console.error(err);
      setMessage("Trade failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-900 rounded-md border border-gray-700">
      <h2 className="text-lg font-semibold mb-3">Place Order</h2>
      {!connected ? (
        <button
          onClick={connect}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md text-white"
        >
          Connect Wallet
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Buy / Sell Toggle */}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setSide("buy")}
              className={`flex-1 px-3 py-2 rounded-md ${
                side === "buy" ? "bg-green-500 text-white" : "bg-gray-800"
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setSide("sell")}
              className={`flex-1 px-3 py-2 rounded-md ${
                side === "sell" ? "bg-red-500 text-white" : "bg-gray-800"
              }`}
            >
              Sell
            </button>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm text-gray-400">Price</label>
            <input
              type="number"
              step="0.0001"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-gray-800 p-2 rounded-md text-white"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm text-gray-400">Amount</label>
            <input
              type="number"
              step="0.0001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-800 p-2 rounded-md text-white"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md text-white disabled:opacity-50"
          >
            {loading ? "Placing Order..." : `Place ${side.toUpperCase()} Order`}
          </button>

          {message && (
            <p className="text-sm text-gray-300 mt-2">{message}</p>
          )}
        </form>
      )}
    </div>
  );
}
