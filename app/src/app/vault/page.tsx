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
            <h1 className="text-2xl font-bold mb-2">
              <Lock className="w-6 h-6 inline-block mr-2 text-[hsl(var(--axi-primary))]" />
              Confidential Vault
            </h1>
            <p className="text-sm text-[hsl(var(--axi-text-muted))]">
              Your balances are encrypted — only you can see them
            </p>
          </div>

          {/* Encrypted Balances Card */}
          <div className="glass-card p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-[hsl(var(--axi-text-muted))]">
                Your Encrypted Balances
              </h2>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--axi-bg))] text-xs font-medium text-[hsl(var(--axi-text-muted))] hover:text-[hsl(var(--axi-text))] transition-colors"
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
                  className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--axi-bg))]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{token.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{token.symbol}</p>
                      <p className="text-xs text-[hsl(var(--axi-text-muted))]">
                        {token.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {showBalance ? (
                      <p className="text-sm font-semibold font-mono">
                        {decryptedBalances[token.symbol] || "0.00"}
                      </p>
                    ) : (
                      <p className="text-sm font-mono text-[hsl(var(--axi-text-muted))]">
                        {encryptedBalances[token.symbol] || "0x0000...0000"}
                      </p>
                    )}
                    <p className="text-[10px] text-[hsl(var(--axi-text-muted))]">
                      {showBalance ? (
                        <span className="flex items-center gap-1 justify-end">
                          <Shield className="w-3 h-3 text-[hsl(var(--axi-success))]" />
                          Decrypted for you only
                        </span>
                      ) : (
                        "Encrypted (euint256)"
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deposit / Withdraw Card */}
          <div className="glass-card p-6 mb-4">
            {/* Tab Selector */}
            <div className="flex rounded-lg bg-[hsl(var(--axi-bg))] p-1 mb-4">
              <button
                onClick={() => setActiveTab("deposit")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "deposit"
                    ? "bg-[hsl(var(--axi-bg-card))] text-[hsl(var(--axi-text))] shadow-sm"
                    : "text-[hsl(var(--axi-text-muted))]"
                }`}
              >
                <ArrowDownToLine className="w-4 h-4" />
                Deposit
              </button>
              <button
                onClick={() => setActiveTab("withdraw")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "withdraw"
                    ? "bg-[hsl(var(--axi-bg-card))] text-[hsl(var(--axi-text))] shadow-sm"
                    : "text-[hsl(var(--axi-text-muted))]"
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTokenIndex === i
                      ? "bg-[hsl(var(--axi-primary)/0.15)] text-[hsl(var(--axi-primary))] border border-[hsl(var(--axi-primary)/0.3)]"
                      : "bg-[hsl(var(--axi-bg))] text-[hsl(var(--axi-text-muted))] hover:text-[hsl(var(--axi-text))]"
                  }`}
                >
                  <span>{token.icon}</span>
                  {token.symbol}
                </button>
              ))}
            </div>

            {/* Amount Input */}
            <div className="p-4 rounded-xl bg-[hsl(var(--axi-bg))] mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[hsl(var(--axi-text-muted))]">
                  {activeTab === "deposit" ? "Deposit Amount" : "Withdraw Amount"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  className="bg-transparent text-3xl font-semibold outline-none flex-1 w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-lg font-semibold text-[hsl(var(--axi-text-muted))]">
                  {selectedToken.symbol}
                </span>
              </div>
            </div>

            {/* Info about encrypt/decrypt */}
            {activeTab === "withdraw" && amount && (
              <div className="mb-4 p-3 rounded-lg bg-[hsl(var(--axi-secondary)/0.05)] border border-[hsl(var(--axi-secondary)/0.15)]">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-[hsl(var(--axi-secondary))] shrink-0 mt-0.5" />
                  <p className="text-xs text-[hsl(var(--axi-text-muted))]">
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
              className={`w-full py-4 rounded-xl font-semibold text-base transition-all ${
                !amount || parseFloat(amount) <= 0
                  ? "bg-[hsl(var(--axi-bg-card))] text-[hsl(var(--axi-text-muted))] cursor-not-allowed"
                  : "axi-button"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {isDepositing || isWithdrawing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {activeTab === "deposit"
                      ? "Depositing..."
                      : "Encrypting & Withdrawing..."}
                  </>
                ) : !amount || parseFloat(amount) <= 0 ? (
                  "Enter an amount"
                ) : activeTab === "deposit" ? (
                  <>
                    <ArrowDownToLine className="w-4 h-4" />
                    Deposit {selectedToken.symbol}
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
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
