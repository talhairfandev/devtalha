"use client";

import Image from "next/image";
import { FileVideo, ImagePlus, Link2, Loader2, Plus, RefreshCw, Trash2, Undo2, UploadCloud, X } from "lucide-react";
import { useId, useState, type ChangeEvent, type DragEvent } from "react";

import { ConfirmModal } from "@/app/admin/components/ConfirmModal";
import { formatBytes, MAX_UPLOAD_BYTES, validateMediaFile, type MediaKind } from "@/lib/admin/fieldRules";
import {
  deleteStoredMedia,
  isManagedPortfolioMediaUrl,
  isPendingUploadValue,
  type PendingUploadValue,
} from "@/lib/admin/uploads";
import { isVideoUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

type Notify = (type: "success" | "error", message: string) => void;

const ACCEPT: Record<MediaKind, string> = {
  image: "image/*",
  video: "video/*",
  media: "image/*,video/*",
};

const KIND_HINT: Record<MediaKind, string> = {
  image: "Images",
  video: "Videos",
  media: "Images or videos",
};

function makePending(file: File, originalUrl?: string): PendingUploadValue {
  return {
    __type: "pending-upload",
    file,
    previewUrl: URL.createObjectURL(file),
    originalUrl: originalUrl || undefined,
  };
}

function releasePending(value: unknown) {
  if (isPendingUploadValue(value)) URL.revokeObjectURL(value.previewUrl);
}

function describeUrl(url: string) {
  if (isManagedPortfolioMediaUrl(url)) return "Stored in your media bucket";
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/** Drag-over state that doesn't flicker when moving across child elements. */
function useDropTarget(onFiles: (files: File[]) => void) {
  const [dragging, setDragging] = useState(false);

  return {
    dragging,
    handlers: {
      onDragOver: (event: DragEvent) => {
        if (!event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        if (!dragging) setDragging(true);
      },
      onDragLeave: (event: DragEvent) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        setDragging(false);
      },
      onDrop: (event: DragEvent) => {
        event.preventDefault();
        setDragging(false);
        const files = Array.from(event.dataTransfer.files ?? []);
        if (files.length > 0) onFiles(files);
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Single media value
// ---------------------------------------------------------------------------

type MediaFieldProps = {
  id?: string;
  kind: MediaKind;
  value: unknown;
  onChange: (next: unknown) => void;
  label: string;
  placeholder?: string;
  notify?: Notify;
  /** Smaller preview for use inside lists */
  compact?: boolean;
};

export function MediaField({ id, kind, value, onChange, label, placeholder, notify, compact = false }: MediaFieldProps) {
  const fileInputId = useId();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const pending = isPendingUploadValue(value) ? value : null;
  const storedUrl = pending ? pending.originalUrl ?? "" : typeof value === "string" ? value.trim() : "";
  const previewUrl = pending ? pending.previewUrl : storedUrl;
  const isVideo = pending ? pending.file.type.startsWith("video/") : isVideoUrl(storedUrl);
  const canDeleteStored = !pending && isManagedPortfolioMediaUrl(storedUrl);

  const selectFile = (file: File) => {
    const problem = validateMediaFile(file, kind);
    if (problem) {
      notify?.("error", problem);
      return;
    }
    releasePending(value);
    onChange(makePending(file, storedUrl));
  };

  const drop = useDropTarget((files) => selectFile(files[0]));

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) selectFile(file);
  };

  const undoSelection = () => {
    if (!pending) return;
    releasePending(pending);
    onChange(pending.originalUrl ?? "");
  };

  const clearValue = () => {
    releasePending(value);
    onChange("");
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    setDeleting(true);
    try {
      await deleteStoredMedia(storedUrl);
      onChange("");
      notify?.("success", `${label} deleted from storage`);
    } catch (error) {
      notify?.("error", error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const fileInput = (
    <input id={fileInputId} type="file" accept={ACCEPT[kind]} onChange={handleInput} className="sr-only" />
  );

  const smallButton =
    "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors disabled:opacity-50";

  return (
    <div className="space-y-2">
      {previewUrl ? (
        <div
          {...drop.handlers}
          className={cn(
            "overflow-hidden rounded-xl border bg-white transition-colors",
            drop.dragging ? "border-zinc-900 ring-2 ring-zinc-900/10" : "border-zinc-200"
          )}
        >
          <div className={cn("relative w-full bg-zinc-100", compact ? "aspect-[16/10]" : "aspect-video max-h-72")}>
            {isVideo ? (
              <video
                key={previewUrl}
                src={previewUrl}
                muted
                loop
                playsInline
                controls
                preload="metadata"
                className="absolute inset-0 h-full w-full bg-black object-contain"
              />
            ) : (
              <Image
                src={previewUrl}
                alt={`${label} preview`}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 640px"
                className="object-cover"
              />
            )}

            {pending ? (
              <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                Uploads on save
              </span>
            ) : null}

            {drop.dragging ? (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/60 text-sm font-semibold text-white">
                Drop to replace
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 px-3 py-2">
            <p className="min-w-0 flex-1 truncate text-xs text-zinc-600">
              {isVideo ? <FileVideo size={12} className="mr-1 inline -mt-0.5" /> : null}
              {pending ? (
                <>
                  <span className="font-medium text-zinc-800">{pending.file.name}</span>
                  <span className="text-zinc-400"> · {formatBytes(pending.file.size)}</span>
                </>
              ) : (
                describeUrl(storedUrl)
              )}
            </p>

            <div className="flex shrink-0 items-center gap-1">
              <label htmlFor={fileInputId} className={cn(smallButton, "cursor-pointer text-zinc-700 hover:bg-zinc-100 focus-within:ring-2 focus-within:ring-zinc-900/20")}>
                <RefreshCw size={13} />
                Replace
                {fileInput}
              </label>
              {pending ? (
                <button type="button" onClick={undoSelection} className={cn(smallButton, "text-zinc-700 hover:bg-zinc-100")}>
                  <Undo2 size={13} />
                  Undo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={clearValue}
                  title="Remove from this field (the stored file is kept)"
                  className={cn(smallButton, "text-zinc-700 hover:bg-zinc-100")}
                >
                  <X size={13} />
                  Remove
                </button>
              )}
              {canDeleteStored ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  disabled={deleting}
                  title="Delete the file from storage"
                  className={cn(smallButton, "text-red-600 hover:bg-red-50")}
                >
                  {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  <span className="hidden sm:inline">Delete file</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <label
          htmlFor={fileInputId}
          {...drop.handlers}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 text-center transition-colors focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-zinc-900/10",
            compact ? "py-6" : "py-9",
            drop.dragging
              ? "border-zinc-900 bg-zinc-100"
              : "border-zinc-300 bg-zinc-50/60 hover:border-zinc-400 hover:bg-zinc-50"
          )}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-500 shadow-sm ring-1 ring-zinc-200">
            {kind === "video" ? <FileVideo size={18} /> : <UploadCloud size={18} />}
          </span>
          <span className="text-sm text-zinc-700">
            {drop.dragging ? "Drop to upload" : <>Drop a file here or <span className="font-semibold text-zinc-900 underline underline-offset-2">browse</span></>}
          </span>
          <span className="text-[11px] text-zinc-500">
            {KIND_HINT[kind]} up to {formatBytes(MAX_UPLOAD_BYTES)}
          </span>
          {fileInput}
        </label>
      )}

      {/* Optional external URL */}
      <div className="relative">
        <Link2 size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          id={id}
          type="url"
          inputMode="url"
          value={pending ? "" : storedUrl}
          onChange={(event) => {
            releasePending(value);
            onChange(event.target.value);
          }}
          placeholder={pending ? "Clear the selected file to use a URL" : placeholder ?? "or paste a URL"}
          disabled={Boolean(pending)}
          className="block h-9 w-full min-w-0 rounded-lg border border-zinc-200 bg-white pl-8 pr-3 text-xs text-zinc-800 placeholder:text-zinc-400 transition-colors hover:border-zinc-300 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 disabled:bg-zinc-50"
        />
      </div>

      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete file from storage?"
        message="This permanently removes the file from your media bucket. Anything else using this URL will break."
        confirmText="Delete file"
        imagesToPurge={storedUrl && !isVideo ? [storedUrl] : []}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// List of media values
// ---------------------------------------------------------------------------

type MediaListFieldProps = {
  id?: string;
  kind: MediaKind;
  value: unknown;
  onChange: (next: unknown[]) => void;
  label: string;
  notify?: Notify;
};

export function MediaListField({ id, kind, value, onChange, label, notify }: MediaListFieldProps) {
  const inputId = useId();
  const list = Array.isArray(value) ? value : [];

  const addFiles = (files: File[]) => {
    const accepted: PendingUploadValue[] = [];
    for (const file of files) {
      const problem = validateMediaFile(file, kind);
      if (problem) notify?.("error", problem);
      else accepted.push(makePending(file));
    }
    if (accepted.length > 0) onChange([...list, ...accepted]);
  };

  const drop = useDropTarget(addFiles);

  const updateItem = (index: number, next: unknown) => onChange(list.map((item, i) => (i === index ? next : item)));

  const removeItem = (index: number) => {
    releasePending(list[index]);
    onChange(list.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {list.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {list.map((item, index) => (
            <div key={`${label}-${index}`} className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-2.5">
              <div className="mb-2 flex items-center justify-between px-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                  {label} {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  aria-label={`Remove ${label} ${index + 1}`}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <X size={14} />
                </button>
              </div>
              <MediaField
                id={index === 0 ? id : undefined}
                kind={kind}
                value={item}
                onChange={(next) => updateItem(index, next)}
                label={`${label} ${index + 1}`}
                notify={notify}
                compact
              />
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <label
          htmlFor={inputId}
          {...drop.handlers}
          className={cn(
            "flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-2.5 text-xs font-semibold transition-colors focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-zinc-900/10",
            drop.dragging
              ? "border-zinc-900 bg-zinc-100 text-zinc-900"
              : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
          )}
        >
          <ImagePlus size={15} />
          {drop.dragging ? "Drop to add" : "Add files (or drop several here)"}
          <input
            id={inputId}
            type="file"
            multiple
            accept={ACCEPT[kind]}
            className="sr-only"
           
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              event.target.value = "";
              addFiles(files);
            }}
          />
        </label>
        <button
          type="button"
          onClick={() => onChange([...list, ""])}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-zinc-300 bg-white px-4 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          <Plus size={14} />
          Add by URL
        </button>
      </div>
    </div>
  );
}
