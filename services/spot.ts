// services/spot.ts
import { executeTrade, estimateFee } from "../lib/api";
import { PublicKey } from "@solana/web3.js";

/**
 * Supported chains type
 */
type Chain = "Cosmos" | "EVM" | "Solana";

/**
 * Parameters for a spot trade
 */
interface SpotTradeParams {
  chain: Chain;
  address: string | PublicKey;
  side: "buy" | "sell";
  amount: number;
  price: number;
}

/**
 * Place a spot trade on any supported chain.
 */
export async function placeSpotTrade({
  chain,
  address,
  side,
  amount,
  price,
}: SpotTradeParams) {
  if (amount <= 0 || price <= 0) {
    throw new Error("Amount and price must be greater than 0.");
  }

  try {
    const tx = await executeTrade({ chain, address, side, amount, price });
    return tx;
  } catch (err) {
    console.error(`Spot trade failed on ${chain}:`, err);
    throw err;
  }
}

/**
 * Estimate fees for a spot trade on any supported chain.
 */
export async function getSpotTradeFee({
  chain,
  address,
  side,
  amount,
  price,
}: SpotTradeParams) {
  if (amount <= 0 || price <= 0) {
    return 0;
  }

  try {
    return await estimateFee({ chain, address, side, amount, price });
  } catch (err) {
    console.warn(`Failed to estimate spot fee on ${chain}:`, err);
    return 0;
  }
}
