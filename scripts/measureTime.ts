import dotenv from "dotenv";
import { parseAbiItem, createPublicClient, createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { createViemHandleClient } from "@iexec-nox/handle";

dotenv.config();

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
  const intentPoolAddress = process.env.NEXT_PUBLIC_INTENT_POOL_ADDRESS as `0x${string}`;
  const wethAddress = process.env.NEXT_PUBLIC_WETH_ADDRESS as `0x${string}`;
  const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;

  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({ chain: arbitrumSepolia, transport: http(process.env.ARBITRUM_SEPOLIA_RPC_URL) });
  const walletClient = createWalletClient({ chain: arbitrumSepolia, transport: http(process.env.ARBITRUM_SEPOLIA_RPC_URL), account }).extend(publicActions);

  console.time("1. createViemHandleClient");
  const noxClient = await createViemHandleClient(walletClient);
  console.timeEnd("1. createViemHandleClient");
  
  console.time("2. encryptInput (Nox Enclave)");
  const amountToEncrypt = BigInt(1000000000000000000); 
  const result = await noxClient.encryptInput(amountToEncrypt, "uint256", intentPoolAddress);
  console.timeEnd("2. encryptInput (Nox Enclave)");
  
  const handle = result.handle as `0x${string}`;
  const proof = result.handleProof as `0x${string}`;
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

  console.time("3. simulateContract");
  const { request } = await publicClient.simulateContract({
    address: intentPoolAddress,
    abi: [parseAbiItem("function submitIntent(uint8 intentType, address tokenIn, address tokenOut, bytes32 encryptedAmount, bytes calldata inputProof, uint256 deadline) external returns (uint256)")],
    functionName: "submitIntent",
    args: [0, wethAddress, usdcAddress, handle, proof, deadline],
    account,
  });
  console.timeEnd("3. simulateContract");

  console.time("4. writeContract (Broadcast to Arbitrum)");
  const hash = await walletClient.writeContract(request);
  console.timeEnd("4. writeContract (Broadcast to Arbitrum)");
  
  console.time("5. waitForTransactionReceipt (Waiting for Block)");
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.timeEnd("5. waitForTransactionReceipt (Waiting for Block)");
}

main().catch(console.error);
