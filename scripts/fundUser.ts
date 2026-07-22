import dotenv from "dotenv";
import { parseAbiItem, createPublicClient, createWalletClient, http, publicActions, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";

dotenv.config();
dotenv.config({ path: "./app/.env.local" });

async function main() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
  const wethAddress = process.env.NEXT_PUBLIC_WETH_ADDRESS as `0x${string}`;
  const userAddress = "0x2c7E21D431CF885FD03958d893447BF5d256eC3C";
  
  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({ chain: arbitrumSepolia, transport: http(process.env.ARBITRUM_SEPOLIA_RPC_URL) });
  const walletClient = createWalletClient({ chain: arbitrumSepolia, transport: http(process.env.ARBITRUM_SEPOLIA_RPC_URL), account }).extend(publicActions);

  console.log(`Deployer: ${account.address}`);
  console.log(`Wrapping 0.1 ETH into WETH...`);
  
  const wrapAmount = parseEther("0.1");
  const { request: wrapReq } = await publicClient.simulateContract({
    address: wethAddress,
    abi: [parseAbiItem("function deposit() public payable")],
    functionName: "deposit",
    value: wrapAmount,
    account,
  });
  const wrapHash = await walletClient.writeContract(wrapReq);
  await publicClient.waitForTransactionReceipt({ hash: wrapHash });
  
  console.log(`Sending 0.1 WETH to ${userAddress}...`);
  const { request: transferReq } = await publicClient.simulateContract({
    address: wethAddress,
    abi: [parseAbiItem("function transfer(address dst, uint wad) public returns (bool)")],
    functionName: "transfer",
    args: [userAddress, wrapAmount],
    account,
  });
  const txHash = await walletClient.writeContract(transferReq);
  await publicClient.waitForTransactionReceipt({ hash: txHash });
  
  console.log("WETH successfully sent to user!");
}

main().catch(console.error);
