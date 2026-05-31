/** Supabase-compatible relationship metadata (empty for MVP tables) */
export type TableRelationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

/** PostgreSQL tracking_type constraint on master_exercises */
export type TrackingType = "reps" | "volume" | "time";

export interface User {
  id: string;
  name: string;
  email: string | null;
  created_at: string;
  is_admin: boolean;
  profile_completed: boolean;
  current_weight: number | null;
  target_weight: number | null;
  height: number | null;
  primary_goal: string | null;
  activity_level: string | null;
  experience_level: string | null;
}

export interface MasterExercise {
  id: string;
  user_id: string;
  day_of_week: string;
  exercise_name: string;
  tracking_type: TrackingType;
  target_sets: number;
  default_weight: number;
  safety_note: string | null;
}

export interface MasterHabit {
  id: string;
  user_id: string;
  day_of_week: string;
  nutrition_text: string | null;
  supplements_text: string | null;
  night_routine_text: string | null;
}

export type MasterHabitInsert = Omit<MasterHabit, "id">;

export interface WorkoutLog {
  id: string;
  user_id: string;
  day_of_week: string;
  completed_at: string;
}

export interface SetLog {
  id: string;
  workout_log_id: string;
  exercise_id: string;
  set_number: number;
  reps: number;
  weight: number;
  duration_seconds: number;
}

export interface DailyTracking {
  id: string;
  user_id: string;
  date: string;
  workout_done: boolean;
  nutrition_done: boolean;
  night_routine_done: boolean;
  supplements_done: boolean;
  freeze_used: boolean;
}

export interface UserStats {
  user_id: string;
  current_streak: number;
  freezes_available: number;
  total_perfect_days: number;
}

export type UserInsert = Pick<User, "name"> & {
  id?: string;
  created_at?: string;
};

export type UserUpdate = Partial<Omit<User, "id">>;

export type MasterExerciseInsert = Omit<MasterExercise, "id"> & {
  id?: string;
};

export type MasterExerciseUpdate = Partial<Omit<MasterExercise, "id">>;

export type WorkoutLogInsert = Omit<WorkoutLog, "id" | "completed_at"> & {
  id?: string;
  completed_at?: string;
};

export type WorkoutLogUpdate = Partial<Omit<WorkoutLog, "id">>;

export type SetLogInsert = Omit<SetLog, "id"> & {
  id?: string;
};

export type SetLogUpdate = Partial<Omit<SetLog, "id">>;

export type DailyTrackingInsert = Omit<DailyTracking, "id"> & {
  id?: string;
};

export type DailyTrackingUpdate = Partial<Omit<DailyTracking, "id">>;

export type UserStatsInsert = UserStats;
export type UserStatsUpdate = Partial<Omit<UserStats, "user_id">>;

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User & Record<string, unknown>;
        Insert: UserInsert & Record<string, unknown>;
        Update: UserUpdate & Record<string, unknown>;
        Relationships: TableRelationship[];
      };
      master_exercises: {
        Row: MasterExercise & Record<string, unknown>;
        Insert: MasterExerciseInsert & Record<string, unknown>;
        Update: MasterExerciseUpdate & Record<string, unknown>;
        Relationships: TableRelationship[];
      };
      workout_logs: {
        Row: WorkoutLog & Record<string, unknown>;
        Insert: WorkoutLogInsert & Record<string, unknown>;
        Update: WorkoutLogUpdate & Record<string, unknown>;
        Relationships: TableRelationship[];
      };
      set_logs: {
        Row: SetLog & Record<string, unknown>;
        Insert: SetLogInsert & Record<string, unknown>;
        Update: SetLogUpdate & Record<string, unknown>;
        Relationships: TableRelationship[];
      };
      daily_tracking: {
        Row: DailyTracking & Record<string, unknown>;
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          workout_done?: boolean;
          nutrition_done?: boolean;
          night_routine_done?: boolean;
          supplements_done?: boolean;
          freeze_used?: boolean;
        } & Record<string, unknown>;
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          workout_done?: boolean;
          nutrition_done?: boolean;
          night_routine_done?: boolean;
          supplements_done?: boolean;
          freeze_used?: boolean;
        } & Record<string, unknown>;
        Relationships: TableRelationship[];
      };
      user_stats: {
        Row: UserStats & Record<string, unknown>;
        Insert: UserStatsInsert & Record<string, unknown>;
        Update: UserStatsUpdate & Record<string, unknown>;
        Relationships: TableRelationship[];
      };
      master_habits: {
        Row: MasterHabit & Record<string, unknown>;
        Insert: MasterHabitInsert & Record<string, unknown>;
        Update: Partial<MasterHabit> & Record<string, unknown>;
        Relationships: TableRelationship[];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
  };
}
