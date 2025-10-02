import { useEffect, useRef } from "react";
import {
  createChart,
  IChartApi,
  UTCTimestamp,
  CandlestickSeriesPartialOptions,
  HistogramSeriesPartialOptions,
} from "lightweight-charts";
import { Candle } from "../types";

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
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Destroy old chart
    if (chartRef.current) {
      chartRef.current.remove();
    }

    // Create chart
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
      upColor: icyMode ? "#38bdf8" : "#22c55e",
      downColor: icyMode ? "#a78bfa" : "#ef4444",
      borderUpColor: icyMode ? "#38bdf8" : "#22c55e",
      borderDownColor: icyMode ? "#a78bfa" : "#ef4444",
      wickUpColor: icyMode ? "#38bdf8" : "#22c55e",
      wickDownColor: icyMode ? "#a78bfa" : "#ef4444",
    };

    const candleSeries = chart.addCandlestickSeries(candleOptions);
    candleSeries.setData(data);

    // Volume histogram overlay
    if (showVolume) {
      const volumeSeries = chart.addHistogramSeries({
        priceFormat: { type: "volume" },
        priceScaleId: "",
        scaleMargins: { top: 0.8, bottom: 0 },
      } as HistogramSeriesPartialOptions);

      volumeSeries.setData(
        data.map((candle) => ({
          time: candle.time as UTCTimestamp,
          value: candle.volume || 0,
          color: candle.close > candle.open ? "#22c55e" : "#ef4444",
        }))
      );
    }

    // Tooltip
    const tooltip = document.createElement("div");
    tooltip.className =
      "absolute bg-gray-900 text-gray-200 text-xs px-2 py-1 rounded border border-gray-700 pointer-events-none z-50";
    tooltip.style.display = "none";
    chartContainerRef.current.appendChild(tooltip);
    tooltipRef.current = tooltip;

    chart.subscribeCrosshairMove((param) => {
      if (!tooltipRef.current) return;
      if (!param.time || !param.seriesData.size) {
        tooltipRef.current.style.display = "none";
        return;
      }

      const candle = param.seriesData.get(candleSeries) as any;
      if (!candle) return;

      tooltipRef.current.style.display = "block";
      tooltipRef.current.style.left = `${param.point?.x ?? 0 + 15}px`;
      tooltipRef.current.style.top = `${param.point?.y ?? 0 - 30}px`;

      tooltipRef.current.innerHTML = `
        <div>O: ${candle.open}</div>
        <div>H: ${candle.high}</div>
        <div>L: ${candle.low}</div>
        <div>C: ${candle.close}</div>
        ${candle.value ? `<div>V: ${candle.value}</div>` : ""}
      `;
    });

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
      if (tooltipRef.current) {
        tooltipRef.current.remove();
      }
      chart.remove();
    };
  }, [data, icyMode, width, height, showVolume]);

  return (
    <div className="relative" ref={chartContainerRef} style={{ width: "100%", height }} />
  );
}
