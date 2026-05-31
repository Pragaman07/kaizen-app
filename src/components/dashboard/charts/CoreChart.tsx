"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartDataPoint } from "./EnduranceChart";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function CoreChart({ data }: { data: ChartDataPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-80 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center shadow-sm">
        <img src="/assets/panda-resting.svg" alt="Resting Panda" className="w-32 h-32 opacity-60 mb-4" />
        <h2 className="text-[24px] font-medium text-[#2C2C2A] mb-1">No core data available</h2>
        <p className="text-[15px] text-[#888780]">Log a workout to see your progress!</p>
      </div>
    );
  }

  return (
    <div className="h-80 w-full rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-6 font-heading text-xl text-primary">Time (Core)</h3>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="displayDate" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "#888780" }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: "#888780" }} 
              tickFormatter={formatDuration}
            />
            <Tooltip
              cursor={{ fill: "#f3f4f6" }}
              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", fontWeight: 500 }}
              formatter={(value: any) => [formatDuration(Number(value)), "Duration"]}
              labelStyle={{ color: "#888780", marginBottom: "4px" }}
            />
            <Area type="monotone" dataKey="value" stroke="#2C2C2A" strokeWidth={3} fill="#2C2C2A" fillOpacity={0.2} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
