const { createPublicClient, http, parseAbiItem } = require('viem');
const { arbitrumSepolia } = require('viem/chains');
const client = createPublicClient({ chain: arbitrumSepolia, transport: http('https://sepolia-rollup.arbitrum.io/rpc') });

async function check() {
  const logs = await client.getLogs({
    address: '0xa78C22d8060fDb3780932cab9B9137b63136b0Dd', // intentPool
    event: parseAbiItem('event IntentSubmitted(uint256 indexed intentId, address indexed user, uint8 intentType, address tokenIn, address tokenOut, uint256 deadline)'),
    fromBlock: 289000000n,
  });
  console.log("Found", logs.length, "intents");
  for (const log of logs.slice(-5)) {
    console.log(`ID: ${log.args.intentId}, in: ${log.args.tokenIn}, out: ${log.args.tokenOut}`);
  }
}
check().catch(console.error);
