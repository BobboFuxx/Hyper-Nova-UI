// services/perp.ts
import { executeTrade, estimateFee } from "../lib/api";
import { PublicKey } from "@solana/web3.js";

export type Chain = "Cosmos" | "EVM" | "Solana";

export interface PerpTradeParams {
  chain: Chain;
  address: string | PublicKey;
  side: "buy" | "sell";
  amount: number;
  price: number;
  // Future: leverage, margin, etc.
}

/**
 * Place a perpetual futures trade.
 * Currently supports basic buy/sell without leverage logic.
 */
export async function placePerpTrade(params: PerpTradeParams) {
  const { chain, address, side, amount, price } = params;

  if (amount <= 0 || price <= 0) throw new Error("Amount and price must be greater than 0");

  try {
    const txHash = await executeTrade({ chain, address, side, amount, price });
    return txHash;
  } catch (err) {
    console.error(`Perp trade failed on ${chain}:`, err);
    throw err;
  }
}

/**
 * Estimate fees for a perpetual futures trade.
 */
export async function getPerpTradeFee(params: PerpTradeParams): Promise<number> {
  const { chain, address, side, amount, price } = params;

  if (amount <= 0 || price <= 0) return 0;

  try {
    const fee = await estimateFee({ chain, address, side, amount, price });
    return fee;
  } catch (err) {
    console.warn(`Failed to estimate perp trade fee on ${chain}:`, err);
    return 0;
  }
}
