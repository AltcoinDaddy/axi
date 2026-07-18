"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Menu, X, LogOut } from "lucide-react";
import { useWallet } from "@/context/WalletContext";

export default function Header() {
  const pathname = usePathname();
  const { account, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/swap", label: "Swap" },
    { href: "/vault", label: "Vault" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/batches", label: "Batches" },
  ];

  // Removed local connectWallet and useEffect because it's now in WalletContext

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[hsl(var(--axi-border)/0.3)]">
      <div className="backdrop-blur-xl bg-[hsl(var(--axi-bg)/0.8)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Shield className="w-8 h-8 text-[hsl(var(--axi-primary))] shield-pulse" />
                <div className="absolute inset-0 bg-[hsl(var(--axi-primary)/0.2)] rounded-full blur-xl group-hover:bg-[hsl(var(--axi-primary)/0.3)] transition-all" />
              </div>
              <span className="text-xl font-bold">
                <span className="glow-text">Axi</span>
              </span>
              <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--axi-primary)/0.15)] text-[hsl(var(--axi-primary))] border border-[hsl(var(--axi-primary)/0.3)] font-medium">
                Sepolia
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === link.href
                      ? "bg-[hsl(var(--axi-primary)/0.15)] text-[hsl(var(--axi-primary))] border border-[hsl(var(--axi-primary)/0.3)]"
                      : "text-[hsl(var(--axi-text-muted))] hover:text-[hsl(var(--axi-text))] hover:bg-[hsl(var(--axi-bg-card))]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Wallet Connect */}
            <div className="flex items-center gap-3">
              {account ? (
                <div className="flex items-center gap-2 bg-[hsl(var(--axi-bg-card))] px-3 py-1.5 rounded-lg border border-[hsl(var(--axi-border)/0.5)]">
                  <div className="status-dot bg-[hsl(var(--axi-success))]" />
                  <span className="text-sm font-mono text-[hsl(var(--axi-text-muted))]">
                    {truncateAddress(account)}
                  </span>
                  <button 
                    onClick={disconnectWallet}
                    className="ml-2 text-[hsl(var(--axi-text-muted))] hover:text-red-400 transition-colors"
                    title="Disconnect Wallet"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="axi-button text-sm"
                >
                  <span>
                    {isConnecting ? "Connecting..." : "Connect Wallet"}
                  </span>
                </button>
              )}

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 text-[hsl(var(--axi-text-muted))]"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[hsl(var(--axi-border)/0.3)] backdrop-blur-xl bg-[hsl(var(--axi-bg)/0.95)]">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "bg-[hsl(var(--axi-primary)/0.15)] text-[hsl(var(--axi-primary))]"
                    : "text-[hsl(var(--axi-text-muted))]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
