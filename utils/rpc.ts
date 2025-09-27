import { StargateClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { QueryClient, setupWebsocket } from "@cosmjs/stargate";
import { subscribeTradesWS, subscribeCandlesWS, Trade, Candle } from "./ws";

const RPC_URL = process.env.NEXT_PUBLIC_HYPERNOVA_RPC!;
const CHAIN_ID = process.env.NEXT_PUBLIC_HYPERNOVA_CHAIN_ID!;
let client: StargateClient | null = null;

/** Initialize Stargate client (RPC or gRPC) */
export async function getClient() {
  if (!client) {
    const tmClient = await Tendermint34Client.connect(RPC_URL);
    client = await StargateClient.create(tmClient);
  }
  return client;
}

/** Fetch OHLC data via smart contract query */
export async function getOHLC(symbol: string) {
  const c = await getClient();
  const res = await c.queryContractSmart(
    process.env.NEXT_PUBLIC_MARKET_CONTRACT!,
    { get_ohlc: { symbol } }
  );
  return res.candles as Candle[];
}

/** Fetch orderbook via smart contract query */
export async function getOrderbook(symbol: string) {
  const c = await getClient();
  const res = await c.queryContractSmart(
    process.env.NEXT_PUBLIC_MARKET_CONTRACT!,
    { get_orderbook: { symbol } }
  );
  return res;
}

/** Connect Cosmos wallet (Keplr, Cosmostation, Leap) */
export async function connectWalletCosmos(): Promise<string> {
  if (!window.keplr) throw new Error("Keplr wallet not found");
  await window.keplr.enable(CHAIN_ID);
  const offlineSigner = window.getOfflineSigner(CHAIN_ID);
  const accounts = await offlineSigner.getAccounts();
  return accounts[0].address;
}

/** Subscribe to live trades via WebSocket */
export function subscribeTrades(symbol: string, callback: (trade: Trade) => void) {
  return subscribeTradesWS(symbol, callback);
}

/** Subscribe to live candles via WebSocket */
export function subscribeCandles(symbol: string, callback: (candle: Candle) => void) {
  return subscribeCandlesWS(symbol, callback);
}
