import React from "react";

export const MenuHero = () => {
  return (
    <div className="relative w-full h-[280px] mx-auto overflow-hidden rounded-3xl my-6 shadow-glow group">
       {/* Background with abstract gradient to simulate food image atmosphere */}
       <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a]">
         {/* Decorative circle to simulate lighting */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
       </div>
       
       <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

       <div className="absolute bottom-5 left-5 right-5 z-10">
         <div className="glass-panel inline-flex items-center px-3 py-1 rounded-full mb-3 border border-white/10 backdrop-blur-md">
           <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Chef's Special</span>
         </div>
         <h2 className="text-3xl font-display font-bold text-white mb-2 leading-tight">Midnight <br/>Truffle Ramen</h2>
         <p className="text-sm text-gray-300 mb-4 font-light leading-relaxed max-w-[90%]">
           Rich tonkotsu broth infused with black truffle oil. A warm hug in a bowl.
         </p>
         <button className="w-full bg-gradient-to-r from-primary to-[#FF8F00] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-900/20 active:scale-95 transition-transform flex items-center justify-center gap-2">
           <span>Get Your Warmth</span>
           <span className="text-lg">🔥</span>
         </button>
       </div>
    </div>
  );
};
