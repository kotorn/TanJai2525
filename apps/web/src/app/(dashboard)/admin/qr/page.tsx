'use client';

import { QRGenerator } from '@/components/admin/QRGenerator';

export default function AdminQRPage() {
    // In a real app, we would get this from the session or config
    const TENANT_ID = 'tanjai'; 
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://tan-jai2525.vercel.app';

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold font-display text-white mb-8">QR Code Management</h1>
            <QRGenerator tenantId={TENANT_ID} baseUrl={BASE_URL} />
        </div>
    );
}
