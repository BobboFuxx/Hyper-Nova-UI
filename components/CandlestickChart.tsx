import { useEffect, useRef } from "react";
import { createChart, IChartApi, UTCTimestamp, CandlestickSeriesPartialOptions } from "lightweight-charts";

interface Candle {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlestickChartProps {
  data: Candle[];
  icyMode?: boolean; // toggle between icy and classic candle colors
  width?: number; // optional custom width
  height?: number; // optional custom height
}

export default function CandlestickChart({
  data,
  icyMode = false,
  width,
  height = 400,
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Remove previous chart if exists
    if (chartRef.current) {
      chartRef.current.remove();
    }

    // create chart
    const chart = createChart(chartContainerRef.current, {
      width: width || chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { color: "#0f172a" },
        textColor: "#cbd5e1",
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
      crosshair: {
        mode: 1,
      },
      timeScale: {
        timeVisible: true,
        borderColor: "#334155",
      },
      rightPriceScale: {
        borderColor: "#334155",
      },
    });

    const candleOptions: CandlestickSeriesPartialOptions = {
      upColor: icyMode ? "#38bdf8" : "#22c55e",
      downColor: icyMode ? "#a78bfa" : "#ef4444",
      borderDownColor: icyMode ? "#a78bfa" : "#ef4444",
      borderUpColor: icyMode ? "#38bdf8" : "#22c55e",
      wickDownColor: icyMode ? "#a78bfa" : "#ef4444",
      wickUpColor: icyMode ? "#38bdf8" : "#22c55e",
    };

    const series = chart.addCandlestickSeries(candleOptions);

    series.setData(data);

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, icyMode, width, height]);

  return <div ref={chartContainerRef} style={{ width: "100%", height }} />;
}
