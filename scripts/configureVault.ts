import dotenv from "dotenv";
import { parseAbiItem, createPublicClient, createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";

dotenv.config();
dotenv.config({ path: "./app/.env.local" });

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
  const vaultAddress = process.env.NEXT_PUBLIC_NOXSHIELD_VAULT_ADDRESS as `0x${string}`;
  const wethAddress = process.env.NEXT_PUBLIC_WETH_ADDRESS as `0x${string}`;
  const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;
  
  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({ chain: arbitrumSepolia, transport: http(process.env.ARBITRUM_SEPOLIA_RPC_URL) });
  const walletClient = createWalletClient({ chain: arbitrumSepolia, transport: http(process.env.ARBITRUM_SEPOLIA_RPC_URL), account }).extend(publicActions);

  console.log(`Vault: ${vaultAddress}`);
  console.log("Adding WETH and USDC to supported tokens in Vault...");

  for (const token of [wethAddress, usdcAddress]) {
    const isSupported = await publicClient.readContract({
      address: vaultAddress,
      abi: [parseAbiItem("function supportedTokens(address) external view returns (bool)")],
      functionName: "supportedTokens",
      args: [token],
    });

    if (!isSupported) {
      console.log(`Token ${token} not supported. Adding it...`);
      const { request } = await publicClient.simulateContract({
        address: vaultAddress,
        abi: [parseAbiItem("function addSupportedToken(address token) external")],
        functionName: "addSupportedToken",
        args: [token],
        account,
      });
      const hash = await walletClient.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash });
      console.log(`Added token: ${token}`);
    } else {
      console.log(`Token ${token} already supported.`);
    }
  }
  
  console.log("Vault configuration complete.");
}

main().catch(console.error);
