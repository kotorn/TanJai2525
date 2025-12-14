"use client";

import Image from "next/image";
import { Store, User } from "lucide-react";

interface RestaurantHeaderProps {
    restaurant: {
        name: string;
        banner_url: string | null;
        logo_url: string | null;
        cuisine_type: string | null;
    };
    tableName: string;
}

export default function RestaurantHeader({ restaurant, tableName }: RestaurantHeaderProps) {
    return (
        <div className="relative bg-white shadow-sm z-10">
            {/* Banner */}
            <div className="h-32 w-full relative bg-gray-100 overflow-hidden">
                {restaurant.banner_url ? (
                    <Image 
                        src={restaurant.banner_url} 
                        alt="Banner" 
                        fill 
                        className="object-cover" 
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Store className="w-12 h-12 opacity-50" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* Profile Info */}
            <div className="px-4 pb-4 -mt-10 relative flex items-end justify-between">
                <div className="flex items-end gap-3">
                    <div className="w-20 h-20 rounded-xl border-4 border-white shadow-md bg-white overflow-hidden relative">
                         {restaurant.logo_url ? (
                            <Image 
                                src={restaurant.logo_url} 
                                alt="Logo" 
                                fill 
                                className="object-cover" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                                <Store className="w-8 h-8" />
                            </div>
                        )}
                    </div>
                    <div className="mb-1 text-white drop-shadow-md">
                        <h1 className="font-bold text-lg leading-tight">{restaurant.name}</h1>
                        <p className="text-xs text-gray-200">{restaurant.cuisine_type || "Restaurant"}</p>
                    </div>
                </div>
                
                <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 mb-1">
                    <User className="size-3" />
                    <span>{tableName}</span>
                </div>
            </div>
        </div>
    );
}
