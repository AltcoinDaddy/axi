import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'

const client = createPublicClient({
  chain: sepolia,
  transport: http()
})

async function main() {
  const code = await client.getBytecode({ address: '0x0b0f3189f10D3D695858f7975507Ce729a6632a4' })
  console.log('Code length:', code ? code.length : 0)
}
main()
