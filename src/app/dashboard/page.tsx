"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import HabitChecklist from "@/components/dashboard/HabitChecklist";
import { TabController } from "@/components/dashboard/TabController";
import { VolumeChart, VolumeDataPoint } from "@/components/dashboard/VolumeChart";
import { calculateConsistency } from "@/lib/utils/streakMath";
import {
  DashboardQueryError,
  fetchDashboardData,
  toggleDailyHabit,
  fetchVolumeHistory,
  fetchAllDailyTracking,
} from "@/lib/supabase/queries";
import {
  useUserStore,
  useUserStoreHydrated,
} from "@/lib/store/useUserStore";
import type { DashboardData } from "@/types/app.types";
import type { DailyHabitField } from "@/types/app.types";

export default function DashboardPage() {
  const router = useRouter();
  const hydrated = useUserStoreHydrated();
  const activeUserId = useUserStore((state) => state.activeUserId);

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"today" | "progress">("today");
  const [volumeData, setVolumeData] = useState<VolumeDataPoint[]>([]);
  const [calculatedStreak, setCalculatedStreak] = useState<number | null>(null);

  useEffect(() => {
    if (!hydrated || !activeUserId) {
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const userId = activeUserId;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const dashboard = await fetchDashboardData(userId);
        if (!cancelled) {
          setData(dashboard);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof DashboardQueryError
              ? err.message
              : "Unable to load dashboard. Check your connection and try again.";
          setError(message);
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [hydrated, activeUserId]);

  useEffect(() => {
    if (!hydrated || !activeUserId || activeTab !== "progress") return;

    let cancelled = false;

    async function loadProgress() {
      try {
        const [volume, trackingRecords] = await Promise.all([
          fetchVolumeHistory(activeUserId!),
          fetchAllDailyTracking(activeUserId!),
        ]);

        if (!cancelled) {
          setVolumeData(volume);
          const freezes = data?.userStats?.freezes_available || 0;
          setCalculatedStreak(calculateConsistency(trackingRecords, freezes));
        }
      } catch (err) {
        console.error("Failed to load progress data:", err);
      }
    }

    void loadProgress();

    return () => {
      cancelled = true;
    };
  }, [hydrated, activeUserId, activeTab, data?.userStats?.freezes_available]);

  const handleToggle = useCallback(
    async (field: DailyHabitField, value: boolean) => {
      if (!data?.dailyTracking || field === "workout_done") return;

      const previous = data.dailyTracking;

      setData({
        ...data,
        dailyTracking: { ...previous, [field]: value },
      });
      setError(null);

      try {
        const updated = await toggleDailyHabit(previous.id, field, value);
        setData((current) =>
          current ? { ...current, dailyTracking: updated } : current,
        );
      } catch (err) {
        setData((current) =>
          current ? { ...current, dailyTracking: previous } : current,
        );
        const message =
          err instanceof DashboardQueryError
            ? err.message
            : "Failed to save habit. Please try again.";
        setError(message);
      }
    },
    [data],
  );

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl text-primary">Daily Discipline</h1>
          {data?.userStats ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Current streak:{" "}
              <span className="font-medium text-foreground">
                {activeTab === "progress" && calculatedStreak !== null 
                  ? calculatedStreak 
                  : data.userStats.current_streak} days
              </span>
              {" · "}
              Freezes: {data.userStats.freezes_available}
            </p>
          ) : null}
        </div>
        
        {hydrated && activeUserId && data && (
          <TabController activeTab={activeTab} onChange={setActiveTab} />
        )}
      </header>

      {hydrated && activeUserId && data && (
        <div className="mb-8">
          <button
            onClick={() => router.push("/workout")}
            disabled={data.dailyTracking.workout_done}
            className={cn(
              "w-full py-4 text-lg font-bold rounded-2xl transition-all shadow-md",
              data.dailyTracking.workout_done
                ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                : "bg-[#1D9E75] hover:bg-[#16825f] text-white"
            )}
          >
            {data.dailyTracking.workout_done ? "Workout Complete" : "Start Today's Workout"}
          </button>
        </div>
      )}

      {!hydrated || loading ? (
        <p className="text-sm text-muted-foreground" role="status">
          Loading dashboard…
        </p>
      ) : null}

      {hydrated && !activeUserId ? (
        <p className="text-sm text-muted-foreground">
          Select a profile to view your dashboard.
        </p>
      ) : null}

      {error ? (
        <p
          className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {hydrated && activeUserId && data && !loading ? (
        activeTab === "today" ? (
          <HabitChecklist
            dailyTracking={data.dailyTracking}
            onToggle={(field, value) => {
              void handleToggle(field, value);
            }}
          />
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <VolumeChart data={volumeData} />
          </div>
        )
      ) : null}
    </div>
  );
}
