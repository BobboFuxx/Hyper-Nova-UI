// lib/api.ts
import { SigningStargateClient } from "@cosmjs/stargate";
import { ethers } from "ethers";
import { Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";

/**
 * -------------------------------
 * Multi-Chain Trade Executor Template
 * -------------------------------
 * Chains supported: Cosmos, EVM, Solana
 *
 * TODO (in order):
 * 1. Deploy smart contracts on each chain:
 *    - Cosmos: market contract
 *    - EVM: market contract
 *    - Solana: trading program
 * 2. Replace placeholder Cosmos execute message with actual contract execute message.
 * 3. Replace Solana placeholder transaction with actual instruction calling your trading program.
 * 4. Update contract addresses & RPC endpoints in .env:
 *    - NEXT_PUBLIC_HYPERNOVA_RPC (Cosmos)
 *    - NEXT_PUBLIC_MARKET_CONTRACT (Cosmos)
 *    - NEXT_PUBLIC_EVM_MARKET_CONTRACT (EVM)
 *    - NEXT_PUBLIC_SOLANA_RPC (Solana)
 *    - NEXT_PUBLIC_SOLANA_PROGRAM (Solana)
 * 5. Ensure amount/price encoding matches contract/program requirements.
 * 6. Add proper error handling & gas/fee estimation for Cosmos and Solana.
 * 7. Test each chain on testnet before mainnet deployment.
 */

// ---------------- Cosmos execution (placeholder)
async function executeCosmosTrade(
  address: string,
  side: "buy" | "sell",
  amount: number,
  price: number
) {
  const rpcUrl = process.env.NEXT_PUBLIC_HYPERNOVA_RPC!;
  const client = await SigningStargateClient.connectWithSigner(
    rpcUrl,
    window.getOfflineSigner("hyper-nova")
  );

  // TODO: Replace with actual contract execute message
  const msg = {
    execute_trade: {
      side,
      amount,
      price,
    },
  };

  const res = await client.execute(
    address,
    process.env.NEXT_PUBLIC_MARKET_CONTRACT!,
    msg,
    "auto"
  );
  return res.transactionHash;
}

// ---------------- EVM execution
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

// ---------------- Solana execution (placeholder)
async function executeSolanaTrade(
  publicKey: PublicKey,
  side: "buy" | "sell",
  amount: number,
  price: number
) {
  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC!);
  const transaction = new Transaction();

  // TODO: Replace with instruction to Solana trading program
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: publicKey, // placeholder, replace with program address
      lamports: amount * 1e9,
    })
  );

  const wallet = (window as any).solana;
  const { signature } = await wallet.signAndSendTransaction(transaction);
  await connection.confirmTransaction(signature);
  return signature;
}

// ---------------- Multi-chain executor
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
  chain: string; // "Cosmos" | "EVM" | "Solana"
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

/**
 * -------------------------------
 * TODO Checklist (in order)
 * -------------------------------
 * 1. Deploy market/trading contracts/programs for each chain.
 * 2. Replace Cosmos placeholder message with actual contract execute message.
 * 3. Replace Solana placeholder transfer with proper program instruction.
 * 4. Update contract/program addresses and RPC endpoints in .env.
 * 5. Ensure proper amount/price encoding for each chain.
 * 6. Implement error handling and gas/fee estimation for Cosmos and Solana.
 * 7. Test on testnet for each chain individually.
 * 8. Integrate with frontend TradeForm.tsx and WalletConnect.tsx.
 * 9. Add notifications for success/failure of transactions.
 * 10. Deploy to mainnet after thorough testing.
 */
