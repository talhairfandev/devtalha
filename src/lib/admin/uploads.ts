import type { FieldConfig, SectionRecord } from "@/lib/admin/types";
import { supabase } from "@/lib/supabase";

const PORTFOLIO_MEDIA_BUCKET = "portfolio-images";

export function getManagedStoragePathFromUrl(url: string) {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return null;

  try {
    const parsed = new URL(trimmedUrl);
    const prefix = `/storage/v1/object/public/${PORTFOLIO_MEDIA_BUCKET}/`;

    if (!parsed.pathname.startsWith(prefix)) {
      return null;
    }

    const objectPath = decodeURIComponent(parsed.pathname.slice(prefix.length));
    return objectPath.trim() ? objectPath : null;
  } catch {
    return null;
  }
}

export function isManagedPortfolioMediaUrl(url: string) {
  return Boolean(getManagedStoragePathFromUrl(url));
}

/** @deprecated Use isManagedPortfolioMediaUrl */
export const isManagedPortfolioImageUrl = isManagedPortfolioMediaUrl;

export type PendingUploadValue = {
  __type: "pending-upload";
  file: File;
  previewUrl: string;
  originalUrl?: string;
};

export function isPendingUploadValue(value: unknown): value is PendingUploadValue {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as { __type?: unknown; file?: unknown; previewUrl?: unknown };
  return (
    candidate.__type === "pending-upload" &&
    typeof File !== "undefined" &&
    candidate.file instanceof File &&
    typeof candidate.previewUrl === "string"
  );
}

export type UploadProgress = {
  /** Field label, e.g. "Main Media" */
  label: string;
  fileName: string;
  /** 1-based position among all files being uploaded in this save */
  index: number;
  count: number;
  /** 0..1 for the current file */
  fraction: number;
};

type ProgressCallback = (progress: UploadProgress) => void;

/**
 * PUTs the file to the signed upload URL with XHR so we get upload progress.
 * Mirrors what supabase-js `uploadToSignedUrl` sends for Blob bodies.
 */
function putWithProgress(path: string, token: string, file: File, onProgress: (fraction: number) => void) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const objectPath = path.split("/").map(encodeURIComponent).join("/");
  const url = `${baseUrl}/storage/v1/object/upload/sign/${PORTFOLIO_MEDIA_BUCKET}/${objectPath}?token=${encodeURIComponent(token)}`;

  const body = new FormData();
  body.append("cacheControl", "3600");
  body.append("", file);

  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("apikey", anonKey);
    xhr.setRequestHeader("Authorization", `Bearer ${anonKey}`);
    xhr.setRequestHeader("x-upsert", "false");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(1);
        resolve();
        return;
      }
      let message = `Upload failed (${xhr.status})`;
      try {
        const parsed = JSON.parse(xhr.responseText) as { message?: string; error?: string };
        message = parsed.message || parsed.error || message;
      } catch {
        // keep default message
      }
      reject(Object.assign(new Error(message), { status: xhr.status }));
    };
    xhr.onerror = () => reject(Object.assign(new Error("Network error during upload"), { status: 0 }));
    xhr.send(body);
  });
}

/**
 * Uploads directly to Supabase Storage using a short-lived signed URL, so
 * large files never go through the Next.js server.
 */
async function uploadFile(file: File, onProgress: (fraction: number) => void = () => {}) {
  const signRes = await fetch("/api/admin/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, contentType: file.type, size: file.size }),
  });

  const signed = (await signRes.json().catch(() => null)) as
    | { path?: string; token?: string; publicUrl?: string; error?: string }
    | null;

  if (!signRes.ok) {
    throw new Error(signed?.error ?? "Could not start upload");
  }

  if (!signed?.path || !signed.token || !signed.publicUrl) {
    throw new Error("Upload response was incomplete");
  }

  try {
    await putWithProgress(signed.path, signed.token, file, onProgress);
  } catch (error) {
    const status = (error as { status?: number }).status ?? 0;
    const message = error instanceof Error ? error.message : "";
    // A file that is too big will fail the same way in the fallback, so surface it directly.
    if (status === 413 || /exceed|too large|maximum allowed size/i.test(message)) throw error;

    // Anything else: retry once with the official client (no progress events).
    const { error: fallbackError } = await supabase.storage
      .from(PORTFOLIO_MEDIA_BUCKET)
      .uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type });
    if (fallbackError) throw new Error(fallbackError.message || "Upload failed");
    onProgress(1);
  }

  return signed.publicUrl;
}
export async function deleteStoredMedia(url: string) {
  const res = await fetch("/api/admin/upload", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  const payload = (await res.json().catch(() => null)) as { error?: string } | null;

  if (!res.ok) {
    throw new Error(payload?.error ?? "Delete failed");
  }
}

/** @deprecated Use deleteStoredMedia */
export const deleteStoredImage = deleteStoredMedia;

/** Field types that resolve a single pending upload */
const SINGLE_MEDIA_TYPES = new Set(["image", "video", "media"]);

/** Field types that resolve a list of pending uploads */
const LIST_MEDIA_TYPES = new Set(["image-list", "media-list"]);

function countPendingUploads(data: SectionRecord, fields: FieldConfig[]) {
  let count = 0;
  for (const field of fields) {
    const value = data[field.key];
    if (SINGLE_MEDIA_TYPES.has(field.type) && isPendingUploadValue(value)) count += 1;
    if (LIST_MEDIA_TYPES.has(field.type) && Array.isArray(value)) {
      count += value.filter((item) => isPendingUploadValue(item)).length;
    }
  }
  return count;
}

export async function resolvePendingUploads(data: SectionRecord, fields: FieldConfig[], onProgress?: ProgressCallback) {
  const next: SectionRecord = { ...data };
  const count = countPendingUploads(data, fields);
  let index = 0;

  const upload = async (file: File, label: string) => {
    index += 1;
    const position = index;
    onProgress?.({ label, fileName: file.name, index: position, count, fraction: 0 });
    try {
      return await uploadFile(file, (fraction) =>
        onProgress?.({ label, fileName: file.name, index: position, count, fraction })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      throw new Error(`${label}: ${message}`);
    }
  };

  for (const field of fields) {
    const value = next[field.key];

    if (SINGLE_MEDIA_TYPES.has(field.type) && isPendingUploadValue(value)) {
      try {
        next[field.key] = await upload(value.file, field.label);
      } finally {
        URL.revokeObjectURL(value.previewUrl);
      }
      continue;
    }

    if (LIST_MEDIA_TYPES.has(field.type) && Array.isArray(value)) {
      const resolvedList: string[] = [];

      for (const item of value) {
        if (isPendingUploadValue(item)) {
          try {
            resolvedList.push(await upload(item.file, field.label));
          } finally {
            URL.revokeObjectURL(item.previewUrl);
          }
        } else {
          const url = String(item ?? "").trim();
          if (url) resolvedList.push(url);
        }
      }

      next[field.key] = resolvedList;
    }
  }

  return next;
}
export function getRecordStorageMedia(record: unknown): string[] {
  const urls: string[] = [];
  const scan = (val: unknown) => {
    if (typeof val === "string") {
      if (isManagedPortfolioMediaUrl(val)) {
        urls.push(val);
      }
    } else if (Array.isArray(val)) {
      val.forEach(scan);
    } else if (val && typeof val === "object") {
      Object.values(val).forEach(scan);
    }
  };
  scan(record);
  return urls;
}

/** @deprecated Use getRecordStorageMedia */
export const getRecordStorageImages = getRecordStorageMedia;
