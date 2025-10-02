import { useEffect, useRef } from "react";
import {
  createChart,
  IChartApi,
  CandlestickSeriesPartialOptions,
  HistogramSeriesPartialOptions,
  CrosshairMode,
} from "lightweight-charts";
import { Candle, CandlestickChartProps } from "../types";

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

    // Destroy old chart instance if exists
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
      crosshair: { mode: CrosshairMode.Normal },
      timeScale: {
        timeVisible: true,
        borderColor: "#334155",
      },
      rightPriceScale: {
        borderColor: "#334155",
      },
    });

    // Candlestick options
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
        data.map((candle: Candle) => ({
          time: candle.time,
          value: candle.volume ?? 0,
          color: candle.close > candle.open ? "#22c55e" : "#ef4444",
        }))
      );
    }

    // Tooltip setup
    const tooltip = document.createElement("div");
    tooltip.className =
      "absolute bg-gray-900 text-gray-200 text-xs px-2 py-1 rounded border border-gray-700 pointer-events-none z-50";
    tooltip.style.display = "none";
    chartContainerRef.current.appendChild(tooltip);
    tooltipRef.current = tooltip;

    chart.subscribeCrosshairMove((param) => {
      if (!tooltipRef.current) return;

      if (!param.time || !param.seriesData.size || !param.point) {
        tooltipRef.current.style.display = "none";
        return;
      }

      const candle = param.seriesData.get(candleSeries) as Candle | undefined;
      if (!candle) return;

      tooltipRef.current.style.display = "block";
      tooltipRef.current.style.left = `${param.point.x + 12}px`;
      tooltipRef.current.style.top = `${param.point.y - 60}px`;

      tooltipRef.current.innerHTML = `
        <div>O: ${candle.open}</div>
        <div>H: ${candle.high}</div>
        <div>L: ${candle.low}</div>
        <div>C: ${candle.close}</div>
        ${"volume" in candle && candle.volume ? `<div>V: ${candle.volume}</div>` : ""}
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
    <div
      className="relative"
      ref={chartContainerRef}
      style={{ width: "100%", height }}
    />
  );
}
