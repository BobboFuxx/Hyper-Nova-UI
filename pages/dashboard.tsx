import { useEffect, useState } from "react";
import MarginPanel from "../components/MarginPanel";
import CandlestickChart from "../components/CandlestickChart";
import { useHyperNova } from "../hooks/useHyperNova";
import { useNotifications } from "../context/Notifications";
import { getOrderbook } from "../utils/rpc";

export default function Dashboard() {
  const { address, connectWallet, getPortfolio } = useHyperNova();
  const { notify } = useNotifications();
  const [portfolio, setPortfolio] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState("BTC/USD");
  const [orderbook, setOrderbook] = useState({ bids: [], asks: [] });
  const [icyTheme, setIcyTheme] = useState(true);

  const loadPortfolio = async () => {
    if (!address) return;
    try {
      const data = await getPortfolio(address);
      setPortfolio(data);
    } catch (e) {
      notify("Error loading portfolio", "error");
    }
  };

  const loadOrderbook = async () => {
    try {
      const ob = await getOrderbook(selectedMarket);
      setOrderbook(ob);
    } catch (e) {
      notify("Error loading orderbook", "error");
    }
  };

  useEffect(() => {
    if (address) loadPortfolio();
    const interval = setInterval(() => {
      loadPortfolio();
      loadOrderbook();
    }, 3000);
    return () => clearInterval(interval);
  }, [address, selectedMarket]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Hyper-Nova Dashboard</h1>
      {!address ? (
        <button
          onClick={connectWallet}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Connect Wallet
        </button>
      ) : (
        <span>Wallet: {address}</span>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-bold mb-2">Markets</h2>
          <select
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            className="border rounded p-2 mb-4"
          >
            {["BTC/USD", "ETH/USD", "ATOM/USD", "XRP/USD", "AVAX/USD", "TIA/USD", "ADA/USD"].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <CandlestickChart market={selectedMarket} icyTheme={icyTheme} />
          <div className="mt-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={icyTheme}
                onChange={() => setIcyTheme(!icyTheme)}
              />
              <span>Use Icy Theme</span>
            </label>
          </div>
        </div>

        <div>
          <MarginPanel />
          <div className="mt-6">
            <h2 className="font-bold mb-2">Orderbook</h2>
            <div className="grid grid-cols-2 border-b pb-1 font-semibold">
              <span>Bids</span>
              <span>Asks</span>
            </div>
            <div className="grid grid-cols-2 text-sm">
              <div>
                {orderbook.bids.map((b, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{b.price.toFixed(2)}</span>
                    <span>{b.amount.toFixed(4)}</span>
                  </div>
                ))}
              </div>
              <div>
                {orderbook.asks.map((a, i) => (
                  <div key={i} className="flex justify-between text-red-500">
                    <span>{a.price.toFixed(2)}</span>
                    <span>{a.amount.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
