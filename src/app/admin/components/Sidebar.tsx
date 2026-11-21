"use client";

import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  X,
} from "lucide-react";

import { SECTION_CONFIGS } from "@/lib/admin/config";
import type { AdminSection } from "@/lib/admin/sections";
import { cn } from "@/lib/utils";

type SidebarProps = {
  activeSection: AdminSection | null;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
  onOpenDashboard: () => void;
  onNavigate: (section: AdminSection) => void;
  onLogout: () => void;
};

const itemBase =
  "w-full flex items-center gap-3 rounded-lg px-3 min-h-10 py-2 text-[13px] font-medium text-left transition-colors";
const itemIdle = "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900";
const itemActive = "bg-zinc-900 text-white shadow-sm";

export function Sidebar({
  activeSection,
  sidebarOpen,
  onCloseSidebar,
  onOpenDashboard,
  onNavigate,
  onLogout,
}: SidebarProps) {
  return (
    <aside
      aria-label="Admin navigation"
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex h-dvh w-[272px] max-w-[85vw] flex-col border-r border-zinc-200 bg-white transition-transform duration-300 ease-out",
        "lg:translate-x-0 lg:shadow-none",
        sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 px-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-[11px] font-bold text-white">
            TI
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold leading-tight tracking-tight text-zinc-900">Portfolio CMS</h1>
            <p className="text-[11px] leading-tight text-zinc-500">Admin Workspace</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCloseSidebar}
          aria-label="Close navigation"
          className="-mr-2 flex h-10 w-10 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-4">
        <button
          type="button"
          onClick={onOpenDashboard}
          aria-current={activeSection === null ? "page" : undefined}
          className={cn(itemBase, activeSection === null ? itemActive : itemIdle)}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </button>

        <p className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Sections</p>

        {SECTION_CONFIGS.map((section) => (
          <button
            type="button"
            key={section.section}
            onClick={() => onNavigate(section.section)}
            aria-current={activeSection === section.section ? "page" : undefined}
            className={cn(itemBase, activeSection === section.section ? itemActive : itemIdle)}
          >
            <span className="shrink-0">{section.icon}</span>
            <span className="truncate">{section.title}</span>
          </button>
        ))}
      </nav>

      <div className="shrink-0 space-y-1 border-t border-zinc-200 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(itemBase, itemIdle)}
        >
          <ExternalLink size={16} />
          View Live Site
        </a>
        <button
          type="button"
          onClick={onLogout}
          className={cn(itemBase, "text-red-600/80 hover:bg-red-50 hover:text-red-700")}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
