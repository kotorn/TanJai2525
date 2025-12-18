'use client';

import { 
  ShoppingBag, 
  Package, 
  Users, 
  Tag, 
  TrendingUp,
  DollarSign 
} from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeCustomers: number;
  lowStockItems: number;
  pendingOrders: number;
  activeCoupons: number;
}

interface AdminDashboardProps {
  stats: DashboardStats;
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
  const statCards = [
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      label: 'Revenue',
      value: `฿${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+8%',
    },
    {
      label: 'Customers',
      value: stats.activeCustomers,
      icon: Users,
      color: 'bg-purple-500',
      change: '+23%',
    },
    {
      label: 'Low Stock',
      value: stats.lowStockItems,
      icon: Package,
      color: 'bg-orange-500',
      alert: true,
    },
    {
      label: 'Pending Orders',
      value: stats.pendingOrders,
      icon: TrendingUp,
      color: 'bg-yellow-500',
    },
    {
      label: 'Active Coupons',
      value: stats.activeCoupons,
      icon: Tag,
      color: 'bg-pink-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-anon-eerie-black">
          Dashboard
        </h1>
        <div className="flex gap-2">
          <select className="px-4 py-2 border border-anon-cultured rounded-lg">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 3 months</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white p-6 rounded-xl shadow-anon-card"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-anon-8 text-anon-sonic-silver mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-black text-anon-eerie-black">
                    {stat.value}
                  </p>
                  {stat.change && (
                    <p className="text-anon-9 text-anon-ocean-green mt-1">
                      {stat.change} from last period
                    </p>
                  )}
                  {stat.alert && (
                    <p className="text-anon-9 text-anon-bittersweet mt-1">
                      Requires attention
                    </p>
                  )}
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-anon-card">
          <h2 className="text-xl font-bold text-anon-eerie-black mb-4">
            Recent Orders
          </h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-anon-cultured last:border-0">
                <div>
                  <p className="font-medium text-anon-eerie-black">
                    ORD-20231218-000{i}
                  </p>
                  <p className="text-anon-9 text-anon-sonic-silver">
                    Customer {i}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-anon-eerie-black">
                    ฿{(Math.random() * 1000).toFixed(0)}
                  </p>
                  <span className="inline-block px-2 py-1 text-anon-9 bg-blue-100 text-blue-700 rounded">
                    Pending
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-anon-card">
          <h2 className="text-xl font-bold text-anon-eerie-black mb-4">
            Low Stock Alerts
          </h2>
          <div className="space-y-3">
            {['Tonkotsu Ramen', 'Gyoza', 'Green Tea', 'Miso Soup'].map((item) => (
              <div key={item} className="flex items-center justify-between py-2 border-b border-anon-cultured last:border-0">
                <p className="font-medium text-anon-eerie-black">{item}</p>
                <span className="text-anon-bittersweet font-bold">
                  {Math.floor(Math.random() * 5) + 1} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
