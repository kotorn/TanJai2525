"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function TableRedirectPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    useEffect(() => {
        // In a real app, validate table existence from DB
        const tableId = params.id;
        
        // Simulating delay for effect
        const timer = setTimeout(() => {
            // Store table context
            if (typeof window !== 'undefined') {
                localStorage.setItem('tanjai_table_id', tableId);
            }
            // Redirect
            router.push(`/menu?table=${tableId}`);
        }, 800);

        return () => clearTimeout(timer);
    }, [params.id, router]);

    return (
        <div className="min-h-screen bg-background-dark flex flex-col items-center justify-center text-white font-display">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-xl font-light">Welcome to Table {params.id}</p>
            <p className="text-sm text-gray-500 mt-2">Setting up your experience...</p>
        </div>
    );
}
