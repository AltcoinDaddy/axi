"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CHAIN } from "@/lib/constants";

interface WalletContextType {
  account: string | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check if disconnected manually
    if (typeof window !== "undefined") {
      const disconnected = localStorage.getItem("wallet_disconnected");
      if (disconnected === "true") {
        return;
      }
    }

    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: unknown) => {
          const accs = accounts as string[];
          if (accs.length > 0) setAccount(accs[0]);
        })
        .catch(console.error);

      const handleAccountsChanged = (...args: unknown[]) => {
        const accounts = args[0] as string[];
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          localStorage.removeItem("wallet_disconnected");
        } else {
          setAccount(null);
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        }
      };
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask to use Axi");
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        localStorage.removeItem("wallet_disconnected");
      }

      // Switch to Sepolia
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${CHAIN.id.toString(16)}` }],
        });
      } catch (switchError: unknown) {
        const err = switchError as { code?: number };
        if (err.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${CHAIN.id.toString(16)}`,
                chainName: CHAIN.name,
                rpcUrls: [CHAIN.rpcUrls.default.http[0]],
                blockExplorerUrls: [CHAIN.blockExplorers?.default.url],
              },
            ],
          });
        }
      }
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    if (typeof window !== "undefined") {
      localStorage.setItem("wallet_disconnected", "true");
    }
  }, []);

  return (
    <WalletContext.Provider value={{ account, isConnecting, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
