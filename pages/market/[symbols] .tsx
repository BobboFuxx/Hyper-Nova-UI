import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CandlestickChart from "../../components/CandlestickChart";
import { useMarket } from "../../hooks/useMarket";
import { useNotifications } from "../../context/Notifications";

export default function MarketPage() {
  const router = useRouter();
  const { symbol } = router.query;
  const { notify } = useNotifications();
  const [icyTheme, setIcyTheme] = useState(true);

  const { trades, subscribeTrades } = useMarket(symbol as string);

  useEffect(() => {
    if (symbol) subscribeTrades();
  }, [symbol]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{symbol} Market</h1>

      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={icyTheme}
            onChange={() => setIcyTheme(!icyTheme)}
          />
          <span>Icy Theme</span>
        </label>
      </div>

      <CandlestickChart market={symbol as string} icyTheme={icyTheme} />

      <div className="mt-4">
        <h2 className="font-bold mb-2">Recent Trades</h2>
        <div className="border p-2 rounded space-y-1 max-h-60 overflow-y-auto">
          {trades.map((t, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{t.price.toFixed(2)}</span>
              <span>{t.amount.toFixed(4)}</span>
              <span className={t.side === "buy" ? "text-green-500" : "text-red-500"}>
                {t.side.toUpperCase()}
              </span>
            </div>
          ))}
          {trades.length === 0 && <div className="text-gray-500">No trades yet</div>}
        </div>
      </div>
    </div>
  );
}
