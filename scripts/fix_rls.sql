-- 1. Create the missing Master Habits table
CREATE TABLE IF NOT EXISTS master_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    day_of_week TEXT NOT NULL,
    nutrition_text TEXT,
    supplements_text TEXT,
    night_routine_text TEXT,
    UNIQUE(user_id, day_of_week)
);

-- 2. Apply Security: master_habits
ALTER TABLE master_habits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own habits" ON master_habits;
CREATE POLICY "Users can manage their own habits" 
ON master_habits FOR ALL TO authenticated 
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 3. Apply Security: master_exercises
ALTER TABLE master_exercises ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own exercises" ON master_exercises;
CREATE POLICY "Users can manage their own exercises" 
ON master_exercises FOR ALL TO authenticated 
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 4. Apply Security: workout_logs
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own workout logs" ON workout_logs;
CREATE POLICY "Users can manage their own workout logs" 
ON workout_logs FOR ALL TO authenticated 
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 5. Apply Security: set_logs
ALTER TABLE set_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own sets" ON set_logs;
CREATE POLICY "Users can manage their own sets" 
ON set_logs FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM workout_logs wl 
    WHERE wl.id = set_logs.workout_log_id AND wl.user_id = auth.uid()
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM workout_logs wl 
    WHERE wl.id = set_logs.workout_log_id AND wl.user_id = auth.uid()
  )
);

-- 6. Apply Security: daily_tracking
ALTER TABLE daily_tracking ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own tracking" ON daily_tracking;
CREATE POLICY "Users can manage their own tracking" 
ON daily_tracking FOR ALL TO authenticated 
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 7. Apply Security: users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read their own profile" ON users;
CREATE POLICY "Users can read their own profile" 
ON users FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" 
ON users FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());