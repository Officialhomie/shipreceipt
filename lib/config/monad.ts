import { defineChain } from "viem";

export const MONAD_TESTNET_CHAIN_ID = 10143;

export const monadTestnet = defineChain({
  id: MONAD_TESTNET_CHAIN_ID,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_MONAD_RPC_URL ||
          "https://testnet-rpc.monad.xyz",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "MonadVision",
      url:
        process.env.NEXT_PUBLIC_MONAD_EXPLORER_URL ||
        "https://testnet.monadvision.com",
    },
  },
  testnet: true,
});

