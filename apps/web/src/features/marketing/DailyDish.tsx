'use client';

import { useState, useEffect } from 'react';
import { Camera, Share2, TrendingUp, Download } from 'lucide-react';
import { toast } from 'sonner';

// Mock Best Seller Data
const mockBestSeller = {
    name: "Spicy Basil Chicken",
    price: 12.99,
    ordersToday: 42,
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=600",
    description: "Our signature dish fueled by local spices."
};

export default function DailyDish() {
    const [caption, setCaption] = useState('');
    const [platform, setPlatform] = useState('instagram');

    useEffect(() => {
        // Generate a default caption
        setCaption(`🔥 Today's Star: ${mockBestSeller.name}! \n\nLiked by ${mockBestSeller.ordersToday} hungry fans today. \n\nGet yours for just $${mockBestSeller.price}. #TanjaiPOS #Foodie #BestSeller`);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(caption);
        toast.success("Caption copied!");
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left: Controls */}
            <div className="w-full lg:w-1/2 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                        <TrendingUp className="text-pink-500" />
                        Today's Viral Hit
                    </h2>
                    
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                        <img src={mockBestSeller.image} alt={mockBestSeller.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div>
                            <p className="font-bold text-gray-900">{mockBestSeller.name}</p>
                            <p className="text-sm text-gray-500">{mockBestSeller.ordersToday} orders today</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Platform Style</label>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setPlatform('instagram')}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${platform === 'instagram' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    Instagram
                                </button>
                                <button 
                                    onClick={() => setPlatform('facebook')}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${platform === 'facebook' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    Facebook
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Caption Editor</label>
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                rows={5}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={handleCopy} className="flex-1 h-10 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                                <Share2 className="w-4 h-4" /> Copy Caption
                            </button>
                             <button className="flex-1 h-10 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" /> Download Asset
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Preview */}
            <div className="w-full lg:w-1/2 flex justify-center">
                <div className="w-[375px] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 transform hover:scale-[1.02] transition-transform duration-300">
                    {/* Mock Phone Header */}
                    <div className="h-6 bg-gray-900 text-white flex justify-between px-4 items-center text-[10px]">
                        <span>9:41</span>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 bg-white rounded-full opacity-20"></div>
                            <div className="w-3 h-3 bg-white rounded-full opacity-20"></div>
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                    </div>

                    {/* App Header */}
                    <div className="p-3 flex items-center justify-between border-b">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-pink-600 rounded-full p-[2px]">
                                <div className="w-full h-full bg-white rounded-full p-[2px]">
                                     <img src="https://github.com/shadcn.png" className="w-full h-full rounded-full" />
                                </div>
                             </div>
                             <span className="text-sm font-semibold">tanjai_pos</span>
                        </div>
                        <span className="text-xl">...</span>
                    </div>

                    {/* Content */}
                    <div className="aspect-square bg-gray-100 relative group cursor-pointer">
                         <img src={mockBestSeller.image} className="w-full h-full object-cover" />
                         {/* Tag overlay simulation */}
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 bg-white/90 px-3 py-1 rounded-full text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                                42 Sold Today! 
                            </div>
                         </div>
                    </div>

                    {/* Actions */}
                    <div className="p-3">
                         <div className="flex justify-between mb-3 text-gray-800">
                            <div className="flex gap-4">
                                <span className="hover:text-red-500 cursor-pointer">❤️</span>
                                <span>💬</span>
                                <span>🚀</span>
                            </div>
                            <span>🔖</span>
                         </div>
                         
                         <div className="text-sm">
                             <p><span className="font-bold">liked by food_lover_99</span> and <span className="font-bold">others</span></p>
                             <div className="mt-1">
                                <span className="font-bold mr-2">tanjai_pos</span>
                                <span className="whitespace-pre-line text-gray-800">{caption}</span>
                             </div>
                             <p className="text-gray-400 text-xs mt-2 uppercase">2 hours ago</p>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
