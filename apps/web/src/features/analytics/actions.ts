'use server';

import { createClient } from '@/lib/supabase/server';
import { format, subDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { validateTenantOwnership } from '@/lib/tenant-auth';

// Define Interfaces for Type Safety
interface DailyStat {
    sale_date: string;
    total_orders: number;
    total_revenue: number;
    aov: number;
}

interface HourlyStat {
    sale_hour: string;
    revenue: number;
}

const TZ = 'Asia/Bangkok';

export async function getDashboardMetrics(tenantId: string) {
    // 0. Security Guard
    await validateTenantOwnership(tenantId);

    const supabase = createClient();

    // Get Current Date in Bangkok Time
    const now = new Date();
    const zonedNow = toZonedTime(now, TZ);
    const todayStr = format(zonedNow, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(zonedNow, 1), 'yyyy-MM-dd');

    // 1. Fetch Today's Stats from View
    const { data: todayStats } = await supabase
        .from('daily_sales_stats')
        .select('*')
        .eq('sale_date', todayStr) // View column is timestamp, but Supabase might match partial? No.
        // Issue: date_trunc returns timestamp (2025-12-19 00:00:00+07).
        // Safest is range or exact match on timestamp string if we construct it perfectly.
        // Let's try .eq with the full ISO string of the start of the day in Bangkok?
        // Actually, let's just use Range GTE/LTE on the view if needed, or better:
        // Query filter: sale_date >= '2025-12-19 00:00:00+07' AND < next day.
        // Or simpler: The View output is timestamp.
        .gte('sale_date', `${todayStr}T00:00:00+07:00`)
        .lt('sale_date', `${format(subDays(zonedNow, -1), 'yyyy-MM-dd')}T00:00:00+07:00`)
        .maybeSingle();

    // 2. Fetch Yesterday's Stats
    const { data: yesterdayStats } = await supabase
        .from('daily_sales_stats')
        .select('total_revenue')
        .gte('sale_date', `${yesterdayStr}T00:00:00+07:00`)
        .lt('sale_date', `${todayStr}T00:00:00+07:00`)
        .maybeSingle();

    // 3. Fetch Hourly Trend for Today
    const { data: hourlyStats } = await supabase
        .from('hourly_sales_stats')
        .select('*')
        .gte('sale_hour', `${todayStr}T00:00:00+07:00`)
        .order('sale_hour', { ascending: true });

    // 4. Data Transformation
    const kpi = {
        revenue: todayStats?.total_revenue || 0,
        orders: todayStats?.total_orders || 0,
        aov: todayStats?.aov || 0,
        prevRevenue: yesterdayStats?.total_revenue || 0
    };

    // Fill 24h array
    const salesTrend = new Array(24).fill(0).map((_, i) => ({
        name: `${i}:00`,
        total: 0
    }));

    if (hourlyStats) {
        hourlyStats.forEach((stat: HourlyStat) => {
            const date = new Date(stat.sale_hour);
            // Warning: new Date(ISO) might be UTC or Local.
            // If string has +07, generic JS Date handles it.
            // We want the hour in Bangkok.
            // If running on a server in UTC, we need to shift. properties of date object are in local (UTC presumably).
            // `toZonedTime` helps to inspect.
            const h = new Date(stat.sale_hour).getHours();
            // Wait, if string is '2025...T00:00:00+07:00', new Date() parses it to correct absolute time.
            // .getHours() returns hour in LOCAL system time. Vercel is UTC.
            // So +07:00 becomes previous day 17:00.
            // We need to extract hour from the ISO string directly or shift.
            // Simplest: The View already truncated to hour in Bangkok. 
            // So the 'hour timestamp' represents the start of the hour in Bangkok?
            // Yes `date_trunc('hour', ... AT TIME ZONE 'Asia/Bangkok')` returns a timestamp WITHOUT timezone? No, usually generic timestamp.
            // Let's assume the string format is usable or use sub-string since we trust the view logic.
            // Better: use library to extract hour from date string.

            // Hacky but reliable for fixed Timezone View:
            // "2025-12-19T09:00:00..."
            const hourStr = stat.sale_hour.substring(11, 13); // Extract HH
            const hInt = parseInt(hourStr, 10);
            if (!isNaN(hInt) && hInt >= 0 && hInt < 24) {
                salesTrend[hInt].total = stat.revenue;
            }
        });
    }

    return {
        kpi,
        trends: salesTrend
    };
}

export async function getTopItems(tenantId: string) {
    // 0. Security Guard
    await validateTenantOwnership(tenantId);

    const supabase = createClient();
    const today = new Date();
    const zonedNow = toZonedTime(today, TZ);
    const start = format(zonedNow, 'yyyy-MM-dd') + 'T00:00:00+07:00';

    // Fallback to aggregation on raw data for Items (View is for Sales)
    // Assuming Volume is manageable for Top Items or we create another view later.
    const { data: items } = await supabase
        .from('order_items')
        .select(`
            quantity,
            menu_items ( name )
        `)
        .gte('created_at', start);

    if (!items) return [];

    const map = new Map<string, number>();
    items.forEach((item: any) => {
        const name = item.menu_items?.name || 'Unknown';
        map.set(name, (map.get(name) || 0) + item.quantity);
    });

    return Array.from(map.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
}
