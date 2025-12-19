export const CategoryNav = () => {
    const categories = ['All Menu', 'Ramen', 'Congee', 'Yakitori', 'Sake', 'Dessert', 'Drinks'];
    
    return (
        <div className="sticky top-[88px] z-20 pt-2 pb-4 bg-background/80 backdrop-blur-sm">
            <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar snap-x">
                {categories.map((cat, index) => (
                    <button 
                        key={cat}
                        className={`snap-start shrink-0 px-5 py-2 rounded-full text-sm font-bold leading-normal transition-all active:scale-95 
                            ${index === 0 
                                ? 'bg-primary text-black shadow-lg shadow-primary/20' 
                                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-white border border-white/5'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
};
