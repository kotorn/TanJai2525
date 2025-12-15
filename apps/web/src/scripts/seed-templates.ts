
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Database } from '../../../../src/types/database.types';

// Load env from root .env.local (assuming run from root, but let's be safe and try to find it)
const envPath = path.resolve(process.cwd(), '.env.local');
// If not found, try apps/web/.env.local or similar? Usually we run from root in monorepo.
// But valid path to .env.local if running from root is .env.local
dotenv.config({ path: envPath });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; 
// ideally use SERVICE_ROLE_KEY for seeding if available to bypass RLS, 
// using ANON might fail if RLS is strict and we are not logged in.
// But user context implies simulate a user selecting a template?
// "Insert the data into the database for a specific restaurant_id (simulating a user selecting a template)."
// This implies we should probably use a service role key if we want to bypass auth, 
// OR we rely on RLS allowing insertion if we can somehow spoof auth?
// Actually if I run this as a script, I probably want admin rights.
// However, the prompt says "using Supabase Client".
// I will use SUPABASE_SERVICE_ROLE_KEY if available, else ANON.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or ANON) are set.');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// --- Type Definitions for JSON Template ---

interface TemplateOption {
  name: string;
  price_mod: number;
}

interface TemplateOptionGroup {
  name: string;
  min_select: number;
  max_select: number | null; // null means unlimited
  selection_type: 'single' | 'multiple';
  options: TemplateOption[];
}

interface TemplateMenuItem {
  name: string;
  price: number;
  option_groups: TemplateOptionGroup[];
}

interface TemplateCategory {
  name: string;
  items: TemplateMenuItem[];
}

interface RestaurantTemplate {
  slug: string;
  name_th: string;
  categories: TemplateCategory[];
}

// --- Seeding Logic ---

async function seedRestaurant(restaurantId: string, template: RestaurantTemplate) {
  // // // console.log(`Starting seed for restaurant ${restaurantId} with template ${template.slug}...`);

  // Cache for OptionGroups to deduplicate by name
  // key: groupName, value: groupId
  // NOTE: This scope is per-restaurant execution. If we wanted to share across restaurants, we'd query DB first.
  // But option_groups table has restaurant_id, so we can't share across restaurants.
  // We can only deduplicate within the same restaurant.
  const optionGroupCache = new Map<string, string>();

  // 1. Insert Categories
  for (const [catIndex, category] of template.categories.entries()) {
    // // // console.log(`Processing Category: ${category.name}`);
    
    const { data: catData, error: catError } = await supabase
      .from('menu_categories')
      .insert({
        restaurant_id: restaurantId,
        name: category.name,
        sort_order: catIndex
      })
      .select()
      .single();

    if (catError) {
      console.error(`Error inserting category ${category.name}:`, catError);
      continue;
    }

    const categoryId = catData.id;

    // 2. Insert Menu Items
    for (const item of category.items) {
      // // // console.log(`  Processing Item: ${item.name}`);
      
      const { data: itemData, error: itemError } = await supabase
        .from('menu_items')
        .insert({
           restaurant_id: restaurantId,
           category_id: categoryId,
           name: item.name,
           price: item.price,
           is_available: true,
           options: {} // Legacy field, keeping empty as we use relational tables
        })
        .select()
        .single();
      
      if (itemError) {
        console.error(`  Error inserting item ${item.name}:`, itemError);
        continue;
      }

      const itemId = itemData.id;

      // 3. Process Option Groups
      for (const [ogIndex, group] of item.option_groups.entries()) {
        let groupId = optionGroupCache.get(group.name);

        if (!groupId) {
          // Check if it already exists in DB for this restaurant matching name (double check)
          // (Optimization: could load all groups for restaurant upfront, but this is fine only 4 templates)
          const { data: existingGroup } = await supabase
             .from('option_groups')
             .select('id')
             .eq('restaurant_id', restaurantId)
             .eq('name', group.name)
             .single();
          
          if (existingGroup) {
             groupId = existingGroup.id;
             // // // console.log(`    Reusing existing Option Group: ${group.name}`);
          } else {
             // // // console.log(`    Creating new Option Group: ${group.name}`);
             const { data: newGroup, error: groupError } = await supabase
               .from('option_groups')
               .insert({
                 restaurant_id: restaurantId,
                 name: group.name,
                 min_selection: group.min_select,
                 max_selection: group.max_select,
                 selection_type: group.selection_type || (group.max_select === 1 ? 'single' : 'multiple'),
               })
               .select()
               .single();
             
             if (groupError) {
                console.error(`    Error creating group ${group.name}:`, groupError);
                continue;
             }
             groupId = newGroup.id;
             
             // 4. Insert Options for new group
             if (group.options && group.options.length > 0) {
                const optionsPayload = group.options.map((opt, idx) => ({
                   group_id: groupId!,
                   name: opt.name,
                   price: opt.price_mod,
                   sort_order: idx,
                   is_available: true
                }));
                
                const { error: optError } = await supabase.from('options').insert(optionsPayload);
                if (optError) {
                   console.error(`    Error inserting options for ${group.name}:`, optError);
                }
             }
          }
          optionGroupCache.set(group.name, groupId);
        } else {
             // // // console.log(`    Reusing cached Option Group: ${group.name}`);
        }

        // 5. Link Item to Option Group
        const { error: linkError } = await supabase
          .from('menu_item_options')
          .insert({
            menu_item_id: itemId,
            option_group_id: groupId,
            sort_order: ogIndex
          });

        if (linkError) {
           // Ignore duplicate key error if we run script multiple times?
           console.error(`    Error linking group ${group.name} to item ${item.name}:`, linkError);
        }
      }
    }
  }
  // // // console.log('Seed completed successfully!');
}

// --- Main Execution ---

async function main() {
  const args = process.argv.slice(2);
  const helpIndex = args.indexOf('--help');
  if (helpIndex >= 0 || args.length < 2) {
    // // // console.log(`
Usage: npx tsx apps/web/src/scripts/seed-templates.ts <restaurant_id> <template_slug>

Available Templates:
  - noodle-shop
  - made-to-order
  - som-tum-yum
  - cafe

Example:
  npx tsx apps/web/src/scripts/seed-templates.ts "rest-uuid-123" "noodle-shop"
    `);
    process.exit(0);
  }

  const restaurantId = args[0];
  const templateSlug = args[1];

  const templatesPath = path.resolve(__dirname, '../data/restaurant_templates.json');
  if (!fs.existsSync(templatesPath)) {
     console.error(`Templates file not found at ${templatesPath}`);
     process.exit(1);
  }

  const rawData = fs.readFileSync(templatesPath, 'utf-8');
  const templates: RestaurantTemplate[] = JSON.parse(rawData);

  const selectedTemplate = templates.find(t => t.slug === templateSlug);
  if (!selectedTemplate) {
     console.error(`Template "${templateSlug}" not found.`);
     // // // console.log(`Available slugs: ${templates.map(t => t.slug).join(', ')}`);
     process.exit(1);
  }

  await seedRestaurant(restaurantId, selectedTemplate);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
