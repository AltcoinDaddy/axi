import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { defineConfig } from "hardhat/config";
import noxPlugin from "@iexec-nox/nox-hardhat-plugin";
import * as dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin, noxPlugin],
  solidity: "0.8.35",
  networks: {
    // Local testing with Nox simulation
    default: {
      type: "edr-simulated",
      chainType: "op",
    },
    // Sepolia testnet deployment
    sepolia: {
      type: "http",
      url: process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/demo",
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
    },
    arbitrumSepolia: {
      type: "http",
      url: process.env.ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
    },
  },
});
