"use client";

import { AlertCircle, Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Toast } from "@/lib/admin/types";

type ToastContainerProps = {
  toasts: Toast[];
  onDismiss: (id: number) => void;
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-3 top-3 z-[110] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-4 sm:top-4 sm:w-[360px]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "admin-fade-in pointer-events-auto flex items-center gap-2.5 rounded-xl border bg-white px-3.5 py-3 text-sm shadow-lg",
            toast.type === "success"
              ? "border-emerald-200 text-emerald-800"
              : "border-red-200 text-red-700"
          )}
        >
          {toast.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
          <span className="min-w-0 flex-1 break-words text-sm font-medium">{toast.message}</span>
          <button type="button" aria-label="Dismiss" onClick={() => onDismiss(toast.id)} className="-mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md opacity-50 hover:bg-zinc-100 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
