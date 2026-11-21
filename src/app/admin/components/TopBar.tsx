"use client";

import { ArrowLeft, Menu } from "lucide-react";

import type { AdminSection } from "@/lib/admin/sections";
import type { SectionConfig } from "@/lib/admin/types";

type TopBarProps = {
  activeSection: AdminSection | null;
  config: SectionConfig | null;
  onOpenSidebar: () => void;
  onBack: () => void;
};

export function TopBar({ activeSection, config, onOpenSidebar, onBack }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open navigation"
        className="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 lg:hidden"
      >
        <Menu size={20} />
      </button>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-[15px] font-semibold leading-tight text-zinc-900">
          {config ? config.title : "Dashboard"}
        </h2>
        <p className="hidden truncate text-xs leading-tight text-zinc-500 sm:block">
          {config ? config.description : "Overview of all portfolio sections"}
        </p>
      </div>

      {activeSection && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">Dashboard</span>
          <span className="sm:hidden">Back</span>
        </button>
      )}
    </header>
  );
}
