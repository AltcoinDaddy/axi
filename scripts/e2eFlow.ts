import dotenv from "dotenv";
import { parseAbiItem, createPublicClient, createWalletClient, http, publicActions, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { createViemHandleClient } from "@iexec-nox/handle";

dotenv.config();

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) throw new Error("DEPLOYER_PRIVATE_KEY not found in .env");

  // Load contract addresses
  const vaultAddress = process.env.NEXT_PUBLIC_NOXSHIELD_VAULT_ADDRESS as `0x${string}`;
  const wethAddress = process.env.NEXT_PUBLIC_WETH_ADDRESS as `0x${string}`;

  if (!vaultAddress || !wethAddress) {
    throw new Error("Missing contract addresses in .env");
  }

  const account = privateKeyToAccount(privateKey);
  console.log(`Using account: ${account.address}`);

  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(process.env.ARBITRUM_SEPOLIA_RPC_URL)
  });

  const walletClient = createWalletClient({
    chain: arbitrumSepolia,
    transport: http(process.env.ARBITRUM_SEPOLIA_RPC_URL),
    account
  }).extend(publicActions);

  const noxClient = await createViemHandleClient(walletClient);
  const testAmount = parseEther("0.001"); // 0.001 ETH

  // 1. Wrap ETH into WETH
  console.log("1. Wrapping ETH to WETH...");
  const wrapHash = await walletClient.writeContract({
    address: wethAddress,
    abi: [parseAbiItem("function deposit() public payable")],
    functionName: "deposit",
    value: testAmount,
  });
  await publicClient.waitForTransactionReceipt({ hash: wrapHash });
  console.log(`Wrapped successfully. Tx: https://sepolia.arbiscan.io/tx/${wrapHash}`);

  // 2. Approve WETH for Vault
  console.log("2. Approving Vault to spend WETH...");
  const approveHash = await walletClient.writeContract({
    address: wethAddress,
    abi: [parseAbiItem("function approve(address guy, uint wad) public returns (bool)")],
    functionName: "approve",
    args: [vaultAddress, testAmount],
  });
  await publicClient.waitForTransactionReceipt({ hash: approveHash });
  console.log(`Approved successfully. Tx: https://sepolia.arbiscan.io/tx/${approveHash}`);

  const wethAbi = parseAbiItem("function allowance(address owner, address spender) view returns (uint256)");
  const balanceAbi = parseAbiItem("function balanceOf(address account) view returns (uint256)");
  
  const wethBalance = await publicClient.readContract({
    address: wethAddress,
    abi: [balanceAbi],
    functionName: "balanceOf",
    args: [account.address]
  });
  console.log(`WETH Balance: ${wethBalance}`);

  const allowance = await publicClient.readContract({
    address: wethAddress,
    abi: [wethAbi],
    functionName: "allowance",
    args: [account.address, vaultAddress]
  });
  console.log(`Vault Allowance: ${allowance}`);

  // 2.5 Add supported token to Vault
  console.log("2.5 Checking/Adding WETH as supported token in Vault...");
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
    console.log(`Added WETH to supported tokens. Tx: https://sepolia.arbiscan.io/tx/${addTokenHash}`);
  } else {
    console.log("WETH is already supported.");
  }

  // 3. Deposit into Vault
  console.log("3. Depositing WETH into Vault...");
  const depositHash = await walletClient.writeContract({
    address: vaultAddress,
    abi: [parseAbiItem("function deposit(address token, uint256 amount) external")],
    functionName: "deposit",
    args: [wethAddress, testAmount],
  });
  await publicClient.waitForTransactionReceipt({ hash: depositHash });
  console.log(`Deposited into Vault successfully. Tx: https://sepolia.arbiscan.io/tx/${depositHash}`);

  // 4. Encrypt Amount for Withdraw
  console.log("4. Encrypting withdraw amount using Nox SDK...");
  const withdrawAmount = parseEther("0.0005"); // withdraw half
  const { handle, handleProof } = await noxClient.encryptInput(withdrawAmount, "uint256", vaultAddress);

  // 5. Withdraw from Vault
  console.log("5. Withdrawing from Vault...");
  const withdrawHash = await walletClient.writeContract({
    address: vaultAddress,
    abi: [parseAbiItem("function withdraw(address token, bytes32 encryptedAmount, bytes calldata inputProof) external")],
    functionName: "withdraw",
    args: [wethAddress, handle as `0x${string}`, handleProof as `0x${string}`],
  });
  await publicClient.waitForTransactionReceipt({ hash: withdrawHash });
  console.log(`Withdrawal successful. Tx: https://sepolia.arbiscan.io/tx/${withdrawHash}`);

  console.log("✅ All E2E transactions completed successfully.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
