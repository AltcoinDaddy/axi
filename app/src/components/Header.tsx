"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Menu, X, LogOut, ChevronRight, Sun, Moon } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { useTheme } from "next-themes";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
      title="Toggle theme"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export default function Header() {
  const pathname = usePathname();
  const { account, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/swap", label: "Swap" },
    { href: "/vault", label: "Vault" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/batches", label: "Batches" },
  ];

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-background/90 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.02)]" 
          : "bg-transparent border-transparent py-2"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group transition-opacity hover:opacity-80">
            <div className="p-2 rounded-full bg-primary text-primary-foreground shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Axi
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Wallet Connect & Theme Toggle */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {account ? (
              <div className="flex items-center gap-0 bg-card border rounded-full p-1 pl-3 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-semibold text-foreground ml-2 mr-3">
                  {truncateAddress(account)}
                </span>
                <button 
                  onClick={disconnectWallet}
                  className="p-2 rounded-full text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  title="Disconnect Wallet"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 text-sm font-semibold rounded-full shadow-sm transition-all hover:shadow-md disabled:opacity-50"
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-foreground rounded-full hover:bg-secondary transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div 
        className={`md:hidden absolute top-full left-0 right-0 border-b bg-background/95 backdrop-blur-md transition-all duration-300 ease-in-out origin-top ${
          isMenuOpen ? "opacity-100 scale-y-100 shadow-sm" : "opacity-0 scale-y-0 pointer-events-none"
        }`}
      >
        <nav className="p-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-2xl transition-colors ${
                pathname === link.href
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              }`}
            >
              {link.label}
              <ChevronRight className="w-4 h-4 opacity-50" />
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
