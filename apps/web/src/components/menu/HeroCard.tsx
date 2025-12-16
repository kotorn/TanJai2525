import { Button } from '@tanjai/ui';

interface HeroCardProps {
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    badgeText?: string;
}

export const HeroCard = ({ title, description, price, imageUrl, badgeText = "Chef's Special" }: HeroCardProps) => {
    return (
        <section className="px-4 mb-8">
            <div className="relative w-full overflow-hidden rounded-xl shadow-glow group cursor-pointer">
                {/* Background Image */}
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                    style={{ backgroundImage: `url("${imageUrl}")` }}
                >
                </div>
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
                
                <div className="relative flex flex-col justify-end h-full min-h-[280px] p-5">
                    {badgeText && (
                        <div className="mb-3 inline-flex items-center gap-1.5 rounded-md bg-secondary/20 px-2 py-1 backdrop-blur-md w-fit border border-secondary/30">
                            <span className="material-symbols-outlined text-secondary text-[16px]">stars</span>
                            <span className="text-secondary text-xs font-bold uppercase tracking-wider">{badgeText}</span>
                        </div>
                    )}
                    
                    <h3 className="text-white text-2xl font-bold leading-tight mb-2 font-display">{title}</h3>
                    <p className="text-gray-300 text-sm font-body line-clamp-2 mb-4 max-w-[90%]">{description}</p>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-white">${price.toFixed(2)}</span>
                        <button className="flex items-center gap-2 bg-gradient-to-r from-secondary to-primary hover:brightness-110 text-white px-4 py-2.5 rounded-lg font-bold text-sm shadow-lg transition-all active:scale-95">
                            <span>Get Your Warmth</span>
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};
