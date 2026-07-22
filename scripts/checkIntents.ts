import dotenv from "dotenv";
import { parseAbiItem, createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";

dotenv.config();

async function main() {
  const publicClient = createPublicClient({ chain: arbitrumSepolia, transport: http(process.env.ARBITRUM_SEPOLIA_RPC_URL) });
  const intentPoolAddress = process.env.NEXT_PUBLIC_INTENT_POOL_ADDRESS as `0x${string}`;
  
  for (let i = 0n; i < 2n; i++) {
    const intent = await publicClient.readContract({
      address: intentPoolAddress,
      abi: [parseAbiItem("function intents(uint256) view returns (uint256 id, address user, uint8 intentType, address tokenIn, address tokenOut, uint256 encryptedAmount, uint256 deadline, uint8 status, uint256 batchId, uint256 createdAt)")],
      functionName: "intents",
      args: [i],
    });
    
    console.log(`Intent #${i}:`);
    console.log(`  Status: ${intent[7]}`); // 0 = PENDING, 1 = BATCHED...
    console.log(`  Deadline: ${intent[6]}`);
    
    const block = await publicClient.getBlock();
    console.log(`  Current block time: ${block.timestamp}`);
    console.log(`  Expired?: ${intent[6] <= block.timestamp}`);
  }
}

main().catch(console.error);
