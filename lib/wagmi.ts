import { configureChains, createClient } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const { provider, webSocketProvider } = configureChains(
  [mainnet, sepolia],
  [publicProvider()]
);

export const wagmiClient = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
});
