import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../apps/tanjai-2525/.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRestaurants() {
  const { data, error } = await supabase.from('restaurants').select('*');
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Restaurants:', JSON.stringify(data, null, 2));
}

checkRestaurants();
