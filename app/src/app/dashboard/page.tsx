"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
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
import IntentStatusDisplay from "@/components/IntentStatus";
import { formatUnits } from "viem";
import { getWalletClient } from "@/lib/nox";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

export default function DashboardPage() {
  const { account: address } = useWallet();
  const [showBalances, setShowBalances] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
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
        // Fetch prices from CoinGecko first
        let prices = { ethereum: { usd: 3500 }, 'usd-coin': { usd: 1 } }; // fallbacks
        try {
          const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd-coin&vs_currencies=usd");
          if (res.ok) {
            prices = await res.json();
          }
        } catch (e) {
          console.warn("Failed to fetch CoinGecko prices, using fallbacks");
        }

        // 1. Fetch encrypted balances from Vault
        const items = await Promise.all(
          TOKENS.map(async (token) => {
            try {
              // Note: actual contract ABI for getBalance must match
              const balanceHandle = await publicClient.readContract({
                address: CONTRACTS.vault,
                abi: [parseAbiItem("function getBalance(address user, address token) view returns (uint256)")],
                functionName: "getBalance",
                args: [address as `0x${string}`, token.address],
              }) as bigint;

              let decryptedBalance = "0.00";
              if (balanceHandle > 0n) {
                const hexHandle = `0x${balanceHandle.toString(16).padStart(64, '0')}`;
                
                return {
                  token,
                  encryptedHandle: `${hexHandle.substring(0, 6)}...encrypted...${hexHandle.substring(62)}`,
                  decryptedBalance: "Unlock to view",
                  usdValue: "$--.--",
                  rawHandle: hexHandle
                };
              }

              return {
                token,
                encryptedHandle: "No balance",
                decryptedBalance: "0.00",
                usdValue: "$0.00",
                rawHandle: null
              };
            } catch (e) {
              return {
                token,
                encryptedHandle: "No balance",
                decryptedBalance: "0.00",
                usdValue: "$0.00",
                rawHandle: null
              };
            }
          })
        );
        setPortfolioItems(items);

        // 2. Fetch Recent Intents
        // For real intents, we fetch IntentSubmitted events
        const logs = await publicClient.getLogs({
          address: CONTRACTS.intentPool,
          event: parseAbiItem('event IntentSubmitted(uint256 indexed intentId, address indexed user, uint8 intentType, address tokenIn, address tokenOut, uint256 deadline)'),
          args: { user: address as `0x${string}` },
          fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOY_BLOCK_NUMBER || "289000000"),
        });

        const intents = await Promise.all(
          logs.map(async (log) => {
            const intentId = log.args.intentId;
            let status = 0; // Default pending
            try {
              const intentData = await publicClient.readContract({
                address: CONTRACTS.intentPool as `0x${string}`,
                abi: [parseAbiItem("function intents(uint256) external view returns (uint256, address, uint8, address, address, uint256, uint256, uint8, uint256, uint256)")],
                functionName: "intents",
                args: [intentId!],
              }) as unknown as any[];
              status = Number(intentData[7]);
            } catch (e) {
              console.error("Failed to read intent status", e);
            }

            return {
              id: Number(intentId),
              status: status,
              tokenIn: log.args.tokenIn === TOKENS[0].address ? "WETH" : "USDC",
              tokenOut: log.args.tokenOut === TOKENS[0].address ? "WETH" : "USDC",
              time: "Recently", // Simplified
            };
          })
        );

        setRecentIntents(intents.reverse().slice(0, 5));
        setPrivacyScore(intents.length > 0 ? 98 : 100);

      } catch (e) {
        console.error("Failed to fetch dashboard data", e);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDashboardData();
  }, [address]);

  const handleToggleDecrypt = async () => {
    if (showBalances) {
      setShowBalances(false);
      return;
    }
    setIsDecrypting(true);
    try {
      let prices = { ethereum: { usd: 3500 }, 'usd-coin': { usd: 1 } };
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd-coin&vs_currencies=usd");
        if (res.ok) prices = await res.json();
      } catch (e) {}

      const { decryptHandle } = await import("@/lib/nox");
      
      const newItems = await Promise.all(
        portfolioItems.map(async (item) => {
          if (item.rawHandle) {
            try {
              const plaintextWei = await decryptHandle(item.rawHandle as `0x${string}`);
              const floatValue = parseFloat(formatUnits(plaintextWei, item.token.decimals));
              const decryptedBalance = floatValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
              
              const price = item.token.symbol === "WETH" ? prices.ethereum.usd : prices['usd-coin'].usd;
              const usdValue = `$${(floatValue * price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              
              return { ...item, decryptedBalance, usdValue };
            } catch (e) {
              return { ...item, decryptedBalance: "Decryption Failed" };
            }
          }
          return item;
        })
      );
      setPortfolioItems(newItems);
      setShowBalances(true);
    } catch (e) {
      console.error(e);
      alert("Decryption failed. Please sign the ACL request.");
    } finally {
      setIsDecrypting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 px-4">
          <div className="max-w-5xl mx-auto text-center mt-20 text-slate-500 dark:text-slate-400 font-medium">
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
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-3 text-slate-800 dark:text-slate-100">
              <Wallet className="w-8 h-8 inline-block mr-2 text-slate-800 dark:text-slate-100" />
              Dashboard
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
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
                color: "text-blue-500 dark:text-blue-400",
                bg: "bg-blue-50 dark:bg-blue-900/30",
              },
              {
                label: "Active Intents",
                value: recentIntents.length.toString(),
                icon: Activity,
                color: "text-indigo-500 dark:text-indigo-400",
                bg: "bg-indigo-50 dark:bg-indigo-900/30",
              },
              {
                label: "MEV Saved",
                value: "Tracking...",
                icon: TrendingUp,
                color: "text-emerald-500 dark:text-emerald-400",
                bg: "bg-emerald-50 dark:bg-emerald-900/30",
              },
              {
                label: "Privacy Score",
                value: `${privacyScore}/100`,
                icon: Shield,
                color: "text-purple-500 dark:text-purple-400",
                bg: "bg-purple-50 dark:bg-purple-900/30",
              },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2.5 rounded-2xl ${stat.bg} ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
                <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Portfolio (3 cols) */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-0">
                    Encrypted Portfolio
                  </h2>
                  <button
                    onClick={handleToggleDecrypt}
                    disabled={isDecrypting}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {isDecrypting ? (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-slate-600 animate-spin" />
                    ) : showBalances ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    {isDecrypting ? "Decrypting..." : showBalances ? "Hide" : "Decrypt"}
                  </button>
                </div>

                <div className="space-y-4">
                  {portfolioItems.length === 0 ? (
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center py-8">No balances found.</p>
                  ) : portfolioItems.map((item) => (
                    <div
                      key={item.token.symbol}
                      className="flex items-center justify-between p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center text-2xl">
                          {item.token.icon}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100 text-base">{item.token.symbol}</p>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.token.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {showBalances ? (
                          <>
                            <p className="font-bold font-mono text-slate-800 dark:text-slate-100 text-lg">
                              {item.decryptedBalance}
                            </p>
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                              {item.usdValue}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-mono text-sm font-medium text-slate-400 dark:text-slate-500">
                              {item.encryptedHandle}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 justify-end mt-1 uppercase tracking-wider">
                              <Lock className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                              Encrypted
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Privacy Score Bar */}
                <div className="mt-8 pt-6 border-t border-slate-100/60 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Privacy Score
                    </span>
                    <span className="text-xs font-bold text-emerald-500">
                      {privacyScore}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                      style={{ width: `${privacyScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                    All vault balances encrypted • 100% intents batched • No
                    plain-text exposure
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Intents (2 cols) */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-8 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Recent Intents</h2>
                <div className="space-y-6">
                  {recentIntents.length === 0 ? (
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center py-8">No recent intents.</p>
                  ) : recentIntents.map((intent) => (
                    <div key={intent.id} className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md border border-slate-100 dark:border-slate-800">
                            {intent.tokenIn} → {intent.tokenOut}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
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
