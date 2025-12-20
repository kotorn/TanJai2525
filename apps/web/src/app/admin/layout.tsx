import { validateSuperAdmin } from '@/lib/tenant-auth';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // Security Gate
    await validateSuperAdmin();

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-800 p-6 flex flex-col">
                <div className="text-2xl font-bold text-orange-500 mb-8 font-display">Tanjai Admin</div>
                <nav className="flex-1 space-y-2">
                    <Link href="/admin/subscriptions" className="block px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors">
                        Subscriptions
                    </Link>
                    <Link href="/admin/tenants" className="block px-4 py-2 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-colors">
                        Tenants
                    </Link>
                </nav>
                <div className="pt-6 border-t border-gray-800">
                    <div className="text-sm text-gray-500">Super Admin Mode</div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
