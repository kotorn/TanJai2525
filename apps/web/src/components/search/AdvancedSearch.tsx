'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

interface SearchFilters {
  query: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  categories?: Array<{ id: string; name: string }>;
}

export function AdvancedSearch({ onSearch, categories = [] }: AdvancedSearchProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sortBy: 'relevance',
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      query: '',
      sortBy: 'relevance',
    });
    onSearch({ query: '', sortBy: 'relevance' });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-anon-card">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-anon-sonic-silver" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 border border-anon-cultured rounded-xl focus:border-anon-salmon-pink focus:outline-none focus:ring-2 focus:ring-anon-salmon-pink/20"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 border rounded-xl transition-colors ${
            showFilters
              ? 'bg-anon-salmon-pink text-white border-anon-salmon-pink'
              : 'border-anon-cultured hover:bg-gray-50'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-anon-salmon-pink hover:bg-anon-sandy-brown text-white font-bold rounded-xl transition-colors"
        >
          Search
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-anon-cultured space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category */}
            <div>
              <label className="block text-anon-8 font-medium text-anon-eerie-black mb-2">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-anon-cultured rounded-lg focus:border-anon-salmon-pink focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-anon-8 font-medium text-anon-eerie-black mb-2">
                Min Price
              </label>
              <input
                type="number"
                value={filters.minPrice || ''}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="฿0"
                className="w-full px-3 py-2 border border-anon-cultured rounded-lg focus:border-anon-salmon-pink focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-anon-8 font-medium text-anon-eerie-black mb-2">
                Max Price
              </label>
              <input
                type="number"
                value={filters.maxPrice || ''}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="฿1000"
                className="w-full px-3 py-2 border border-anon-cultured rounded-lg focus:border-anon-salmon-pink focus:outline-none"
              />
            </div>

            {/* Min Rating */}
            <div>
              <label className="block text-anon-8 font-medium text-anon-eerie-black mb-2">
                Min Rating
              </label>
              <select
                value={filters.minRating || ''}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-anon-cultured rounded-lg focus:border-anon-salmon-pink focus:outline-none"
              >
                <option value="">Any Rating</option>
                <option value="4">4★ & up</option>
                <option value="3">3★ & up</option>
                <option value="2">2★ & up</option>
              </select>
            </div>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-4">
            <label className="text-anon-8 font-medium text-anon-eerie-black">
              Sort by:
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'relevance', label: 'Relevance' },
                { value: 'price_asc', label: 'Price: Low to High' },
                { value: 'price_desc', label: 'Price: High to Low' },
                { value: 'rating', label: 'Highest Rated' },
                { value: 'newest', label: 'Newest' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilters({ ...filters, sortBy: option.value as any })}
                  className={`px-4 py-2 text-anon-8 rounded-lg transition-colors ${
                    filters.sortBy === option.value
                      ? 'bg-anon-salmon-pink text-white'
                      : 'bg-anon-cultured text-anon-eerie-black hover:bg-anon-salmon-pink/10'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-end">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-anon-8 text-anon-sonic-silver hover:text-anon-eerie-black transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
