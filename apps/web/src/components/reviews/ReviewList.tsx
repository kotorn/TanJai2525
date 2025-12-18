'use client';

import { StarRating } from './StarRating';
import { ThumbsUp, User } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title?: string;
  comment: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  user_profiles?: {
    display_name?: string;
  };
}

interface ReviewListProps {
  menuItemId: string;
  reviews: Review[];
  onReviewsUpdate?: () => void;
}

export function ReviewList({ menuItemId, reviews, onReviewsUpdate }: ReviewListProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());

  const handleHelpful = async (reviewId: string) => {
    if (!user) return;

    try {
      if (helpfulReviews.has(reviewId)) {
        // Remove helpful vote
        await supabase
          .from('review_helpful')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', user.id);
        
        setHelpfulReviews((prev) => {
          const next = new Set(prev);
          next.delete(reviewId);
          return next;
        });
      } else {
        // Add helpful vote
        await supabase
          .from('review_helpful')
          .insert({ review_id: reviewId, user_id: user.id });
        
        setHelpfulReviews((prev) => new Set(prev).add(reviewId));
      }

      onReviewsUpdate?.();
    } catch (error) {
      console.error('Error updating helpful vote:', error);
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-anon-sonic-silver">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white p-6 rounded-xl shadow-anon-card">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-anon-cultured rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-anon-sonic-silver" />
              </div>
              <div>
                <p className="font-medium text-anon-eerie-black">
                  {review.user_profiles?.display_name || 'Anonymous'}
                  {review.verified_purchase && (
                    <span className="ml-2 text-anon-9 text-anon-ocean-green">✓ Verified Purchase</span>
                  )}
                </p>
                <p className="text-anon-9 text-anon-sonic-silver">
                  {new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <StarRating rating={review.rating} readOnly size="sm" />
          </div>

          {/* Title */}
          {review.title && (
            <h4 className="font-bold text-anon-eerie-black mb-2">{review.title}</h4>
          )}

          {/* Comment */}
          <p className="text-anon-7 text-anon-sonic-silver mb-4 leading-relaxed">
            {review.comment}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-4 pt-3 border-t border-anon-cultured">
            <button
              onClick={() => handleHelpful(review.id)}
              disabled={!user}
              className={`flex items-center gap-2 text-anon-8 ${
                helpfulReviews.has(review.id)
                  ? 'text-anon-salmon-pink'
                  : 'text-anon-sonic-silver hover:text-anon-eerie-black'
              } transition-colors disabled:opacity-50`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Helpful ({review.helpful_count})</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
