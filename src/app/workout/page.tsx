"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useUserStore, useUserStoreHydrated } from "@/lib/store/useUserStore";
import { fetchTodayWorkout } from "@/lib/supabase/queries";
import { MasterExercise } from "@/types/database.types";
import { WizardWrapper } from "@/components/workout/WizardWrapper";

export default function WorkoutPage() {
  const isHydrated = useUserStoreHydrated();
  const { activeUserId } = useUserStore();

  const [todaysPlan, setTodaysPlan] = useState<MasterExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    if (!activeUserId) {
      setIsLoading(false);
      return;
    }

    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const todayStr = days[currentDate.getDay()];

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
  }, [activeUserId, currentDate]);

  const handlePrevDay = () => setCurrentDate(d => {
    const nd = new Date(d);
    nd.setDate(d.getDate() - 1);
    return nd;
  });

  const handleNextDay = () => setCurrentDate(d => {
    const nd = new Date(d);
    nd.setDate(d.getDate() + 1);
    return nd;
  });

  const isToday = new Date().toDateString() === currentDate.toDateString();
  const dateLabel = isToday ? "Today" : currentDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 md:py-12 px-4">
      <div className="w-full max-w-md flex items-center justify-between mb-8 bg-white p-2 rounded-full shadow-sm border border-gray-200">
        <button onClick={handlePrevDay} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="size-5 text-[#2C2C2A]" />
        </button>
        <span className="font-heading text-lg text-[#2C2C2A]">{dateLabel}</span>
        <button onClick={handleNextDay} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronRight className="size-5 text-[#2C2C2A]" />
        </button>
      </div>

      <div className="w-full">
        {todaysPlan.length === 0 ? (
          <div className="flex flex-col items-center justify-center max-w-md mx-auto w-full p-12 text-center bg-white border border-dashed border-gray-300 rounded-3xl shadow-sm">
            <img src="/icons/panda.webp" alt="Resting Panda" className="w-32 h-32 opacity-60 mb-6" />
            <h2 className="text-[24px] font-medium text-[#2C2C2A] mb-1">Rest Day</h2>
            <p className="text-[15px] text-[#888780]">No plan assigned for this day.</p>
          </div>
        ) : (
          <WizardWrapper exercises={todaysPlan} isReadOnly={!isToday} />
        )}
      </div>
    </div>
  );
}