import { useEffect, useState } from "react";

export function useMarket(symbol: string) {
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_HYPERNOVA_WS!);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        jsonrpc: "2.0",
        method: "subscribe",
        id: 1,
        params: { query: `tm.event='NewTrade' AND trade.market='${symbol}'` }
      }));
    };

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.result?.data?.value) {
        setTrades(prev => [data.result.data.value, ...prev].slice(0, 50));
      }
    };

    return () => ws.close();
  }, [symbol]);

  return trades;
}
