"use client";

import { Clock, CheckCircle2, Layers, Zap, XCircle } from "lucide-react";
import { IntentStatus, INTENT_STATUS_LABELS } from "@/lib/constants";

interface IntentStatusProps {
  status: IntentStatus;
  batchId?: number;
  intentId: number;
}

export default function IntentStatusDisplay({
  status,
  batchId,
  intentId,
}: IntentStatusProps) {
  const steps = [
    {
      label: "Submitted",
      icon: Clock,
      status: IntentStatus.PENDING,
      description: "Encrypted intent in queue",
    },
    {
      label: "Batched",
      icon: Layers,
      status: IntentStatus.BATCHED,
      description: "Grouped with compatible intents",
    },
    {
      label: "Executed",
      icon: Zap,
      status: IntentStatus.EXECUTED,
      description: "Swap completed on-chain",
    },
    {
      label: "Settled",
      icon: CheckCircle2,
      status: IntentStatus.EXECUTED,
      description: "Output tokens distributed",
    },
  ];

  const isCancelled = status === IntentStatus.CANCELLED;
  const isExpired = status === IntentStatus.EXPIRED;

  const currentStepIndex =
    status === IntentStatus.PENDING
      ? 0
      : status === IntentStatus.BATCHED
      ? 1
      : status === IntentStatus.EXECUTED
      ? 3
      : 0;

  if (isCancelled || isExpired) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[hsl(var(--axi-danger)/0.15)]">
            <XCircle className="w-5 h-5 text-[hsl(var(--axi-danger))]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[hsl(var(--axi-danger))]">
              Intent #{intentId} — {isCancelled ? "Cancelled" : "Expired"}
            </p>
            <p className="text-xs text-[hsl(var(--axi-text-muted))]">
              {isCancelled
                ? "This intent was cancelled by the user"
                : "This intent expired before being batched"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium">
          Intent #{intentId}
          {batchId !== undefined && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--axi-secondary)/0.15)] text-[hsl(var(--axi-secondary))]">
              Batch #{batchId}
            </span>
          )}
        </p>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            status === IntentStatus.PENDING
              ? "bg-amber-500/15 text-amber-400"
              : status === IntentStatus.BATCHED
              ? "bg-blue-500/15 text-blue-400"
              : "bg-emerald-500/15 text-emerald-400"
          }`}
        >
          {INTENT_STATUS_LABELS[status]}
        </span>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-0">
        {steps.map((step, index) => {
          const isActive = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const StepIcon = step.icon;

          return (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`relative p-1.5 rounded-full transition-all ${
                    isCurrent
                      ? "bg-[hsl(var(--axi-primary)/0.2)] ring-2 ring-[hsl(var(--axi-primary)/0.4)]"
                      : isActive
                      ? "bg-[hsl(var(--axi-success)/0.15)]"
                      : "bg-[hsl(var(--axi-bg))]"
                  }`}
                >
                  <StepIcon
                    className={`w-4 h-4 ${
                      isCurrent
                        ? "text-[hsl(var(--axi-primary))]"
                        : isActive
                        ? "text-[hsl(var(--axi-success))]"
                        : "text-[hsl(var(--axi-text-muted)/0.4)]"
                    }`}
                  />
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full bg-[hsl(var(--axi-primary)/0.2)] animate-ping" />
                  )}
                </div>
                <p
                  className={`text-[10px] mt-1 text-center ${
                    isActive
                      ? "text-[hsl(var(--axi-text))]"
                      : "text-[hsl(var(--axi-text-muted)/0.4)]"
                  }`}
                >
                  {step.label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 rounded-full transition-all ${
                    index < currentStepIndex
                      ? "bg-[hsl(var(--axi-success))]"
                      : "bg-[hsl(var(--axi-border))]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
