import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI, Type } from "@google/genai";

// --- Types ---

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  icon: string;
};

type CartItem = Product & {
  quantity: number;
};

type Order = {
  id: string;
  items: CartItem[];
  total: number;
  timestamp: Date;
  paymentMethod: 'cash' | 'qr';
};

type ViewState = 'onboarding' | 'pos' | 'insights' | 'settings';

// --- Icons (Simple SVG Components) ---
const Icons = {
  Store: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>,
  Grid: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>,
  Chart: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  Minus: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Sparkles: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 5H5"/><path d="M5 21v-4"/><path d="M9 19H5"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
};

// --- Gemini Service ---

const generateMenuWithGemini = async (shopType: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create a list of 12 popular products for a "${shopType}" in Thailand.
      Return a JSON object with a "products" property containing an array.
      Each item should have:
      - name: Product name (Thai language preferred for local context, or English if international)
      - price: Realistic price in THB (number)
      - category: A short category name (e.g., Drinks, Food, Dessert)
      - icon: A single emoji representing the item.
      Ensure good variety.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  category: { type: Type.STRING },
                  icon: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return data.products.map((p: any, index: number) => ({
      ...p,
      id: `gen-${Date.now()}-${index}`
    }));
  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback menu if AI fails
    return [
      { id: '1', name: 'สินค้าทั่วไป', price: 100, category: 'ทั่วไป', icon: '📦' },
      { id: '2', name: 'บริการ', price: 500, category: 'บริการ', icon: '🛠️' }
    ];
  }
};

