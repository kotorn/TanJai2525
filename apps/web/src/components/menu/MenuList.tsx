import React from "react";

const ramenItems = [
  { id: 1, name: "Midnight Truffle", price: 280, desc: "Black truffle oil, chashu, soft egg, bamboo shoot", image: "/placeholder-ramen-1.jpg" },
  { id: 2, name: "Spicy Miso", price: 240, desc: "Rich chili oil, minced pork, corn, butter", image: "/placeholder-ramen-2.jpg" },
  { id: 3, name: "Shoyu Classic", price: 200, desc: "Clear broth, bamboo shoots, nori, naruto", image: "/placeholder-ramen-3.jpg" },
  { id: 4, name: "Yuzu Shio", price: 220, desc: "Citrus infused light broth, chicken breast", image: "/placeholder-ramen-4.jpg" },
];

const congeeItems = [
  { id: 5, name: "Pork Ball Congee", price: 80, image: "/placeholder-congee-1.jpg" },
  { id: 6, name: "Sea Bass Congee", price: 120, image: "/placeholder-congee-2.jpg" },
  { id: 7, name: "Century Egg", price: 90, image: "/placeholder-congee-3.jpg" },
  { id: 8, name: "Mushroom Special", price: 70, image: "/placeholder-congee-4.jpg" },
];

export const MenuList = () => {
  return (
    <div className="pb-24 space-y-8">
      {/* Horizontal Cards - Ramen */}
      <section>
        <h3 className="text-xl font-display font-bold text-white mb-4 px-4 flex items-center gap-2">
          <span>🍜</span> Signature Ramen
        </h3>
        <div className="space-y-4 px-4">
          {ramenItems.map((item) => (
            <div key={item.id} className="glass-panel p-3 rounded-2xl flex gap-4 active:scale-[0.98] transition-all duration-200 hover:bg-white/5 cursor-pointer group">
              <div className="w-24 h-24 bg-surface-dark rounded-xl flex-shrink-0 relative overflow-hidden shadow-inner border border-white/5">
                 <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                    🍜
                 </div>
              </div>
              <div className="flex-1 flex flex-col justify-center py-1">
                <div>
                  <h4 className="font-bold text-white text-lg leading-tight mb-1">{item.name}</h4>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{item.desc}</p>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="font-display font-bold text-primary text-base">฿{item.price}</span>
                  <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-lg">
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Grid Cards - Congee */}
      <section>
        <h3 className="text-xl font-display font-bold text-white mb-4 px-4 flex items-center gap-2">
          <span>🥣</span> Comfort Congee
        </h3>
        <div className="grid grid-cols-2 gap-4 px-4">
          {congeeItems.map((item) => (
            <div key={item.id} className="glass-panel p-3 rounded-2xl flex flex-col active:scale-[0.98] transition-all duration-200 hover:bg-white/5 cursor-pointer group">
              <div className="aspect-square bg-surface-dark rounded-xl mb-3 relative overflow-hidden shadow-inner border border-white/5">
                 <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                    🥣
                 </div>
              </div>
              <h4 className="font-bold text-white text-sm truncate px-1">{item.name}</h4>
              <div className="flex justify-between items-center mt-2 px-1">
                <span className="font-display font-bold text-primary text-sm">฿{item.price}</span>
                <button className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
