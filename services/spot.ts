import { executeTrade, estimateFee } from "../lib/api";
import { PublicKey } from "@solana/web3.js";

/**
 * Place a spot trade on any supported chain.
 */
export async function placeSpotTrade({
  chain,
  address,
  side,
  amount,
  price,
}: {
  chain: "Cosmos" | "EVM" | "Solana";
  address: string | PublicKey;
  side: "buy" | "sell";
  amount: number;
  price: number;
}) {
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
export async function getSpotFee({
  chain,
  address,
  side,
  amount,
  price,
}: {
  chain: "Cosmos" | "EVM" | "Solana";
  address: string | PublicKey;
  side: "buy" | "sell";
  amount: number;
  price: number;
}) {
  try {
    return await estimateFee({ chain, address, side, amount, price });
  } catch (err) {
    console.warn(`Failed to estimate spot fee on ${chain}:`, err);
    return 0;
  }
}
