"use client";

import { Plus, Trash2 } from "lucide-react";

import { MediaField, MediaListField } from "@/app/admin/components/fields/MediaField";
import { fromTextValue, toTextValue } from "@/lib/admin/converters";
import { getFormatError, isValidLink } from "@/lib/admin/fieldRules";
import type { FieldConfig, ScopeItem, SocialItem, StatItem } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type FieldEditorProps = {
  id?: string;
  field: FieldConfig;
  value: unknown;
  onChange: (next: unknown) => void;
  addToast?: (type: "success" | "error", message: string) => void;
};

const addButton =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-300 bg-white px-4 text-xs font-semibold text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50";
const iconButton =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600";
const itemCard = "rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 sm:p-4";
const miniLabel = "mb-1 block text-[11px] font-medium text-zinc-500";

const baseInput =
  "block w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 h-10 text-sm text-zinc-900 placeholder:text-zinc-400 shadow-sm transition-colors hover:border-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10";
const invalidInput = "border-red-300 hover:border-red-400 focus:border-red-500 focus:ring-red-500/15";

/** Character counter shown under text inputs and textareas. */
function CharCount({ length, max }: { length: number; max?: number }) {
  const over = typeof max === "number" && length > max;
  return (
    <span className={cn("tabular-nums", over ? "font-semibold text-amber-600" : "text-zinc-400")}>
      {max ? `${length} / ${max}` : `${length} characters`}
    </span>
  );
}

