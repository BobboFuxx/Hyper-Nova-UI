// src/types.ts
import type { UTCTimestamp } from "lightweight-charts";

// -------------------- Core Trading Types --------------------
export type MarketType = "spot" | "perp";
export type TradeSide = "buy" | "sell";

export interface TradeParams {
  chain: string; // Cosmos, EVM, Solana, etc.
  address: string; // wallet address
  side: TradeSide;
  amount: number;
  price: number;
}

export interface Trade {
  id: string;
  side: TradeSide;
  price: number;
  amount: number;
  timestamp: number; // unix timestamp (ms)
}

export interface FeeResponse {
  fee: number;
  currency: string; // e.g. "SOL", "ETH", "USDC"
}

// -------------------- Order Book --------------------
export interface Order {
  price: number;
  amount: number;
}

export interface OrderBookData {
  bids: Order[];
  asks: Order[];
}

export interface OrderBookEntry extends Order {
  side: TradeSide; // "buy" = bid, "sell" = ask
}

// -------------------- Market Data --------------------
export interface MarketData {
  bestBid: number | null;
  bestAsk: number | null;
  lastPrice: number | null;
  suggestedAmount?: number;
  volume24h?: number;
  change24h?: number;
}

// -------------------- Candlestick Chart --------------------
export interface Candle {
  time: UTCTimestamp; // required by lightweight-charts
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface CandlestickChartProps {
  data: Candle[];
  icyMode?: boolean; // toggle icy vs. classic candles
  width?: number;
  height?: number;
  showVolume?: boolean; // toggle volume overlay
  onSelectCandle?: (candle: Candle) => void;
}

// -------------------- Wallet --------------------
export interface WalletContext {
  cosmosAddress?: string;
  evmAddress?: string;
  solanaPublicKey?: any; // replace `any` if you import Solana types
  activeWallet?: "Cosmos" | "EVM" | "Solana";
  connect: () => Promise<void>;
}
