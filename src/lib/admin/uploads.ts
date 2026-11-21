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

/**
 * Uploads directly to Supabase Storage using a short-lived signed URL, so
 * large files never go through the Next.js server.
 */
async function uploadFile(file: File) {
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

  const { error } = await supabase.storage
    .from(PORTFOLIO_MEDIA_BUCKET)
    .uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type });

  if (error) {
    throw new Error(error.message || "Upload failed");
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

export async function resolvePendingUploads(data: SectionRecord, fields: FieldConfig[]) {
  const next: SectionRecord = { ...data };

  for (const field of fields) {
    const value = next[field.key];

    if (SINGLE_MEDIA_TYPES.has(field.type) && isPendingUploadValue(value)) {
      try {
        const uploadedUrl = await uploadFile(value.file);
        next[field.key] = uploadedUrl;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed";
        throw new Error(`${field.label}: ${message}`);
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
            const uploadedUrl = await uploadFile(item.file);
            resolvedList.push(uploadedUrl);
          } catch (error) {
            const message = error instanceof Error ? error.message : "Upload failed";
            throw new Error(`${field.label}: ${message}`);
          } finally {
            URL.revokeObjectURL(item.previewUrl);
          }
        } else {
          resolvedList.push(String(item ?? ""));
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
