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
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">
              <Layers className="w-6 h-6 inline-block mr-2 text-[hsl(var(--axi-primary))]" />
              Batch Explorer
            </h1>
            <p className="text-sm text-[hsl(var(--axi-text-muted))]">
              View executed batches — individual amounts are{" "}
              <span className="text-[hsl(var(--axi-primary))] font-medium">
                never visible
              </span>
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="glass-card p-4 mb-6 border-[hsl(var(--axi-primary)/0.2)]">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[hsl(var(--axi-primary)/0.1)] shrink-0">
                <Shield className="w-5 h-5 text-[hsl(var(--axi-primary))]" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">
                  Privacy Guarantee
                </p>
                <p className="text-xs text-[hsl(var(--axi-text-muted))] leading-relaxed">
                  This page shows real batch metadata fetched from Sepolia. Individual user amounts, strategies, and positions are{" "}
                  <strong className="text-[hsl(var(--axi-primary))]">
                    encrypted and never exposed
                  </strong>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Batch Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold">{batches.length}</p>
              <p className="text-xs text-[hsl(var(--axi-text-muted))]">
                Total Batches
              </p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold">
                {batches.reduce((sum, b) => sum + b.intentCount, 0)}
              </p>
              <p className="text-xs text-[hsl(var(--axi-text-muted))]">
                Intents Processed
              </p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-[hsl(var(--axi-success))]">
                {batches.filter((b) => b.status === "executed").length}
              </p>
              <p className="text-xs text-[hsl(var(--axi-text-muted))]">
                Executed
              </p>
            </div>
          </div>

          {/* Batch Table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[hsl(var(--axi-border)/0.3)]">
                    <th className="text-left px-6 py-4 text-xs font-medium text-[hsl(var(--axi-text-muted))] uppercase tracking-wider">
                      Batch ID
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-[hsl(var(--axi-text-muted))] uppercase tracking-wider">
                      Pair
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-[hsl(var(--axi-text-muted))] uppercase tracking-wider">
                      Intents
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-[hsl(var(--axi-text-muted))] uppercase tracking-wider">
                      Amounts
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-[hsl(var(--axi-text-muted))] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-medium text-[hsl(var(--axi-text-muted))] uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--axi-border)/0.2)]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-sm text-[hsl(var(--axi-text-muted))]">
                        Loading on-chain data from Sepolia...
                      </td>
                    </tr>
                  ) : batches.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-sm text-[hsl(var(--axi-text-muted))]">
                        No batches found on Sepolia yet. Submit intents to form a batch!
                      </td>
                    </tr>
                  ) : batches.map((batch) => (
                    <tr
                      key={batch.id}
                      className="hover:bg-[hsl(var(--axi-bg-card)/0.5)] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium">
                          #{batch.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium">
                          {batch.tokenIn}{" "}
                          <span className="text-[hsl(var(--axi-text-muted))]">
                            →
                          </span>{" "}
                          {batch.tokenOut}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">{batch.intentCount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-[hsl(var(--axi-primary))]" />
                          <span className="text-xs font-mono text-[hsl(var(--axi-text-muted))]">
                            Encrypted
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {batch.status === "executed" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            Executed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-xs text-[hsl(var(--axi-text-muted))]">
                            {new Date(batch.createdAt).toLocaleString()}
                          </p>
                          {batch.txHash && (
                            <a
                              href={`https://sepolia.etherscan.io/tx/${batch.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-[hsl(var(--axi-primary))] hover:underline mt-0.5"
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
