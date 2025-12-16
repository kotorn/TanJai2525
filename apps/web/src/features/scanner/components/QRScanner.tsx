'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@tanjai/ui';
import { useRouter } from 'next/navigation';

// DEV-0002: PWA Scanner
// Owner: Dev Core

export const QRScanner = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [permission, setPermission] = useState<PermissionState | 'unknown'>('unknown');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Request Camera Access
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment' } 
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setPermission('granted');
            } catch (err) {
                console.error('Camera Error:', err);
                setError('Camera access denied. Please enable permissions.');
                setPermission('denied');
            }
        };

        if (typeof window !== 'undefined') {
            startCamera();
        }

        return () => {
            // Cleanup: Stop stream
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleSimulateScan = () => {
        // Mock Decode: Redirect to a test table
        const mockToken = 'mock-jwt-token-table-5';
        router.push(`/q/${mockToken}`);
    };

    return (
        <div className="relative h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden">
            {/* Camera Feed */}
            {permission === 'granted' ? (
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="absolute inset-0 h-full w-full object-cover opacity-80"
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 text-white/50">
                    <p>{error || 'Initializing Camera...'}</p>
                </div>
            )}

            {/* Scanning Overlay (Glass Frame) */}
            <div className="relative z-10 size-64 border-2 border-white/30 rounded-3xl backdrop-blur-[2px] shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] flex items-center justify-center">
                <div className="absolute top-0 left-0 h-8 w-8 border-t-4 border-l-4 border-primary -translate-x-1 -translate-y-1 rounded-tl-xl" />
                <div className="absolute top-0 right-0 h-8 w-8 border-t-4 border-r-4 border-primary translate-x-1 -translate-y-1 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-primary -translate-x-1 translate-y-1 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-primary translate-x-1 translate-y-1 rounded-br-xl" />
                
                {/* Laser Scan Animation */}
                <div className="absolute w-full h-0.5 bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
            </div>

            <div className="absolute bottom-20 z-20 text-center">
                <p className="text-white text-sm font-medium mb-6 drop-shadow-md">
                    Scan QR Code at your table
                </p>
                
                {/* Dev Tool: Simulate Scan */}
                <Button 
                    variant="outline" 
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
                    onClick={handleSimulateScan}
                >
                    [Dev] Simulate Scan
                </Button>
            </div>
        </div>
    );
};
