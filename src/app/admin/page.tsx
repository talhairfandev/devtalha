"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DashboardOverview,
  Sidebar,
  ToastContainer,
  TopBar,
} from "@/app/admin/components";
import {
  CollectionSectionEditor,
  SectionBuilderEditor,
  SingleSectionEditor,
} from "@/app/admin/components/sections";
import { useAdminToast } from "@/hooks/useAdminToast";
import { useScrollLock } from "@/hooks/useScrollLock";
import { SECTION_CONFIGS } from "@/lib/admin/config";
import type { AdminSection } from "@/lib/admin/sections";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { toasts, addToast, dismissToast } = useAdminToast();
  const mainRef = useRef<HTMLElement>(null);

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

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
    }
  };

  const handleNavigation = (section: AdminSection) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

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
        onOpenDashboard={() => {
          setActiveSection(null);
          setSidebarOpen(false);
        }}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
      />

      <div className="flex min-h-dvh flex-col lg:pl-[272px]">
        <TopBar
          activeSection={activeSection}
          config={config}
          onOpenSidebar={() => setSidebarOpen(true)}
          onBack={() => setActiveSection(null)}
        />

        <main
          ref={mainRef}
          key={activeSection ?? "dashboard"}
          className="admin-main admin-fade-in mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8"
        >
          {!config ? (
            <DashboardOverview onNavigate={handleNavigation} />
          ) : config.section === "section_order" ? (
            <SectionBuilderEditor addToast={addToast} />
          ) : config.mode === "single" ? (
            <SingleSectionEditor config={config} addToast={addToast} />
          ) : (
            <CollectionSectionEditor config={config} addToast={addToast} />
          )}
        </main>
      </div>
    </div>
  );
}
