import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// Ethereum Sepolia testnet addresses
const UNISWAP_V3_ROUTER = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
const AAVE_V3_POOL = "0x0000000000000000000000000000000000000001"; // Placeholder
const WETH = "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14";
const USDC = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

export default buildModule("AxiModule", (m) => {
  // 1. Deploy Wrappers
  const cWETH = m.contract("WrappedConfidentialETH", [WETH]);
  const cUSDC = m.contract("WrappedConfidentialUSDC", [USDC]);

  // 2. Deploy Router (fee: 0.3% = 30 bps)
  const router = m.contract("AxiRouter", [
    UNISWAP_V3_ROUTER,
    AAVE_V3_POOL,
    30n,
  ]);

  // 3. Deploy Vault and set router
  const vault = m.contract("AxiVault", [router]);

  // 4. Deploy Intent Pool (minBatchSize: 2, maxBatchSize: 10)
  const intentPool = m.contract("ConfidentialIntentPool", [router, 2n, 10n]);

  // 5. Link Router to Vault and Intent Pool
  m.call(router, "setVault", [vault]);
  m.call(router, "setIntentPool", [intentPool]);

  return { cWETH, cUSDC, router, vault, intentPool };
});
