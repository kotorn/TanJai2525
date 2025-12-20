import { createClient } from '@/lib/supabase/server';
import { validateTenantOwnership } from '@/lib/tenant-auth';
import Link from 'next/link';
import RecipeEditor from '@/features/inventory/components/recipe-editor';
import { ArrowLeft, ChefHat } from 'lucide-react';

export default async function Page({ params }: { params: { tenant: string; id: string } }) {
    const { tenant } = await validateTenantOwnership(params.tenant);
    const supabase = createClient();

    // 1. Fetch Menu Item
    const { data: menuItem } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', params.id)
        .eq('tenant_id', tenant.id) // Security check
        .single();

    if (!menuItem) return <div>Menu Item not found</div>;

    // 2. Fetch Existing Recipe Items
    const { data: recipeItems } = await supabase
        .from('recipes')
        .select(`
            id,
            quantity_required,
            ingredient:ingredients (
                id,
                name,
                unit,
                cost_per_unit
            )
        `)
        .eq('menu_item_id', menuItem.id);

    // 3. Fetch All Ingredients (for the dropdown)
    const { data: allIngredients } = await supabase
        .from('ingredients')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('name');

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <Link
                href={`/${params.tenant}/menu`}
                className="inline-flex items-center text-gray-500 hover:text-gray-800 transition-colors mb-4"
            >
                <ArrowLeft size={16} className="mr-1" /> Back to Menu
            </Link>

            <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                    <ChefHat size={32} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{menuItem.name}</h1>
                    <p className="text-gray-500">Recipe Management</p>
                </div>
            </div>

            <RecipeEditor
                menuItemId={menuItem.id}
                initialRecipe={recipeItems || []}
                allIngredients={allIngredients || []}
            />
        </div>
    );
}
