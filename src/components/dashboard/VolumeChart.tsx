"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface VolumeDataPoint {
  date: string;
  volume: number;
}

export function VolumeChart({ data }: { data: VolumeDataPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
        No volume data available for the last 30 days. Log a workout to see your progress!
      </div>
    );
  }

  const formattedData = data.map((d) => {
    // Assuming d.date is "YYYY-MM-DD"
    const dateParts = d.date.split("-");
    const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    return {
      ...d,
      displayDate: dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    };
  });

  return (
    <div className="h-80 w-full rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-6 font-heading text-xl text-primary">Volume (Progressive Overload)</h3>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
              formatter={(value: any) => [`${Number(value).toLocaleString()} lbs`, "Total Volume"]}
              labelStyle={{ color: "#888780", marginBottom: "4px" }}
            />
            <Bar dataKey="volume" fill="#1D9E75" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}