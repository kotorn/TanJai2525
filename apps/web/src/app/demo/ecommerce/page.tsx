'use client';

import { TopBanner } from '@/components/ecommerce/TopBanner';
import { EcommerceHeader } from '@/components/ecommerce/EcommerceHeader';
import { CheckoutModal } from '@/components/ecommerce/CheckoutModal';
import { CategorySidebar } from '@/components/ecommerce/CategorySidebar';
import { useState } from 'react';

export default function EcommerceDemoPage() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ramen');
  const [cartItems] = useState([
    { id: '1', name: 'Tonkotsu Ramen', price: 280, quantity: 2 },
    { id: '2', name: 'Gyoza (6pcs)', price: 120, quantity: 1 },
  ]);

  const mockCategories = [
    {
      id: 'ramen',
      name: 'Ramen',
      icon: '🍜',
      count: 12,
      subcategories: [
        { id: 'tonkotsu', name: 'Tonkotsu', count: 5 },
        { id: 'shoyu', name: 'Shoyu', count: 4 },
        { id: 'miso', name: 'Miso', count: 3 },
      ],
    },
    {
      id: 'congee',
      name: 'Congee',
      icon: '🍚',
      count: 8,
      subcategories: [
        { id: 'pork', name: 'Pork Congee', count: 3 },
        { id: 'chicken', name: 'Chicken Congee', count: 3 },
        { id: 'seafood', name: 'Seafood Congee', count: 2 },
      ],
    },
    {
      id: 'beverages',
      name: 'Beverages',
      icon: '🥤',
      count: 15,
    },
    {
      id: 'desserts',
      name: 'Desserts',
      icon: '🍰',
      count: 6,
    },
    {
      id: 'appetizers',
      name: 'Appetizers',
      icon: '🥟',
      count: 10,
    },
  ];

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Banner */}
      <TopBanner />

      {/* Header */}
      <EcommerceHeader 
        cartItemCount={totalItems}
        onMenuClick={() => alert('Mobile menu clicked!')}
      />

      {/* Demo Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-black text-anon-eerie-black">
              E-commerce Components Demo
            </h1>
            <p className="text-anon-sonic-silver text-lg">
              Showcasing the new Anon-inspired header, banner, and checkout modal
            </p>
          </div>

          {/* Component Showcase */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* CategorySidebar Demo */}
            <div className="lg:col-span-1">
              <CategorySidebar 
                categories={mockCategories}
                activeCategory={activeCategory}
                onCategorySelect={setActiveCategory}
              />
            </div>

            {/* Info Cards */}
            <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
              {/* TopBanner Card */}
              <div className="bg-white p-6 rounded-xl shadow-anon-card">
                <h2 className="text-xl font-bold text-anon-eerie-black mb-3">
                  ✅ TopBanner
                </h2>
                <ul className="space-y-2 text-anon-7 text-anon-sonic-silver">
                  <li>• Promotional message</li>
                  <li>• Gradient background</li>
                  <li>• Closeable with X button</li>
                  <li>• Sticky top position</li>
                </ul>
              </div>

              {/* CategorySidebar Card */}
              <div className="bg-white p-6 rounded-xl shadow-anon-card">
                <h2 className="text-xl font-bold text-anon-eerie-black mb-3">
                  ✅ CategorySidebar
                </h2>
                <ul className="space-y-2 text-anon-7 text-anon-sonic-silver">
                  <li>• Expandable categories</li>
                  <li>• Subcategory navigation</li>
                  <li>• Price range filter</li>
                  <li>• Rating filter</li>
                </ul>
                <p className="mt-3 text-anon-8 text-anon-salmon-pink font-medium">
                  → Try clicking categories on the left!
                </p>
              </div>

              {/* Header Card */}
              <div className="bg-white p-6 rounded-xl shadow-anon-card">
                <h2 className="text-xl font-bold text-anon-eerie-black mb-3">
                  ✅ EcommerceHeader
                </h2>
                <ul className="space-y-2 text-anon-7 text-anon-sonic-silver">
                  <li>• Search bar with focus states</li>
                  <li>• Cart icon with badge ({totalItems})</li>
                  <li>• Wishlist & User account</li>
                  <li>• Mobile responsive</li>
                </ul>
              </div>

              {/* CheckoutModal Card */}
              <div className="bg-white p-6 rounded-xl shadow-anon-card">
                <h2 className="text-xl font-bold text-anon-eerie-black mb-3">
                  ✅ CheckoutModal
                </h2>
                <ul className="space-y-2 text-anon-7 text-anon-sonic-silver mb-4">
                  <li>• Multi-step checkout flow</li>
                  <li>• Perfect text contrast (15.8:1)</li>
                  <li>• LINE Pay integration</li>
                  <li>• Shipping form with validation</li>
                </ul>
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full px-4 py-3 bg-anon-salmon-pink hover:bg-anon-sandy-brown text-white font-bold rounded-xl transition-colors shadow-anon-hover"
                >
                  Test Checkout Modal
                </button>
              </div>

              {/* Design System Card */}
              <div className="bg-white p-6 rounded-xl shadow-anon-card">
                <h2 className="text-xl font-bold text-anon-eerie-black mb-3">
                  🎨 Design System
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-anon-8 text-anon-spanish-gray mb-1">Colors</p>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-anon-salmon-pink rounded" title="Salmon Pink"></div>
                      <div className="w-8 h-8 bg-anon-eerie-black rounded" title="Eerie Black"></div>
                      <div className="w-8 h-8 bg-anon-sandy-brown rounded" title="Sandy Brown"></div>
                      <div className="w-8 h-8 bg-anon-ocean-green rounded" title="Ocean Green"></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-anon-8 text-anon-spanish-gray mb-1">Shadows</p>
                    <div className="flex gap-2">
                      <div className="w-12 h-12 bg-white shadow-anon-card rounded"></div>
                      <div className="w-12 h-12 bg-white shadow-anon-hover rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="bg-gradient-to-br from-anon-salmon-pink/10 to-anon-sandy-brown/10 p-8 rounded-2xl border border-anon-salmon-pink/20">
              <h2 className="text-2xl font-bold text-anon-eerie-black mb-6">
                🚀 Completed Features
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-anon-ocean-green text-2xl">✓</span>
                  <div>
                    <p className="font-bold text-anon-eerie-black">Anon Color System</p>
                    <p className="text-anon-8 text-anon-sonic-silver">11 colors integrated into Tailwind</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-anon-ocean-green text-2xl">✓</span>
                  <div>
                    <p className="font-bold text-anon-eerie-black">Typography Scale</p>
                    <p className="text-anon-8 text-anon-sonic-silver">11 font sizes (anon-1 to anon-11)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-anon-ocean-green text-2xl">✓</span>
                  <div>
                    <p className="font-bold text-anon-eerie-black">WCAG AAA Compliance</p>
                    <p className="text-anon-8 text-anon-sonic-silver">Contrast ratio 15.8:1</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-anon-ocean-green text-2xl">✓</span>
                  <div>
                    <p className="font-bold text-anon-eerie-black">Mobile Responsive</p>
                    <p className="text-anon-8 text-anon-sonic-silver">All components adapt to screen size</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        total={total}
      />
    </div>
  );
}
