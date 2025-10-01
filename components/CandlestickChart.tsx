import { useEffect, useRef } from "react";
import {
  createChart,
  IChartApi,
  UTCTimestamp,
  CandlestickSeriesPartialOptions,
  HistogramSeriesPartialOptions,
} from "lightweight-charts";

interface Candle {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface CandlestickChartProps {
  data: Candle[];
  icyMode?: boolean; // toggle icy vs. classic candles
  width?: number;
  height?: number;
  showVolume?: boolean; // toggle volume overlay
}

export default function CandlestickChart({
  data,
  icyMode = false,
  width,
  height = 400,
  showVolume = true,
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Destroy old chart
    if (chartRef.current) {
      chartRef.current.remove();
    }

    // Create new chart
    const chart = createChart(chartContainerRef.current, {
      width: width || chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { color: "#0f172a" }, // dark slate background
        textColor: "#cbd5e1", // slate text
      },
      grid: {
        vertLines: { color: "#1e293b" },
        horzLines: { color: "#1e293b" },
      },
      crosshair: { mode: 1 },
      timeScale: {
        timeVisible: true,
        borderColor: "#334155",
      },
      rightPriceScale: {
        borderColor: "#334155",
      },
    });

    // Candle options
    const candleOptions: CandlestickSeriesPartialOptions = {
      upColor: icyMode ? "#38bdf8" : "#22c55e", // cyan or green
      downColor: icyMode ? "#a78bfa" : "#ef4444", // purple or red
      borderUpColor: icyMode ? "#38bdf8" : "#22c55e",
      borderDownColor: icyMode ? "#a78bfa" : "#ef4444",
      wickUpColor: icyMode ? "#38bdf8" : "#22c55e",
      wickDownColor: icyMode ? "#a78bfa" : "#ef4444",
    };

    const candleSeries = chart.addCandlestickSeries(candleOptions);
    candleSeries.setData(data);

    // Volume histogram overlay (optional)
    if (showVolume) {
      const volumeSeries = chart.addHistogramSeries({
        color: "#6366f1", // indigo bars
        priceFormat: { type: "volume" },
        priceScaleId: "", // separate scale
        scaleMargins: { top: 0.8, bottom: 0 },
      } as HistogramSeriesPartialOptions);

      volumeSeries.setData(
        data.map((candle) => ({
          time: candle.time,
          value: candle.volume || 0,
          color: candle.close > candle.open ? "#22c55e" : "#ef4444", // green/red volume
        }))
      );
    }

    chartRef.current = chart;

    // Resize handler
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, icyMode, width, height, showVolume]);

  return <div ref={chartContainerRef} style={{ width: "100%", height }} />;
}
