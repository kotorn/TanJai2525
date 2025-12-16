'use client';

import { useLiff } from '@/lib/liff/LiffProvider';
import { Button } from '@tanjai/ui';
import Image from 'next/image';

export const LiffProfileCard = () => {
    const { isLoggedIn, profile, login, logout, error, isReady } = useLiff();

    if (!isReady) return <div className="animate-pulse h-12 w-full bg-white/5 rounded-lg" />;

    if (error) {
        return (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                LIFF Error: {error}
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="p-4 rounded-lg bg-white/5 border border-white/5 text-center">
                <p className="text-sm text-gray-400 mb-3">Sync with LINE for member benefits</p>
                <Button onClick={login} className="bg-[#00B900] hover:bg-[#009900] text-white">
                    Login with LINE
                </Button>
            </div>
        );
    }

    return (
        <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
            {profile?.pictureUrl ? (
                <Image 
                    src={profile.pictureUrl} 
                    alt={profile.displayName} 
                    width={48} 
                    height={48} 
                    className="rounded-full border-2 border-[#00B900]"
                />
            ) : (
                <div className="size-12 rounded-full bg-[#00B900] flex items-center justify-center text-white font-bold">
                    {profile?.displayName?.charAt(0)}
                </div>
            )}
            
            <div className="flex-1">
                <h3 className="text-white font-medium">{profile?.displayName}</h3>
                <p className="text-xs text-[#00B900]">Connected via LINE</p>
            </div>

            <Button variant="ghost" size="sm" onClick={logout} className="text-gray-500 hover:text-white">
                Logout
            </Button>
        </div>
    );
};
