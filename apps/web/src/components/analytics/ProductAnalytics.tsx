'use client';

import { TrendingUp, Eye, ShoppingCart, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ProductPerformance {
  topSelling: Array<{
    name: string;
    totalSold: number;
    revenue: number;
    rating: number;
  }>;
  topRated: Array<{
    name: string;
    rating: number;
    reviewCount: number;
  }>;
  trending: Array<{
    name: string;
    viewCount: number;
    conversionRate: number;
  }>;
}

export function ProductAnalytics() {
  const [performance, setPerformance] = useState<ProductPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadPerformance();
  }, []);

  const loadPerformance = async () => {
    try {
      const { data, error } = await supabase
        .from('product_analytics')
        .select('*')
        .order('popularity_score', { ascending: false });

      if (error) throw error;

      const topSelling = data
        .sort((a, b) => b.total_revenue - a.total_revenue)
        .slice(0, 5)
        .map(p => ({
          name: p.name,
          totalSold: p.total_quantity_sold || 0,
          revenue: p.total_revenue || 0,
          rating: p.average_rating || 0,
        }));

      const topRated = data
        .filter(p => p.review_count > 0)
        .sort((a, b) => b.average_rating - a.average_rating)
        .slice(0, 5)
        .map(p => ({
          name: p.name,
          rating: p.average_rating || 0,
          reviewCount: p.review_count || 0,
        }));

      const trending = data
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, 5)
        .map(p => ({
          name: p.name,
          viewCount: p.view_count || 0,
          conversionRate: p.conversion_rate || 0,
        }));

      setPerformance({ topSelling, topRated, trending });
    } catch (error) {
      console.error('Error loading performance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-96 rounded-xl"></div>;
  }

  if (!performance) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-anon-eerie-black">
        Product Analytics
      </h2>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Selling */}
        <div className="bg-white p-6 rounded-xl shadow-anon-card">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold text-anon-eerie-black">
              Top Selling
            </h3>
          </div>
          <div className="space-y-3">
            {performance.topSelling.map((product, index) => (
              <div key={index} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-anon-eerie-black text-anon-8">
                    {product.name}
                  </p>
                  <p className="text-anon-9 text-anon-sonic-silver">
                    {product.totalSold} sold
                  </p>
                </div>
                <p className="font-bold text-green-600">
                  ฿{product.revenue.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Rated */}
        <div className="bg-white p-6 rounded-xl shadow-anon-card">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-bold text-anon-eerie-black">
              Top Rated
            </h3>
          </div>
          <div className="space-y-3">
            {performance.topRated.map((product, index) => (
              <div key={index} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-anon-eerie-black text-anon-8">
                    {product.name}
                  </p>
                  <p className="text-anon-9 text-anon-sonic-silver">
                    {product.reviewCount} reviews
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="font-bold text-yellow-600">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending */}
        <div className="bg-white p-6 rounded-xl shadow-anon-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-anon-eerie-black">
              Trending
            </h3>
          </div>
          <div className="space-y-3">
            {performance.trending.map((product, index) => (
              <div key={index} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-anon-eerie-black text-anon-8">
                    {product.name}
                  </p>
                  <p className="text-anon-9 text-anon-sonic-silver">
                    {product.viewCount} views
                  </p>
                </div>
                <p className="font-bold text-blue-600">
                  {product.conversionRate.toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
