import { useState } from 'react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { CustomerAnalytics } from '@/components/analytics/CustomerAnalytics';
import { ProductAnalytics } from '@/components/analytics/ProductAnalytics';
import { 
  LayoutDashboard,
  ShoppingBag, 
  Package, 
  Tag, 
  Users,
  Settings
} from 'lucide-react';

type AdminTab = 'dashboard' | 'orders' | 'inventory' | 'coupons' | 'customers' | 'settings';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const tabs = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders' as AdminTab, label: 'Orders', icon: ShoppingBag },
    { id: 'inventory' as AdminTab, label: 'Inventory', icon: Package },
    { id: 'coupons' as AdminTab, label: 'Coupons', icon: Tag },
    { id: 'customers' as AdminTab, label: 'Customers', icon: Users },
    { id: 'settings' as AdminTab, label: 'Settings', icon: Settings },
  ];

  // Mock stats
  const stats = {
    totalOrders: 1247,
    totalRevenue: 352800,
    activeCustomers: 892,
    lowStockItems: 12,
    pendingOrders: 34,
    activeCoupons: 8,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-anon-cultured">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-anon-eerie-black">
                TanJai Admin
              </h1>
              <p className="text-anon-8 text-anon-sonic-silver">
                Manage your restaurant
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-anon-7 font-medium text-anon-eerie-black">
                  Admin User
                </p>
                <p className="text-anon-9 text-anon-sonic-silver">
                  Tanjai Demo
                </p>
              </div>
              <div className="w-10 h-10 bg-anon-salmon-pink rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-anon-card p-4">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-anon-salmon-pink text-white'
                          : 'text-anon-eerie-black hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === 'dashboard' && <AdminDashboard stats={stats} />}
            
            {activeTab === 'orders' && (
              <div className="bg-white p-6 rounded-xl shadow-anon-card">
                <h2 className="text-2xl font-bold mb-4">Order Management</h2>
                <p className="text-anon-sonic-silver">Order list and management tools coming soon...</p>
              </div>
            )}
            
            {activeTab === 'inventory' && (
              <div className="bg-white p-6 rounded-xl shadow-anon-card">
                <h2 className="text-2xl font-bold mb-4">Inventory Management</h2>
                <p className="text-anon-sonic-silver">Stock management tools coming soon...</p>
              </div>
            )}
            
            {activeTab === 'coupons' && (
              <div className="bg-white p-6 rounded-xl shadow-anon-card">
                <h2 className="text-2xl font-bold mb-4">Coupon Management</h2>
                <p className="text-anon-sonic-silver">Create and manage promotional coupons...</p>
              </div>
            )}
            
            {activeTab === 'customers' && (
              <div className="space-y-6">
                <CustomerAnalytics />
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <ProductAnalytics />
                
                <div className="bg-white p-6 rounded-xl shadow-anon-card mt-6">
                  <h2 className="text-2xl font-bold mb-4">Settings</h2>
                  <p className="text-anon-sonic-silver">Restaurant settings and configuration...</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
