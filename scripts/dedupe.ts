import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function dedupe() {
  const { data: exercises, error } = await supabase.from('master_exercises').select('*');
  if (error) throw error;

  console.log(`Found ${exercises.length} total exercises.`);

  const seen = new Set();
  const idsToDelete = [];

  for (const ex of exercises) {
    const key = `${ex.user_id}-${ex.day_of_week}-${ex.exercise_name}`;
    if (seen.has(key)) {
      idsToDelete.push(ex.id);
    } else {
      seen.add(key);
    }
  }

  if (idsToDelete.length > 0) {
    console.log(`Found ${idsToDelete.length} duplicates. Deleting...`);
    const { error: deleteError } = await supabase.from('master_exercises').delete().in('id', idsToDelete);
    if (deleteError) throw deleteError;
    console.log('Duplicates deleted successfully.');
  } else {
    console.log('No duplicates found.');
  }
}

dedupe().catch(console.error);
