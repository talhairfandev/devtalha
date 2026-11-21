"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DashboardOverview,
  Sidebar,
  ToastContainer,
  TopBar,
} from "@/app/admin/components";
import { ConfirmModal } from "@/app/admin/components/ConfirmModal";
import {
  CollectionSectionEditor,
  SectionBuilderEditor,
  SingleSectionEditor,
} from "@/app/admin/components/sections";
import { useAdminToast } from "@/hooks/useAdminToast";
import { useScrollLock } from "@/hooks/useScrollLock";
import { clearUnsavedChanges, hasUnsavedChanges, useBeforeUnloadGuard } from "@/hooks/useUnsavedChanges";
import { SECTION_CONFIGS } from "@/lib/admin/config";
import type { AdminSection } from "@/lib/admin/sections";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const router = useRouter();
  const { toasts, addToast, dismissToast } = useAdminToast();

  useBeforeUnloadGuard();

  // Lock scrolling behind the mobile drawer
  useScrollLock(sidebarOpen);

  // Close drawer with Escape
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  // Reset scroll to the top of the panel when switching sections
  useEffect(() => {
    document.querySelector<HTMLElement>(".admin-panel")?.scrollTo({ top: 0 });
  }, [activeSection]);

  const config = useMemo(
    () => (activeSection ? SECTION_CONFIGS.find((section) => section.section === activeSection) ?? null : null),
    [activeSection]
  );

  /** Runs `action` now, or asks first if an editor has unsaved changes. */
  const guard = (action: () => void) => {
    if (hasUnsavedChanges()) {
      setPendingAction(() => action);
      return;
    }
    action();
  };

  const goTo = (section: AdminSection | null) =>
    guard(() => {
      setActiveSection(section);
      setSidebarOpen(false);
    });

  const handleLogout = () =>
    guard(async () => {
      try {
        await fetch("/api/admin/logout", { method: "POST" });
      } finally {
        router.push("/admin/login");
      }
    });

  return (
    <div className="min-h-dvh bg-zinc-100 text-zinc-900">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div
        aria-hidden="true"
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-30 bg-zinc-900/40 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <Sidebar
        activeSection={activeSection}
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
        onOpenDashboard={() => goTo(null)}
        onNavigate={(section) => goTo(section)}
        onLogout={handleLogout}
      />

      <div className="flex min-h-dvh flex-col lg:pl-[272px]">
        <TopBar
          activeSection={activeSection}
          config={config}
          onOpenSidebar={() => setSidebarOpen(true)}
          onBack={() => goTo(null)}
        />

        <main
          key={activeSection ?? "dashboard"}
          className="admin-main admin-fade-in mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8"
        >
          {!config ? (
            <DashboardOverview onNavigate={(section) => goTo(section)} />
          ) : config.section === "section_order" ? (
            <SectionBuilderEditor addToast={addToast} />
          ) : config.mode === "single" ? (
            <SingleSectionEditor config={config} addToast={addToast} />
          ) : (
            <CollectionSectionEditor config={config} addToast={addToast} />
          )}
        </main>
      </div>

      <ConfirmModal
        isOpen={pendingAction !== null}
        onClose={() => setPendingAction(null)}
        onConfirm={() => {
          const action = pendingAction;
          clearUnsavedChanges();
          setPendingAction(null);
          action?.();
        }}
        title="Discard unsaved changes?"
        message="You have changes that haven't been saved. If you leave now, they will be lost."
        confirmText="Discard changes"
        cancelText="Keep editing"
      />
    </div>
  );
}
