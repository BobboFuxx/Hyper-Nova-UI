// lib/api.ts
import { SigningStargateClient, GasPrice, calculateFee } from "@cosmjs/stargate";
import { ethers } from "ethers";
import { Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";

/**
 * -------------------------------
 * Multi-Chain Trade Executor
 * -------------------------------
 * Chains supported: Cosmos, EVM, Solana
 *
 * Features:
 * - Dynamic gas/fee estimation for Cosmos, EVM, Solana
 * - Error handling & input validation
 * - Accurate conversions
 * - Clean placeholders for contract/program calls
 */

// ---------------- Cosmos execution
export async function executeCosmosTrade(
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

  const gasPrice = GasPrice.fromString("0.025unova");

  try {
    // Try to simulate gas first
    const simulatedGas = await client.simulate(address, [msg], "");
    const fee = calculateFee(simulatedGas, gasPrice);

    const res = await client.execute(address, process.env.NEXT_PUBLIC_MARKET_CONTRACT!, msg, fee);

    if (res.code && res.code !== 0) throw new Error(`Cosmos transaction failed: ${res.rawLog}`);
    return res.transactionHash;
  } catch (err) {
    console.warn("Cosmos execution failed, using fallback gas:", err);
    const fallbackFee = calculateFee(200000, gasPrice);
    const res = await client.execute(address, process.env.NEXT_PUBLIC_MARKET_CONTRACT!, msg, fallbackFee);
    return res.transactionHash;
  }
}

// ---------------- EVM execution
export async function executeEVMTrade(
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
    const txData = await contract.populateTransaction.executeTrade(
      side,
      ethers.utils.parseUnits(amount.toString(), 18),
      ethers.utils.parseUnits(price.toString(), 18)
    );

    const gasLimit = await provider.estimateGas({ ...txData, from: address });
    const gasPrice = await provider.getGasPrice();

    const tx = await signer.sendTransaction({ ...txData, gasLimit, gasPrice });
    const receipt = await tx.wait();
    return receipt.transactionHash;
  } catch (err) {
    console.warn("EVM execution failed, sending without estimate:", err);
    const tx = await contract.executeTrade(
      side,
      ethers.utils.parseUnits(amount.toString(), 18),
      ethers.utils.parseUnits(price.toString(), 18)
    );
    const receipt = await tx.wait();
    return receipt.transactionHash;
  }
}

// ---------------- Solana execution
export async function executeSolanaTrade(
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
      toPubkey: publicKey, // TODO: replace with your trading program address
      lamports: amount * 1e9,
    })
  );

  const wallet = (window as any).solana;
  if (!wallet || !wallet.isConnected) throw new Error("Solana wallet not connected");

  try {
    const { signature } = await wallet.signAndSendTransaction(transaction);
    await connection.confirmTransaction(signature, "confirmed");
    return signature;
  } catch (err) {
    console.error("Solana execution failed:", err);
    throw err;
  }
}

// ---------------- Fee Estimation
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
  if (amount <= 0 || price <= 0) return 0;

  switch (chain) {
    case "Cosmos": {
      const rpcUrl = process.env.NEXT_PUBLIC_HYPERNOVA_RPC!;
      const client = await SigningStargateClient.connect(rpcUrl);
      const msg = { execute_trade: { side, amount, price } };
      const gasPrice = GasPrice.fromString("0.025unova");

      try {
        const simulatedGas = await client.simulate(address as string, [msg], "");
        const fee = calculateFee(simulatedGas, gasPrice);
        return parseFloat(fee.amount[0].amount) / 1e6; // UNOVA
      } catch (err) {
        console.warn("Cosmos fee estimation failed, using fallback:", err);
        return 200000 * 0.025; // fallback
      }
    }

    case "EVM": {
      if (!window.ethereum) throw new Error("EVM wallet not found");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contractAddress = process.env.NEXT_PUBLIC_EVM_MARKET_CONTRACT!;
      const abi = [
        "function executeTrade(string side, uint256 amount, uint256 price) public returns (bool)"
      ];
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const txData = await contract.populateTransaction.executeTrade(
        side,
        ethers.utils.parseUnits(amount.toString(), 18),
        ethers.utils.parseUnits(price.toString(), 18)
      );

      try {
        const gasLimit = await provider.estimateGas(txData);
        const gasPrice = await provider.getGasPrice();
        return parseFloat(ethers.utils.formatEther(gasLimit.mul(gasPrice)));
      } catch (err) {
        console.warn("EVM fee estimation failed, using fallback:", err);
        return 0.01; // fallback in ETH
      }
    }

    case "Solana": {
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC!);
      try {
        const { feeCalculator } = await connection.getRecentBlockhash();
        const lamportsPerSignature = feeCalculator.lamportsPerSignature;
        return lamportsPerSignature / 1e9; // SOL
      } catch (err) {
        console.warn("Solana fee estimation failed, using fallback:", err);
        return 0.00001;
      }
    }

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
