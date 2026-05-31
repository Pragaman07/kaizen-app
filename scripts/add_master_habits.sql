CREATE TABLE public.master_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL,
    nutrition_text TEXT,
    supplements_text TEXT,
    night_routine_text TEXT,
    UNIQUE(user_id, day_of_week)
);

-- Note: In Supabase, you may also need to set up RLS policies depending on your configuration.
-- For local/dev environments without RLS or using the service key, this is sufficient.
