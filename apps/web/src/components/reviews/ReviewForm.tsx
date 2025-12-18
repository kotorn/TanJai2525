'use client';

import { useState } from 'react';
import { StarRating } from './StarRating';
import { X, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ReviewFormProps {
  menuItemId: string;
  tenantSlug: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ menuItemId, tenantSlug, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please sign in to submit a review');
      return;
    }

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: submitError } = await supabase
        .from('product_reviews')
        .insert({
          user_id: user.id,
          tenant_slug: tenantSlug,
          menu_item_id: menuItemId,
          rating,
          title,
          comment,
        });

      if (submitError) throw submitError;

      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-anon-card">
      <h3 className="text-anon-3 font-bold text-anon-eerie-black mb-4">
        Write a Review
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-anon-8 text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-anon-7 font-medium text-anon-eerie-black mb-2">
            Your Rating <span className="text-anon-bittersweet">*</span>
          </label>
          <StarRating rating={rating} onRatingChange={setRating} size="lg" />
        </div>

        {/* Title */}
        <div>
          <label className="block text-anon-7 font-medium text-anon-eerie-black mb-2">
            Review Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-anon-cultured rounded-lg focus:border-anon-salmon-pink focus:outline-none focus:ring-2 focus:ring-anon-salmon-pink/20"
            placeholder="Summarize your experience"
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-anon-7 font-medium text-anon-eerie-black mb-2">
            Your Review <span className="text-anon-bittersweet">*</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            rows={4}
            className="w-full px-4 py-2 border border-anon-cultured rounded-lg focus:border-anon-salmon-pink focus:outline-none focus:ring-2 focus:ring-anon-salmon-pink/20 resize-none"
            placeholder="Share your thoughts about this product..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || rating === 0}
            className="flex-1 px-4 py-3 bg-anon-salmon-pink hover:bg-anon-sandy-brown text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-3 border border-anon-cultured hover:bg-gray-50 text-anon-eerie-black font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
