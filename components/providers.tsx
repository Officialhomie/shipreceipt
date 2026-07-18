"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { injected } from "@wagmi/connectors/injected";
import { monadTestnet } from "@/lib/config/monad";

const config = createConfig({ chains: [monadTestnet], connectors: [injected()], transports: { [monadTestnet.id]: http(process.env.NEXT_PUBLIC_MONAD_RPC_URL || "https://testnet-rpc.monad.xyz") } });
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return <WagmiProvider config={config}><QueryClientProvider client={queryClient}>{children}</QueryClientProvider></WagmiProvider>;
}
