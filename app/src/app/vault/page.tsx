"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { VaultPrivacyBreakdown } from "@/components/PrivacyIndicator";
import {
  Vault,
  ArrowDownToLine,
  ArrowUpFromLine,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Info,
  Loader2,
} from "lucide-react";
import { TOKENS } from "@/lib/constants";

export default function VaultPage() {
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(1); // USDC
  const [amount, setAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [showBalance, setShowBalance] = useState(false);

  // Simulated encrypted balances (in production, decrypted via Nox SDK)
  const [encryptedBalances] = useState<Record<string, string>>({
    WETH: "0x7f3a...encrypted...9c2b",
    USDC: "0x4e8d...encrypted...1a7f",
  });

  const [decryptedBalances] = useState<Record<string, string>>({
    WETH: "2.5000",
    USDC: "5,000.00",
  });

  const selectedToken = TOKENS[selectedTokenIndex];

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setIsDepositing(true);
    // Simulate deposit flow
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsDepositing(false);
    setAmount("");
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setIsWithdrawing(true);
    // Simulate withdraw flow (encrypt amount → unwrap → finalize)
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsWithdrawing(false);
    setAmount("");
  };

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3 text-slate-800 dark:text-slate-100">
              <Lock className="w-8 h-8 inline-block mr-2 text-slate-800 dark:text-slate-100" />
              Confidential Vault
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Your balances are encrypted — only you can see them
            </p>
          </div>

          {/* Encrypted Balances Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-6 mb-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Your Encrypted Balances
              </h2>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {showBalance ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
                {showBalance ? "Hide" : "Decrypt & Show"}
              </button>
            </div>

            <div className="space-y-3">
              {TOKENS.map((token) => (
                <div
                  key={token.symbol}
                  className="flex items-center justify-between p-4 rounded-[1.25rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{token.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{token.symbol}</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {token.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {showBalance ? (
                      <p className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100">
                        {decryptedBalances[token.symbol] || "0.00"}
                      </p>
                    ) : (
                      <p className="text-sm font-mono text-slate-400 dark:text-slate-500 font-medium">
                        {encryptedBalances[token.symbol] || "0x0000...0000"}
                      </p>
                    )}
                    <p className="text-[10px] font-medium mt-1">
                      {showBalance ? (
                        <span className="flex items-center gap-1 justify-end text-blue-500">
                          <Shield className="w-3 h-3" />
                          Decrypted for you only
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">Encrypted (euint256)</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deposit / Withdraw Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-6 mb-4 hover:shadow-md transition-shadow">
            {/* Tab Selector */}
            <div className="flex rounded-full bg-slate-50 dark:bg-slate-800/50 p-1.5 mb-5 border border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setActiveTab("deposit")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold transition-all ${
                  activeTab === "deposit"
                    ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-100 dark:border-slate-700"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <ArrowDownToLine className="w-4 h-4" />
                Deposit
              </button>
              <button
                onClick={() => setActiveTab("withdraw")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold transition-all ${
                  activeTab === "withdraw"
                    ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-100 dark:border-slate-700"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <ArrowUpFromLine className="w-4 h-4" />
                Withdraw
              </button>
            </div>

            {/* Token Selection */}
            <div className="flex gap-2 mb-4">
              {TOKENS.map((token, i) => (
                <button
                  key={token.symbol}
                  onClick={() => setSelectedTokenIndex(i)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    selectedTokenIndex === i
                      ? "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm"
                      : "bg-white dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>{token.icon}</span>
                  {token.symbol}
                </button>
              ))}
            </div>

            {/* Amount Input */}
            <div className="p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {activeTab === "deposit" ? "Deposit Amount" : "Withdraw Amount"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="bg-transparent text-4xl font-bold text-slate-800 dark:text-slate-100 outline-none flex-1 w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-slate-300 dark:placeholder:text-slate-600"
                />
                <span className="text-xl font-bold text-slate-400 dark:text-slate-500">
                  {selectedToken.symbol}
                </span>
              </div>
            </div>

            {/* Info about encrypt/decrypt */}
            {activeTab === "withdraw" && amount && (
              <div className="mb-5 p-4 rounded-[1.25rem] bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                    Withdrawal is a 2-step process: First, your encrypted amount
                    is burned. Then, after off-chain decryption via Nox, you
                    finalize to receive ERC-20 tokens.
                  </p>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={activeTab === "deposit" ? handleDeposit : handleWithdraw}
              disabled={
                !amount ||
                parseFloat(amount) <= 0 ||
                isDepositing ||
                isWithdrawing
              }
              className={`w-full py-4 rounded-full font-bold text-base transition-all shadow-sm ${
                !amount || parseFloat(amount) <= 0
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  : "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-900 dark:hover:bg-white hover:shadow-md active:scale-[0.98]"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {isDepositing || isWithdrawing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {activeTab === "deposit"
                      ? "Depositing..."
                      : "Encrypting & Withdrawing..."}
                  </>
                ) : !amount || parseFloat(amount) <= 0 ? (
                  "Enter an amount"
                ) : activeTab === "deposit" ? (
                  <>
                    <ArrowDownToLine className="w-5 h-5" />
                    Deposit {selectedToken.symbol}
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Withdraw {selectedToken.symbol}
                  </>
                )}
              </span>
            </button>
          </div>

          {/* Privacy Breakdown */}
          <VaultPrivacyBreakdown />
        </div>
      </main>
    </>
  );
}
