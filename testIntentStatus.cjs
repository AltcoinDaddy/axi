const { createPublicClient, http, parseAbiItem } = require('viem');
const { arbitrumSepolia } = require('viem/chains');
const client = createPublicClient({ chain: arbitrumSepolia, transport: http('https://sepolia-rollup.arbitrum.io/rpc') });

async function check() {
  for (let i = 48; i <= 52; i++) {
    const data = await client.readContract({
      address: '0xa78C22d8060fDb3780932cab9B9137b63136b0Dd',
      abi: [{ inputs: [{ type: 'uint256' }], name: 'intents', outputs: [{ type: 'uint256' }, { type: 'address' }, { type: 'uint8' }, { type: 'address' }, { type: 'address' }, { type: 'uint256' }, { type: 'uint256' }, { type: 'uint8' }, { type: 'uint256' }, { type: 'uint256' }], stateMutability: 'view', type: 'function' }],
      functionName: 'intents',
      args: [i]
    });
    console.log(`ID ${i}: status=${data[7]}, deadline=${data[6]}`);
  }
}
check().catch(console.error);
