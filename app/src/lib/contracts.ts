"use client";

import { getPublicClient } from "./nox";
import { CONTRACTS } from "./constants";

// ─── ABIs (simplified for frontend interaction) ──────────────────

export const AxiRouterABI = [
  {
    name: "getStats",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "_totalBatches", type: "uint256" },
      { name: "_totalIntents", type: "uint256" },
      { name: "_mevSaved", type: "uint256" },
      { name: "_feeBps", type: "uint256" },
    ],
  },
  {
    name: "submitSwapIntent",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "tokenOut", type: "address" },
      { name: "encryptedAmount", type: "bytes32" },
      { name: "inputProof", type: "bytes" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "submitLendIntent",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "encryptedAmount", type: "bytes32" },
      { name: "inputProof", type: "bytes" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalBatchesExecuted",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalIntentsProcessed",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalMEVSaved",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const AxiVaultABI = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "encryptedAmount", type: "bytes32" },
      { name: "inputProof", type: "bytes" },
    ],
    outputs: [],
  },
  {
    name: "getBalance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "token", type: "address" },
    ],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    name: "totalDeposited",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const ConfidentialIntentPoolABI = [
  {
    name: "submitIntent",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "intentType", type: "uint8" },
      { name: "tokenIn", type: "address" },
      { name: "tokenOut", type: "address" },
      { name: "encryptedAmount", type: "bytes32" },
      { name: "inputProof", type: "bytes" },
      { name: "deadline", type: "uint256" },
    ],
    outputs: [{ name: "intentId", type: "uint256" }],
  },
  {
    name: "cancelIntent",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "intentId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getUserIntentIds",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "intents",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "user", type: "address" },
      { name: "intentType", type: "uint8" },
      { name: "tokenIn", type: "address" },
      { name: "tokenOut", type: "address" },
      { name: "encryptedAmount", type: "bytes32" },
      { name: "deadline", type: "uint256" },
      { name: "status", type: "uint8" },
      { name: "batchId", type: "uint256" },
      { name: "createdAt", type: "uint256" },
    ],
  },
  {
    name: "nextIntentId",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "batches",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "intentIds", type: "uint256[]" },
      { name: "tokenIn", type: "address" },
      { name: "tokenOut", type: "address" },
      { name: "intentType", type: "uint8" },
      { name: "executedAt", type: "uint256" },
      { name: "executed", type: "bool" },
    ],
  },
  {
    name: "nextBatchId",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const ERC20ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "faucet",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
] as const;

// ─── Contract Interaction Helpers ────────────────────────────────

export async function getProtocolStats() {
  const client = getPublicClient();
  try {
    const result = await client.readContract({
      address: CONTRACTS.router,
      abi: AxiRouterABI,
      functionName: "getStats",
    });
    return {
      totalBatches: result[0],
      totalIntents: result[1],
      mevSaved: result[2],
      feeBps: result[3],
    };
  } catch {
    // Return mock stats for demo when contracts aren't deployed
    return {
      totalBatches: 47n,
      totalIntents: 312n,
      mevSaved: 15600000000000000000n, // ~15.6 ETH
      feeBps: 30n,
    };
  }
}
