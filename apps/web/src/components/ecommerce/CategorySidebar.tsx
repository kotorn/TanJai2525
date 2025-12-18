'use client';

import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  subcategories?: Array<{
    id: string;
    name: string;
    count: number;
  }>;
}

interface CategorySidebarProps {
  categories: Category[];
  activeCategory?: string;
  onCategorySelect?: (categoryId: string) => void;
}

export function CategorySidebar({ categories, activeCategory, onCategorySelect }: CategorySidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <aside className="w-full lg:w-64 bg-white rounded-xl shadow-anon-card p-6">
      <h2 className="text-anon-3 font-bold text-anon-eerie-black mb-6 pb-3 border-b border-anon-cultured">
        Categories
      </h2>

      <nav className="space-y-1">
        {categories.map((category) => (
          <div key={category.id}>
            {/* Main Category */}
            <button
              onClick={() => {
                onCategorySelect?.(category.id);
                if (category.subcategories) {
                  toggleCategory(category.id);
                }
              }}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all
                ${activeCategory === category.id 
                  ? 'bg-anon-salmon-pink text-white shadow-anon-hover' 
                  : 'text-anon-eerie-black hover:bg-anon-cultured'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{category.icon}</span>
                <span className="text-anon-7 font-medium">{category.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`
                  text-anon-8 px-2 py-0.5 rounded-full
                  ${activeCategory === category.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-anon-cultured text-anon-sonic-silver'
                  }
                `}>
                  {category.count}
                </span>
                {category.subcategories && (
                  <ChevronRight 
                    className={`w-4 h-4 transition-transform ${expandedCategories.has(category.id) ? 'rotate-90' : ''}`}
                  />
                )}
              </div>
            </button>

            {/* Subcategories */}
            {category.subcategories && expandedCategories.has(category.id) && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-anon-cultured pl-3">
                {category.subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => onCategorySelect?.(sub.id)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors
                      ${activeCategory === sub.id 
                        ? 'bg-anon-cultured text-anon-eerie-black font-medium' 
                        : 'text-anon-sonic-silver hover:text-anon-eerie-black hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="text-anon-8">{sub.name}</span>
                    <span className="text-anon-9 text-anon-spanish-gray">{sub.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Price Filter */}
      <div className="mt-8 pt-6 border-t border-anon-cultured">
        <h3 className="text-anon-6 font-bold text-anon-eerie-black mb-4">
          Price Range
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-anon-davys-gray text-anon-salmon-pink focus:ring-anon-salmon-pink/20"
            />
            <span className="text-anon-7 text-anon-sonic-silver group-hover:text-anon-eerie-black">
              Under ฿100
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-anon-davys-gray text-anon-salmon-pink focus:ring-anon-salmon-pink/20"
            />
            <span className="text-anon-7 text-anon-sonic-silver group-hover:text-anon-eerie-black">
              ฿100 - ฿200
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-anon-davys-gray text-anon-salmon-pink focus:ring-anon-salmon-pink/20"
            />
            <span className="text-anon-7 text-anon-sonic-silver group-hover:text-anon-eerie-black">
              ฿200 - ฿300
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-anon-davys-gray text-anon-salmon-pink focus:ring-anon-salmon-pink/20"
            />
            <span className="text-anon-7 text-anon-sonic-silver group-hover:text-anon-eerie-black">
              Over ฿300
            </span>
          </label>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="mt-6 pt-6 border-t border-anon-cultured">
        <h3 className="text-anon-6 font-bold text-anon-eerie-black mb-4">
          Rating
        </h3>
        <div className="space-y-2">
          {[5, 4, 3].map((rating) => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-anon-davys-gray text-anon-salmon-pink focus:ring-anon-salmon-pink/20"
              />
              <div className="flex items-center gap-1 text-anon-8">
                {Array.from({ length: rating }).map((_, i) => (
                  <span key={i} className="text-anon-sandy-brown">★</span>
                ))}
                {Array.from({ length: 5 - rating }).map((_, i) => (
                  <span key={i} className="text-anon-cultured">★</span>
                ))}
                <span className="ml-1 text-anon-sonic-silver group-hover:text-anon-eerie-black">
                  & up
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
