import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import { Truck, Phone, User, Loader2, Trash2, ShieldCheck } from 'lucide-react';

export default function AdminDrivers() {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDrivers = async () => {
        setLoading(true);
        // This fetches from your 'drivers' table and links to 'profiles' to see their role
        const { data, error } = await supabase
            .from('drivers')
            .select('*')
            .order('name', { ascending: true });

        if (error) console.error(error);
        else setDrivers(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const deleteDriver = async (id) => {
        if (window.confirm("Are you sure you want to remove this driver?")) {
            const { error } = await supabase.from('drivers').delete().eq('id', id);
            if (!error) fetchDrivers();
        }
    };

    return (
        <AdminLayout>
            <div className="p-12 space-y-10">
                <header className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-[#1E3A8A]">Fleet Management</h1>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Manage your delivery personnel</p>
                    </div>
                    <div className="bg-blue-50 px-6 py-3 rounded-2xl flex items-center gap-3 border border-blue-100 text-[#1E3A8A]">
                        <Truck size={20} />
                        <span className="font-black text-xs uppercase">{drivers.length} Active Drivers</span>
                    </div>
                </header>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-[#1E3A8A]" size={40} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {drivers.length > 0 ? drivers.map(driver => (
                            <div key={driver.id} className="bg-white p-8 rounded-[45px] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#1E3A8A] group-hover:text-white transition-all">
                                        <User size={30} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase italic text-gray-900 leading-none">{driver.name}</h3>
                                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-2 flex items-center gap-1">
                                            <ShieldCheck size={12} /> Verified Driver
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-4 text-gray-500">
                                        <Phone size={16} className="text-gray-300" />
                                        <span className="font-bold text-sm tracking-tight">{driver.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-gray-500">
                                        <Truck size={16} className="text-gray-300" />
                                        <span className="font-bold text-sm uppercase tracking-tight">{driver.vehicle || 'Not Assigned'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-6 border-t border-gray-50">
                                    <button 
                                        onClick={() => deleteDriver(driver.id)}
                                        className="flex-grow py-4 rounded-2xl bg-red-50 text-red-600 font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={14} /> Remove Access
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-20 text-center bg-white rounded-[45px] border-2 border-dashed border-gray-100">
                                <p className="text-gray-400 font-black uppercase italic text-xl">No drivers found in the system.</p>
                                <p className="text-gray-300 font-bold uppercase text-[10px] tracking-widest mt-2">Drivers must register to appear here.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}