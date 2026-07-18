"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Layers, Zap, EyeOff, Lock, Activity, CheckCircle2, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import { SwapPrivacyBreakdown } from "@/components/PrivacyIndicator";
import IntentStatusDisplay from "@/components/IntentStatus";
import { IntentStatus } from "@/lib/constants";
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
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      <main className="flex-1 pt-32 pb-24">
        {/* ─── Hero Section ────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-12 pb-32">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 dark:from-slate-900/80 to-transparent -z-10" />
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 max-w-4xl mx-auto leading-[1.1]">
              A New Era of <br className="hidden md:block"/> Confidential Trading
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Empowered by Nox enclaves, execute massive intent batches with zero MEV extraction and total privacy. The future is yours to shape.
            </p>

            <Link href="/swap" className="inline-flex items-center justify-center h-14 px-10 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-0.5">
              Get Started
            </Link>

            {/* Floating visual elements (simulating the 3D coins from the design) */}
            <div className="relative w-full max-w-4xl h-48 md:h-64 mt-20 perspective-1000">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-blue-600 to-indigo-900 shadow-2xl flex items-center justify-center z-20 animate-pulse-slow">
                <Shield className="w-16 h-16 md:w-24 md:h-24 text-white opacity-80" strokeWidth={1.5} />
              </div>
              <div className="absolute top-10 left-[15%] w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-xl opacity-90 blur-[1px] animate-float z-10" />
              <div className="absolute bottom-10 right-[15%] w-28 h-28 rounded-full bg-gradient-to-tl from-indigo-500 to-purple-500 shadow-xl opacity-80 blur-[2px] animate-float-delayed z-10" />
              <div className="absolute top-20 right-[5%] w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 shadow-lg opacity-60 blur-[3px] animate-float z-0" />
              <div className="absolute bottom-20 left-[5%] w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-800 shadow-lg opacity-70 blur-[2px] animate-float-delayed z-0" />
            </div>
            
            <div className="mt-12 text-sm text-muted-foreground flex flex-col items-center animate-bounce-slow">
              <div className="w-5 h-8 rounded-full border-2 border-muted-foreground flex justify-center p-1 mb-2">
                <div className="w-1 h-2 bg-muted-foreground rounded-full" />
              </div>
              Scroll down for more
            </div>

          </div>
        </section>

        {/* ─── How it Works (Features Section) ────────────────────── */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* 2-Column Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground max-w-xl leading-tight">
                <span className="text-muted-foreground font-medium block mb-2 text-3xl">What Does</span>
                Confidential DeFi Mean in Web3?
              </h2>
              <p className="text-muted-foreground max-w-sm text-base leading-relaxed font-medium">
                Powered by Nox secure enclaves, every intent and smart contract execution is cryptographically shielded and decentralized.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-10 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform duration-700 group-hover:scale-110">
                  <Lock className="w-48 h-48" />
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center mb-8 relative z-10">
                  <Lock className="w-8 h-8 text-slate-700 dark:text-slate-200" />
                </div>
                <h3 className="text-2xl font-bold mb-3 relative z-10 text-slate-800 dark:text-slate-100">Own Your Strategy</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium relative z-10 max-w-sm">
                  With encrypted intents, you control how your orders are executed—no more data harvesting or front-running by bots.
                </p>
              </div>

              <div className="p-10 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform duration-700 group-hover:scale-110">
                  <Layers className="w-48 h-48" />
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center mb-8 relative z-10">
                  <Layers className="w-8 h-8 text-slate-700 dark:text-slate-200" />
                </div>
                <h3 className="text-2xl font-bold mb-3 relative z-10 text-slate-800 dark:text-slate-100">Secret Batching</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium relative z-10 max-w-sm">
                  From swaps to lending—intents are grouped and matched internally, ensuring zero slippage for coincidence of wants.
                </p>
              </div>

              <div className="p-10 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all duration-300 md:col-span-2 flex flex-col md:flex-row gap-10 items-center overflow-hidden">
                <div className="flex-1">
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center mb-8">
                    <Zap className="w-8 h-8 text-slate-700 dark:text-slate-200" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-800 dark:text-slate-100">Trustless Settlement</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium max-w-sm">
                    The Enclave produces a proof of correct execution and securely settles the remaining delta on public AMMs like Uniswap.
                  </p>
                </div>
                <div className="flex-1 w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100/50 dark:border-slate-800/50">
                  <IntentStatusDisplay 
                    status={IntentStatus.EXECUTED} 
                    intentId={404} 
                    batchId={12} 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Privacy Breakdown ──────────────────────────────────── */}
        <section className="py-24 bg-white dark:bg-slate-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-800 dark:text-slate-100">
                The Protocol Difference
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-4 leading-relaxed font-medium">
                Compare standard DeFi routing against Axi's confidential infrastructure.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-10 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-slate-700 dark:text-slate-200">
                  <EyeOff className="w-6 h-6 text-red-400" />
                  Standard DeFi
                </h3>
                <div className="space-y-8">
                  <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center shrink-0 shadow-sm">
                      <CheckCircle2 className="w-6 h-6 rotate-45" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-slate-800 dark:text-slate-100">Public Mempool</p>
                      <p className="text-base text-slate-500 dark:text-slate-400 mt-1 font-medium">Bots front-run your transactions before they even execute on-chain.</p>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center shrink-0 shadow-sm">
                      <CheckCircle2 className="w-6 h-6 rotate-45" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-slate-800 dark:text-slate-100">MEV Extraction</p>
                      <p className="text-base text-slate-500 dark:text-slate-400 mt-1 font-medium">Sandwich attacks steal your slippage tolerance, costing you money.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 rounded-[2.5rem] bg-slate-800 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Shield className="w-48 h-48 text-white" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-blue-400" />
                    Axi Protocol
                  </h3>
                  <div className="space-y-8 mb-10">
                    <div className="flex gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 shadow-sm backdrop-blur-sm">
                        <CheckCircle2 className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Encrypted Intents</p>
                        <p className="text-base text-slate-300 mt-1 font-medium">Your swap parameters are mathematically hidden inside the enclave.</p>
                      </div>
                    </div>
                    <div className="flex gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 shadow-sm backdrop-blur-sm">
                        <CheckCircle2 className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Zero Slippage</p>
                        <p className="text-base text-slate-300 mt-1 font-medium">Internal batch matching ensures exact price execution.</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <SwapPrivacyBreakdown />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Live Statistics ────────────────────────────────────── */}
        <section className="py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Protocol Statistics</h2>
              <Link href="/dashboard" className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-2 transition-colors mt-4 md:mt-0">
                View Full Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Total Intents Processed", value: stats.totalIntents.toString() },
                { label: "Batches Settled", value: stats.totalBatches.toString() },
                { label: "MEV Prevented (ETH)", value: parseFloat(formatEther(stats.mevSaved)).toFixed(4) },
              ].map((stat, i) => (
                <div key={i} className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-5xl font-bold tracking-tighter text-slate-800 dark:text-slate-100">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400"><Shield className="w-4 h-4"/></div>
              Axi Protocol
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
              <a href="https://docs.iex.ec" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 dark:hover:text-slate-100 transition-colors">
                Documentation
              </a>
              <a href="#" className="hover:text-slate-800 dark:hover:text-slate-100 transition-colors">
                GitHub
              </a>
              <a href="#" className="hover:text-slate-800 dark:hover:text-slate-100 transition-colors">
                Discord
              </a>
              <a href="#" className="hover:text-slate-800 dark:hover:text-slate-100 transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Basic animations for hero section */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(15px) rotate(-2deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          50% { transform: translate(-50%, -50%) scale(1.05); opacity: 1; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .perspective-1000 { perspective: 1000px; }
      `}} />
    </div>
  );
}
