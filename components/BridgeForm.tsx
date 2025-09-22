import { useState, useEffect } from "react";
import { depositToken, withdrawToken, getIBCTransactions } from "../utils/skipIbc";
import { useHyperNova } from "../hooks/useHyperNova";
import { useNotifications } from "../context/Notifications";

const SUPPORTED_ASSETS = ["BTC", "ETH", "ATOM", "XRP", "AVAX", "TIA", "ADA", "USDC"];

export default function BridgeForm() {
  const { address } = useHyperNova();
  const { notify } = useNotifications();

  const [action, setAction] = useState<"deposit" | "withdraw">("deposit");
  const [asset, setAsset] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [txs, setTxs] = useState<any[]>([]);

  const refreshTxs = async () => {
    if (!address) return;
    try {
      const data = await getIBCTransactions(address);
      setTxs(data);
    } catch (e) {
      notify("Failed to fetch IBC transactions", "error");
    }
  };

  useEffect(() => {
    refreshTxs();
    const interval = setInterval(refreshTxs, 5000);
    return () => clearInterval(interval);
  }, [address]);

  const handleSubmit = async () => {
    if (!address || !amount || Number(amount) <= 0) {
      notify("Enter a valid amount", "error");
      return;
    }
    try {
      let txHash;
      if (action === "deposit") {
        txHash = await depositToken("cosmoshub", asset, amount, address);
        notify(`Deposit submitted: ${txHash}`, "success");
      } else {
        txHash = await withdrawToken("cosmoshub", asset, amount, address);
        notify(`Withdrawal submitted: ${txHash}`, "success");
      }
      setAmount("");
      refreshTxs();
    } catch (e) {
      notify("Transaction failed", "error");
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h2 className="font-bold text-xl">Bridge / IBC</h2>

      <div className="flex space-x-2">
        <button
          onClick={() => setAction("deposit")}
          className={`px-4 py-2 rounded ${action === "deposit" ? "bg-blue-600 text-white" : "border"}`}
        >
          Deposit
        </button>
        <button
          onClick={() => setAction("withdraw")}
          className={`px-4 py-2 rounded ${action === "withdraw" ? "bg-blue-600 text-white" : "border"}`}
        >
          Withdraw
        </button>
      </div>

      <div className="flex flex-col space-y-2">
        <select
          value={asset}
          onChange={(e) => setAsset(e.target.value)}
          className="border rounded p-2"
        >
          {SUPPORTED_ASSETS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border rounded p-2"
        />

        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Submit
        </button>
      </div>

      <div className="mt-4">
        <h3 className="font-semibold mb-2">Recent Transactions</h3>
        <div className="border p-2 rounded space-y-1 max-h-60 overflow-y-auto">
          {txs.map((tx, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{tx.txHash}</span>
              <span>{tx.type}</span>
              <span>{tx.denom}</span>
              <span>{tx.amount}</span>
              <span className={tx.status === "confirmed" ? "text-green-500" : "text-yellow-500"}>
                {tx.status}
              </span>
            </div>
          ))}
          {txs.length === 0 && <div className="text-gray-500">No transactions yet</div>}
        </div>
      </div>
    </div>
  );
}
