import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const { data, error } = await supabase.from('tables').select('*').limit(5);
  if (error) {
    console.error('Error fetching tables:', error);
    return;
  }
  console.log('TABLES_DATA:' + JSON.stringify(data));
}

checkTables();
