import { useState, useCallback } from "react";
import { PublicKey } from "@solana/web3.js";
import * as spotService from "../services/spot";
import * as perpService from "../services/perp";

type Chain = "Cosmos" | "EVM" | "Solana";

interface TradeParams {
  chain: Chain;
  address: string | PublicKey;
  side: "buy" | "sell";
  amount: number;
  price: number;
}

export function useTrades() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<string | null>(null);

  // ---------------- Spot Trade ----------------
  const placeSpotTrade = useCallback(async (params: TradeParams) => {
    setLoading(true);
    setError(null);

    try {
      const tx = await spotService.placeSpotTrade(params);
      setLastTx(tx);
      return tx;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Spot trade failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSpotFee = useCallback(async (params: TradeParams) => {
    try {
      return await spotService.getSpotFee(params);
    } catch (err) {
      console.warn("Spot fee estimation failed:", err);
      return 0;
    }
  }, []);

  // ---------------- Perp Trade ----------------
  const placePerpTrade = useCallback(async (params: TradeParams) => {
    setLoading(true);
    setError(null);

    try {
      const tx = await perpService.placePerpTrade(params);
      setLastTx(tx);
      return tx;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Perp trade failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPerpFee = useCallback(async (params: TradeParams) => {
    try {
      return await perpService.getPerpFee(params);
    } catch (err) {
      console.warn("Perp fee estimation failed:", err);
      return 0;
    }
  }, []);

  return {
    loading,
    error,
    lastTx,
    placeSpotTrade,
    getSpotFee,
    placePerpTrade,
    getPerpFee,
  };
}
