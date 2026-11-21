"use client";

import { useEffect } from "react";

let activeLocks = 0;

/**
 * Locks scrolling of the admin shell (`.admin-panel`) while `active` is true.
 * Reference-counted so nested modals work. Does not move the page, so there
 * is no scroll jump or blank gap when the lock is released.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const shell = document.querySelector<HTMLElement>(".admin-panel");
    if (!shell) return;

    activeLocks += 1;
    shell.style.overflowY = "hidden";

    return () => {
      activeLocks = Math.max(0, activeLocks - 1);
      if (activeLocks === 0) shell.style.overflowY = "";
    };
  }, [active]);
}
