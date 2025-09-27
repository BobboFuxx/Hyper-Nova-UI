// services/spot.ts
import { executeTrade, estimateFee } from "../lib/api";
import { PublicKey } from "@solana/web3.js";

export type Chain = "Cosmos" | "EVM" | "Solana";

export interface SpotTradeParams {
  chain: Chain;
  address: string | PublicKey;
  side: "buy" | "sell";
  amount: number;
  price: number;
}

/**
 * Place a spot trade on any supported chain.
 */
export async function placeSpotTrade(params: SpotTradeParams) {
  const { chain, address, side, amount, price } = params;

  if (amount <= 0 || price <= 0) throw new Error("Amount and price must be greater than 0");

  try {
    const txHash = await executeTrade({ chain, address, side, amount, price });
    return txHash;
  } catch (err) {
    console.error(`Spot trade failed on ${chain}:`, err);
    throw err;
  }
}

/**
 * Estimate fees for a spot trade on any supported chain.
 */
export async function getSpotTradeFee(params: SpotTradeParams): Promise<number> {
  const { chain, address, side, amount, price } = params;

  if (amount <= 0 || price <= 0) return 0;

  try {
    const fee = await estimateFee({ chain, address, side, amount, price });
    return fee;
  } catch (err) {
    console.warn(`Failed to estimate spot trade fee on ${chain}:`, err);
    return 0;
  }
}
