import { SupabaseClient } from '@supabase/supabase-js'

export function isMockMode() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return !url || url.includes("your-project-url");
}

export async function getRestaurantId(supabase: SupabaseClient) {
    if (isMockMode()) return "mock-rest-1";

    // 1. Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // 2. Fetch the restaurant associated with the user
    // Assuming RLS allows the user to see their own restaurants.
    const { data } = await supabase
        .from('restaurants')
        .select('id')
        .limit(1)
        .single();
    
    if (data) return data.id;

    return null;
}
