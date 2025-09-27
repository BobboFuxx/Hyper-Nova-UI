// lib/api.ts
import { SigningStargateClient } from "@cosmjs/stargate";
import { ethers } from "ethers";
import { Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";

// ---------------- Cosmos ----------------
async function executeCosmosTrade(
  address: string,
  side: "buy" | "sell",
  amount: number,
  price: number
) {
  if (!(window as any).getOfflineSigner) throw new Error("Cosmos wallet not found");

  const rpcUrl = process.env.NEXT_PUBLIC_HYPERNOVA_RPC!;
  const client = await SigningStargateClient.connectWithSigner(
    rpcUrl,
    (window as any).getOfflineSigner("hyper-nova")
  );

  const msg = {
    execute_trade: { side, amount, price },
  };

  const res = await client.execute(
    address,
    process.env.NEXT_PUBLIC_MARKET_CONTRACT!,
    msg,
    "auto"
  );

  return res.transactionHash;
}

// ---------------- EVM ----------------
async function executeEVMTrade(
  address: string,
  side: "buy" | "sell",
  amount: number,
  price: number
) {
  if (!window.ethereum) throw new Error("EVM wallet not found");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const contractAddress = process.env.NEXT_PUBLIC_EVM_MARKET_CONTRACT!;
  const abi = [
    "function executeTrade(string side, uint256 amount, uint256 price) public returns (bool)"
  ];
  const contract = new ethers.Contract(contractAddress, abi, signer);

  const tx = await contract.executeTrade(
    side,
    ethers.utils.parseUnits(amount.toString(), 18),
    ethers.utils.parseUnits(price.toString(), 18)
  );
  const receipt = await tx.wait();
  return receipt.transactionHash;
}

// ---------------- Solana ----------------
async function executeSolanaTrade(
  publicKey: PublicKey,
  side: "buy" | "sell",
  amount: number,
  price: number
) {
  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC!);
  const transaction = new Transaction();

  // Placeholder: simple SOL transfer as a demo
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: publicKey, // Replace with actual program address
      lamports: BigInt(amount * 1e9), // 1 SOL = 1e9 lamports
    })
  );

  const wallet = (window as any).solana;
  if (!wallet) throw new Error("Solana wallet not found");

  const { signature } = await wallet.signAndSendTransaction(transaction);
  await connection.confirmTransaction(signature);
  return signature;
}

// ---------------- Main multi-chain executor ----------------
export async function executeTrade({
  address,
  side,
  amount,
  price,
  chain,
}: {
  address: string | PublicKey;
  side: "buy" | "sell";
  amount: number;
  price: number;
  chain: "Cosmos" | "EVM" | "Solana";
}) {
  switch (chain) {
    case "Cosmos":
      return executeCosmosTrade(address as string, side, amount, price);
    case "EVM":
      return executeEVMTrade(address as string, side, amount, price);
    case "Solana":
      return executeSolanaTrade(address as PublicKey, side, amount, price);
    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
}
