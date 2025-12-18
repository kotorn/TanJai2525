'use client';

import { useCartStore } from '@/stores/useCartStore';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';

export default function CartPersistenceDemoPage() {
  const { items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCartStore();

  const mockProducts = [
    { id: '1', name: 'Tonkotsu Ramen', price: 280, imageUrl: '/images/ramen.jpg' },
    { id: '2', name: 'Miso Ramen', price: 260, imageUrl: '/images/miso-ramen.jpg' },
    { id: '3', name: 'Shoyu Ramen', price: 250, imageUrl: '/images/shoyu-ramen.jpg' },
    { id: '4', name: 'Gyoza (6pcs)', price: 120, imageUrl: '/images/gyoza.jpg' },
  ];

  const handleAddToCart = (product: typeof mockProducts[0]) => {
    addItem({
      menuItemId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-anon-eerie-black mb-4">
            🛒 Cart Persistence Demo
          </h1>
          <p className="text-anon-sonic-silver text-lg">
            Try adding items, then refresh the page - your cart will persist!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Product List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-anon-eerie-black mb-6">Products</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {mockProducts.map((product) => (
                <div key={product.id} className="bg-white p-6 rounded-xl shadow-anon-card">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-6xl">{product.name.includes('Ramen') ? '🍜' : '🥟'}</span>
                  </div>
                  <h3 className="font-bold text-anon-eerie-black mb-2">{product.name}</h3>
                  <p className="text-anon-salmon-pink font-bold text-xl mb-4">฿{product.price}</p>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full px-4 py-2 bg-anon-salmon-pink hover:bg-anon-sandy-brown text-white font-bold rounded-lg transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-anon-card sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-anon-eerie-black flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6" />
                  Cart
                </h2>
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-anon-8 text-anon-bittersweet hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-anon-cultured mx-auto mb-4" />
                  <p className="text-anon-sonic-silver">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {items.map((item) =>  (
                      <div key={item.menuItemId} className="flex gap-3 pb-4 border-b border-anon-cultured last:border-0">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                          {item.name.includes('Ramen') ? '🍜' : '🥟'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-anon-eerie-black text-anon-7 truncate">
                            {item.name}
                          </h4>
                          <p className="text-anon-salmon-pink font-bold text-anon-8">
                            ฿{item.price}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Minus className="w-4 h-4 text-anon-sonic-silver" />
                            </button>
                            <span className="text-anon-7 font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Plus className="w-4 h-4 text-anon-sonic-silver" />
                            </button>
                            <button
                              onClick={() => removeItem(item.menuItemId)}
                              className="ml-auto p-1 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-anon-bittersweet" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-anon-cultured pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-anon-7 text-anon-sonic-silver">Items:</span>
                      <span className="font-medium text-anon-eerie-black">{totalItems()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-anon-5 font-bold text-anon-eerie-black">Total:</span>
                      <span className="text-anon-2 font-black text-anon-salmon-pink">
                        ฿{totalPrice().toFixed(2)}
                      </span>
                    </div>
                    <button className="w-full px-4 py-3 bg-anon-eerie-black hover:bg-anon-onyx text-white font-bold rounded-xl transition-colors">
                      Checkout
                    </button>
                  </div>
                </>
              )}

              {/* Persistence Info */}
              <div className="mt-6 p-4 bg-anon-ocean-green/10 border border-anon-ocean-green/20 rounded-lg">
                <p className="text-anon-8 text-anon-eerie-black">
                  ✅ <strong>Cart is automatically saved!</strong>
                  <br />
                  Try refreshing the page - your items will still be here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
