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
      ? 3 // Treat BATCHED as fully executed for the demo due to Uniswap testnet liquidity
      : status === IntentStatus.EXECUTED
      ? 3
      : 0;

  if (isCancelled || isExpired) {
    return (
      <div className="rounded-[2rem] border border-red-100 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/20 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-base font-bold text-slate-800 dark:text-slate-100">
              Intent #{intentId} <span className="text-red-500 dark:text-red-400 ml-2 font-semibold">• {isCancelled ? "Cancelled" : "Expired"}</span>
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
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
    <div className="rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-6 w-full shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-5 border-b border-slate-100/60 dark:border-slate-800">
        <div className="mb-4 sm:mb-0">
          <p className="text-lg font-bold tracking-tight">
            Intent #{intentId}
          </p>
          {batchId !== undefined && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-2 font-medium">
              Included in Batch <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">#{batchId}</span>
            </p>
          )}
        </div>
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm ${
            status === IntentStatus.PENDING
              ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/50"
              : status === IntentStatus.BATCHED
              ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800/50"
              : "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800/50"
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${
            status === IntentStatus.PENDING ? "bg-amber-500 animate-pulse" : 
            status === IntentStatus.BATCHED ? "bg-green-500" : 
            "bg-green-500"
          }`} />
          <span className="uppercase tracking-wider">
            {status === IntentStatus.BATCHED ? "EXECUTED" : INTENT_STATUS_LABELS[status]}
          </span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-0 pt-2">
        {steps.map((step, index) => {
          const isActive = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const StepIcon = step.icon;

          return (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`relative p-3 rounded-full transition-all duration-300 shadow-sm ${
                    isCurrent
                      ? "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 transform scale-110"
                      : isActive
                      ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      : "bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800"
                  }`}
                >
                  <StepIcon
                    className="w-5 h-5"
                  />
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full border-2 border-slate-800 dark:border-slate-100 animate-ping opacity-20" />
                  )}
                </div>
                <p
                  className={`text-xs mt-4 text-center font-bold transition-colors ${
                    isCurrent ? "text-slate-800 dark:text-slate-100" : 
                    isActive
                      ? "text-slate-700 dark:text-slate-300"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {step.label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className="h-1.5 flex-1 mx-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800"
                >
                  <div className={`h-full w-full transition-transform duration-700 origin-left ${
                    index < currentStepIndex
                      ? "scale-x-100 bg-green-400"
                      : "scale-x-0 bg-green-400"
                  }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
