"use client";

import { SECTION_CONFIGS } from "@/lib/admin/config";
import type { AdminSection } from "@/lib/admin/sections";

type DashboardOverviewProps = {
  onNavigate: (section: AdminSection) => void;
};

export function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl text-zinc-900">Dashboard</h2>
        <p className="text-sm text-zinc-500 mt-1">Manage all sections of your portfolio from one place.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {SECTION_CONFIGS.map((config) => (
          <button
            type="button"
            key={config.section}
            onClick={() => onNavigate(config.section)}
            className="group text-left rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md sm:p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="rounded-lg bg-zinc-100 p-2.5 text-zinc-600 group-hover:bg-zinc-900 group-hover:text-white transition">
                {config.icon}
              </div>
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-600">
                {config.mode === "single" ? "Single" : "List"}
              </span>
            </div>
            <h3 className="text-[15px] font-semibold text-zinc-900">{config.title}</h3>
            <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{config.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
