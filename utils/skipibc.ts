import { SkipClient } from "@skip-protocol/sdk";

const skip = new SkipClient({ network: "testnet" });

export async function depositToken(chain: string, denom: string, amount: string, address: string) {
  const tx = await skip.deposit({ chain, denom, amount, sender: address });
  return tx.txHash;
}

export async function withdrawToken(chain: string, denom: string, amount: string, address: string) {
  const tx = await skip.withdraw({ chain, denom, amount, receiver: address });
  return tx.txHash;
}

export async function getIBCTransactions(address: string) {
  const txs = await skip.getHistory(address);
  return txs.map(tx => ({
    txHash: tx.txHash,
    type: tx.type,
    denom: tx.denom,
    amount: Number(tx.amount),
    status: tx.status
  }));
}
