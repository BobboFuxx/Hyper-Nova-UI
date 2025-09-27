import { executeTrade, estimateFee } from "../lib/api";
import { PublicKey } from "@solana/web3.js";

/**
 * Place a perpetual futures trade.
 * Currently supports basic buy/sell without leverage logic.
 */
export async function placePerpTrade({
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
    console.error(`Perp trade failed on ${chain}:`, err);
    throw err;
  }
}

/**
 * Estimate fees for a perpetual futures trade.
 */
export async function getPerpFee({
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
    console.warn(`Failed to estimate perp fee on ${chain}:`, err);
    return 0;
  }
}
