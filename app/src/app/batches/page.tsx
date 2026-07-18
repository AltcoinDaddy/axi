"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
// Removed wagmi
import { createPublicClient, http, parseAbiItem } from "viem";
import { sepolia } from "viem/chains";
import { RPC_URL, CONTRACTS } from "@/lib/constants";
import {
  Layers,
  CheckCircle2,
  Clock,
  Shield,
  Lock,
  ExternalLink,
} from "lucide-react";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

interface BatchEvent {
  id: number;
  tokenIn: string;
  tokenOut: string;
  intentCount: number;
  status: string;
  createdAt: string;
  executedAt: string | null;
  txHash: string | null;
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<BatchEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBatches() {
      try {
        if (!CONTRACTS.router || CONTRACTS.router === "0x0000000000000000000000000000000000000000") {
          setIsLoading(false);
          return; // Not deployed
        }

        // Fetch real logs from the router contract
        const logs = await publicClient.getLogs({
          address: CONTRACTS.router,
          event: parseAbiItem('event BatchSwapExecuted(uint256 indexed batchId, address indexed tokenIn, address indexed tokenOut, uint256 totalAmountIn, uint256 totalAmountOut, uint256 intentCount)'),
          fromBlock: "earliest",
        });

        const formattedBatches = await Promise.all(
          logs.map(async (log) => {
            const block = await publicClient.getBlock({ blockHash: log.blockHash });
            return {
              id: Number(log.args.batchId),
              tokenIn: log.args.tokenIn === "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14" ? "WETH" : "USDC",
              tokenOut: log.args.tokenOut === "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14" ? "WETH" : "USDC",
              intentCount: Number(log.args.intentCount),
              status: "executed",
              createdAt: new Date(Number(block.timestamp) * 1000).toISOString(),
              executedAt: new Date(Number(block.timestamp) * 1000).toISOString(),
              txHash: log.transactionHash,
            };
          })
        );

        setBatches(formattedBatches.reverse()); // Newest first
      } catch (e) {
        console.error("Failed to fetch batches", e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBatches();
  }, []);

  return (
    <>
      <Header />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold mb-3 text-slate-800 dark:text-slate-100">
              <Layers className="w-8 h-8 inline-block mr-2 text-slate-800 dark:text-slate-100" />
              Batch Explorer
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              View executed batches — individual amounts are{" "}
              <span className="text-blue-500 font-bold">
                never visible
              </span>
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50/50 dark:bg-blue-900/20 p-5 rounded-[2rem] border border-blue-100 dark:border-blue-800/50 shadow-sm mb-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-100/50 dark:bg-blue-900/50 shrink-0">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1.5">
                  Privacy Guarantee
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                  This page shows real batch metadata fetched from Sepolia. Individual user amounts, strategies, and positions are{" "}
                  <strong className="text-blue-500 font-bold">
                    encrypted and never exposed
                  </strong>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Batch Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm text-center hover:shadow-md transition-shadow">
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{batches.length}</p>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                Total Batches
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm text-center hover:shadow-md transition-shadow">
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                {batches.reduce((sum, b) => sum + b.intentCount, 0)}
              </p>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                Intents Processed
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm text-center hover:shadow-md transition-shadow">
              <p className="text-3xl font-bold text-emerald-500 tracking-tight">
                {batches.filter((b) => b.status === "executed").length}
              </p>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                Executed
              </p>
            </div>
          </div>

          {/* Batch Table */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="text-left px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Batch ID
                    </th>
                    <th className="text-left px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Pair
                    </th>
                    <th className="text-left px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Intents
                    </th>
                    <th className="text-left px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Amounts
                    </th>
                    <th className="text-left px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-10 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                        Loading on-chain data from Sepolia...
                      </td>
                    </tr>
                  ) : batches.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-10 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                        No batches found on Sepolia yet. Submit intents to form a batch!
                      </td>
                    </tr>
                  ) : batches.map((batch) => (
                    <tr
                      key={batch.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
                          #{batch.id}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {batch.tokenIn}{" "}
                          <span className="text-slate-400 dark:text-slate-500 px-1">
                            →
                          </span>{" "}
                          {batch.tokenOut}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{batch.intentCount}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-xs font-bold font-mono text-slate-400 dark:text-slate-500 uppercase">
                            Encrypted
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {batch.status === "executed" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-800/50">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Executed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-100 dark:border-amber-800/50">
                            <Clock className="w-3.5 h-3.5" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <div>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {new Date(batch.createdAt).toLocaleString()}
                          </p>
                          {batch.txHash && (
                            <a
                              href={`https://sepolia.etherscan.io/tx/${batch.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-500 hover:text-blue-600 hover:underline mt-1 transition-colors"
                            >
                              {batch.txHash.slice(0, 8)}...{batch.txHash.slice(-6)}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
