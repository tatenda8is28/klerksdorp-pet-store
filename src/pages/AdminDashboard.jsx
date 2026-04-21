import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { supabase } from '../lib/supabase';
import { TrendingUp, Clock, Truck, Box, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ revenue: 0, active: 0, road: 0, stock: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const { data: orders } = await supabase.from('orders').select('*');
            if (orders) {
                const totalRev = orders.filter(o => o.status === 'Delivered').reduce((acc, curr) => acc + Number(curr.total_amount), 0);
                const activeCount = orders.filter(o => o.status === 'Pending').length;
                const roadCount = orders.filter(o => o.status === 'Out for Delivery').length;
                setStats({ revenue: totalRev, active: activeCount, road: roadCount, stock: 5 });
                setRecentOrders(orders.slice(0, 5));
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) return <AdminLayout><div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-[#1E3A8A]" /></div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="p-12 space-y-12">
                <div className="flex gap-8">
                    <Stat icon={TrendingUp} label="Total Revenue" value={`R ${stats.revenue}`} sub="Delivered Orders" />
                    <Stat icon={Clock} label="Active Orders" value={stats.active} sub="Awaiting Packing" />
                    <Stat icon={Truck} label="On The Road" value={stats.road} sub="In Klerksdorp" />
                    <Stat icon={Box} label="Total Inventory" value={stats.stock} sub="In Catalog" />
                </div>

                <div className="grid grid-cols-3 gap-12">
                    <div className="col-span-2 bg-white rounded-[60px] p-12 shadow-sm border border-gray-100">
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-10">Priority Deliveries</h2>
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-[10px] font-black uppercase tracking-widest text-gray-300">
                                    <th className="pb-8">Customer</th>
                                    <th className="pb-8">Location</th>
                                    <th className="pb-8">Amount</th>
                                    <th className="pb-8 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id} className="border-t border-gray-50">
                                        <td className="py-8 font-black uppercase italic text-sm">{order.customer_name}</td>
                                        <td className="py-8 text-xs font-bold text-gray-400">{order.delivery_address.slice(0, 20)}...</td>
                                        <td className="py-8 font-black text-[#2061c9] italic">R {order.total_amount}</td>
                                        <td className="py-8 text-right">
                                            <span className="bg-blue-50 text-[#1256b6] px-4 py-2 rounded-xl text-[10px] font-black uppercase">{order.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Stock Alert Card - Deep Blue #1E3A8A */}
                    <div className="bg-[#1769c2] rounded-[60px] p-12 text-white shadow-2xl">
                        <h2 className="text-2xl font-black uppercase italic mb-10">Stock Alerts</h2>
                        <div className="bg-[#0e61a0] p-8 rounded-[40px] border border-white/10">
                            <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-2 italic">Low Stock</p>
                            <h4 className="font-black uppercase italic mb-6">Rimax Adult 20KG</h4>
                            <div className="h-3 bg-[#1E3A8A] rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 w-1/4"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function Stat({ icon: Icon, label, value, sub }) {
    return (
        <div className="bg-white p-10 rounded-[50px] shadow-sm border border-gray-100 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 text-gray-400">
                <Icon size={24} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
            <h3 className="text-4xl font-black italic tracking-tighter text-gray-900">{value}</h3>
            <p className="text-[10px] font-bold text-gray-300 mt-2 uppercase">{sub}</p>
        </div>
    );
}