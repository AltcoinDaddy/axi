import { createWalletClient, createPublicClient, http, publicActions, parseAbiItem } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { createViemHandleClient } from "@iexec-nox/handle";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load .env from root
dotenv.config({ path: resolve(__dirname, "../../.env") });
// Fallback if not found
if (!process.env.DEPLOYER_PRIVATE_KEY) {
  dotenv.config({ path: resolve(__dirname, "../.env") });
}

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) throw new Error("DEPLOYER_PRIVATE_KEY not found in .env");

  // Load contract addresses
  const intentPoolAddress = process.env.NEXT_PUBLIC_INTENT_POOL_ADDRESS as `0x${string}`;
  const wethAddress = process.env.NEXT_PUBLIC_WETH_ADDRESS as `0x${string}`;
  const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;
  const rpcUrl = process.env.ARBITRUM_SEPOLIA_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";

  if (!intentPoolAddress || !wethAddress || !usdcAddress) {
    throw new Error("Missing contract addresses in .env");
  }

  // Create an account from the private key
  const account = privateKeyToAccount(privateKey);
  console.log(`Using account: ${account.address}`);

  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(rpcUrl)
  });

  const walletClient = createWalletClient({
    chain: arbitrumSepolia,
    transport: http(rpcUrl),
    account
  }).extend(publicActions);

  console.log("Initializing Nox Handle Client...");
  // Pass the walletClient to Nox Handle SDK to sign the encryption request
  const noxClient = await createViemHandleClient(walletClient as any);

  console.log("Encrypting value 100 with Nox SDK...");
  const { handle, handleProof } = await noxClient.encryptInput(100n, "uint256", intentPoolAddress);
  
  console.log(`Encryption successful. Handle: ${handle}`);
  console.log(`Proof size: ${handleProof.length / 2} bytes`);

  const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

  console.log("Submitting intent...");
  
  try {
    const { request } = await publicClient.simulateContract({
      address: intentPoolAddress,
      abi: [
        parseAbiItem("function submitIntent(uint8 intentType, address tokenIn, address tokenOut, bytes32 encryptedAmount, bytes calldata inputProof, uint256 deadline) external returns (uint256)")
      ],
      functionName: "submitIntent",
      args: [
        0, // SWAP
        wethAddress,
        usdcAddress,
        handle as `0x${string}`,
        handleProof as `0x${string}`,
        deadline
      ],
      account,
    });

    const hash = await walletClient.writeContract(request);
    
    console.log(`Transaction sent: https://sepolia.arbiscan.io/tx/${hash}`);
    console.log("Waiting for confirmation...");
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
  } catch (error: any) {
    console.error("Transaction failed:");
    console.error(error.message || error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
