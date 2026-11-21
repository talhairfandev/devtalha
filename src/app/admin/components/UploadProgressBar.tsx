"use client";

import type { UploadProgress } from "@/lib/admin/uploads";
import { cn } from "@/lib/utils";

export function uploadButtonLabel(progress: UploadProgress | null) {
  if (!progress) return "Saving...";
  return `Uploading ${Math.round(progress.fraction * 100)}%`;
}

/** Thin progress strip with file details, shown while a save is uploading files. */
export function UploadProgressBar({ progress, className }: { progress: UploadProgress | null; className?: string }) {
  if (!progress) return null;
  const percent = Math.round(progress.fraction * 100);

  return (
    <div className={cn("space-y-1.5", className)} role="status" aria-live="polite">
      <div className="flex items-center justify-between gap-3 text-[11px] text-zinc-600">
        <span className="min-w-0 truncate">
          Uploading <span className="font-semibold text-zinc-800">{progress.label}</span>
          {progress.count > 1 ? ` (${progress.index} of ${progress.count})` : ""}
          <span className="text-zinc-400"> · {progress.fileName}</span>
        </span>
        <span className="shrink-0 font-semibold tabular-nums text-zinc-800">{percent}%</span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={`Uploading ${progress.label}`}
      >
        <div className="h-full rounded-full bg-zinc-900 transition-[width] duration-200" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
