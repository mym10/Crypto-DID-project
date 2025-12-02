// src/wagmi.js
import { createConfig, http } from "wagmi";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";

export const hardhatChain = {
  id: 31337,
  name: "Hardhat",
  network: "hardhat",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
    public: { http: ["http://127.0.0.1:8545"] },
  },
};

const { connectors } = getDefaultWallets({
  appName: "DID App",
  projectId: "0474b04fb82878c9acbd6026fff2c3f6",
  chains: [hardhatChain],   // REQUIRED
});

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  chains: [hardhatChain],
  transports: {
    [hardhatChain.id]: http("http://127.0.0.1:8545"),
  },
});
