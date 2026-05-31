import React from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Trash } from "lucide-react";
import { TrackingType, MasterExerciseInsert } from "@/types/database.types";

export interface BuilderInputRowProps {
  exercise: MasterExerciseInsert;
  onChange: (updated: MasterExerciseInsert) => void;
  onDelete: () => void;
}

export function BuilderInputRow({
  exercise,
  onChange,
  onDelete,
}: BuilderInputRowProps) {
  const customInputClasses =
    "bg-[#FFFFFF] border-[#888780] focus-visible:border-[#1D9E75] focus-visible:ring-1 focus-visible:ring-[#1D9E75] text-black";

  return (
    <div className="flex flex-wrap md:flex-nowrap items-center gap-3 p-3 bg-white border border-[#888780]/20 rounded-xl shadow-sm mb-3">
      <div className="w-full md:w-1/4">
        <label className="block text-xs font-semibold text-gray-500 mb-1">Exercise Name</label>
        <Input
          type="text"
          value={exercise.exercise_name}
          onChange={(e) => onChange({ ...exercise, exercise_name: e.target.value })}
          className={customInputClasses}
          placeholder="e.g. Barbell Squat"
        />
      </div>

      <div className="w-full md:w-1/6">
        <label className="block text-xs font-semibold text-gray-500 mb-1">Tracking Type</label>
        <Select
          value={exercise.tracking_type}
          onChange={(e) => onChange({ ...exercise, tracking_type: e.target.value as TrackingType })}
          className={customInputClasses}
        >
          <option value="reps">Reps</option>
          <option value="volume">Volume</option>
          <option value="time">Time</option>
        </Select>
      </div>

      <div className="w-full md:w-1/6">
        <label className="block text-xs font-semibold text-gray-500 mb-1">Sets</label>
        <Input
          type="number"
          min={1}
          value={exercise.target_sets || ""}
          onChange={(e) => onChange({ ...exercise, target_sets: parseInt(e.target.value) || 0 })}
          className={customInputClasses}
          placeholder="e.g. 3"
        />
      </div>

      <div className="w-full md:w-1/6">
        <label className="block text-xs font-semibold text-gray-500 mb-1">Default Weight (kg)</label>
        <Input
          type="number"
          value={exercise.default_weight || ""}
          onChange={(e) => onChange({ ...exercise, default_weight: parseFloat(e.target.value) || 0 })}
          className={customInputClasses}
          placeholder="e.g. 135"
        />
      </div>

      <div className="w-full md:w-1/4">
        <label className="block text-xs font-semibold text-gray-500 mb-1">Safety Note</label>
        <Input
          type="text"
          value={exercise.safety_note || ""}
          onChange={(e) => onChange({ ...exercise, safety_note: e.target.value })}
          className={customInputClasses}
          placeholder="Optional note"
        />
      </div>

      <div className="w-full md:w-auto flex justify-end mt-4 md:mt-5">
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete exercise"
        >
          <Trash size={20} />
        </button>
      </div>
    </div>
  );
}