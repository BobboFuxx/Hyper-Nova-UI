import { getSigningCosmosClient } from "@cosmos-kit/core";

export async function connectCosmosWallet(chainId: string) {
  const client = await getSigningCosmosClient(chainId);
  const accounts = await client.getAccounts();
  return {
    client,
    address: accounts[0].address,
  };
}
