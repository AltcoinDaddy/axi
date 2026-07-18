"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import IntentStatusDisplay from "@/components/IntentStatus";
// Removed wagmi to avoid peer dependency and context issues
import { createPublicClient, http, parseAbiItem } from "viem";
import { sepolia } from "viem/chains";
import { RPC_URL, CONTRACTS, TOKENS } from "@/lib/constants";
import {
  Shield,
  TrendingUp,
  Eye,
  EyeOff,
  Lock,
  Wallet,
  Activity,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

export default function DashboardPage() {
  const { account: address } = useWallet();
  const [showBalances, setShowBalances] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Real data state
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [recentIntents, setRecentIntents] = useState<any[]>([]);
  const [privacyScore, setPrivacyScore] = useState(0);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!address || !CONTRACTS.vault || CONTRACTS.vault === "0x0000000000000000000000000000000000000000") {
        setIsLoading(false);
        return;
      }

      try {
        // 1. Fetch encrypted balances from Vault
        const items = await Promise.all(
          TOKENS.map(async (token) => {
            try {
              // Note: actual contract ABI for getBalance must match
              const balanceHandle = await publicClient.readContract({
                address: CONTRACTS.vault,
                abi: [parseAbiItem("function getBalance(address user, address token) view returns (bytes)")],
                functionName: "getBalance",
                args: [address as `0x${string}`, token.address],
              }) as `0x${string}`;

              let decryptedBalance = "0.00";
              if (showBalances && balanceHandle !== "0x") {
                // To do this for real, user must sign a decryption request
                // For now, we will show "Unlock to view" if they want to decrypt
                // const { value } = await nox.decrypt(balanceHandle);
                decryptedBalance = "Unlock to view"; 
              }

              return {
                token,
                encryptedHandle: balanceHandle === "0x" ? "0x0000...0000" : `${balanceHandle.substring(0, 10)}...${balanceHandle.substring(balanceHandle.length - 4)}`,
                decryptedBalance,
                usdValue: "$--.--", // Mock price for now
              };
            } catch (e) {
              return {
                token,
                encryptedHandle: "No balance",
                decryptedBalance: "0.00",
                usdValue: "$0.00",
              };
            }
          })
        );
        setPortfolioItems(items);

        // 2. Fetch Recent Intents
        // For real intents, we fetch IntentSubmitted events
        const logs = await publicClient.getLogs({
          address: CONTRACTS.intentPool,
          event: parseAbiItem('event IntentSubmitted(uint256 indexed intentId, address indexed user, address tokenIn, address tokenOut, uint256 deadline)'),
          args: { user: address as `0x${string}` },
          fromBlock: "earliest",
        });

        const intents = logs.map((log) => ({
          id: Number(log.args.intentId),
          status: 0, // Pending by default, need to check if executed
          tokenIn: log.args.tokenIn === TOKENS[0].address ? "WETH" : "USDC",
          tokenOut: log.args.tokenOut === TOKENS[0].address ? "WETH" : "USDC",
          time: "Recently", // Simplified
        }));

        setRecentIntents(intents.reverse().slice(0, 5));
        setPrivacyScore(intents.length > 0 ? 98 : 100);

      } catch (e) {
        console.error("Failed to fetch dashboard data", e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [address, showBalances]);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-5xl mx-auto text-center mt-20 text-[hsl(var(--axi-text-muted))]">
            Loading your secure dashboard...
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">
              <Wallet className="w-6 h-6 inline-block mr-2 text-[hsl(var(--axi-primary))]" />
              Dashboard
            </h1>
            <p className="text-sm text-[hsl(var(--axi-text-muted))]">
              Your private portfolio and intent history
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Value",
                value: showBalances ? "$--.--" : "••••••",
                icon: Wallet,
                color: "axi-primary",
              },
              {
                label: "Active Intents",
                value: recentIntents.length.toString(),
                icon: Activity,
                color: "axi-secondary",
              },
              {
                label: "MEV Saved",
                value: "Tracking...",
                icon: TrendingUp,
                color: "axi-success",
              },
              {
                label: "Privacy Score",
                value: `${privacyScore}/100`,
                icon: Shield,
                color: "axi-primary",
              },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon
                    className={`w-4 h-4 text-[hsl(var(--${stat.color}))]`}
                  />
                  <span className="text-xs text-[hsl(var(--axi-text-muted))]">
                    {stat.label}
                  </span>
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Portfolio (3 cols) */}
            <div className="lg:col-span-3">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    Encrypted Portfolio
                  </h2>
                  <button
                    onClick={() => setShowBalances(!showBalances)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--axi-bg))] text-xs font-medium text-[hsl(var(--axi-text-muted))] hover:text-[hsl(var(--axi-text))] transition-colors"
                  >
                    {showBalances ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                    {showBalances ? "Hide" : "Decrypt"}
                  </button>
                </div>

                <div className="space-y-3">
                  {portfolioItems.length === 0 ? (
                    <p className="text-sm text-[hsl(var(--axi-text-muted))] text-center py-4">No balances found.</p>
                  ) : portfolioItems.map((item) => (
                    <div
                      key={item.token.symbol}
                      className="flex items-center justify-between p-4 rounded-xl bg-[hsl(var(--axi-bg))]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[hsl(var(--axi-primary)/0.1)] flex items-center justify-center text-xl">
                          {item.token.icon}
                        </div>
                        <div>
                          <p className="font-medium">{item.token.symbol}</p>
                          <p className="text-xs text-[hsl(var(--axi-text-muted))]">
                            {item.token.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {showBalances ? (
                          <>
                            <p className="font-semibold font-mono">
                              {item.decryptedBalance}
                            </p>
                            <p className="text-xs text-[hsl(var(--axi-text-muted))]">
                              {item.usdValue}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-mono text-sm text-[hsl(var(--axi-text-muted))]">
                              {item.encryptedHandle}
                            </p>
                            <p className="text-[10px] text-[hsl(var(--axi-text-muted))] flex items-center gap-1 justify-end">
                              <Lock className="w-3 h-3" />
                              Encrypted
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Privacy Score Bar */}
                <div className="mt-6 pt-4 border-t border-[hsl(var(--axi-border)/0.3)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-[hsl(var(--axi-text-muted))]">
                      Privacy Score
                    </span>
                    <span className="text-xs font-semibold text-[hsl(var(--axi-success))]">
                      {privacyScore}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[hsl(var(--axi-bg))]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--axi-primary))] to-[hsl(var(--axi-success))] transition-all duration-500"
                      style={{ width: `${privacyScore}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[hsl(var(--axi-text-muted))] mt-1">
                    All vault balances encrypted • 100% intents batched • No
                    plain-text exposure
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Intents (2 cols) */}
            <div className="lg:col-span-2">
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Intents</h2>
                <div className="space-y-3">
                  {recentIntents.length === 0 ? (
                    <p className="text-sm text-[hsl(var(--axi-text-muted))] text-center py-4">No recent intents.</p>
                  ) : recentIntents.map((intent) => (
                    <div key={intent.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[hsl(var(--axi-text-muted))]">
                            {intent.tokenIn} → {intent.tokenOut}
                          </span>
                        </div>
                        <span className="text-[10px] text-[hsl(var(--axi-text-muted))]">
                          {intent.time}
                        </span>
                      </div>
                      <IntentStatusDisplay
                        intentId={intent.id}
                        status={intent.status}
                        batchId={undefined}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
