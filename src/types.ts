// src/types.ts

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

export interface FeeResponse {
  fee: number;
  currency: string; // e.g. "SOL", "ETH", "UNOVA"
}

// -------------------- Orderbook --------------------
export interface Order {
  price: number;
  amount: number;
}

export interface OrderBookData {
  bids: Order[];
  asks: Order[];
}

// -------------------- Market Data --------------------
export interface MarketData {
  bestBid: number | null;
  bestAsk: number | null;
  lastPrice: number | null;
  suggestedAmount?: number;
}

// -------------------- Candlestick Chart --------------------
export interface Candle {
  time: number; // unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartProps {
  symbol: string;
  candles: Candle[];
  onSelectCandle?: (candle: Candle) => void;
}

// -------------------- Wallet --------------------
export interface WalletContext {
  cosmosAddress?: string;
  evmAddress?: string;
  solanaPublicKey?: any; // keep as `any` unless you install @solana/web3.js types
  activeWallet?: string; // "Cosmos", "EVM", "Solana"
  connect: () => Promise<void>;
}
