import { useEffect, useState } from "react";
import { useHyperNova } from "../hooks/useHyperNova";

export default function MarginPanel() {
  const { getPortfolio } = useHyperNova();
  const [portfolio, setPortfolio] = useState([]);

  useEffect(() => {
    const loadPortfolio = async () => {
      const data = await getPortfolio();
      setPortfolio(data);
    };
    loadPortfolio();
  }, []);

  return (
    <div className="border rounded p-4 space-y-2">
      <h2 className="font-bold text-xl">Portfolio</h2>
      {portfolio.length === 0 ? (
        <div>No assets yet</div>
      ) : (
        <ul className="space-y-1">
          {portfolio.map((p: any) => (
            <li key={p.asset} className="flex justify-between">
              <span>{p.asset}</span>
              <span>{p.balance}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
