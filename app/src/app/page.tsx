"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import {
  Shield,
  Zap,
  Eye,
  EyeOff,
  Layers,
  Lock,
  ArrowRight,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";
import { getProtocolStats } from "@/lib/contracts";
import { formatEther } from "viem";

export default function HomePage() {
  const [stats, setStats] = useState({
    totalBatches: 0n,
    totalIntents: 0n,
    mevSaved: 0n,
    feeBps: 0n,
  });

  useEffect(() => {
    getProtocolStats().then(setStats);
  }, []);

  return (
    <>
      <Header />
      <main className="pt-16">
        {/* ─── Hero Section ────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[hsl(var(--axi-primary)/0.08)] rounded-full blur-[120px]" />
          <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-[hsl(var(--axi-secondary)/0.06)] rounded-full blur-[100px]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 relative">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[hsl(var(--axi-primary)/0.1)] border border-[hsl(var(--axi-primary)/0.2)] mb-8">
                <div className="status-dot bg-[hsl(var(--axi-primary))]" />
                <span className="text-xs font-medium text-[hsl(var(--axi-primary))]">
                  Powered by iExec Nox • Live on Sepolia
                </span>
              </div>

              {/* Title */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6">
                <span className="text-[hsl(var(--axi-text))]">Shield Your </span>
                <span className="glow-text">DeFi Trades</span>
                <br />
                <span className="text-[hsl(var(--axi-text))]">from </span>
                <span className="text-[hsl(var(--axi-danger))] line-through opacity-60">
                  MEV
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-[hsl(var(--axi-text-muted))] max-w-2xl mx-auto mb-10 leading-relaxed">
                Axi routes your swaps and lending through{" "}
                <span className="text-[hsl(var(--axi-primary))] font-medium">
                  encrypted intent batches
                </span>
                . Your amounts stay private. Your strategy stays hidden.
                Bots see nothing.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Link href="/swap" className="axi-button text-lg px-8 py-4">
                  <span className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Launch App
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
                <Link
                  href="/batches"
                  className="axi-button-secondary text-lg px-8 py-4"
                >
                  View Batches
                </Link>
              </div>

              {/* Animated Shield */}
              <div className="relative w-32 h-32 mx-auto mb-16 float-animation">
                <Shield className="w-32 h-32 text-[hsl(var(--axi-primary)/0.3)] shield-pulse" />
                <Lock className="w-10 h-10 text-[hsl(var(--axi-primary))] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Live Stats ─────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Batches Executed",
                value: stats.totalBatches.toString(),
                icon: Layers,
                color: "axi-primary",
              },
              {
                label: "Intents Shielded",
                value: stats.totalIntents.toString(),
                icon: Shield,
                color: "axi-secondary",
              },
              {
                label: "MEV Saved",
                value: `${parseFloat(formatEther(stats.mevSaved)).toFixed(2)} ETH`,
                icon: TrendingUp,
                color: "axi-success",
              },
              {
                label: "Protocol Fee",
                value: `${Number(stats.feeBps) / 100}%`,
                icon: Activity,
                color: "axi-accent",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="glass-card glass-card-hover p-5 text-center"
              >
                <stat.icon
                  className={`w-6 h-6 mx-auto mb-2 text-[hsl(var(--${stat.color}))]`}
                />
                <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-[hsl(var(--axi-text-muted))] mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── How It Works ───────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            How <span className="glow-text">Axi</span> Works
          </h2>
          <p className="text-center text-[hsl(var(--axi-text-muted))] mb-12 max-w-xl mx-auto">
            Three steps to MEV-free, privacy-preserving DeFi
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Encrypt Your Intent",
                description:
                  "Enter your swap amount. The Nox JS SDK encrypts it client-side and sends only an encrypted handle to the blockchain. Your amount is never visible.",
                icon: Lock,
                detail: "Amount → Nox SDK → Encrypted Handle",
              },
              {
                step: "02",
                title: "Batch with Others",
                description:
                  "Your encrypted intent joins a pool of similar intents. When enough accumulate, they're batched together. Individual amounts stay hidden inside the batch.",
                icon: Layers,
                detail: "Intent Pool → Batch Formation → Aggregated Amount",
              },
              {
                step: "03",
                title: "Execute Privately",
                description:
                  "The batch executes as a single aggregated trade on Uniswap. Bots see one large trade — they can't extract value from individual users.",
                icon: Zap,
                detail: "Batched Trade → Uniswap → Proportional Distribution",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="glass-card glass-card-hover p-6 relative overflow-hidden"
              >
                <span className="absolute top-4 right-4 text-5xl font-black text-[hsl(var(--axi-border)/0.3)]">
                  {item.step}
                </span>
                <div className="relative">
                  <div className="p-3 rounded-xl bg-[hsl(var(--axi-primary)/0.1)] w-fit mb-4">
                    <item.icon className="w-6 h-6 text-[hsl(var(--axi-primary))]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-[hsl(var(--axi-text-muted))] mb-4 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-[hsl(var(--axi-bg))] text-[hsl(var(--axi-primary))] inline-block">
                    {item.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Privacy Comparison ─────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <h2 className="text-3xl font-bold text-center mb-12">
            What&apos;s <span className="text-[hsl(var(--axi-danger))]">Exposed</span>{" "}
            vs{" "}
            <span className="text-[hsl(var(--axi-success))]">Shielded</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Without Axi */}
            <div className="glass-card p-6 border-[hsl(var(--axi-danger)/0.3)]">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-[hsl(var(--axi-danger))]" />
                <h3 className="text-lg font-semibold text-[hsl(var(--axi-danger))]">
                  Without Axi
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  "Swap amount visible in mempool",
                  "Trading strategy exposed",
                  "MEV bots sandwich your trade",
                  "Portfolio positions public",
                  "Timing reveals intent",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-[hsl(var(--axi-text-muted))]"
                  >
                    <Eye className="w-4 h-4 text-[hsl(var(--axi-danger)/0.6)] shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* With Axi */}
            <div className="glass-card p-6 border-[hsl(var(--axi-success)/0.3)]">
              <div className="flex items-center gap-3 mb-4">
                <EyeOff className="w-6 h-6 text-[hsl(var(--axi-success))]" />
                <h3 className="text-lg font-semibold text-[hsl(var(--axi-success))]">
                  With Axi
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  "Amount encrypted via Nox TEE",
                  "Strategy hidden in batch",
                  "Bots see aggregated batch only",
                  "Balances encrypted (ERC-7984)",
                  "Timing obscured by batching",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-[hsl(var(--axi-text-muted))]"
                  >
                    <Lock className="w-4 h-4 text-[hsl(var(--axi-success)/0.6)] shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Footer ─────────────────────────────────────────────── */}
        <footer className="border-t border-[hsl(var(--axi-border)/0.3)] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[hsl(var(--axi-primary))]" />
                <span className="font-semibold">Axi</span>
                <span className="text-xs text-[hsl(var(--axi-text-muted))]">
                  Built for WTF Hackathon 2025
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-[hsl(var(--axi-text-muted))]">
                <a
                  href="https://docs.iex.ec/axi-protocol/getting-started/welcome"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[hsl(var(--axi-primary))] transition-colors"
                >
                  Nox Docs
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[hsl(var(--axi-primary))] transition-colors"
                >
                  GitHub
                </a>
                <a
                  href="https://discord.gg/RXYHBJceMe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[hsl(var(--axi-primary))] transition-colors"
                >
                  Discord
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
