"use client";

import { cn } from "@/lib/utils";

export interface TabControllerProps {
  activeTab: "today" | "progress";
  onChange: (tab: "today" | "progress") => void;
}

export function TabController({ activeTab, onChange }: TabControllerProps) {
  return (
    <div className="flex w-full max-w-[240px] bg-gray-100 rounded-full p-1 shadow-inner border border-gray-200 mb-8 mx-auto md:mx-0">
      <button
        onClick={() => onChange("today")}
        className={cn(
          "flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all whitespace-nowrap",
          activeTab === "today"
            ? "bg-white text-[#1D9E75] shadow-sm"
            : "text-gray-500 hover:text-gray-800"
        )}
      >
        Today
      </button>
      <button
        onClick={() => onChange("progress")}
        className={cn(
          "flex-1 py-2 px-4 rounded-full text-sm font-bold transition-all whitespace-nowrap",
          activeTab === "progress"
            ? "bg-white text-[#1D9E75] shadow-sm"
            : "text-gray-500 hover:text-gray-800"
        )}
      >
        Progress
      </button>
    </div>
  );
}