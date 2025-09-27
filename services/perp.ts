// services/perp.ts
import { executeTrade, estimateFee } from "../lib/api";
import { PublicKey } from "@solana/web3.js";

/**
 * Supported chains type
 */
type Chain = "Cosmos" | "EVM" | "Solana";

/**
 * Parameters for a perpetual futures trade
 */
interface PerpTradeParams {
  chain: Chain;
  address: string | PublicKey;
  side: "buy" | "sell";
  amount: number;
  price: number;
}

/**
 * Place a perpetual futures trade on any supported chain.
 * Currently supports basic buy/sell without leverage logic.
 */
export async function placePerpTrade({
  chain,
  address,
  side,
  amount,
  price,
}: PerpTradeParams) {
  if (amount <= 0 || price <= 0) {
    throw new Error("Amount and price must be greater than 0.");
  }

  try {
    const tx = await executeTrade({ chain, address, side, amount, price });
    return tx;
  } catch (err) {
    console.error(`Perp trade failed on ${chain}:`, err);
    throw err;
  }
}

/**
 * Estimate fees for a perpetual futures trade on any supported chain.
 */
export async function getPerpTradeFee({
  chain,
  address,
  side,
  amount,
  price,
}: PerpTradeParams) {
  if (amount <= 0 || price <= 0) {
    return 0;
  }

  try {
    return await estimateFee({ chain, address, side, amount, price });
  } catch (err) {
    console.warn(`Failed to estimate perp fee on ${chain}:`, err);
    return 0;
  }
}
