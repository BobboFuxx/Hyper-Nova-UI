import { useEffect, useState } from "react";
import { fetchCandles } from "../utils/rpc";
import { Chart } from "react-charts";

interface Props {
  market: string;
  icyTheme: boolean;
}

export default function CandlestickChart({ market, icyTheme }: Props) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const loadCandles = async () => {
      const d = await fetchCandles(market);
      setData(d);
    };
    loadCandles();
  }, [market]);

  return (
    <div className="border rounded p-2">
      <h3 className="font-semibold mb-2">{market} Candles</h3>
      {/* Placeholder for chart */}
      <div className="h-64 bg-gray-100 flex items-center justify-center">
        <span>{icyTheme ? "Icy Theme Chart" : "Classic Chart"}</span>
      </div>
    </div>
  );
}
