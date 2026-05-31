import type { DailyTracking } from "@/types/database.types";

export function calculateConsistency(
  dailyTrackingRecords: DailyTracking[],
  freezesAvailable: number = 0
): number {
  if (!dailyTrackingRecords || dailyTrackingRecords.length === 0) return 0;

  // Sort by date descending
  const sorted = [...dailyTrackingRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  let freezes = freezesAvailable;
  
  // Start checking from today
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const record = sorted[i];
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);

    if (recordDate > currentDate) continue;

    const diffTime = currentDate.getTime() - recordDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      const missedDays = diffDays - 1;
      if (freezes >= missedDays) {
        freezes -= missedDays;
      } else {
        break;
      }
    }

    const isPerfect =
      record.workout_done &&
      record.nutrition_done &&
      record.night_routine_done &&
      record.supplements_done;

    if (isPerfect || record.freeze_used) {
      streak++;
    } else if (diffDays === 0) {
      // Today is imperfect, doesn't break streak yet
    } else if (freezes > 0) {
      // Past imperfect day, use a freeze
      freezes--;
    } else {
      break;
    }

    currentDate = recordDate;
  }

  return streak;
}