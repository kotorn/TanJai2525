export const CategoryNav = () => {
    const categories = ['All Menu', 'Ramen', 'Congee', 'Yakitori', 'Sake'];
    
    return (
        <div className="sticky top-[88px] z-20 bg-[#121212]/95 backdrop-blur-sm pt-2 pb-4">
            <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar snap-x">
                {categories.map((cat, index) => (
                    <button 
                        key={cat}
                        className={`snap-start shrink-0 px-5 py-2 rounded-full text-sm font-medium leading-normal transition-all active:scale-95 
                            ${index === 0 
                                ? 'bg-primary shadow-glow border border-primary/50 text-white font-bold' 
                                : 'bg-[#1E1E1E]/60 backdrop-blur-md border border-white/5 text-[#E0E0E0] hover:bg-white/10'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
};
