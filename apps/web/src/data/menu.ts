import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

export const getMenu = cache(async (restaurantId: string) => {
  const supabase = createClient();
  
  const { data: categories, error } = await (await supabase)
    .from('menu_categories')
    .select(`
      id,
      name,
      sort_order,
      menu_items (
        id,
        name,
        price,
        description,
        image_url,
        is_available,
        stock
      )
    `)
    .eq('tenant_id', restaurantId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching menu:', error);
    return [];
  }

  return categories;
});
