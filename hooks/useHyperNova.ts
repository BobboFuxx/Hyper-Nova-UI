import { useState } from "react";
import { connectWalletCosmos, getClient } from "../utils/rpc";

export function useHyperNova() {
  const [address, setAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    const addr = await connectWalletCosmos();
    setAddress(addr);
    return addr;
  };

  const getPortfolio = async (addr: string) => {
    const c = await getClient();
    const res = await c.queryContractSmart(process.env.NEXT_PUBLIC_MARGIN_CONTRACT!, { get_portfolio: { address: addr } });
    return res.portfolio;
  };

  return { address, connectWallet, getPortfolio };
}
