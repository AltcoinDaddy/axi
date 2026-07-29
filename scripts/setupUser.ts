import dotenv from "dotenv";
import { parseAbiItem, createPublicClient, createWalletClient, http, publicActions, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

dotenv.config();

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
  const vaultAddress = process.env.NEXT_PUBLIC_NOXSHIELD_VAULT_ADDRESS as `0x${string}`;
  const wethAddress = process.env.NEXT_PUBLIC_WETH_ADDRESS as `0x${string}`;

  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({ chain: sepolia, transport: http(process.env.SEPOLIA_RPC_URL) });
  const walletClient = createWalletClient({ chain: sepolia, transport: http(process.env.SEPOLIA_RPC_URL), account }).extend(publicActions);

  const testAmount = parseEther("0.01");

  console.log("1. Approving Vault to spend WETH...");
  const approveHash = await walletClient.writeContract({
    address: wethAddress,
    abi: [parseAbiItem("function approve(address guy, uint wad) public returns (bool)")],
    functionName: "approve",
    args: [vaultAddress, testAmount],
  });
  await publicClient.waitForTransactionReceipt({ hash: approveHash });
  console.log(`Approved successfully. Tx: ${approveHash}`);

  console.log("2. Checking/Adding WETH as supported token in Vault...");
  const isSupported = await publicClient.readContract({
    address: vaultAddress,
    abi: [parseAbiItem("function supportedTokens(address) external view returns (bool)")],
    functionName: "supportedTokens",
    args: [wethAddress],
  });

  if (!isSupported) {
    console.log("Token not supported. Adding it...");
    const addTokenHash = await walletClient.writeContract({
      address: vaultAddress,
      abi: [parseAbiItem("function addSupportedToken(address token) external")],
      functionName: "addSupportedToken",
      args: [wethAddress],
    });
    await publicClient.waitForTransactionReceipt({ hash: addTokenHash });
  }

  console.log("3. Depositing WETH into Vault...");
  const depositHash = await walletClient.writeContract({
    address: vaultAddress,
    abi: [parseAbiItem("function deposit(address token, uint256 amount) external")],
    functionName: "deposit",
    args: [wethAddress, testAmount],
  });
  await publicClient.waitForTransactionReceipt({ hash: depositHash });
  console.log(`Deposited into Vault successfully. Tx: ${depositHash}`);
}

main().catch(console.error);
