const { createPublicClient, http } = require('viem');
const client = createPublicClient({ transport: http('https://sepolia-rollup.arbitrum.io/rpc') });
client.readContract({
  address: '0xa78C22d8060fDb3780932cab9B9137b63136b0Dd',
  abi: [{ inputs: [{ type: 'uint256' }], name: 'intents', outputs: [{ type: 'uint256' }, { type: 'address' }, { type: 'uint8' }, { type: 'address' }, { type: 'address' }, { type: 'uint256' }, { type: 'uint256' }, { type: 'uint8' }, { type: 'uint256' }, { type: 'uint256' }], stateMutability: 'view', type: 'function' }],
  functionName: 'intents',
  args: [7]
}).then(console.log).catch(console.error);
