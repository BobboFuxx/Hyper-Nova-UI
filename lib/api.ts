// lib/api.ts
import { SigningStargateClient, GasPrice } from "@cosmjs/stargate";
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

// ---------------- Fee estimation
export async function estimateFee({
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
}): Promise<number> {
  switch (chain) {
    case "Cosmos":
      // TODO: calculate actual gas from contract call
      const rpcUrl = process.env.NEXT_PUBLIC_HYPERNOVA_RPC!;
      const gasPrice = GasPrice.fromString("0.025unova"); // example
      const estimatedGas = 200000; // placeholder
      return estimatedGas * gasPrice.amount.toNumber() / 1e6; // returns in UNOVA
    case "EVM":
      if (!window.ethereum) throw new Error("EVM wallet not found");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const gasPriceEVM = await provider.getGasPrice();
      const estimatedGasEVM = ethers.BigNumber.from("21000"); // placeholder
      return parseFloat(ethers.utils.formatEther(gasPriceEVM.mul(estimatedGasEVM)));
    case "Solana":
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC!);
      const feeCalculator = await connection.getRecentBlockhash();
      const lamportsPerSignature = feeCalculator.feeCalculator.lamportsPerSignature;
      const numSignatures = 1; // placeholder
      return (lamportsPerSignature * numSignatures) / 1e9; // returns in SOL
    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
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
