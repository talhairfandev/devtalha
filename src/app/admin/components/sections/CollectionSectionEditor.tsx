"use client";

import Image from "next/image";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
  GripVertical,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { SectionForm } from "@/app/admin/components/sections/SectionForm";
import { ConfirmModal } from "@/app/admin/components/ConfirmModal";
import { useScrollLock } from "@/hooks/useScrollLock";
import { resolvePendingUploads, getRecordStorageImages } from "@/lib/admin/uploads";
import type { SectionConfig, SectionRecord } from "@/lib/admin/types";


type SortableRowProps = {
  row: SectionRecord;
  index: number;
  totalRows: number;
  onEdit: (row: SectionRecord) => void;
  onDelete: (id: string) => void;
};

function SortableRow({ row, index, totalRows, onEdit, onDelete }: SortableRowProps) {
  const id = String(row.id);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const title = String(row.title ?? row.number ?? row.label ?? `Item ${index + 1}`);
  const subtitle = String(row.client ?? row.email ?? row.description ?? "").slice(0, 80);
  const imgUrl = String(row.image_url ?? "");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-xl border border-zinc-200 bg-white p-3 shadow-sm transition hover:border-zinc-300 sm:p-4 ${
        isDragging ? "relative z-10 shadow-lg ring-2 ring-zinc-900/10" : ""
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 touch-none cursor-grab items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500 hover:bg-zinc-100 active:cursor-grabbing"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>

        {imgUrl && (
          <div className="relative hidden h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 sm:block">
            <Image
              src={imgUrl}
              alt=""
              fill
              unoptimized
              sizes="56px"
              className="object-cover"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h4 className="truncate text-[15px] font-semibold text-zinc-900">{title}</h4>
          {subtitle && <p className="truncate text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>

        <span className="hidden h-8 min-w-8 items-center justify-center rounded-lg bg-zinc-100 px-2 text-[11px] font-semibold text-zinc-600 md:flex">
          {index + 1}/{totalRows}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(row)}
            aria-label={`Edit ${title}`}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(String(row.id))}
            aria-label={`Delete ${title}`}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-red-500/70 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

type CollectionSectionEditorProps = {
  config: SectionConfig;
  addToast: (type: "success" | "error", message: string) => void;
};

export function CollectionSectionEditor({ config, addToast }: CollectionSectionEditorProps) {
  const [rows, setRows] = useState<SectionRecord[]>([]);
  const [editing, setEditing] = useState<SectionRecord | null>(null);
  const [originalEditing, setOriginalEditing] = useState<SectionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingRow, setDeletingRow] = useState<SectionRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  // Lock the admin shell scroll while the editor sheet is open
  useScrollLock(Boolean(editing));

  // Close the editor with Escape
  useEffect(() => {
    if (!editing || saving) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEditing(null);
        setOriginalEditing(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, saving]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadRows = useCallback(async () => {
    setLoading(true);
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

    setRows((payload as SectionRecord[]) ?? []);
    setLoading(false);
  }, [config.section, addToast]);

  useEffect(() => {
    setEditing(null);
    setOriginalEditing(null);
    loadRows();
  }, [loadRows]);

  const createEmptyRow = () =>
    ({
      id: "",
      ...(config.createDefaults ?? {}),
      sort_order: rows.length + 1,
    }) as SectionRecord;

  const upsertRow = async (record: SectionRecord) => {
    const id = String(record.id ?? "");
    const isNew = !id;
    const method = isNew ? "POST" : "PUT";
    const tempId = `temp-${Date.now()}`;
    const optimistic = isNew ? { ...record, id: tempId } : record;
    const previousRows = rows;

    if (isNew) setRows((current) => [...current, optimistic]);
    else setRows((current) => current.map((row) => (String(row.id) === id ? optimistic : row)));

    setSaving(true);
    try {
      const resolvedRecord = await resolvePendingUploads(record, config.fields);
      const payloadRecord = { ...resolvedRecord };
      if (isNew && !String(payloadRecord.id ?? "").trim()) {
        delete payloadRecord.id;
      }

      const res = await fetch(`/api/admin/${config.section}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadRecord),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "Save failed");
      const saved = payload as SectionRecord;
      if (isNew) setRows((current) => current.map((row) => (String(row.id) === tempId ? saved : row)));
      else setRows((current) => current.map((row) => (String(row.id) === String(saved.id) ? saved : row)));
      setEditing(null);
      setOriginalEditing(null);
      addToast("success", isNew ? "Item created" : "Item updated");
    } catch (error) {
      setRows(previousRows);
      addToast("error", error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const removeRow = (id: string) => {
    const target = rows.find((row) => String(row.id) === id);
    if (target) {
      setDeletingRow(target);
    }
  };

  const confirmRemoveRow = async () => {
    if (!deletingRow) return;
    const id = String(deletingRow.id);

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/${config.section}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "Delete failed");

      setRows((current) => current.filter((row) => String(row.id) !== id));
      addToast("success", "Item deleted");
      setDeletingRow(null);
    } catch (error) {
      addToast("error", error instanceof Error ? error.message : "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };


  const openEditor = (record: SectionRecord) => {
    setEditing(record);
    setOriginalEditing(record);
  };

  const hasRecordChanged = useMemo(
    () =>
      editing && originalEditing
        ? JSON.stringify(editing) !== JSON.stringify(originalEditing)
        : false,
    [editing, originalEditing]
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = rows.findIndex((row) => String(row.id) === String(active.id));
    const newIndex = rows.findIndex((row) => String(row.id) === String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const previousRows = rows;
    const moved = arrayMove(rows, oldIndex, newIndex);
    const nextRows: SectionRecord[] = moved.map((row, index) => ({
      ...row,
      sort_order: index + 1,
    }));
    setRows(nextRows);

    try {
      const previousSortById = new Map(
        previousRows.map((row) => [String(row["id"] ?? ""), Number(row["sort_order"] ?? 0)])
      );

      const updates = nextRows.filter((row, index) => {
        const id = String(row["id"] ?? "");
        if (!id.trim()) return false;
        return previousSortById.get(id) !== index + 1;
      });

      await Promise.all(
        updates.map(async (item) => {
          const response = await fetch(`/api/admin/${config.section}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          });

          if (!response.ok) {
            const payload = (await response.json().catch(() => null)) as { error?: string } | null;
            throw new Error(payload?.error ?? "Failed to update order");
          }
        })
      );

      addToast("success", "Order updated");
    } catch (error) {
      setRows(previousRows);
      addToast("error", error instanceof Error ? error.message : "Reorder failed");
    }
  };

  if (loading) {
    return (
      <div className="space-y-3" role="status" aria-live="polite">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[74px] animate-pulse rounded-xl border border-zinc-200 bg-white" />
        ))}
        <span className="sr-only">Loading {config.title}...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={rows.map((row) => String(row.id))} strategy={verticalListSortingStrategy}>
          <div className="space-y-2.5 sm:space-y-3">
            {rows.map((row, index) => (
              <SortableRow
                key={String(row.id)}
                row={row}
                index={index}
                totalRows={rows.length}
                onEdit={openEditor}
                onDelete={removeRow}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {rows.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm text-zinc-500">
          No items yet. Add your first {config.title.replace(/s$/, "").toLowerCase()} below.
        </div>
      )}

      <button
        type="button"
        onClick={() => openEditor(createEmptyRow())}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-white text-xs font-semibold text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
      >
        <Plus size={16} />
        Add New {config.title.replace(/s$/, "")}
      </button>

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${String(editing.id) ? "Edit" : "New"} ${config.title.replace(/s$/, "")}`}
        >
          <div
            className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm"
            onClick={() => {
              if (saving) return;
              setEditing(null);
              setOriginalEditing(null);
            }}
          />
          <div className="admin-sheet-in relative flex max-h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl max-sm:h-[100dvh] sm:max-h-[90dvh] sm:max-w-3xl sm:rounded-2xl sm:border sm:border-zinc-200">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 sm:px-6 sm:py-4">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-zinc-900 sm:text-lg">
                  {String(editing.id) ? "Edit" : "New"} {config.title.replace(/s$/, "")}
                </h3>
                <p className="text-xs text-zinc-500">Fill in the details below</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                disabled={saving}
                onClick={() => {
                  setEditing(null);
                  setOriginalEditing(null);
                }}
                className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6">
              <SectionForm fields={config.fields} data={editing} onChange={setEditing} addToast={addToast} />
            </div>

            <div className="flex shrink-0 flex-col-reverse items-stretch gap-3 border-t border-zinc-200 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
              <p className="flex items-center gap-2 text-xs text-zinc-500">
                <span className={`h-2 w-2 rounded-full ${hasRecordChanged ? "bg-amber-500" : "bg-zinc-300"}`} />
                {hasRecordChanged ? "Unsaved changes" : "No changes yet"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setEditing(null);
                    setOriginalEditing(null);
                  }}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50 sm:flex-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => upsertRow(editing)}
                  disabled={saving || !hasRecordChanged}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 text-xs font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50 sm:flex-none"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? "Saving..." : "Save Item"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {deletingRow && (
        <ConfirmModal
          isOpen={true}
          onClose={() => setDeletingRow(null)}
          onConfirm={confirmRemoveRow}
          isLoading={isDeleting}
          title={`Delete ${config.title.replace(/s$/, "")}`}
          message={`Are you sure you want to delete "${
            deletingRow.title ?? deletingRow.number ?? deletingRow.label ?? "this item"
          }"?`}
          imagesToPurge={getRecordStorageImages(deletingRow)}
        />
      )}
    </div>

  );
}
