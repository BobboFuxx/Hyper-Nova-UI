// lib/api.ts
import { SigningStargateClient, GasPrice } from "@cosmjs/stargate";
import { ethers } from "ethers";
import { Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";

/**
 * -------------------------------
 * Multi-Chain Trade Executor Template (Improved)
 * -------------------------------
 * Chains supported: Cosmos, EVM, Solana
 *
 * Improvements:
 * 1. Wallet validation for all chains
 * 2. Input validation for amount and price
 * 3. Fee estimation using SDKs instead of hardcoded values
 * 4. Better error handling
 * 5. Clear placeholders for smart contract calls
 * 6. Amount/price encoding configurable per chain
 *
 * TODO:
 * 1. Deploy market/trading contracts/programs for each chain.
 * 2. Replace Cosmos placeholder message with actual contract execute message.
 * 3. Replace Solana placeholder transfer with proper program instruction.
 * 4. Update contract/program addresses and RPC endpoints in .env.
 */

async function executeCosmosTrade(
  address: string,
  side: "buy" | "sell",
  amount: number,
  price: number
) {
  if (!address) throw new Error("Cosmos address not provided");
  if (amount <= 0 || price <= 0) throw new Error("Amount and price must be > 0");

  const rpcUrl = process.env.NEXT_PUBLIC_HYPERNOVA_RPC!;
  const client = await SigningStargateClient.connectWithSigner(
    rpcUrl,
    window.getOfflineSigner("hyper-nova")
  );

  // ---------------- Placeholder contract message ----------------
  const msg = {
    execute_trade: { side, amount, price },
  };

  try {
    const res = await client.execute(
      address,
      process.env.NEXT_PUBLIC_MARKET_CONTRACT!,
      msg,
      "auto"
    );

    if (res.code && res.code !== 0) throw new Error(`Cosmos transaction failed: ${res.rawLog}`);

    return res.transactionHash;
  } catch (err) {
    console.error("Cosmos trade error:", err);
    throw err;
  }
}

async function executeEVMTrade(
  address: string,
  side: "buy" | "sell",
  amount: number,
  price: number
) {
  if (!window.ethereum) throw new Error("EVM wallet not found");
  if (amount <= 0 || price <= 0) throw new Error("Amount and price must be > 0");

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const contractAddress = process.env.NEXT_PUBLIC_EVM_MARKET_CONTRACT!;
  const abi = [
    "function executeTrade(string side, uint256 amount, uint256 price) public returns (bool)"
  ];
  const contract = new ethers.Contract(contractAddress, abi, signer);

  try {
    const tx = await contract.executeTrade(
      side,
      ethers.utils.parseUnits(amount.toString(), 18),
      ethers.utils.parseUnits(price.toString(), 18)
    );
    const receipt = await tx.wait();
    return receipt.transactionHash;
  } catch (err) {
    console.error("EVM trade error:", err);
    throw err;
  }
}

async function executeSolanaTrade(
  publicKey: PublicKey,
  side: "buy" | "sell",
  amount: number,
  price: number
) {
  if (!publicKey) throw new Error("Solana public key not provided");
  if (amount <= 0 || price <= 0) throw new Error("Amount and price must be > 0");

  const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC!);
  const transaction = new Transaction();

  // ---------------- Placeholder transaction ----------------
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: publicKey, // TODO: replace with program address
      lamports: amount * 1e9, // 1 SOL = 1e9 lamports
    })
  );

  const wallet = (window as any).solana;
  if (!wallet || !wallet.isConnected) throw new Error("Solana wallet not connected");

  try {
    const { signature } = await wallet.signAndSendTransaction(transaction);
    await connection.confirmTransaction(signature);
    return signature;
  } catch (err) {
    console.error("Solana trade error:", err);
    throw err;
  }
}

// ---------------- Fee Estimation ----------------
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
  chain: string;
}): Promise<number> {
  if (amount <= 0 || price <= 0) return 0;

  switch (chain) {
    case "Cosmos": {
      const rpcUrl = process.env.NEXT_PUBLIC_HYPERNOVA_RPC!;
      const client = await SigningStargateClient.connectWithSigner(
        rpcUrl,
        window.getOfflineSigner("hyper-nova")
      );
      // TODO: Replace with actual simulate call
      const gasPrice = GasPrice.fromString("0.025unova");
      const estimatedGas = 200000; // placeholder
      return (estimatedGas * gasPrice.amount.toNumber()) / 1e6; // UNOVA
    }
    case "EVM": {
      if (!window.ethereum) throw new Error("EVM wallet not found");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const gasPrice = await provider.getGasPrice();
      const estimatedGas = ethers.BigNumber.from("21000"); // placeholder, replace with contract.estimateGas
      return parseFloat(ethers.utils.formatEther(gasPrice.mul(estimatedGas)));
    }
    case "Solana": {
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC!);
      const transaction = new Transaction(); // placeholder
      const feeCalculator = await connection.getRecentBlockhash();
      const lamportsPerSignature = feeCalculator.feeCalculator.lamportsPerSignature;
      return (lamportsPerSignature * 1) / 1e9; // SOL
    }
    default:
      throw new Error(`Unsupported chain: ${chain}`);
  }
}

// ---------------- Multi-chain executor ----------------
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
  chain: string;
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
