'use client';

import { useEffect, useState } from 'react';

// Mock Weather Data (In real app, fetch from API)
const WEATHER_TYPES = {
    SUNNY: { icon: 'sunny', label: 'Sunny', gradient: 'from-orange-400/20 to-yellow-400/5' },
    RAINY: { icon: 'rainy', label: 'Rainy', gradient: 'from-blue-400/20 to-gray-400/5' },
    NIGHT: { icon: 'bedtime', label: 'Clear', gradient: 'from-indigo-400/20 to-purple-400/5' },
};

export const ContextHeader = ({ tableId }: { tableId: string }) => {
    const [context, setContext] = useState(WEATHER_TYPES.SUNNY);
    const [greeting, setGreeting] = useState('Welcome Back');

    useEffect(() => {
        // Simple Time Logic
        const hour = new Date().getHours();
        
        if (hour >= 18 || hour < 6) {
            setContext(WEATHER_TYPES.NIGHT);
            setGreeting('Good Evening');
        } else if (hour < 12) {
            setContext(WEATHER_TYPES.SUNNY);
            setGreeting('Good Morning');
        } else {
            setContext(WEATHER_TYPES.SUNNY); // Default day
            setGreeting('Good Afternoon');
        }

        // Mock Random "Rain" (10% chance)
        if (Math.random() > 0.9) {
            setContext(WEATHER_TYPES.RAINY);
            setGreeting('Stay Warm');
        }
    }, []);

    return (
        <div className={`relative overflow-hidden rounded-2xl mx-4 mt-4 p-4 mb-2 border border-white/5 ${context.gradient} bg-gradient-to-br transition-all duration-1000`}>
            {/* Glass Background Layer */}
            <div className="absolute inset-0 bg-[#1E1E1E]/40 backdrop-blur-sm" />

            {/* Content */}
            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-amber-400 text-sm animate-pulse">
                            {context.icon}
                        </span>
                        <span className="text-xs font-medium text-white/70 tracking-wide uppercase">
                            {context.label} • {new Date().toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight font-display">
                        {greeting}, <span className="text-primary">Guest</span>
                    </h1>
                    <p className="text-xs text-white/50 mt-0.5">
                        Table {tableId} • Ready to serve
                    </p>
                </div>

                {/* Decorative Circle */}
                <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-glow">
                     <span className="material-symbols-outlined text-white/80">
                        restaurant
                     </span>
                </div>
            </div>
        </div>
    );
};
