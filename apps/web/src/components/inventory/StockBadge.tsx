'use client';

import { Package, AlertTriangle, CheckCircle } from 'lucide-react';

interface StockBadgeProps {
  stockQuantity: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
}

export function StockBadge({ stockQuantity, lowStockThreshold = 10, trackInventory = true }: StockBadgeProps) {
  if (!trackInventory) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-anon-9 rounded">
        <Package className="w-3 h-3" />
        <span>Always Available</span>
      </div>
    );
  }

  if (stockQuantity === 0) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-anon-9 font-medium rounded">
        <AlertTriangle className="w-3 h-3" />
        <span>Out of Stock</span>
      </div>
    );
  }

  if (stockQuantity <= lowStockThreshold) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-anon-9 font-medium rounded">
        <AlertTriangle className="w-3 h-3" />
        <span>Only {stockQuantity} left!</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-anon-9 rounded">
      <CheckCircle className="w-3 h-3" />
      <span>In Stock ({stockQuantity})</span>
    </div>
  );
}
