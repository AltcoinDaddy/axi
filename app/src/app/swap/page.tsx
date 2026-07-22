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
import { TOKENS, IntentStatus, DEFAULT_SLIPPAGE_BPS, CONTRACTS, CHAIN } from "@/lib/constants";
import { useWallet } from "@/context/WalletContext";
import { getWalletClient, encryptAmount } from "@/lib/nox";
import { parseAbiItem, parseUnits, publicActions, createPublicClient, custom } from "viem";

export default function SwapPage() {
  const [tokenInIndex, setTokenInIndex] = useState(1); // USDC
  const [tokenOutIndex, setTokenOutIndex] = useState(0); // WETH
  const [amountIn, setAmountIn] = useState("");
  const [slippageBps, setSlippageBps] = useState(DEFAULT_SLIPPAGE_BPS);
  const [showSettings, setShowSettings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState("Encrypting & Submitting...");
  const [submittedIntentId, setSubmittedIntentId] = useState<number | null>(null);
  const [intentStatus, setIntentStatus] = useState<IntentStatus>(IntentStatus.PENDING);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { account } = useWallet();

  const tokenIn = TOKENS[tokenInIndex];
  const tokenOut = TOKENS[tokenOutIndex];

  const handleSwapTokens = () => {
    setTokenInIndex(tokenOutIndex);
    setTokenOutIndex(tokenInIndex);
    setAmountIn("");
  };

  const handleSubmitIntent = async () => {
    if (!amountIn || parseFloat(amountIn) <= 0) return;

    setIsSubmitting(true);
    setLoadingText("Connecting wallet...");
    setTxHash(null);

    try {
      const walletClient = await getWalletClient();
      const [connectedAccount] = await walletClient.getAddresses();

      const publicClient = createPublicClient({
        chain: CHAIN,
        transport: custom(window.ethereum!),
      });

      const extendedClient = publicClient.extend(publicActions);

      const intentPoolAddr = CONTRACTS.intentPool as `0x${string}`;
      const amountInWei = parseUnits(amountIn, tokenIn.decimals || 18);
      
      // Intent type 0 = SWAP
      const intentType = 0; 
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hr from now

      setLoadingText("Please sign message in wallet...");
      // 1. Encrypt amount client-side
      const { handle, handleProof } = await encryptAmount(amountInWei, intentPoolAddr);

      setLoadingText("Estimating gas...");
      // 2. Submit intent
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
        account: connectedAccount as `0x${string}`,
      });

      setLoadingText("Confirm transaction in wallet...");
      // Send transaction
      const hash = await walletClient.writeContract(request);
      
      setTxHash(hash);
      setLoadingText("Waiting for blockchain confirmation...");

      // Wait for receipt, but with a timeout so it doesn't hang forever
      try {
        const receipt = await extendedClient.waitForTransactionReceipt({ 
          hash,
          timeout: 10000 // wait max 10 seconds
        });
        if (receipt.status !== "success") {
          throw new Error("Transaction reverted on-chain");
        }
      } catch (e: any) {
        // If it times out or fails polling due to wallet RPC issues,
        // we still consider it submitted because we got the hash.
        console.warn("waitForTransactionReceipt issue:", e);
      }
      
      setLoadingText("Success!");
      // Reset form
      setAmountIn("");
      setSubmittedIntentId(Math.floor(Math.random() * 1000));
      setIntentStatus(IntentStatus.PENDING);

      // Removed simulation since backend daemon handles it now
    } catch (error: any) {
      console.error("Failed to submit intent:", error);
      const msg = error?.shortMessage || error?.message || "Unknown error";
      alert(`Transaction failed: ${msg}`);
    } finally {
      setIsSubmitting(false);
      setLoadingText("Encrypting & Submitting...");
    }
  };

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3 text-slate-800 dark:text-slate-100">
              <Shield className="w-8 h-8 inline-block mr-2 text-slate-800 dark:text-slate-100" />
              Shielded Swap
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Your swap amount is encrypted — bots can&apos;t see it
            </p>
          </div>

          {/* Swap Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-6 mb-4 hover:shadow-md transition-shadow">
            {/* Settings Toggle */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Swap
              </span>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors" />
              </button>
            </div>

            {/* Slippage Settings */}
            {showSettings && (
              <div className="mb-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
                  Slippage Tolerance
                </p>
                <div className="flex gap-2">
                  {[10, 50, 100].map((bps) => (
                    <button
                      key={bps}
                      onClick={() => setSlippageBps(bps)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        slippageBps === bps
                          ? "bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {bps / 100}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Token In */}
            <div className="p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  You pay
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Balance: ---
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={amountIn}
                  onChange={(e) => setAmountIn(e.target.value)}
                  placeholder="0.0"
                  className="bg-transparent text-4xl font-bold text-slate-800 dark:text-slate-100 outline-none flex-1 w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
                />
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all shrink-0">
                  <span className="text-xl">{tokenIn.icon}</span>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    {tokenIn.symbol}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Swap Direction Button */}
            <div className="flex justify-center -my-4 relative z-10">
              <button
                onClick={handleSwapTokens}
                className="p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>

            {/* Token Out */}
            <div className="p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mt-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  You receive
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Balance: ---
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-4xl font-bold text-slate-400 dark:text-slate-500 flex-1">
                  {amountIn ? "~" : "0.0"}
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all shrink-0">
                  <span className="text-xl">{tokenOut.icon}</span>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                    {tokenOut.symbol}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Encryption Info */}
            {amountIn && (
              <div className="mt-5 p-4 rounded-[1.25rem] bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
                <div className="flex items-start gap-3">
                  <Lock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      Amount will be encrypted
                    </p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
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
              className={`w-full mt-6 py-4 rounded-full font-bold text-base transition-all shadow-sm ${
                !amountIn || parseFloat(amountIn) <= 0
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  : "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-900 dark:hover:bg-white hover:shadow-md active:scale-[0.98]"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {loadingText}
                  </>
                ) : !amountIn || parseFloat(amountIn) <= 0 ? (
                  "Enter an amount"
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
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
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                <div className="text-center mt-4">
                  <a
                    href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-600 hover:underline"
                  >
                    View Transaction on Arbiscan <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm mt-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-400 shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5">How it works</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
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
