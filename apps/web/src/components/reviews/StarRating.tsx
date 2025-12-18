'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
}

export function StarRating({ 
  rating, 
  onRatingChange, 
  readOnly = false, 
  size = 'md',
  showCount = false,
  count 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (value: number) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => {
        const isFilled = value <= (hoverRating || rating);
        return (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => !readOnly && setHoverRating(value)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            disabled={readOnly}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled 
                  ? 'fill-anon-sandy-brown text-anon-sandy-brown' 
                  : 'text-anon-cultured'
              }`}
            />
          </button>
        );
      })}
      {showCount && count !== undefined && (
        <span className="ml-2 text-anon-8 text-anon-sonic-silver">
          ({count})
        </span>
      )}
    </div>
  );
}
