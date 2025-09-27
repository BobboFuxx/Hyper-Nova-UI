import { useState } from "react";
import { useWallet } from "../hooks/useWallet";

export default function WalletConnect() {
  const { activeWallet, address, connect, disconnect, connectors } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<"Cosmos" | "EVM" | "Solana">("Cosmos");

  return (
    <div className="p-4 bg-gray-900 rounded-md border border-gray-700">
      <h2 className="text-lg font-semibold mb-3">Wallet Connection</h2>

      {activeWallet ? (
        <div className="space-y-2">
          <p className="text-gray-300">
            Connected via <span className="font-bold">{activeWallet}</span>
          </p>
          <p className="text-sm text-gray-400 break-words">{address}</p>
          <button
            onClick={disconnect}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-white"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Wallet type selection */}
          <div className="flex space-x-2 mb-2">
            {["Cosmos", "EVM", "Solana"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedWallet(type as "Cosmos" | "EVM" | "Solana")}
                className={`flex-1 px-2 py-1 rounded-md text-white ${
                  selectedWallet === type
                    ? type === "Cosmos"
                      ? "bg-blue-500"
                      : type === "EVM"
                      ? "bg-green-500"
                      : "bg-purple-500"
                    : "bg-gray-800"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Connect button based on selected wallet */}
          {selectedWallet === "Cosmos" && (
            <button
              onClick={() => connect("Cosmos")}
              className="w-full bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md text-white"
            >
              Connect Keplr / Cosmostation / Leap
            </button>
          )}
          {selectedWallet === "EVM" && (
            <div className="space-y-2">
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => connect("EVM")}
                  className="w-full bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md text-white"
                >
                  Connect {connector.name}
                </button>
              ))}
            </div>
          )}
          {selectedWallet === "Solana" && (
            <button
              onClick={() => connect("Solana")}
              className="w-full bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-md text-white"
            >
              Connect Phantom
            </button>
          )}
        </div>
      )}
    </div>
  );
}
