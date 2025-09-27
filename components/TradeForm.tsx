import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "../hooks/useWallet";
import { useTrades } from "../hooks/useTrades";

export default function TradeForm({ marketType = "spot" as "spot" | "perp" }) {
  const { cosmosAddress, evmAddress, solanaPublicKey, activeWallet, connect } = useWallet();
  const { 
    error, 
    lastTx, 
    placeSpotTrade, 
    getSpotTradeFee, 
    placePerpTrade, 
    getPerpTradeFee 
  } = useTrades();

  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [estimatedFee, setEstimatedFee] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const connectedAddress = cosmosAddress || evmAddress || solanaPublicKey?.toBase58();
  const parsedAmount = parseFloat(amount);
  const parsedPrice = parseFloat(price);
  const connected = !!connectedAddress && !!activeWallet;

  // -------------------- Fee estimation --------------------
  useEffect(() => {
    if (!connected || parsedAmount <= 0 || parsedPrice <= 0) {
      setEstimatedFee(null);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const fee =
          marketType === "spot"
            ? await getSpotTradeFee({
                chain: activeWallet,
                address: activeWallet === "Solana" && solanaPublicKey ? solanaPublicKey : connectedAddress,
                side,
                amount: parsedAmount,
                price: parsedPrice,
              })
            : await getPerpTradeFee({
                chain: activeWallet,
                address: activeWallet === "Solana" && solanaPublicKey ? solanaPublicKey : connectedAddress,
                side,
                amount: parsedAmount,
                price: parsedPrice,
              });
        setEstimatedFee(fee);
      } catch (err) {
        console.error("Fee estimation failed:", err);
        setEstimatedFee(null);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [side, parsedAmount, parsedPrice, connected, activeWallet, connectedAddress, solanaPublicKey, marketType, getSpotTradeFee, getPerpTradeFee]);

  // -------------------- Handle trade --------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connected) {
      setMessage("Please connect your wallet first.");
      return;
    }
    if (parsedAmount <= 0 || parsedPrice <= 0) {
      setMessage("Enter valid amount and price.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const params = {
        chain: activeWallet,
        address: activeWallet === "Solana" && solanaPublicKey ? solanaPublicKey : connectedAddress,
        side,
        amount: parsedAmount,
        price: parsedPrice,
      };

      const tx =
        marketType === "spot"
          ? await placeSpotTrade(params)
          : await placePerpTrade(params);

      setMessage(`Trade executed on ${activeWallet}! Tx: ${tx}`);
      setAmount("");
      setPrice("");
      setEstimatedFee(null);
    } catch (err: any) {
      console.error(err);
      setMessage(error || `Trade failed on ${activeWallet}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-900 rounded-md border border-gray-700">
      <h2 className="text-lg font-semibold mb-3">Place {marketType.toUpperCase()} Order</h2>

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

          {/* Price & Amount Inputs */}
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

          {/* Fee Display */}
          {estimatedFee !== null && (
            <p className="text-sm text-yellow-400">
              Estimated Fee: {estimatedFee.toFixed(6)}{" "}
              {activeWallet === "Solana"
                ? "SOL"
                : activeWallet === "EVM"
                ? "ETH"
                : "UNOVA"}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || estimatedFee === null || parsedAmount <= 0 || parsedPrice <= 0}
            className="w-full bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md text-white disabled:opacity-50"
          >
            {loading ? "Placing Order..." : `Place ${side.toUpperCase()} Order`}
          </button>

          {/* Status Message */}
          {message && <p className="text-sm text-gray-300 mt-2">{message}</p>}
        </form>
      )}
    </div>
  );
}
