import type { FieldConfig, SectionRecord } from "@/lib/admin/types";
import { isPendingUploadValue } from "@/lib/admin/uploads";

/** Must match MAX_UPLOAD_BYTES in src/app/api/admin/upload/sign/route.ts */
export const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

export function isFieldVisible(field: FieldConfig, data: SectionRecord) {
  if (!field.showWhen) return true;
  const current = String(data[field.showWhen.key] ?? "");
  const allowed = Array.isArray(field.showWhen.equals) ? field.showWhen.equals : [field.showWhen.equals];
  return allowed.includes(current);
}

function isEmptyValue(value: unknown) {
  if (isPendingUploadValue(value)) return false;
  if (Array.isArray(value)) return value.length === 0;
  return String(value ?? "").trim() === "";
}

/** Labels of visible required fields that are empty. */
export function getMissingRequiredFields(fields: FieldConfig[], data: SectionRecord) {
  return fields
    .filter((field) => field.required && isFieldVisible(field, data) && isEmptyValue(data[field.key]))
    .map((field) => field.label);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Accepts full URLs, on-page anchors, site paths, mailto: and tel: links. */
export function isValidLink(value: string) {
  return /^(#|\/(?!\/)|mailto:|tel:)/i.test(value) || isHttpUrl(value);
}

/** Returns a message when a non-empty value doesn't match the expected format. */
export function getFormatError(format: FieldConfig["format"], raw: unknown): string | null {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!format || !value) return null;
  if (format === "email" && !EMAIL_RE.test(value)) return "Enter a valid email address, e.g. hello@example.com.";
  if (format === "url" && !isHttpUrl(value)) return "Enter a full URL starting with https://";
  if (format === "link" && !isValidLink(value)) return "Use a full URL (https://...), an anchor like #contact, or a path like /projects.";
  return null;
}

/** Visible fields whose current value has a format problem: label -> message. */
export function getFormatErrors(fields: FieldConfig[], data: SectionRecord) {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    if (!isFieldVisible(field, data)) continue;
    const message = getFormatError(field.format, data[field.key]);
    if (message) errors[field.label] = message;
  }
  return errors;
}

/** Social rows with a bad link: returns how many. */
export function countInvalidSocialLinks(fields: FieldConfig[], data: SectionRecord) {
  let invalid = 0;
  for (const field of fields) {
    if (field.type !== "socials" || !isFieldVisible(field, data)) continue;
    const list = Array.isArray(data[field.key]) ? (data[field.key] as { href?: string }[]) : [];
    invalid += list.filter((item) => {
      const href = String(item?.href ?? "").trim();
      return href !== "" && href !== "#" && !isValidLink(href);
    }).length;
  }
  return invalid;
}

/** One combined check used before saving. Returns a toast message or null. */
export function getSaveBlocker(fields: FieldConfig[], data: SectionRecord): string | null {
  const missing = getMissingRequiredFields(fields, data);
  if (missing.length > 0) return `Please fill in: ${missing.join(", ")}`;
  const formatErrors = Object.keys(getFormatErrors(fields, data));
  if (formatErrors.length > 0) return `Please fix: ${formatErrors.join(", ")}`;
  const badSocials = countInvalidSocialLinks(fields, data);
  if (badSocials > 0) return `Please fix ${badSocials} social link${badSocials === 1 ? "" : "s"}.`;
  return null;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export type MediaKind = "image" | "video" | "media";

/** Returns an error message, or null when the file is acceptable. */
export function validateMediaFile(file: File, kind: MediaKind): string | null {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");

  if (kind === "image" && !isImage) return `"${file.name}" is not an image file.`;
  if (kind === "video" && !isVideo) return `"${file.name}" is not a video file.`;
  if (kind === "media" && !isImage && !isVideo) return `"${file.name}" must be an image or video.`;

  if (file.size > MAX_UPLOAD_BYTES) {
    return `"${file.name}" is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_UPLOAD_BYTES)}.`;
  }

  return null;
}

/** Stable comparison for dirty checks (ignores key order differences from the API). */
export function isSameRecord(a: SectionRecord | null, b: SectionRecord | null) {
  return JSON.stringify(a) === JSON.stringify(b);
}
