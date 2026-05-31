"use client";

import { useEffect, useState } from "react";
import { useUserStore, useUserStoreHydrated } from "@/lib/store/useUserStore";
import { fetchTodayWorkout } from "@/lib/supabase/queries";
import { MasterExercise } from "@/types/database.types";
import { WizardWrapper } from "@/components/workout/WizardWrapper";

export default function WorkoutPage() {
  const isHydrated = useUserStoreHydrated();
  const { activeUserId } = useUserStore();

  const [todaysPlan, setTodaysPlan] = useState<MasterExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!activeUserId) {
      setIsLoading(false);
      return;
    }

    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const todayStr = days[new Date().getDay()];

    let isMounted = true;
    setIsLoading(true);

    fetchTodayWorkout(activeUserId, todayStr)
      .then((plan) => {
        if (isMounted) setTodaysPlan(plan);
      })
      .catch((err) => {
        console.error("Failed to load today's plan:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeUserId]);

  if (!isHydrated) return null;

  if (!activeUserId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-[#EF9F27] text-white p-4 rounded-xl shadow-md font-semibold text-center w-full max-w-md">
          Please select a profile from the Dashboard first.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-gray-400">
        Loading your workout...
      </div>
    );
  }

  if (todaysPlan.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-8 text-center bg-white border border-dashed border-gray-300 rounded-3xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Rest Day</h2>
          <p className="text-gray-500">Rest Day or No Plan Assigned.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 px-4">
      <WizardWrapper exercises={todaysPlan} />
    </div>
  );
}