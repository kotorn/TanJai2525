import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/feed/facebook-catalog.xml
 * Generates an XML product feed for Facebook/Instagram Commerce Manager.
 * Usage: /api/feed/facebook-catalog.xml?restaurant_id=UUID
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurant_id');

    if (!restaurantId) {
        return new Response('Missing restaurant_id', { status: 400 });
    }

    const supabase = createClient();

    // 1. Fetch menu items and their associated inventory data
    // Note: Assuming a simple 1:1 mapping for MVP. 
    // In complex setups, one menu item might map to multiple inventory ingredients.
    const { data: items, error } = await supabase
        .from('menu_items')
        .select(`
            id,
            name,
            description,
            price,
            image_url,
            is_available
        `)
        .eq('restaurant_id', restaurantId);

    if (error) {
        console.error('[FacebookFeed] Error fetching items:', error);
        return new Response('Error fetching data', { status: 500 });
    }

    // 2. Generate XML
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tanjai.app';

    let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>TanJai POS Catalog</title>
    <link>${baseUrl}</link>
    <description>Product feed for Facebook Catalog Sync</description>
    `;

    for (const item of items) {
        // Simple stock check logic
        const availability = item.is_available ? 'in stock' : 'out of stock';

        xml += `
    <item>
      <g:id>${item.id}</g:id>
      <g:title><![CDATA[${item.name}]]></g:title>
      <g:description><![CDATA[${item.description || item.name}]]></g:description>
      <g:link>${baseUrl}/menu/${item.id}</g:link>
      <g:image_link>${item.image_url || baseUrl + '/placeholder-food.png'}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${item.price} THB</g:price>
      <g:brand>TanJai POS</g:brand>
    </item>`;
    }

    xml += `
  </channel>
</rss>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
        },
    });
}
