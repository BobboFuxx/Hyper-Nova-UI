import { useState, useEffect, useRef, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "../hooks/useWallet";
import { useTrades } from "../hooks/useTrades";
import { useMarket } from "../hooks/useMarket";

export default function TradeForm({ marketType = "spot" as "spot" | "perp" }) {
  const { cosmosAddress, evmAddress, solanaPublicKey, activeWallet, connect } = useWallet();
  const { 
    loading, 
    error, 
    lastTx, 
    placeSpotTrade, 
    getSpotFee, 
    placePerpTrade, 
    getPerpFee 
  } = useTrades();

  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [estimatedFee, setEstimatedFee] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [glowIntensity, setGlowIntensity] = useState(0);

  const connectedAddress = cosmosAddress || evmAddress || solanaPublicKey?.toBase58();
  const parsedAmount = parseFloat(amount);
  const parsedPrice = parseFloat(price);
  const connected = !!connectedAddress && !!activeWallet;
  const feeInterval = useRef<NodeJS.Timer | null>(null);

  const { bestBid, bestAsk, lastPrice, suggestedAmount } = useMarket(activeWallet, marketType);

  // -------------------- Unified fee estimation --------------------
  const estimateCurrentFee = useCallback(async () => {
    if (!connected || parsedAmount <= 0 || parsedPrice <= 0) {
      setEstimatedFee(null);
      return;
    }

    try {
      const fee =
        marketType === "spot"
          ? await getSpotFee({
              chain: activeWallet,
              address: activeWallet === "Solana" && solanaPublicKey ? solanaPublicKey : connectedAddress,
              side,
              amount: parsedAmount,
              price: parsedPrice,
            })
          : await getPerpFee({
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
  }, [
    connected,
    parsedAmount,
    parsedPrice,
    marketType,
    activeWallet,
    connectedAddress,
    solanaPublicKey,
    side,
    getSpotFee,
    getPerpFee,
  ]);

  // -------------------- Debounced fee estimation --------------------
  useEffect(() => {
    const handler = setTimeout(estimateCurrentFee, 500);
    return () => clearTimeout(handler);
  }, [estimateCurrentFee]);

  // -------------------- Real-time fee updates --------------------
  useEffect(() => {
    if (feeInterval.current) clearInterval(feeInterval.current);
    if (!connected || parsedAmount <= 0 || parsedPrice <= 0) return;

    feeInterval.current = setInterval(estimateCurrentFee, 5000);
    return () => {
      if (feeInterval.current) clearInterval(feeInterval.current);
    };
  }, [estimateCurrentFee, connected, parsedAmount, parsedPrice]);

  // -------------------- Immediate fee refresh on wallet/chain change --------------------
  useEffect(() => {
    estimateCurrentFee();
  }, [activeWallet, connectedAddress, solanaPublicKey, estimateCurrentFee]);

  // -------------------- Check if current price matches best bid/ask --------------------
  const isBestPrice =
    (side === "buy" && parsedPrice === bestAsk) ||
    (side === "sell" && parsedPrice === bestBid);

  // -------------------- Animated glow intensity & dynamic color --------------------
  useEffect(() => {
    if (!parsedPrice || !bestBid || !bestAsk) return;

    let targetIntensity = 0;
    if (isBestPrice) {
      targetIntensity = 1; // full pulse for exact match
    } else {
      const diff = side === "buy" ? Math.abs(parsedPrice - bestAsk) : Math.abs(parsedPrice - bestBid);
      const refPrice = side === "buy" ? bestAsk : bestBid;
      targetIntensity = Math.max(0, 1 - diff / (refPrice * 0.05));
    }

    setGlowIntensity((prev) => {
      const alpha = 0.1; // smoothing factor
      return prev + (targetIntensity - prev) * alpha;
    });
  }, [parsedPrice, bestBid, bestAsk, side, isBestPrice]);

  const glowColor = isBestPrice
    ? "bg-yellow-500 text-black animate-pulse cursor-pointer"
    : side === "buy"
    ? `bg-[rgba(0,255,0,${glowIntensity})] text-white` // green for buy
    : `bg-[rgba(255,0,0,${glowIntensity})] text-white`; // red for sell

  const glowStyle = isBestPrice
    ? glowColor
    : `shadow-[0_0_${8 * glowIntensity}px_${2 * glowIntensity}px_rgba(255,215,0,${0.6 * glowIntensity})] transition-shadow duration-300 ease-in-out ${glowColor}`;

  // -------------------- Handle trade --------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected) return setMessage("Please connect your wallet first.");
    if (parsedAmount <= 0 || parsedPrice <= 0) return setMessage("Enter valid amount and price.");

    try {
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
    }
  };

  // -------------------- Fill suggested amount when clicking best-price input --------------------
  const handlePriceClick = () => {
    if (isBestPrice && suggestedAmount) {
      setAmount(suggestedAmount.toString());
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
              className={`flex-1 px-3 py-2 rounded-md ${side === "buy" ? "bg-green-500 text-white" : "bg-gray-800"}`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setSide("sell")}
              className={`flex-1 px-3 py-2 rounded-md ${side === "sell" ? "bg-red-500 text-white" : "bg-gray-800"}`}
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
              onClick={handlePriceClick}
              className={`w-full p-2 rounded-md ${glowStyle}`}
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
