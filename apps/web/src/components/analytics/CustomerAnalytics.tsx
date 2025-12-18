'use client';

import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Star,
  Package,
  ShoppingCart 
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface CustomerInsights {
  vipCount: number;
  regularCount: number;
  newCount: number;
  totalCustomers: number;
  averageLTV: number;
  topCustomers: Array<{
    displayName: string;
    lifetimeValue: number;
    totalOrders: number;
    tier: string;
  }>;
}

export function CustomerAnalytics() {
  const [insights, setInsights] = useState<CustomerInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      // Refresh materialized view
      await supabase.rpc('refresh_analytics');

      // Get customer insights
      const { data, error } = await supabase
        .from('customer_analytics')
        .select('*')
        .order('lifetime_value', { ascending: false });

      if (error) throw error;

      const vipCount = data.filter(c => c.customer_tier === 'VIP').length;
      const regularCount = data.filter(c => c.customer_tier === 'Regular').length;
      const newCount = data.filter(c => c.customer_tier === 'New').length;
      const avgLTV = data.reduce((sum, c) => sum + (c.lifetime_value || 0), 0) / data.length;

      setInsights({
        vipCount,
        regularCount,
        newCount,
        totalCustomers: data.length,
        averageLTV: avgLTV || 0,
        topCustomers: data.slice(0, 10).map(c => ({
          displayName: c.display_name || c.email,
          lifetimeValue: c.lifetime_value || 0,
          totalOrders: c.total_orders || 0,
          tier: c.customer_tier,
        })),
      });
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-96 rounded-xl"></div>;
  }

  if (!insights) return null;

  const tierColors = {
    VIP: 'bg-purple-100 text-purple-700',
    Regular: 'bg-blue-100 text-blue-700',
    New: 'bg-green-100 text-green-700',
    Prospect: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-anon-eerie-black">
        Customer Analytics
      </h2>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-anon-card">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-anon-sonic-silver" />
            <span className="text-anon-8 text-anon-sonic-silver">Total Customers</span>
          </div>
          <p className="text-3xl font-black text-anon-eerie-black">
            {insights.totalCustomers}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-anon-card">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-5 h-5 text-purple-500" />
            <span className="text-anon-8 text-anon-sonic-silver">VIP Customers</span>
          </div>
          <p className="text-3xl font-black text-purple-600">
            {insights.vipCount}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-anon-card">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span className="text-anon-8 text-anon-sonic-silver">Regular</span>
          </div>
          <p className="text-3xl font-black text-blue-600">
            {insights.regularCount}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-anon-card">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <span className="text-anon-8 text-anon-sonic-silver">Avg LTV</span>
          </div>
          <p className="text-3xl font-black text-green-600">
            ฿{insights.averageLTV.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-white p-6 rounded-xl shadow-anon-card">
        <h3 className="text-xl font-bold text-anon-eerie-black mb-4">
          Top Customers by Lifetime Value
        </h3>
        <div className="space-y-3">
          {insights.topCustomers.map((customer, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-3 border-b border-anon-cultured last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-anon-cultured rounded-full flex items-center justify-center font-bold text-anon-sonic-silver">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-anon-eerie-black">
                    {customer.displayName}
                  </p>
                  <p className="text-anon-9 text-anon-sonic-silver">
                    {customer.totalOrders} orders
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-anon-9 font-medium ${tierColors[customer.tier as keyof typeof tierColors]}`}>
                  {customer.tier}
                </span>
                <p className="font-bold text-anon-eerie-black w-24 text-right">
                  ฿{customer.lifetimeValue.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
