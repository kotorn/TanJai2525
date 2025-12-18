'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  recommendationType: string;
}

interface ProductRecommendationsProps {
  productId: string;
  type?: 'similar' | 'frequently_bought' | 'recently_viewed';
}

export function ProductRecommendations({ 
  productId, 
  type = 'similar' 
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadRecommendations();
  }, [productId, type]);

  const loadRecommendations = async () => {
    try {
      if (type === 'frequently_bought') {
        const { data, error } = await supabase
          .rpc('get_frequently_bought_together', {
            p_menu_item_id: productId,
            p_limit: 4,
          });

        if (error) throw error;
        setRecommendations(data || []);
      } else {
        const { data, error } = await supabase
          .rpc('get_product_recommendations', {
            p_menu_item_id: productId,
            p_limit: 5,
          });

        if (error) throw error;
        setRecommendations(data || []);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 h-48 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  const titles = {
    similar: '🔥 You May Also Like',
    frequently_bought: '🛒 Frequently Bought Together',
    recently_viewed: '👀 Recently Viewed',
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-anon-eerie-black">
        {titles[type]}
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-anon-card overflow-hidden hover:shadow-anon-hover transition-shadow cursor-pointer"
          >
            <div className="aspect-square bg-gray-200 flex items-center justify-center text-4xl">
              🍜
            </div>
            <div className="p-3">
              <h4 className="font-medium text-anon-eerie-black text-anon-8 line-clamp-2">
                {product.name}
              </h4>
              <p className="text-anon-salmon-pink font-bold mt-1">
                ฿{product.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
