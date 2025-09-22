import { StargateClient } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";

const RPC_URL = process.env.NEXT_PUBLIC_HYPERNOVA_RPC!;
let client: StargateClient | null = null;

export async function getClient() {
  if (!client) {
    const tmClient = await Tendermint34Client.connect(RPC_URL);
    client = await StargateClient.create(tmClient);
  }
  return client;
}

export async function getOHLC(symbol: string) {
  const c = await getClient();
  const res = await c.queryContractSmart(
    process.env.NEXT_PUBLIC_MARKET_CONTRACT!,
    { get_ohlc: { symbol } }
  );
  return res.candles;
}

export async function getOrderbook(symbol: string) {
  const c = await getClient();
  const res = await c.queryContractSmart(
    process.env.NEXT_PUBLIC_MARKET_CONTRACT!,
    { get_orderbook: { symbol } }
  );
  return res;
}

export async function connectWalletCosmos(): Promise<string> {
  if (!window.keplr) throw new Error("Keplr wallet not found");
  await window.keplr.enable("hyper-nova");
  const offlineSigner = window.getOfflineSigner("hyper-nova");
  const accounts = await offlineSigner.getAccounts();
  return accounts[0].address;
}
