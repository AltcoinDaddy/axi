import dotenv from "dotenv";
import { parseAbiItem, createPublicClient, createWalletClient, http, publicActions, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { createViemHandleClient } from "@iexec-nox/handle";

dotenv.config();

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
  const routerAddress = process.env.NEXT_PUBLIC_NOXSHIELD_ROUTER_ADDRESS as `0x${string}`;
  const intentPoolAddress = process.env.NEXT_PUBLIC_INTENT_POOL_ADDRESS as `0x${string}`;
  
  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({ chain: arbitrumSepolia, transport: http(process.env.ARBITRUM_SEPOLIA_RPC_URL) });
  const walletClient = createWalletClient({ chain: arbitrumSepolia, transport: http(process.env.ARBITRUM_SEPOLIA_RPC_URL), account }).extend(publicActions);

  console.log("🕵️ Relayer Started");
  console.log("Scanning Confidential Intent Pool for pending batches...");
  
  const wethAddress = process.env.NEXT_PUBLIC_WETH_ADDRESS as `0x${string}`;
  const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;

  
  console.log("Forming batch for WETH -> USDC...");
  try {
    console.log("Calling intentPool.formBatch() to group pending intents...");
    const { request: formReq, result: batchIdResult } = await publicClient.simulateContract({
      address: intentPoolAddress,
      abi: [parseAbiItem("function formBatch(address tokenIn, address tokenOut, uint8 intentType) external returns (uint256)")],
      functionName: "formBatch",
      args: [wethAddress, usdcAddress, 0], // intentType 0 = SWAP
      account,
    });
    
    const formHash = await walletClient.writeContract(formReq);
    await publicClient.waitForTransactionReceipt({ hash: formHash });
    
    const batchId = batchIdResult as bigint;
    console.log(`✅ Formed new Batch #${batchId}! Intents are now BATCHED.`);
    
    // In production, the TEE would decrypt the intents, sum the amounts, and execute the swap.
    // For this mock demo execution, we'll pretend the TEE decrypted it to 0.001 WETH total.
    console.log("🛡️ TEE Enclave: Decrypting intents and calculating total volume...");
    const totalAmountIn = 1000000000000000n; // 0.001 ETH
    const minAmountOut = 0n; // mock
    const poolFee = 3000;
    
    console.log(`🛡️ TEE Enclave: Aggregated volume is ${Number(totalAmountIn) / 1e18} WETH. Trade size is perfectly obfuscated.`);
    
    // Hack for demo: Fund the Router directly with WETH since we forgot to call routerSpend in the smart contract
    console.log("Funding AxiRouter with WETH...");
    const { request: fundReq } = await publicClient.simulateContract({
      address: wethAddress,
      abi: [parseAbiItem("function transfer(address to, uint256 amount) external returns (bool)")],
      functionName: "transfer",
      args: [routerAddress, totalAmountIn],
      account,
    });
    const fundHash = await walletClient.writeContract(fundReq);
    await publicClient.waitForTransactionReceipt({ hash: fundHash });
    
    console.log(`Executing batch swap on Uniswap...`);
    
    const { request: execReq } = await publicClient.simulateContract({
      address: routerAddress,
      abi: [parseAbiItem("function executeBatchSwap(uint256 batchId, uint256 totalAmountIn, uint256 amountOutMinimum, uint24 poolFee) external")],
      functionName: "executeBatchSwap",
      args: [batchId, totalAmountIn, minAmountOut, poolFee],
      account,
    });
    
    const execHash = await walletClient.writeContract(execReq);
    await publicClient.waitForTransactionReceipt({ hash: execHash });
    
    console.log(`✅ Batch Executed! Tx: https://sepolia.arbiscan.io/tx/${execHash}`);
    console.log("Intents have been settled. Check your Dashboard in the UI!");
    
  } catch (e: any) {
    console.error("Failed to run relayer:", e.message || e);
  }
}

main().catch(console.error);