const analyzeSalesWithGemini = async (orders: Order[]) => {
  try {
    if (orders.length === 0) return "ยังไม่มียอดขายให้วิเคราะห์ ลองขายสินค้าสักชิ้นก่อนนะครับ";
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Simplify data for token efficiency
    const summary = orders.map(o => ({
      total: o.total,
      items: o.items.map(i => i.name).join(", "),
      time: o.timestamp.toLocaleTimeString()
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze these recent sales for a small shop in Thailand: ${JSON.stringify(summary)}.
      Act as an encouraging business coach.
      1. Summarize what is selling well.
      2. Give one specific, actionable tip to increase sales.
      Keep it short, friendly, and in Thai.`,
    });

    return response.text;
  } catch (error) {
    return "ไม่สามารถวิเคราะห์ข้อมูลได้ในขณะนี้";
  }
};

// --- Components ---

const App = () => {
  // State
  const [view, setView] = useState<ViewState>('onboarding');
  const [shopName, setShopName] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; method: 'cash' | 'qr' | null }>({ open: false, method: null });
  
  // Onboarding State
  const [businessType, setBusinessType] = useState("");
  const [generatingMenu, setGeneratingMenu] = useState(false);

  // Insights State
  const [insightText, setInsightText] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);

  // --- Actions ---

  const handleStartShop = async () => {
    if (!businessType) return;
    setGeneratingMenu(true);
    const menu = await generateMenuWithGemini(businessType);
    setProducts(menu);
    setShopName(businessType); // Use business type as temp name
    setGeneratingMenu(false);
    setView('pos');
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleCheckoutClick = (method: 'cash' | 'qr') => {
    setConfirmModal({ open: true, method });
  };

  const confirmPayment = () => {
    const method = confirmModal.method;
    if (!method) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      items: [...cart],
      total,
      timestamp: new Date(),
      paymentMethod: method
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
    setConfirmModal({ open: false, method: null });
    
    // Slight delay for smoother UI transition
    setTimeout(() => {
        alert(`ชำระเงินสำเร็จ! (${method === 'cash' ? 'เงินสด' : 'สแกนจ่าย'})\nรับเงิน: ฿${total.toLocaleString()}`);
    }, 100);
  };

  const fetchInsights = async () => {
    setLoadingInsight(true);
    const text = await analyzeSalesWithGemini(orders);
    setInsightText(text);
    setLoadingInsight(false);
  };

  // --- Derived State ---
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // --- Views ---

  if (view === 'onboarding') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-fade-in text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
               <Icons.Store />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">TunJai POS</h1>
          <p className="text-gray-500 mb-8">เริ่มต้นร้านค้าของคุณได้ในไม่กี่วินาที</p>

          <div className="space-y-4 text-left">
            <label className="block text-sm font-medium text-gray-700">คุณขายอะไร? (เช่น ร้านกาแฟ, ร้านข้าวแกง)</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
              placeholder="Ex. ร้านกาแฟโบราณ"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartShop()}
            />
          </div>

          <button 
            onClick={handleStartShop}
            disabled={generatingMenu || !businessType}
            className={`mt-8 w-full py-3 rounded-xl text-white font-semibold shadow-lg flex items-center justify-center space-x-2 transition-all ${generatingMenu ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 hover:shadow-orange-500/30'}`}
          >
            {generatingMenu ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>กำลังสร้างรายการสินค้าด้วย AI...</span>
              </>
            ) : (
              <>
                <Icons.Sparkles />
                <span>เปิดร้านทันใจ</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      {/* Sidebar */}
      <nav className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 space-y-8 z-10">
        <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">T</div>
        
        <div className="flex flex-col w-full space-y-2">
          <NavButton active={view === 'pos'} onClick={() => setView('pos')} icon={<Icons.Grid />} label="ขาย" />
          <NavButton active={view === 'insights'} onClick={() => { setView('insights'); fetchInsights(); }} icon={<Icons.Chart />} label="สรุป" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {view === 'pos' && (
          <>
            {/* Product Area */}
            <div className="flex-1 flex flex-col p-6 overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{shopName || "ร้านค้าของคุณ"}</h2>
                  <p className="text-sm text-gray-500">{new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="ค้นหาสินค้า..." 
                    className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400"><Icons.Search /></div>
                </div>
              </div>

              {/* Categories */}
              <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 hide-scroll">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-gray-800 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div className="flex-1 overflow-y-auto hide-scroll pb-20">
                 {filteredProducts.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                        <p>ไม่พบสินค้า</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredProducts.map(product => (
                        <button 
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className="bg-white p-4 rounded-xl shadow-sm border border-transparent hover:border-orange-500 hover:shadow-md transition-all flex flex-col items-center text-center group active:scale-95"
                        >
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{product.icon}</div>
                            <h3 className="font-medium text-gray-800 leading-tight mb-1">{product.name}</h3>
                            <p className="text-orange-600 font-bold">฿{product.price}</p>
                        </button>
                        ))}
                    </div>
                 )}
              </div>
            </div>

            {/* Cart Sidebar (Right) */}
            <div className="w-96 bg-white border-l border-gray-200 flex flex-col shadow-xl z-20">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800">รายการสั่งซื้อ</h3>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                   <span>Order #{orders.length + 1}</span>
                   <span>{cart.reduce((acc, i) => acc + i.quantity, 0)} รายการ</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center"><Icons.Store /></div>
                    <p>เลือกสินค้าเพื่อเริ่มรายการ</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">฿{item.price} / ชิ้น</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                         <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600">
                             {item.quantity === 1 ? <div className="scale-75"><Icons.Trash /></div> : <div className="scale-75"><Icons.Minus /></div>}
                         </button>
                         <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                         <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded-full bg-orange-100 hover:bg-orange-200 flex items-center justify-center text-orange-600">
                             <div className="scale-75"><Icons.Plus /></div>
                         </button>
                      </div>
                      <div className="w-16 text-right font-medium text-gray-800">฿{item.price * item.quantity}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                   <span className="text-gray-600">ยอดรวม</span>
                   <span className="text-3xl font-bold text-gray-900">฿{cartTotal.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleCheckoutClick('cash')}
                    disabled={cart.length === 0}
                    className="py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                  >
                    เงินสด
                  </button>
                  <button 
                    onClick={() => handleCheckoutClick('qr')}
                    disabled={cart.length === 0}
                    className="py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                  >
                    QR Code
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {view === 'insights' && (
          <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
             <h2 className="text-3xl font-bold text-gray-800 mb-8">สรุปยอดขาย</h2>
             
             {/* Stats Cards */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <p className="text-gray-500 text-sm font-medium mb-1">ยอดขายรวมวันนี้</p>
                 <h3 className="text-4xl font-bold text-gray-900">฿{orders.reduce((acc, o) => acc + o.total, 0).toLocaleString()}</h3>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <p className="text-gray-500 text-sm font-medium mb-1">จำนวนออเดอร์</p>
                 <h3 className="text-4xl font-bold text-gray-900">{orders.length}</h3>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                 <p className="text-gray-500 text-sm font-medium mb-1">สินค้าขายดี</p>
                 <h3 className="text-2xl font-bold text-gray-900 truncate">
                    {orders.length > 0 ? orders[0].items[0].name : '-'}
                 </h3>
               </div>
             </div>

             {/* AI Advisor */}
             <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                   <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.95 2.95 4.95-4.95L12 11zm-7.9 1.1L12 16l7.9-3.9V17L12 21l-7.9-4V12.1z"/></svg>
                </div>
                
                <div className="flex items-start space-x-4 relative z-10">
                   <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                      <Icons.Sparkles />
                   </div>
                   <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">TunJai AI Advisor</h3>
                      {loadingInsight ? (
                        <div className="animate-pulse flex space-x-4">
                          <div className="flex-1 space-y-2 py-1">
                            <div className="h-2 bg-white/30 rounded"></div>
                            <div className="h-2 bg-white/30 rounded w-5/6"></div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-indigo-100 leading-relaxed whitespace-pre-wrap">{insightText || "คลิกเมนู 'สรุป' เพื่อให้ AI วิเคราะห์ยอดขายของคุณ"}</p>
                      )}
                      <button 
                        onClick={fetchInsights} 
                        className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors border border-white/20"
                      >
                         วิเคราะห์อีกครั้ง
                      </button>
                   </div>
                </div>
             </div>
             
             <div className="mt-8">
               <h3 className="text-lg font-bold text-gray-700 mb-4">ประวัติการขายล่าสุด</h3>
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                 <table className="w-full text-left">
                   <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs">
                     <tr>
                       <th className="px-6 py-3">เวลา</th>
                       <th className="px-6 py-3">รายการ</th>
                       <th className="px-6 py-3">ยอดรวม</th>
                       <th className="px-6 py-3">การชำระ</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {orders.map(order => (
                       <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                         <td className="px-6 py-4 text-sm text-gray-500">{order.timestamp.toLocaleTimeString()}</td>
                         <td className="px-6 py-4 text-sm text-gray-800">
                            {order.items.map(i => `${i.name} (x${i.quantity})`).join(", ")}
                         </td>
                         <td className="px-6 py-4 text-sm font-bold text-gray-900">฿{order.total}</td>
                         <td className="px-6 py-4 text-sm">
                           <span className={`px-2 py-1 rounded text-xs font-medium ${order.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                             {order.paymentMethod === 'cash' ? 'เงินสด' : 'QR Code'}
                           </span>
                         </td>
                       </tr>
                     ))}
                     {orders.length === 0 && (
                       <tr>
                         <td colSpan={4} className="px-6 py-8 text-center text-gray-400">ยังไม่มีรายการขาย</td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
             </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-4">ยืนยันการชำระเงิน</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>ยอดรวม</span>
                  <span className="font-bold text-gray-900">฿{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>วิธีการชำระ</span>
                  <span className="font-medium text-orange-600">
                    {confirmModal.method === 'cash' ? 'เงินสด' : 'สแกนจ่าย (QR)'}
                  </span>
                </div>
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                  รายการสินค้า {cart.reduce((acc, i) => acc + i.quantity, 0)} ชิ้น
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setConfirmModal({ open: false, method: null })}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  onClick={confirmPayment}
                  className="flex-1 py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 shadow-lg shadow-orange-500/30 transition-all"
                >
                  ยืนยัน
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`w-16 h-16 flex flex-col items-center justify-center space-y-1 rounded-xl transition-all ${active ? 'text-orange-600 bg-orange-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
  >
    <div className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>{icon}</div>
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const root = createRoot(document.getElementById("root")!);
root.render(<App />);