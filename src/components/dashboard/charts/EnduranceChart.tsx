"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface ChartDataPoint {
  date: string;
  displayDate: string;
  value: number;
}

export function EnduranceChart({ data }: { data: ChartDataPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-80 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center shadow-sm">
        <img src="/assets/panda-resting.svg" alt="Resting Panda" className="w-32 h-32 opacity-60 mb-4" />
        <h2 className="text-[24px] font-medium text-[#2C2C2A] mb-1">No endurance data available</h2>
        <p className="text-[15px] text-[#888780]">Log a workout to see your progress!</p>
      </div>
    );
  }

  return (
    <div className="h-80 w-full rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-6 font-heading text-xl text-primary">Max Reps (Endurance)</h3>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
            />
            <Tooltip
              cursor={{ fill: "#f3f4f6" }}
              contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", fontWeight: 500 }}
              formatter={(value: any) => [`${value} reps`, "Max Reps"]}
              labelStyle={{ color: "#888780", marginBottom: "4px" }}
            />
            <Line type="monotone" dataKey="value" stroke="#1D9E75" strokeWidth={3} dot={{ r: 4, fill: "#1D9E75" }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
