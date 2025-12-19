export const CategoryNav = () => {
    const categories = ['All Menu', 'Ramen', 'Congee', 'Yakitori', 'Sake', 'Dessert', 'Drinks'];
    
    return (
        <div className="sticky top-[88px] z-20 bg-white shadow-sm pt-2 pb-4">
            <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar snap-x">
                {categories.map((cat, index) => (
                    <button 
                        key={cat}
                        className={`snap-start shrink-0 px-5 py-2 rounded-full text-sm font-bold leading-normal transition-all active:scale-95 
                            ${index === 0 
                                ? 'bg-primary text-white shadow-md' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
};
