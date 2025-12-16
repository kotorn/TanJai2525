import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { STRESS_TEST_DATA } from '@/lib/mock-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();
  console.log('Attempting to seed. URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Key length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length);

  // 1. Create Tenant (Mock) or Restaurant
  // We need a restaurant first.
  const { data: restaurants } = await supabase.from('restaurants').select('id').limit(1);
  let restaurantId = restaurants?.[0]?.id;

  if (!restaurantId) {
    const { data: newRest, error } = await supabase.from('restaurants').insert({
        name: 'Tanjai QA',
        slug: 'tanjai-qa'
    }).select().single();
    if(error) return NextResponse.json({ error: error.message }, { status: 500 });
    restaurantId = newRest.id;
  }

  // 2. Create Categories
  const categories = ['Main Course', 'Appetizer', 'Side Dish', 'Beverage', 'Dessert'];
  const catMap: Record<string, string> = {};

  for (const catName of categories) {
    const { data: existing } = await supabase.from('menu_categories').select('id').eq('name', catName).single();
    if (existing) {
        catMap[catName] = existing.id;
    } else {
        const { data: newCat } = await supabase.from('menu_categories').insert({
            name: catName,
            restaurant_id: restaurantId,
            sort_order: 0
        }).select().single();
        if (newCat) catMap[catName] = newCat.id;
    }
  }

  // 3. Insert Items
  for (const item of STRESS_TEST_DATA.MENU_ITEMS) {
    const catId = catMap[item.category] || catMap['Main Course'];
    // Check if exists
    const { data: existing } = await supabase.from('menu_items').select('id').eq('name', item.name).single();
    if (!existing) {
         await supabase.from('menu_items').insert({
            name: item.name,
            price: item.price,
            category_id: catId,
            restaurant_id: restaurantId,
            is_available: true,
            description: 'QA Auto Generated',
             // id: item.id // Let PG generate ID or force it? Better let PG generate if UUID, but test might check ID?
             // Test checks TEXT. So ID doesn't matter much unless test relies on specific ID.
        });
    }
  }

  return NextResponse.json({ success: true, message: 'Seeding Complete' });
}
