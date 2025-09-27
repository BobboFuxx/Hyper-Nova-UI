import { useEffect, useState } from "react";

// Cosmos wallets
import { useChain } from "@cosmos-kit/react";

// EVM wallets
import { useAccount, useConnect, useDisconnect } from "wagmi";

// Solana wallets
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";

export default function WalletConnect() {
  // Cosmos
  const { connect: connectCosmos, address: cosmosAddress, status: cosmosStatus } = useChain("osmosis"); // replace with your chain

  // EVM
  const { address: evmAddress, isConnected: evmConnected } = useAccount();
  const { connect: connectEVM, connectors } = useConnect();
  const { disconnect: disconnectEVM } = useDisconnect();

  // Solana
  const { publicKey, connected: solanaConnected, connect: connectSolana, disconnect: disconnectSolana } =
    useSolanaWallet();

  const [activeWallet, setActiveWallet] = useState<string>("");

  // Update active wallet
  useEffect(() => {
    if (cosmosAddress) setActiveWallet("Cosmos");
    else if (evmAddress) setActiveWallet("EVM");
    else if (solanaConnected) setActiveWallet("Solana");
    else setActiveWallet("");
  }, [cosmosAddress, evmAddress, solanaConnected]);

  return (
    <div className="p-4 bg-gray-900 rounded-md border border-gray-700">
      <h2 className="text-lg font-semibold mb-3">Wallet Connection</h2>

      {activeWallet ? (
        <div className="space-y-2">
          <p className="text-gray-300">
            Connected via <span className="font-bold">{activeWallet}</span>
          </p>
          <p className="text-sm text-gray-400 break-words">
            {cosmosAddress || evmAddress || publicKey?.toBase58()}
          </p>
          <button
            onClick={() => {
              if (cosmosAddress) {
                // CosmosKit handles disconnect internally
                window.location.reload();
              } else if (evmAddress) {
                disconnectEVM();
              } else if (solanaConnected) {
                disconnectSolana();
              }
            }}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-white"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Cosmos wallets */}
          <div>
            <h3 className="text-sm text-gray-400 mb-1">Cosmos Wallets</h3>
            <button
              onClick={() => connectCosmos()}
              className="w-full bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md text-white"
            >
              Connect Keplr / Cosmostation / Leap
            </button>
          </div>

          {/* EVM wallets */}
          <div>
            <h3 className="text-sm text-gray-400 mb-1">EVM Wallets</h3>
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => connectEVM({ connector })}
                className="w-full bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md text-white mb-2"
              >
                Connect {connector.name}
              </button>
            ))}
          </div>

          {/* Solana wallets */}
          <div>
            <h3 className="text-sm text-gray-400 mb-1">Solana Wallets</h3>
            <button
              onClick={connectSolana}
              className="w-full bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-md text-white"
            >
              Connect Phantom
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
