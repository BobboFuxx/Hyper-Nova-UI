const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_HYPERNOVA_RPC: process.env.NEXT_PUBLIC_HYPERNOVA_RPC,
    NEXT_PUBLIC_HYPERNOVA_WS: process.env.NEXT_PUBLIC_HYPERNOVA_WS,
    NEXT_PUBLIC_MARKET_CONTRACT: process.env.NEXT_PUBLIC_MARKET_CONTRACT,
    NEXT_PUBLIC_MARGIN_CONTRACT: process.env.NEXT_PUBLIC_MARGIN_CONTRACT,
    NEXT_PUBLIC_SKIP_NETWORK: process.env.NEXT_PUBLIC_SKIP_NETWORK,
  },
};

module.exports = nextConfig;
