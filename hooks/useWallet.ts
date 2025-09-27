import { useState, useEffect } from "react";

// Cosmos wallets
import { useChain } from "@cosmos-kit/react";

// EVM wallets
import { useAccount, useConnect, useDisconnect } from "wagmi";

// Solana wallets
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";

export function useWallet() {
  // ---------------- Cosmos ----------------
  const { connect: connectCosmos, address: cosmosAddress, status: cosmosStatus } =
    useChain("osmosis"); // replace "osmosis" with your chainId

  // ---------------- EVM ----------------
  const { address: evmAddress, isConnected: evmConnected } = useAccount();
  const { connect: connectEVM, connectors } = useConnect();
  const { disconnect: disconnectEVM } = useDisconnect();

  // ---------------- Solana ----------------
  const {
    publicKey,
    connected: solanaConnected,
    connect: connectSolana,
    disconnect: disconnectSolana,
  } = useSolanaWallet();

  // Active wallet type
  const [activeWallet, setActiveWallet] = useState<"Cosmos" | "EVM" | "Solana" | null>(null);
  const [address, setAddress] = useState<string>("");

  // Detect which wallet is connected
  useEffect(() => {
    if (cosmosAddress) {
      setActiveWallet("Cosmos");
      setAddress(cosmosAddress);
    } else if (evmAddress) {
      setActiveWallet("EVM");
      setAddress(evmAddress);
    } else if (solanaConnected && publicKey) {
      setActiveWallet("Solana");
      setAddress(publicKey.toBase58());
    } else {
      setActiveWallet(null);
      setAddress("");
    }
  }, [cosmosAddress, evmAddress, solanaConnected, publicKey]);

  // Connect function based on wallet type
  const connect = async (type: "Cosmos" | "EVM" | "Solana") => {
    try {
      if (type === "Cosmos") {
        await connectCosmos();
      } else if (type === "EVM") {
        // default to first connector (MetaMask, WalletConnect, etc.)
        await connectEVM({ connector: connectors[0] });
      } else if (type === "Solana") {
        await connectSolana();
      }
    } catch (err) {
      console.error("Wallet connect error:", err);
    }
  };

  // Disconnect function
  const disconnect = () => {
    if (activeWallet === "EVM") disconnectEVM();
    else if (activeWallet === "Solana") disconnectSolana();
    else if (activeWallet === "Cosmos") {
      // CosmosKit handles disconnect internally, sometimes a reload is needed
      window.location.reload();
    }
  };

  return {
    activeWallet,
    address,
    connect,
    disconnect,
    connectors, // for EVM wallets display in WalletConnect.tsx
  };
}
