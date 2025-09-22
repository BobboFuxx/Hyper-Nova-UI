import { useState } from "react";
import dynamic from "next/dynamic";
import MarginPanel from "../components/MarginPanel";
import BridgeForm from "../components/BridgeForm";

const MarketDetail = dynamic(() => import("./market/[symbol]"), { ssr: false });

export default function Dashboard() {
  const [selectedMarket, setSelectedMarket] = useState("BTC/USD");

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Hyper-Nova Dashboard</h1>

      <div className="flex space-x-2">
        {["BTC/USD","ETH/USD","ATOM/USD","XRP/USD","AVAX/USD","TIA/USD","ADA/USD"].map(m => (
          <button
            key={m}
            onClick={() => setSelectedMarket(m)}
            className={`px-3 py-1 rounded ${selectedMarket === m ? "bg-blue-500 text-white" : "border"}`}
          >
            {m}
          </button>
        ))}
      </div>

      <MarketDetail key={selectedMarket} symbol={selectedMarket} />
      <MarginPanel />
      <BridgeForm />
    </div>
  );
}
