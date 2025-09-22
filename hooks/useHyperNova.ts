import { useState } from "react";

export function useHyperNova() {
  const [address, setAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    // Wallet connection logic here (Keplr/Metamask)
    setAddress("hyper1dummyaddress");
  };

  const getPortfolio = async () => {
    // Fetch portfolio logic
    return [
      { asset: "BTC", balance: 0.5 },
      { asset: "ETH", balance: 2 },
      { asset: "USDC", balance: 1000 },
    ];
  };

  return {
    address,
    connectWallet,
    getPortfolio,
  };
}
