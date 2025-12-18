'use client';

import { useState } from 'react';
import { CheckoutModal } from '@/components/ecommerce/CheckoutModal';

export default function CheckoutDemoPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockCartItems = [
    { id: '1', name: 'Tonkotsu Ramen', price: 280, quantity: 2 },
    { id: '2', name: 'Gyoza (6pcs)', price: 120, quantity: 1 },
    { id: '3', name: 'Green Tea', price: 50, quantity: 2 },
  ];

  const total = mockCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Checkout Modal Demo
        </h1>
        <p className="text-gray-600 mb-8">
          Click the button below to test the new checkout modal with proper text contrast
        </p>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          Open Checkout Modal
        </button>

        <div className="mt-8 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
          <h2 className="font-bold text-lg mb-4">Cart Summary</h2>
          <div className="space-y-2 text-left">
            {mockCartItems.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} x{item.quantity}</span>
                <span className="font-semibold">฿{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-blue-600">฿{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cartItems={mockCartItems}
        total={total}
      />
    </div>
  );
}
