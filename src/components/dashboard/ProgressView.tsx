"use client";

import { useState, useMemo } from "react";
import { Select } from "@/components/ui/select";
import { EnduranceChart, ChartDataPoint } from "./charts/EnduranceChart";
import { StrengthChart } from "./charts/StrengthChart";
import { CoreChart } from "./charts/CoreChart";

export type TabType = "Endurance" | "Strength" | "Core";

export interface ProgressViewProps {
  rawData: any[];
}

export function ProgressView({ rawData }: ProgressViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("Endurance");
  const [selectedExercise, setSelectedExercise] = useState<string>("All");

  // Determine eligible tracking type based on tab
  const activeTrackingType = useMemo(() => {
    if (activeTab === "Core") return "time";
    return "reps"; // Endurance and Strength both use reps exercises primarily
  }, [activeTab]);

  // Extract unique exercises for the current tab
  const availableExercises = useMemo(() => {
    const exercises = new Set<string>();
    
    (rawData || []).forEach(log => {
      (log.set_logs || []).forEach((set: any) => {
        const type = set.master_exercises?.tracking_type;
        const name = set.master_exercises?.exercise_name;
        if (name && type === activeTrackingType) {
          exercises.add(name);
        }
      });
    });

    return ["All", ...Array.from(exercises)].sort();
  }, [rawData, activeTrackingType]);

  // When changing tabs, if the selected exercise is not in the new list (and not "All"), reset to "All"
  useMemo(() => {
    if (selectedExercise !== "All" && !availableExercises.includes(selectedExercise)) {
      setSelectedExercise("All");
    }
  }, [availableExercises, selectedExercise]);

  // Process data for the charts
  const chartData = useMemo(() => {
    const dataByDay: Record<string, number> = {};

    (rawData || []).forEach(log => {
      const dateKey = log.completed_at ? log.completed_at.substring(0, 10) : "";
      if (!dateKey) return;

      let dailyMetric = 0;
      let hasData = false;

      (log.set_logs || []).forEach((set: any) => {
        const name = set.master_exercises?.exercise_name;
        const type = set.master_exercises?.tracking_type;

        if (type === activeTrackingType && (selectedExercise === "All" || name === selectedExercise)) {
          hasData = true;
          if (activeTab === "Endurance") {
            // max reps
            dailyMetric = Math.max(dailyMetric, set.reps || 0);
          } else if (activeTab === "Strength") {
            // total volume
            let w = set.weight || 0;
            if (w === 0) w = 1;
            dailyMetric += (set.reps || 0) * w;
          } else if (activeTab === "Core") {
            // total duration
            dailyMetric += (set.duration_seconds || 0);
          }
        }
      });

      if (hasData) {
        dataByDay[dateKey] = (dataByDay[dateKey] || 0);
        if (activeTab === "Endurance") {
          dataByDay[dateKey] = Math.max(dataByDay[dateKey], dailyMetric);
        } else {
          dataByDay[dateKey] += dailyMetric;
        }
      }
    });

    return Object.entries(dataByDay)
      .map(([date, value]) => {
        const dateParts = date.split("-");
        const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
        return {
          date,
          displayDate: dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
          value
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [rawData, activeTab, selectedExercise, activeTrackingType]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Segmented Tab Controller */}
      <div className="flex bg-[#F8F7F4] rounded-full p-1 shadow-inner border border-gray-200">
        {(["Endurance", "Strength", "Core"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-white text-[#2C2C2A] shadow-sm"
                : "text-[#888780] hover:text-[#2C2C2A] bg-transparent"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Exercise Selector */}
      {availableExercises.length > 1 && (
        <div className="w-full">
          <Select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="w-full bg-white border-gray-300 rounded-xl"
          >
            {availableExercises.map((ex) => (
              <option key={ex} value={ex}>
                {ex === "All" ? `All ${activeTab} Exercises` : ex}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* Chart */}
      {activeTab === "Endurance" && <EnduranceChart data={chartData} />}
      {activeTab === "Strength" && <StrengthChart data={chartData} />}
      {activeTab === "Core" && <CoreChart data={chartData} />}
      
    </div>
  );
}
