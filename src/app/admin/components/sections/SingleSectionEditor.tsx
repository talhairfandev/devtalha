"use client";

import { Loader2, RotateCcw, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { SectionForm } from "@/app/admin/components/sections/SectionForm";
import { resolvePendingUploads, type UploadProgress } from "@/lib/admin/uploads";
import { getMissingRequiredFields, getSaveBlocker } from "@/lib/admin/fieldRules";
import { UploadProgressBar, uploadButtonLabel } from "@/app/admin/components/UploadProgressBar";
import { useReportUnsaved } from "@/hooks/useUnsavedChanges";
import type { SectionConfig, SectionRecord } from "@/lib/admin/types";

type SingleSectionEditorProps = {
  config: SectionConfig;
  addToast: (type: "success" | "error", message: string) => void;
};

export function SingleSectionEditor({ config, addToast }: SingleSectionEditorProps) {
  const [data, setData] = useState<SectionRecord | null>(null);
  const [originalData, setOriginalData] = useState<SectionRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showErrors, setShowErrors] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${config.section}`);
      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      const payload = await res.json();
      if (!res.ok) {
        addToast("error", payload.error ?? "Failed to load data");
        setLoading(false);
        return;
      }

      setData(payload as SectionRecord);
      setOriginalData(payload as SectionRecord);
    } catch {
      addToast("error", "Network error while loading data");
    } finally {
      setLoading(false);
    }
  }, [config.section, addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isDirty = data && originalData ? JSON.stringify(data) !== JSON.stringify(originalData) : false;
  useReportUnsaved(`single:${config.section}`, isDirty);

  const missingFields = data ? getMissingRequiredFields(config.fields, data) : [];

  const handleSave = async () => {
    if (!data) return;

    const blocker = getSaveBlocker(config.fields, data);
    if (blocker) {
      setShowErrors(true);
      addToast("error", blocker);
      return;
    }

    setSaving(true);
    try {
      const payloadToSave = await resolvePendingUploads(data, config.fields, setProgress);

      const res = await fetch(`/api/admin/${config.section}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToSave),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "Save failed");
      setData(payload as SectionRecord);
      setOriginalData(payload as SectionRecord);
      setShowErrors(false);
      addToast("success", `${config.title} saved successfully`);
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
      setProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4" role="status" aria-live="polite">
        <div className="h-6 w-40 animate-pulse rounded bg-zinc-200" />
        <div className="space-y-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-zinc-200" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-100" />
            </div>
          ))}
        </div>
        <span className="sr-only">Loading {config.title}...</span>
      </div>
    );
  }

  if (!data) return null;

  const handleDiscard = () => {
    if (originalData) setData(originalData);
    setShowErrors(false);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <SectionForm
          fields={config.fields}
          data={data}
          onChange={setData}
          addToast={addToast}
          invalidFields={showErrors ? missingFields : []}
        />
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-all duration-300 lg:left-[272px] ${
          isDirty ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
        }`}
        aria-hidden={!isDirty}
      >
        {progress ? (
          <div className="mx-auto mb-2 max-w-3xl rounded-xl border border-zinc-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
            <UploadProgressBar progress={progress} />
          </div>
        ) : null}
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white/95 p-2.5 pl-4 shadow-xl backdrop-blur">
          <p className="flex items-center gap-2 text-xs font-medium text-zinc-600">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="hidden sm:inline">You have unsaved changes</span>
            <span className="sm:hidden">Unsaved</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={saving || !isDirty}
              tabIndex={isDirty ? 0 : -1}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50"
            >
              <RotateCcw size={14} />
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !isDirty}
              tabIndex={isDirty ? 0 : -1}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? uploadButtonLabel(progress) : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}