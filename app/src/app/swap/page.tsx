"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { SwapPrivacyBreakdown } from "@/components/PrivacyIndicator";
import IntentStatusDisplay from "@/components/IntentStatus";
import {
  ArrowDown,
  Shield,
  Settings,
  ChevronDown,
  Lock,
  Zap,
  Info,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { TOKENS, IntentStatus, DEFAULT_SLIPPAGE_BPS, CONTRACTS } from "@/lib/constants";
import { useWallet } from "@/context/WalletContext";
import { getWalletClient, encryptAmount } from "@/lib/nox";
import { parseAbiItem, parseUnits, publicActions } from "viem";

export default function SwapPage() {
  const [tokenInIndex, setTokenInIndex] = useState(1); // USDC
  const [tokenOutIndex, setTokenOutIndex] = useState(0); // WETH
  const [amountIn, setAmountIn] = useState("");
  const [slippageBps, setSlippageBps] = useState(DEFAULT_SLIPPAGE_BPS);
  const [showSettings, setShowSettings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedIntentId, setSubmittedIntentId] = useState<number | null>(null);
  const [intentStatus, setIntentStatus] = useState<IntentStatus>(IntentStatus.PENDING);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { account } = useWallet();

  const tokenIn = TOKENS[tokenInIndex];
  const tokenOut = TOKENS[tokenOutIndex];

  const handleSwapTokens = () => {
    setTokenInIndex(tokenOutIndex);
    setTokenOutIndex(tokenInIndex);
  };

  const handleSubmitIntent = async () => {
    if (!amountIn || parseFloat(amountIn) <= 0 || !account) {
      if (!account) alert("Please connect your wallet first.");
      return;
    }

    setIsSubmitting(true);
    setTxHash(null);

    try {
      const walletClient = await getWalletClient();
      const extendedClient = walletClient.extend(publicActions);
      const amountInWei = parseUnits(amountIn, tokenIn.decimals || 18);
      
      // 1. Encrypt the amount using Nox SDK
      // Note: In real life we need the contract address of the Intent Pool
      const intentPoolAddr = CONTRACTS.intentPool as `0x${string}`;
      const { handle, handleProof } = await encryptAmount(amountInWei, intentPoolAddr);

      // 2. Submit the encrypted intent to the contract
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour from now
      const intentType = 0; // SWAP

      const { request } = await extendedClient.simulateContract({
        address: intentPoolAddr,
        abi: [
          parseAbiItem("function submitIntent(uint8 intentType, address tokenIn, address tokenOut, bytes32 encryptedAmount, bytes calldata inputProof, uint256 deadline) external returns (uint256 intentId)")
        ],
        functionName: "submitIntent",
        args: [
          intentType,
          tokenIn.address as `0x${string}`,
          tokenOut.address as `0x${string}`,
          handle,
          handleProof,
          deadline
        ],
        account: account as `0x${string}`,
      });

      const hash = await walletClient.writeContract(request);
      setTxHash(hash);
      
      // Wait for receipt
      const receipt = await extendedClient.waitForTransactionReceipt({ hash });
      
      // We don't parse the exact intentId for the demo, just show success
      setSubmittedIntentId(Math.floor(Math.random() * 1000));
      setIntentStatus(IntentStatus.PENDING);

      // Simulate batching for UI demo purposes since we don't have a live relayer
      setTimeout(() => setIntentStatus(IntentStatus.BATCHED), 4000);
    } catch (error) {
      console.error("Failed to submit intent:", error);
      alert("Transaction failed. Make sure you are on Arbitrum Sepolia.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">
              <Shield className="w-6 h-6 inline-block mr-2 text-[hsl(var(--axi-primary))]" />
              Shielded Swap
            </h1>
            <p className="text-sm text-[hsl(var(--axi-text-muted))]">
              Your swap amount is encrypted — bots can&apos;t see it
            </p>
          </div>

          {/* Swap Card */}
          <div className="glass-card p-6 mb-4">
            {/* Settings Toggle */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-[hsl(var(--axi-text-muted))]">
                Swap
              </span>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 rounded-lg hover:bg-[hsl(var(--axi-bg-card))] transition-colors"
              >
                <Settings className="w-4 h-4 text-[hsl(var(--axi-text-muted))]" />
              </button>
            </div>

            {/* Slippage Settings */}
            {showSettings && (
              <div className="mb-4 p-3 rounded-lg bg-[hsl(var(--axi-bg))]">
                <p className="text-xs font-medium text-[hsl(var(--axi-text-muted))] mb-2">
                  Slippage Tolerance
                </p>
                <div className="flex gap-2">
                  {[10, 50, 100].map((bps) => (
                    <button
                      key={bps}
                      onClick={() => setSlippageBps(bps)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        slippageBps === bps
                          ? "bg-[hsl(var(--axi-primary)/0.2)] text-[hsl(var(--axi-primary))] border border-[hsl(var(--axi-primary)/0.3)]"
                          : "bg-[hsl(var(--axi-bg-card))] text-[hsl(var(--axi-text-muted))] hover:text-[hsl(var(--axi-text))]"
                      }`}
                    >
                      {bps / 100}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Token In */}
            <div className="p-4 rounded-xl bg-[hsl(var(--axi-bg))] mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[hsl(var(--axi-text-muted))]">
                  You pay
                </span>
                <span className="text-xs text-[hsl(var(--axi-text-muted))]">
                  Balance: ---
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={amountIn}
                  onChange={(e) => setAmountIn(e.target.value)}
                  placeholder="0.0"
                  className="bg-transparent text-3xl font-semibold outline-none flex-1 w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[hsl(var(--axi-bg-card))] border border-[hsl(var(--axi-border))] hover:border-[hsl(var(--axi-primary)/0.3)] transition-all shrink-0">
                  <span className="text-lg">{tokenIn.icon}</span>
                  <span className="font-semibold text-sm">
                    {tokenIn.symbol}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[hsl(var(--axi-text-muted))]" />
                </button>
              </div>
            </div>

            {/* Swap Direction Button */}
            <div className="flex justify-center -my-3 relative z-10">
              <button
                onClick={handleSwapTokens}
                className="p-2 rounded-xl bg-[hsl(var(--axi-bg-card))] border border-[hsl(var(--axi-border))] hover:border-[hsl(var(--axi-primary)/0.3)] hover:bg-[hsl(var(--axi-bg-secondary))] transition-all"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>

            {/* Token Out */}
            <div className="p-4 rounded-xl bg-[hsl(var(--axi-bg))] mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[hsl(var(--axi-text-muted))]">
                  You receive
                </span>
                <span className="text-xs text-[hsl(var(--axi-text-muted))]">
                  Balance: ---
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-semibold text-[hsl(var(--axi-text-muted))] flex-1">
                  {amountIn ? "~" : "0.0"}
                </div>
                <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[hsl(var(--axi-bg-card))] border border-[hsl(var(--axi-border))] hover:border-[hsl(var(--axi-primary)/0.3)] transition-all shrink-0">
                  <span className="text-lg">{tokenOut.icon}</span>
                  <span className="font-semibold text-sm">
                    {tokenOut.symbol}
                  </span>
                  <ChevronDown className="w-4 h-4 text-[hsl(var(--axi-text-muted))]" />
                </button>
              </div>
            </div>

            {/* Encryption Info */}
            {amountIn && (
              <div className="mt-4 p-3 rounded-lg bg-[hsl(var(--axi-primary)/0.05)] border border-[hsl(var(--axi-primary)/0.15)]">
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-[hsl(var(--axi-primary))] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-[hsl(var(--axi-primary))]">
                      Amount will be encrypted
                    </p>
                    <p className="text-xs text-[hsl(var(--axi-text-muted))] mt-0.5">
                      Your {amountIn} {tokenIn.symbol} will be encrypted using
                      the Nox SDK before submission. Only you and the TEE can see
                      the actual amount.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmitIntent}
              disabled={!amountIn || parseFloat(amountIn) <= 0 || isSubmitting}
              className={`w-full mt-4 py-4 rounded-xl font-semibold text-base transition-all ${
                !amountIn || parseFloat(amountIn) <= 0
                  ? "bg-[hsl(var(--axi-bg-card))] text-[hsl(var(--axi-text-muted))] cursor-not-allowed"
                  : "axi-button"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Encrypting & Submitting...
                  </>
                ) : !amountIn || parseFloat(amountIn) <= 0 ? (
                  "Enter an amount"
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Shield & Swap
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Privacy Breakdown */}
          <div className="mb-4">
            <SwapPrivacyBreakdown />
          </div>

          {/* Intent Status (after submission) */}
          {submittedIntentId !== null && (
            <div className="mt-4">
              <IntentStatusDisplay
                intentId={submittedIntentId}
                status={intentStatus}
                batchId={
                  intentStatus >= IntentStatus.BATCHED
                    ? Math.floor(submittedIntentId / 3)
                    : undefined
                }
              />
              {txHash && (
                <div className="text-center mt-3">
                  <a
                    href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[hsl(var(--axi-primary))] hover:underline"
                  >
                    View Transaction on Arbiscan <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="glass-card p-4 mt-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[hsl(var(--axi-text-muted))] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">How it works</p>
                <p className="text-xs text-[hsl(var(--axi-text-muted))] leading-relaxed">
                  Your swap amount is encrypted client-side using the Nox JS SDK.
                  The encrypted intent is submitted to the ConfidentialIntentPool
                  contract. When enough intents accumulate, they&apos;re batched and
                  executed as a single aggregated trade on Uniswap — hiding your
                  individual amount from MEV bots.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
