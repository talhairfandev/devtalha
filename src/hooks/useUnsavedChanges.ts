"use client";

import { useEffect } from "react";

/**
 * Tiny module-level registry of editors that currently hold unsaved edits.
 * Editors report their state with `useReportUnsaved`; the dashboard shell asks
 * `hasUnsavedChanges()` before navigating away.
 */
const dirtySources = new Set<string>();

export function setUnsaved(source: string, dirty: boolean) {
  if (dirty) dirtySources.add(source);
  else dirtySources.delete(source);
}

export function hasUnsavedChanges() {
  return dirtySources.size > 0;
}

export function clearUnsavedChanges() {
  dirtySources.clear();
}

export function useReportUnsaved(source: string, dirty: boolean) {
  useEffect(() => {
    setUnsaved(source, dirty);
    return () => setUnsaved(source, false);
  }, [source, dirty]);
}

/** Shows the browser's native "Leave site?" prompt while anything is unsaved. */
export function useBeforeUnloadGuard() {
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges()) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);
}
