import dotenv from "dotenv";
import { parseAbiItem, createPublicClient, createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { createViemHandleClient } from "@iexec-nox/handle";

dotenv.config();

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) throw new Error("DEPLOYER_PRIVATE_KEY not found in .env");

  // Load contract addresses
  const intentPoolAddress = process.env.NEXT_PUBLIC_INTENT_POOL_ADDRESS as `0x${string}`;
  const wethAddress = process.env.NEXT_PUBLIC_WETH_ADDRESS as `0x${string}`;
  const usdcAddress = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;

  if (!intentPoolAddress || !wethAddress || !usdcAddress) {
    throw new Error("Missing contract addresses in .env");
  }

  // Create an account from the private key
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


  console.log("Encrypting amount using Nox SDK...");
  const noxClient = await createViemHandleClient(walletClient);
  
  // Encrypt 1 WETH (1e18) for the intent pool
  const amountToEncrypt = BigInt(1000000000000000000); // 1 ETH/WETH
  const result = await noxClient.encryptInput(amountToEncrypt, "uint256", intentPoolAddress);
  
  const handle = result.handle as `0x${string}`;
  const proof = result.handleProof as `0x${string}`;
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
        handle,
        proof,
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
