import { arbitrumSepolia } from "viem/chains";

// ─── Network Configuration ─────────────────────────────────────
export const CHAIN = arbitrumSepolia;
export const CHAIN_ID = arbitrumSepolia.id;
export const RPC_URL =
  process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL ||
  "https://sepolia-rollup.arbitrum.io/rpc";

// ─── Contract Addresses (Sepolia) ───────────────────────────────
// These will be populated after deployment
export const CONTRACTS = {
  router:
    (process.env.NEXT_PUBLIC_NOXSHIELD_ROUTER_ADDRESS as `0x${string}`) ||
    "0x0000000000000000000000000000000000000000",
  vault:
    (process.env.NEXT_PUBLIC_NOXSHIELD_VAULT_ADDRESS as `0x${string}`) ||
    "0x0000000000000000000000000000000000000000",
  intentPool:
    (process.env.NEXT_PUBLIC_INTENT_POOL_ADDRESS as `0x${string}`) ||
    "0x0000000000000000000000000000000000000000",
  cWETH:
    (process.env.NEXT_PUBLIC_CWETH_ADDRESS as `0x${string}`) ||
    "0x0000000000000000000000000000000000000000",
  cUSDC:
    (process.env.NEXT_PUBLIC_CUSDC_ADDRESS as `0x${string}`) ||
    "0x0000000000000000000000000000000000000000",
} as const;

// ─── Token Definitions ──────────────────────────────────────────
export interface Token {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
  icon: string;
  confidentialAddress?: `0x${string}`;
}

export const TOKENS: Token[] = [
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address:
      (process.env.NEXT_PUBLIC_WETH_ADDRESS as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    decimals: 18,
    icon: "Ξ",
    confidentialAddress: CONTRACTS.cWETH,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address:
      (process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`) ||
      "0x0000000000000000000000000000000000000000",
    decimals: 6,
    icon: "$",
    confidentialAddress: CONTRACTS.cUSDC,
  },
];

// ─── Intent Types ───────────────────────────────────────────────
export enum IntentType {
  SWAP = 0,
  LEND = 1,
  WITHDRAW_LEND = 2,
}

export enum IntentStatus {
  PENDING = 0,
  BATCHED = 1,
  EXECUTED = 2,
  CANCELLED = 3,
  EXPIRED = 4,
}

export const INTENT_STATUS_LABELS: Record<IntentStatus, string> = {
  [IntentStatus.PENDING]: "Pending",
  [IntentStatus.BATCHED]: "Batched",
  [IntentStatus.EXECUTED]: "Executed",
  [IntentStatus.CANCELLED]: "Cancelled",
  [IntentStatus.EXPIRED]: "Expired",
};

export const INTENT_STATUS_COLORS: Record<IntentStatus, string> = {
  [IntentStatus.PENDING]: "text-amber-400",
  [IntentStatus.BATCHED]: "text-blue-400",
  [IntentStatus.EXECUTED]: "text-emerald-400",
  [IntentStatus.CANCELLED]: "text-red-400",
  [IntentStatus.EXPIRED]: "text-gray-400",
};

// ─── App Constants ──────────────────────────────────────────────
export const APP_NAME = "Axi";
export const APP_DESCRIPTION =
  "Private DeFi Intent Router — Shield your trades from MEV";
export const DEFAULT_DEADLINE_MINUTES = 60;
export const DEFAULT_SLIPPAGE_BPS = 50; // 0.5%