export function FieldEditor({ id, field, value, onChange, addToast }: FieldEditorProps) {
  const textValue = toTextValue(value, field.type);

  // ---------------------------------------------------------------- stats
  if (field.type === "stats") {
    const list = Array.isArray(value) ? (value as StatItem[]) : [];
    const updateItem = (index: number, next: StatItem) => onChange(list.map((item, i) => (i === index ? next : item)));

    return (
      <div className="space-y-3">
        {list.map((item, index) => (
          <div key={`${field.key}-${index}`} className={itemCard}>
            <div className="grid grid-cols-2 items-end gap-3 lg:grid-cols-[120px_100px_1fr_auto]">
              <label className="min-w-0">
                <span className={miniLabel}>Value</span>
                <input
                  type="number"
                  value={String(item.value ?? 0)}
                  onChange={(event) => updateItem(index, { ...item, value: Number(event.target.value) || 0 })}
                  placeholder="150"
                  className={baseInput}
                />
              </label>
              <label className="min-w-0">
                <span className={miniLabel}>Suffix</span>
                <input
                  type="text"
                  value={item.suffix ?? ""}
                  onChange={(event) => updateItem(index, { ...item, suffix: event.target.value })}
                  placeholder="+ or %"
                  className={baseInput}
                />
              </label>
              <label className="col-span-2 min-w-0 lg:col-span-1">
                <span className={miniLabel}>Label</span>
                <input
                  type="text"
                  value={item.label ?? ""}
                  onChange={(event) => updateItem(index, { ...item, label: event.target.value })}
                  placeholder="Projects delivered"
                  className={baseInput}
                />
              </label>
              <button
                type="button"
                onClick={() => onChange(list.filter((_, i) => i !== index))}
                className={cn(iconButton, "col-span-2 w-full lg:col-span-1 lg:w-10")}
                aria-label={`Remove stat ${index + 1}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...list, { value: 0, suffix: "", label: "" }])} className={addButton}>
          <Plus size={14} />
          Add Stat
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------- socials
  if (field.type === "socials") {
    const list = Array.isArray(value) ? (value as SocialItem[]) : [];
    const updateItem = (index: number, next: SocialItem) => onChange(list.map((item, i) => (i === index ? next : item)));

    return (
      <div className="space-y-3">
        {list.map((item, index) => {
          const href = (item.href ?? "").trim();
          const hrefInvalid = href !== "" && href !== "#" && !isValidLink(href);
          return (
            <div key={`${field.key}-${index}`} className={itemCard}>
              <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[180px_1fr_auto]">
                <label className="min-w-0">
                  <span className={miniLabel}>Platform</span>
                  <input
                    type="text"
                    value={item.name ?? ""}
                    onChange={(event) => updateItem(index, { ...item, name: event.target.value })}
                    placeholder="LinkedIn"
                    className={baseInput}
                  />
                </label>
                <label className="min-w-0">
                  <span className={miniLabel}>Link</span>
                  <input
                    type="url"
                    inputMode="url"
                    value={item.href ?? ""}
                    onChange={(event) => updateItem(index, { ...item, href: event.target.value })}
                    placeholder="https://..."
                    aria-invalid={hrefInvalid}
                    className={cn(baseInput, hrefInvalid && invalidInput)}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => onChange(list.filter((_, i) => i !== index))}
                  className={cn(iconButton, "w-full sm:w-10")}
                  aria-label={`Remove social link ${index + 1}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {hrefInvalid ? (
                <p className="mt-2 text-xs text-red-600">Use a full URL starting with https:// (or mailto:).</p>
              ) : null}
            </div>
          );
        })}
        <button type="button" onClick={() => onChange([...list, { name: "", href: "" }])} className={addButton}>
          <Plus size={14} />
          Add Social Link
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------- scope
  if (field.type === "scope") {
    const list = Array.isArray(value) ? (value as ScopeItem[]) : [];
    const updateItem = (index: number, next: ScopeItem) => onChange(list.map((item, i) => (i === index ? next : item)));

    return (
      <div className="space-y-3">
        {list.map((item, index) => (
          <div key={`${field.key}-${index}`} className={itemCard}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Scope {index + 1}</span>
              <button
                type="button"
                onClick={() => onChange(list.filter((_, i) => i !== index))}
                className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                aria-label={`Remove scope ${index + 1}`}
              >
                <Trash2 size={13} />
                Remove
              </button>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={item.title ?? ""}
                onChange={(event) => updateItem(index, { ...item, title: event.target.value })}
                placeholder="Scope title (e.g. Design, API Architecture)"
                className={baseInput}
              />
              <textarea
                value={item.description ?? ""}
                onChange={(event) => updateItem(index, { ...item, description: event.target.value })}
                placeholder="What was done in this part of the project..."
                rows={3}
                className={cn(baseInput, "h-auto resize-y py-2.5 leading-relaxed")}
              />
            </div>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...list, { title: "", description: "" }])} className={addButton}>
          <Plus size={14} />
          Add Scope Item
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------- string-list
  if (field.type === "string-list") {
    const list = Array.isArray(value) ? value.map((item) => String(item)) : [];
    const updateItem = (index: number, next: string) => onChange(list.map((item, i) => (i === index ? next : item)));

    return (
      <div className="space-y-2.5">
        {list.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {list.map((item, index) => (
              <div
                key={`${field.key}-${index}`}
                className="flex items-center gap-1 rounded-lg border border-zinc-300 bg-white pl-3 pr-1 shadow-sm focus-within:border-zinc-900 focus-within:ring-2 focus-within:ring-zinc-900/10"
              >
                <input
                  type="text"
                  value={item}
                  onChange={(event) => updateItem(index, event.target.value)}
                  placeholder={field.placeholder}
                  size={Math.max(8, item.length + 1)}
                  className="h-9 min-w-0 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => onChange(list.filter((_, i) => i !== index))}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${item || "item"}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <button type="button" onClick={() => onChange([...list, ""])} className={addButton}>
          <Plus size={14} />
          Add Item
        </button>
      </div>
    );
  }

  // ---------------------------------------------------------------- media
  if (field.type === "image" || field.type === "video" || field.type === "media") {
    return (
      <MediaField
        id={id}
        kind={field.type}
        value={value}
        onChange={onChange}
        label={field.label}
        placeholder={field.placeholder}
        notify={addToast}
      />
    );
  }

  if (field.type === "image-list" || field.type === "media-list") {
    return (
      <MediaListField
        id={id}
        kind={field.type === "image-list" ? "image" : "media"}
        value={value}
        onChange={onChange}
        label={field.label}
        notify={addToast}
      />
    );
  }

  // ------------------------------------------------------------- textarea
  if (field.type === "textarea") {
    return (
      <div className="space-y-1">
        <textarea
          id={id}
          value={textValue}
          onChange={(event) => onChange(fromTextValue(event.target.value, field.type))}
          rows={4}
          placeholder={field.placeholder}
          className={cn(baseInput, "h-auto min-h-[110px] resize-y py-2.5 leading-relaxed")}
        />
        <div className="flex justify-end text-[11px]">
          <CharCount length={textValue.length} max={field.maxLength} />
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------- number
  if (field.type === "number") {
    return (
      <input
        id={id}
        type="number"
        inputMode="numeric"
        value={textValue}
        onChange={(event) => onChange(fromTextValue(event.target.value, "number"))}
        className={cn(baseInput, "sm:w-40")}
      />
    );
  }

  // --------------------------------------------------------------- select
  if (field.type === "select") {
    const options = field.options ?? [];

    // Two or three options read better as a segmented control
    if (options.length > 0 && options.length <= 3) {
      return (
        <div
          role="radiogroup"
          aria-labelledby={id ? `${id}-label` : undefined}
          className="grid gap-1 rounded-lg border border-zinc-300 bg-zinc-100 p-1"
          style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
        >
          {options.map((option, index) => {
            const selected = textValue === option.value;
            return (
              <button
                key={option.value}
                id={index === 0 ? id : undefined}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(option.value)}
                className={cn(
                  "h-8 rounded-md px-3 text-xs font-semibold transition-all",
                  selected ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200" : "text-zinc-600 hover:text-zinc-900"
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <select id={id} value={textValue} onChange={(event) => onChange(event.target.value)} className={baseInput}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  // ---------------------------------------------------------------- range
  if (field.type === "range") {
    const min = field.min ?? 0;
    const max = field.max ?? 100;
    const step = field.step ?? 1;
    const numValue = typeof value === "number" ? value : Number(textValue) || 0;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <input
            id={id}
            type="range"
            min={min}
            max={max}
            step={step}
            value={numValue}
            onChange={(event) => onChange(Number(event.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 accent-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          />
          <span className="min-w-[44px] rounded-md bg-zinc-100 px-2 py-1 text-center text-xs font-semibold tabular-nums text-zinc-700">
            {numValue}%
          </span>
        </div>
        {/* Live preview of overlay darkness on a neutral sample */}
        <div className="relative h-14 overflow-hidden rounded-lg border border-zinc-200 bg-[linear-gradient(135deg,#f5d0a9,#c7d2fe_50%,#a7f3d0)]">
          <div className="absolute inset-0 bg-black" style={{ opacity: numValue / 100 }} />
          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold tracking-wide text-white drop-shadow">
            Overlay preview
          </span>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------- text
  const formatError = getFormatError(field.format, textValue);
  const inputType = field.format === "email" ? "email" : field.format === "url" ? "url" : "text";

  return (
    <div className="space-y-1">
      <input
        id={id}
        type={inputType}
        inputMode={field.format === "email" ? "email" : field.format ? "url" : undefined}
        autoComplete={field.format === "email" ? "email" : undefined}
        value={textValue}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        aria-invalid={Boolean(formatError)}
        className={cn(baseInput, formatError && invalidInput)}
      />
      {formatError || field.maxLength ? (
        <div className="flex items-start justify-between gap-3 text-[11px]">
          <span className="text-red-600">{formatError}</span>
          {field.maxLength ? <CharCount length={textValue.length} max={field.maxLength} /> : null}
        </div>
      ) : null}
    </div>
  );
}
