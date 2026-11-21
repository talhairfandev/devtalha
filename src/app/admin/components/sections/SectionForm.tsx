"use client";

import { FieldEditor } from "@/app/admin/components/fields";
import type { FieldConfig, FieldType, SectionRecord } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type SectionFormProps = {
  fields: FieldConfig[];
  data: SectionRecord;
  onChange: (next: SectionRecord) => void;
  addToast?: (type: "success" | "error", message: string) => void;
  /** Use a single column regardless of width (e.g. inside a modal) */
  compact?: boolean;
};

/** Short, single-line controls can sit side by side on wide screens. */
const HALF_WIDTH_TYPES = new Set<FieldType>(["text", "number", "select"]);

export function SectionForm({ fields, data, onChange, addToast, compact = false }: SectionFormProps) {
  return (
    <div className={cn("grid grid-cols-1 gap-x-5 gap-y-6", !compact && "md:grid-cols-2")}>
      {fields.map((field) => {
        const half = HALF_WIDTH_TYPES.has(field.type) && !field.key.includes("url");
        const inputId = `field-${field.key}`;

        return (
          <div key={field.key} className={cn("min-w-0 space-y-2", !half && "md:col-span-2")}>
            <div className="space-y-0.5">
              <label htmlFor={inputId} className="block text-[13px] font-semibold text-zinc-800">
                {field.label}
              </label>
              {field.description ? (
                <p className="text-xs leading-relaxed text-zinc-500">{field.description}</p>
              ) : null}
            </div>
            <FieldEditor
              id={inputId}
              field={field}
              value={data[field.key]}
              addToast={addToast}
              onChange={(nextValue) => onChange({ ...data, [field.key]: nextValue })}
            />
          </div>
        );
      })}
    </div>
  );
}
