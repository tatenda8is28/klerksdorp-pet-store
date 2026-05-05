import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { supabase } from '../lib/supabase';
import { TrendingUp, Clock, Truck, Box, Loader2, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ revenue: 0, active: 0, road: 0, stock: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStockItem, setLowStockItem] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        // 1. Fetch Orders for Stats and Recent Table
        const { data: orders } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        // 2. Fetch Products for Catalog count and Low Stock Alert
        const { data: products } = await supabase
            .from('products')
            .select('*')
            .order('stock_level', { ascending: true });

        if (orders) {
            const totalRev = orders
                .filter(o => o.status === 'Delivered')
                .reduce((acc, curr) => acc + Number(curr.total_amount), 0);
            
            const activeCount = orders.filter(o => ['Pending', 'Ready for Pickup'].includes(o.status)).length;
            const roadCount = orders.filter(o => o.status === 'Out for Delivery').length;

            setStats({ 
                revenue: totalRev, 
                active: activeCount, 
                road: roadCount, 
                stock: products ? products.length : 0 
            });
            
            setRecentOrders(orders.slice(0, 5));
        }

        if (products && products.length > 0) {
            // Pick the item with the absolute lowest stock for the alert card
            setLowStockItem(products[0]);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchData();

        // Optional: Real-time subscription so dashboard updates without refresh
        const orderSubscription = supabase
            .channel('dashboard-orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchData)
            .subscribe();

        const productSubscription = supabase
            .channel('dashboard-products')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchData)
            .subscribe();

        return () => {
            supabase.removeChannel(orderSubscription);
            supabase.removeChannel(productSubscription);
        };
    }, []);

    if (loading) return <AdminLayout><div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-[#1E3A8A]" /></div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="p-12 space-y-12">
                {/* Real-time Stat Cards */}
                <div className="flex gap-8">
                    <Stat icon={TrendingUp} label="Total Revenue" value={`R ${stats.revenue.toLocaleString()}`} sub="Delivered Orders" />
                    <Stat icon={Clock} label="Active Orders" value={stats.active} sub="Awaiting Packing" />
                    <Stat icon={Truck} label="On The Road" value={stats.road} sub="In Klerksdorp" />
                    <Stat icon={Box} label="Products" value={stats.stock} sub="In Catalog" />
                </div>

                <div className="grid grid-cols-3 gap-12">
                    {/* Dynamic Recent Orders Table */}
                    <div className="col-span-2 bg-white rounded-[60px] p-12 shadow-sm border border-gray-100">
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-10">Recent Activity</h2>
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
                                        <td className="py-8 text-xs font-bold text-gray-400">
                                            {order.delivery_address ? `${order.delivery_address.slice(0, 25)}...` : 'No address'}
                                        </td>
                                        <td className="py-8 font-black text-[#2061c9] italic">R {order.total_amount}</td>
                                        <td className="py-8 text-right">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${
                                                order.status === 'Delivered' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {recentOrders.length === 0 && (
                                    <tr><td colSpan="4" className="py-10 text-center font-bold text-gray-300 uppercase italic">No recent orders</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Dynamic Stock Alert Card */}
                    <div className="bg-[#1769c2] rounded-[60px] p-12 text-white shadow-2xl flex flex-col">
                        <h2 className="text-2xl font-black uppercase italic mb-10">Stock Alerts</h2>
                        
                        {lowStockItem ? (
                            <div className="bg-[#0e61a0] p-8 rounded-[40px] border border-white/10 flex-1 flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle size={14} className="text-yellow-400" />
                                    <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest italic">Action Required</p>
                                </div>
                                <h4 className="font-black uppercase italic mb-2 text-xl leading-tight">{lowStockItem.name}</h4>
                                <p className="text-blue-200 text-[10px] font-bold uppercase mb-6 tracking-widest">{lowStockItem.brand}</p>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase italic">
                                        <span>Current Inventory</span>
                                        <span className="text-yellow-400">{lowStockItem.stock_level} Bags left</span>
                                    </div>
                                    <div className="h-3 bg-[#1E3A8A] rounded-full overflow-hidden border border-white/5">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${lowStockItem.stock_level <= 2 ? 'bg-red-500' : 'bg-yellow-400'}`} 
                                            style={{ width: `${Math.min((lowStockItem.stock_level / 20) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#0e61a0] p-8 rounded-[40px] border border-white/10 flex items-center justify-center flex-1">
                                <p className="font-black italic uppercase text-blue-300 opacity-50">All stock levels normal</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function Stat({ icon: Icon, label, value, sub }) {
    return (
        <div className="bg-white p-10 rounded-[50px] shadow-sm border border-gray-100 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 text-[#1E3A8A]">
                <Icon size={24} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
            <h3 className="text-4xl font-black italic tracking-tighter text-gray-900">{value}</h3>
            <p className="text-[10px] font-bold text-gray-300 mt-2 uppercase">{sub}</p>
        </div>
    );
}