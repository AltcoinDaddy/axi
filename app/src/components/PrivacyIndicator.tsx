"use client";

import { useState } from "react";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

interface PrivacyIndicatorProps {
  isEncrypted: boolean;
  label?: string;
  details?: string[];
}

export default function PrivacyIndicator({
  isEncrypted,
  label,
  details,
}: PrivacyIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`rounded-[2rem] border transition-all duration-300 shadow-sm overflow-hidden ${
      isEncrypted 
        ? "bg-slate-50 border-slate-100 hover:border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 dark:hover:border-slate-700"
        : "bg-amber-50 border-amber-100 hover:border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/50 dark:hover:border-amber-700/50"
    }`}>
      <div 
        className="flex items-start justify-between cursor-pointer p-6 group" 
        onClick={() => details && setShowDetails(!showDetails)}
      >
        <div className="flex items-center gap-4">
          <div
            className={`p-3 rounded-2xl border shadow-sm ${
              isEncrypted
                ? "bg-white border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                : "bg-white border-amber-200 text-amber-600 dark:bg-amber-900/30 dark:border-amber-800/50 dark:text-amber-400"
            }`}
          >
            {isEncrypted ? (
              <Lock className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
              {label || (isEncrypted ? "Encrypted" : "Public")}
              {isEncrypted && <Shield className="w-4 h-4 text-blue-400 opacity-80" />}
            </p>
            <p className="text-sm font-medium mt-1 text-slate-500 dark:text-slate-400">
              {isEncrypted
                ? "Secured by Nox TEE"
                : "Visible on-chain"}
            </p>
          </div>
        </div>

        {details && details.length > 0 && (
          <button
            className="p-2 rounded-full transition-colors backdrop-blur-sm bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showDetails ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      <div className={`grid transition-all duration-300 ease-in-out ${showDetails ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="p-6 pt-0 border-t mt-1 border-slate-200/60 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-wider mb-4 mt-4 text-slate-400 dark:text-slate-500">
              Privacy Breakdown
            </p>
            <div className="space-y-2.5">
              {details?.map((detail, i) => {
                const isPositive = detail.startsWith("✅");
                const text = detail.replace(/^[✅⚠️]\s*/, "");
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl border text-sm bg-white border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                    {isPositive ? (
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500 dark:text-amber-400" />
                    )}
                    <span className={`font-medium ${
                      isPositive 
                        ? "text-slate-700 dark:text-slate-300" 
                        : "text-slate-500 dark:text-slate-400"
                    }`}>
                      {text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SwapPrivacyBreakdown() {
  return (
    <PrivacyIndicator
      isEncrypted={true}
      label="Shielded Swap Execution"
      details={[
        "✅ Swap amount cryptographically secured via Nox",
        "✅ Strategy / timing obscured within batch",
        "✅ Individual output encrypted on delivery",
        "⚠️ Token pair visible (required for routing)",
        "⚠️ Batch total visible during Uniswap settlement",
      ]}
    />
  );
}

export function VaultPrivacyBreakdown() {
  return (
    <PrivacyIndicator
      isEncrypted={true}
      label="Confidential Balance Vault"
      details={[
        "✅ Balance mathematically encrypted (euint256)",
        "✅ Decryption restricted to your address",
        "⚠️ Deposit amount public during ERC-20 transfer",
        "✅ Post-deposit state fully confidential (ERC-7984)",
      ]}
    />
  );
}
