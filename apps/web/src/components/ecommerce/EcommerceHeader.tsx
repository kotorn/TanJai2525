'use client';

import { Search, ShoppingCart, Menu, User, Heart } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface EcommerceHeaderProps {
  cartItemCount?: number;
  onMenuClick?: () => void;
}

export function EcommerceHeader({ cartItemCount = 0, onMenuClick }: EcommerceHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white border-b border-anon-cultured sticky top-0 z-40">
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-anon-eerie-black hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-anon-salmon-pink to-anon-sandy-brown rounded-lg">
              <span className="text-white font-black text-xl">T</span>
            </div>
            <span className="font-black text-xl text-anon-eerie-black hidden sm:block">
              TanJai
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full px-4 py-3 pr-12 text-anon-7 text-anon-eerie-black border border-anon-cultured rounded-xl focus:outline-none focus:border-anon-salmon-pink focus:ring-2 focus:ring-anon-salmon-pink/20 transition-all"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-anon-sonic-silver hover:text-anon-salmon-pink transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button - Mobile */}
            <button className="md:hidden p-2 text-anon-eerie-black hover:bg-gray-100 rounded-lg">
              <Search className="w-6 h-6" />
            </button>

            {/* Wishlist */}
            <button className="hidden sm:flex p-2 text-anon-eerie-black hover:bg-gray-100 rounded-lg relative">
              <Heart className="w-6 h-6" />
            </button>

            {/* User Account */}
            <button className="hidden sm:flex p-2 text-anon-eerie-black hover:bg-gray-100 rounded-lg">
              <User className="w-6 h-6" />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="flex items-center gap-2 px-4 py-2 bg-anon-eerie-black hover:bg-anon-onyx text-white rounded-lg transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-anon-bittersweet text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
              <span className="hidden sm:inline text-anon-7 font-medium">Cart</span>
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2.5 pr-10 text-anon-7 text-anon-eerie-black border border-anon-cultured rounded-lg focus:outline-none focus:border-anon-salmon-pink focus:ring-2 focus:ring-anon-salmon-pink/20"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-anon-sonic-silver">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation - Desktop */}
      <nav className="hidden lg:block border-t border-anon-cultured">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-8 py-3">
            <li>
              <Link href="/categories/ramen" className="text-anon-7 text-anon-eerie-black hover:text-anon-salmon-pink font-medium transition-colors">
                Ramen
              </Link>
            </li>
            <li>
              <Link href="/categories/congee" className="text-anon-7 text-anon-eerie-black hover:text-anon-salmon-pink font-medium transition-colors">
                Congee
              </Link>
            </li>
            <li>
              <Link href="/categories/beverages" className="text-anon-7 text-anon-eerie-black hover:text-anon-salmon-pink font-medium transition-colors">
                Beverages
              </Link>
            </li>
            <li>
              <Link href="/categories/desserts" className="text-anon-7 text-anon-eerie-black hover:text-anon-salmon-pink font-medium transition-colors">
                Desserts
              </Link>
            </li>
            <li className="ml-auto">
              <Link href="/deals" className="text-anon-7 text-anon-bittersweet hover:text-anon-salmon-pink font-bold transition-colors">
                🔥 Hot Deals
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
