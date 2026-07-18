"use client";

import { useState } from "react";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
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
    <div className="glass-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isEncrypted
                ? "bg-[hsl(var(--axi-success)/0.15)]"
                : "bg-[hsl(var(--axi-warning)/0.15)]"
            }`}
          >
            {isEncrypted ? (
              <Lock className="w-5 h-5 text-[hsl(var(--axi-success))]" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-[hsl(var(--axi-warning))]" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium">
              {label || (isEncrypted ? "Encrypted" : "Public")}
            </p>
            <p className="text-xs text-[hsl(var(--axi-text-muted))]">
              {isEncrypted
                ? "Hidden from public view via Nox"
                : "Visible on-chain"}
            </p>
          </div>
        </div>

        {details && details.length > 0 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-1.5 rounded-lg hover:bg-[hsl(var(--axi-bg-card))] transition-colors"
          >
            {showDetails ? (
              <EyeOff className="w-4 h-4 text-[hsl(var(--axi-text-muted))]" />
            ) : (
              <Eye className="w-4 h-4 text-[hsl(var(--axi-text-muted))]" />
            )}
          </button>
        )}
      </div>

      {showDetails && details && (
        <div className="mt-3 pt-3 border-t border-[hsl(var(--axi-border)/0.3)]">
          <p className="text-xs font-medium text-[hsl(var(--axi-text-muted))] mb-2">
            Privacy Breakdown
          </p>
          <div className="space-y-1.5">
            {details.map((detail, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                {detail.startsWith("✅") ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(var(--axi-success))] shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-[hsl(var(--axi-warning))] shrink-0" />
                )}
                <span className="text-[hsl(var(--axi-text-muted))]">
                  {detail.replace(/^[✅⚠️]\s*/, "")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SwapPrivacyBreakdown() {
  return (
    <PrivacyIndicator
      isEncrypted={true}
      label="Shielded Swap"
      details={[
        "✅ Swap amount — encrypted via Nox",
        "✅ Strategy / timing — hidden in batch",
        "✅ Individual output — encrypted",
        "⚠️ Token pair — visible (required for matching)",
        "⚠️ Batch total — visible on Uniswap",
      ]}
    />
  );
}

export function VaultPrivacyBreakdown() {
  return (
    <PrivacyIndicator
      isEncrypted={true}
      label="Encrypted Balance"
      details={[
        "✅ Your balance — encrypted (euint256)",
        "✅ Only you can decrypt via Nox SDK",
        "⚠️ Deposit amount — briefly public during ERC-20 transfer",
        "✅ Post-deposit — fully encrypted",
      ]}
    />
  );
}
