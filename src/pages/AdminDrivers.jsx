import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import { Truck, Phone, User, Loader2, Trash2, Calendar, BarChart3 } from 'lucide-react';

export default function AdminDrivers() {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDriversAndStats = async () => {
        setLoading(true);
        
        // 1. Fetch Drivers
        const { data: driversData } = await supabase.from('drivers').select('*').order('name');
        
        // 2. Fetch Delivered Orders to calculate stats
        const { data: ordersData } = await supabase
            .from('orders')
            .select('driver_id, completed_at')
            .eq('status', 'Delivered');

        if (driversData) {
            const now = new Date();
            const startOfToday = new Date(now.setHours(0,0,0,0)).toISOString();
            
            // Get Monday of current week
            const today = new Date();
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1);
            const startOfWeek = new Date(today.setDate(diff)).toISOString();

            // Map stats to each driver
            const driversWithStats = driversData.map(d => {
                const driverOrders = ordersData?.filter(o => o.driver_id === d.id) || [];
                return {
                    ...d,
                    todayCount: driverOrders.filter(o => o.completed_at >= startOfToday).length,
                    weekCount: driverOrders.filter(o => o.completed_at >= startOfWeek).length,
                    totalCount: driverOrders.length
                };
            });
            
            setDrivers(driversWithStats);
        }
        setLoading(false);
    };

    useEffect(() => { fetchDriversAndStats(); }, []);

    const deleteDriver = async (id) => {
        if (window.confirm("Remove this driver's access?")) {
            await supabase.from('drivers').delete().eq('id', id);
            fetchDriversAndStats();
        }
    };

    return (
        <AdminLayout>
            <div className="p-8 lg:p-12 space-y-10">
                <header className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-[#1E3A8A]">Fleet Management</h1>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Live Driver Performance</p>
                    </div>
                    <div className="bg-blue-50 px-6 py-3 rounded-2xl flex items-center gap-3 border border-blue-100 text-[#1E3A8A]">
                        <Truck size={20} />
                        <span className="font-black text-xs uppercase">{drivers.length} Active Drivers</span>
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#1E3A8A]" size={40} /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {drivers.map(driver => (
                            <div key={driver.id} className="bg-white p-8 rounded-[45px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center text-[#1E3A8A]"><User size={30} /></div>
                                    <div>
                                        <h3 className="text-2xl font-black uppercase italic text-gray-900 leading-none">{driver.name}</h3>
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-2">{driver.vehicle} • {driver.phone}</p>
                                    </div>
                                </div>

                                {/* PERFORMANCE STATS GRID */}
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center">
                                        <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Today</p>
                                        <p className="text-xl font-black text-[#1E3A8A]">{driver.todayCount}</p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100 text-center">
                                        <p className="text-[9px] font-black text-blue-600 uppercase mb-1">This Week</p>
                                        <p className="text-xl font-black text-blue-900">{driver.weekCount}</p>
                                    </div>
                                    <div className="col-span-2 bg-emerald-50 p-4 rounded-3xl border border-emerald-100 flex justify-between items-center px-6">
                                        <p className="text-[10px] font-black text-emerald-600 uppercase">Total Lifetime</p>
                                        <p className="text-xl font-black text-emerald-900">{driver.totalCount}</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => deleteDriver(driver.id)} 
                                    className="w-full py-4 rounded-2xl bg-red-50 text-red-600 font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={14} /> Remove Access
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}