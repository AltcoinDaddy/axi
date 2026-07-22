"use client";

import {
  createWalletClient,
  createPublicClient,
  custom,
  http,
  type WalletClient,
  type PublicClient,
} from "viem";
import { createViemHandleClient } from "@iexec-nox/handle";
import { CHAIN, RPC_URL } from "./constants";

// ─── Types ──────────────────────────────────────────────────────
export type HandleClient = Awaited<ReturnType<typeof createViemHandleClient>>;

// ─── Public Client (read-only) ──────────────────────────────────
export function getPublicClient(): PublicClient {
  return createPublicClient({
    chain: CHAIN,
    transport: http(RPC_URL),
  });
}

// ─── Wallet Client (requires browser wallet) ────────────────────
export async function getWalletClient(): Promise<WalletClient> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet detected. Please install MetaMask.");
  }

  const walletClient = createWalletClient({
    chain: CHAIN,
    transport: custom(window.ethereum),
  });

  // Request account access
  await walletClient.requestAddresses();

  // Ensure the user is on the correct network (Arbitrum Sepolia)
  try {
    const chainId = await walletClient.getChainId();
    if (chainId !== CHAIN.id) {
      await walletClient.switchChain({ id: CHAIN.id });
    }
  } catch (error: any) {
    if (error.code === 4902) {
      // Chain not added to MetaMask yet
      await walletClient.addChain({ chain: CHAIN });
    } else {
      console.warn("Could not switch chain automatically:", error);
    }
  }

  return walletClient;
}

// ─── Nox Handle Client ──────────────────────────────────────────

let cachedHandleClient: HandleClient | null = null;

/**
 * Initialize the Nox Handle Client for encrypting and decrypting values.
 * Uses the connected wallet for signing EIP-712 messages.
 */
export async function getNoxHandleClient(): Promise<HandleClient> {
  if (cachedHandleClient) return cachedHandleClient;

  const walletClient = await getWalletClient();
  cachedHandleClient = await createViemHandleClient(walletClient);

  return cachedHandleClient;
}

/**
 * Reset the cached handle client (call on wallet disconnect).
 */
export function resetNoxClient(): void {
  cachedHandleClient = null;
}

// ─── Encryption Helpers ─────────────────────────────────────────

/**
 * Encrypt a value for use with a Nox confidential smart contract.
 * @param value The plaintext value to encrypt
 * @param contractAddress The contract that will receive the encrypted handle
 * @returns { handle, handleProof } for passing to the contract
 */
export async function encryptAmount(
  value: bigint,
  contractAddress: `0x${string}`
): Promise<{ handle: `0x${string}`; handleProof: `0x${string}` }> {
  const client = await getNoxHandleClient();
  const result = await client.encryptInput(value, "uint256", contractAddress);
  return {
    handle: result.handle as `0x${string}`,
    handleProof: result.handleProof as `0x${string}`,
  };
}

/**
 * Decrypt an encrypted handle (ACL-protected — only authorized viewers).
 * @param handle The 32-byte handle to decrypt
 * @returns The plaintext bigint value
 */
export async function decryptHandle(handle: `0x${string}`): Promise<bigint> {
  const client = await getNoxHandleClient();
  const result = await client.decrypt(handle);
  return result.value as bigint;
}

/**
 * Decrypt a publicly decryptable handle (no ACL check needed).
 * @param handle The 32-byte handle to decrypt
 * @returns The plaintext bigint value
 */
export async function publicDecryptHandle(
  handle: `0x${string}`
): Promise<bigint> {
  const client = await getNoxHandleClient();
  const result = await client.publicDecrypt(handle);
  return result.value as bigint;
}
