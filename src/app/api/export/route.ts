import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("workout_logs")
    .select(`
      id,
      completed_at,
      set_logs (
        set_number,
        reps,
        weight,
        duration_seconds,
        master_exercises (
          exercise_name,
          tracking_type
        )
      )
    `)
    .eq("user_id", userId)
    .order("completed_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const headers = ['Date', 'Exercise', 'Type', 'Set', 'Reps', 'Weight', 'Duration'];
  const rows: string[] = [];

  (data || []).forEach((log: any) => {
    const date = log.completed_at ? log.completed_at.substring(0, 10) : '';
    (log.set_logs || []).forEach((set: any) => {
      // Escape commas in exercise name
      const exercise = set.master_exercises?.exercise_name 
        ? `"${set.master_exercises.exercise_name.replace(/"/g, '""')}"` 
        : '""';
      const type = set.master_exercises?.tracking_type || '';
      const setNum = set.set_number || '';
      const reps = set.reps || '0';
      const weight = set.weight || '0';
      const duration = set.duration_seconds || '0';

      rows.push([date, exercise, type, setNum, reps, weight, duration].join(','));
    });
  });

  const csv = [headers.join(','), ...rows].join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="kaizen_export_data.csv"',
    },
  });
}