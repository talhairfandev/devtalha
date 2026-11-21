"use client";

import { Fragment } from "react";

import { FieldEditor } from "@/app/admin/components/fields";
import { isFieldVisible } from "@/lib/admin/fieldRules";
import type { FieldConfig, FieldType, SectionRecord } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

type SectionFormProps = {
  fields: FieldConfig[];
  data: SectionRecord;
  onChange: (next: SectionRecord) => void;
  addToast?: (type: "success" | "error", message: string) => void;
  /** Use a single column regardless of width (e.g. inside a modal) */
  compact?: boolean;
  /** Field labels to highlight as missing */
  invalidFields?: string[];
};

/** Short, single-line controls can sit side by side on wide screens. */
const HALF_WIDTH_TYPES = new Set<FieldType>(["text", "number", "select"]);

export function SectionForm({ fields, data, onChange, addToast, compact = false, invalidFields = [] }: SectionFormProps) {
  const visibleFields = fields.filter((field) => isFieldVisible(field, data));
  const hasGroups = visibleFields.some((field) => field.group);

  return (
    <div className={cn("grid grid-cols-1 gap-x-5 gap-y-6", !compact && "md:grid-cols-2")}>
      {visibleFields.map((field, index) => {
        const half = HALF_WIDTH_TYPES.has(field.type) && !field.key.includes("url");
        const inputId = `field-${field.key}`;
        const isInvalid = invalidFields.includes(field.label);
        const startsGroup = hasGroups && field.group && field.group !== visibleFields[index - 1]?.group;

        return (
          <Fragment key={field.key}>
            {startsGroup ? (
              <div className={cn("md:col-span-2", index > 0 && "mt-2 border-t border-zinc-200 pt-6")}>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">{field.group}</h3>
              </div>
            ) : null}

            <div className={cn("min-w-0 space-y-2", !half && "md:col-span-2")}>
              <div className="space-y-0.5">
                <label id={`${inputId}-label`} htmlFor={inputId} className="block text-[13px] font-semibold text-zinc-800">
                  {field.label}
                  {field.required ? (
                    <span className="ml-0.5 text-red-500" aria-hidden="true">
                      *
                    </span>
                  ) : null}
                  {field.required ? <span className="sr-only"> (required)</span> : null}
                </label>
                {field.description ? (
                  <p className="text-xs leading-relaxed text-zinc-500">{field.description}</p>
                ) : null}
              </div>
              <div className={cn(isInvalid && "rounded-lg ring-2 ring-red-300 ring-offset-2")}>
                <FieldEditor
                  id={inputId}
                  field={field}
                  value={data[field.key]}
                  addToast={addToast}
                  onChange={(nextValue) => onChange({ ...data, [field.key]: nextValue })}
                />
              </div>
              {isInvalid ? <p className="text-xs font-medium text-red-600">{field.label} is required.</p> : null}
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}
