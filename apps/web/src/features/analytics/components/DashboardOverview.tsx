'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card } from '@tanjai/ui';
import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingBag, Users, Activity } from 'lucide-react';

const KPICard = ({ title, value, subtext, icon: Icon, trend }: any) => (
  <div className="bg-[#1e1e1e]/80 border border-white/5 p-6 rounded-2xl backdrop-blur-md">
    <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-xl">
            <Icon className="text-amber-400" size={24} />
        </div>
        {trend && (
            <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trend >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {Math.abs(trend)}%
            </div>
        )}
    </div>
    <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
    <div className="text-3xl font-bold text-white mt-1">{value}</div>
    <div className="text-gray-500 text-xs mt-2">{subtext}</div>
  </div>
);

export function DashboardOverview({ metrics, topItems }: any) {
  const { kpi, trends } = metrics;
  
  // Calc Growth
  const growth = kpi.prevRevenue > 0 
    ? Math.round(((kpi.revenue - kpi.prevRevenue) / kpi.prevRevenue) * 100) 
    : 0;

  return (
    <div className="space-y-6 p-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
            title="Total Revenue" 
            value={`฿${kpi.revenue.toLocaleString()}`} 
            subtext="Today's Earnings"
            icon={DollarSign}
            trend={growth}
        />
        <KPICard 
            title="Total Orders" 
            value={kpi.orders} 
            subtext="Orders Processed"
            icon={ShoppingBag}
        />
         <KPICard 
            title="Avg. Order Value" 
            value={`฿${Math.round(kpi.aov)}`} 
            subtext="Per Table"
            icon={Users}
        />
         <KPICard 
            title="Active Status" 
            value="Open" 
            subtext="Store is Online"
            icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-[#1e1e1e]/80 border border-white/5 p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Sales Trend (Hourly)</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trends}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `฿${value}`} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="total" stroke="#fbbf24" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Top Items */}
        <div className="bg-[#1e1e1e]/80 border border-white/5 p-6 rounded-2xl">
             <h3 className="text-lg font-bold text-white mb-6">Top Menu Items</h3>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={topItems}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#333" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} stroke="#999" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '8px' }}
                        />
                        <Bar dataKey="value" fill="#64FFDA" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
        </div>
      </div>
    </div>
  );
}
