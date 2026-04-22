import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import StoreHeader from '../components/StoreHeader';
import Footer from '../components/Footer';
import { Package, MapPin, Clock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Orders() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchMyOrders = async () => {
            const { data } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            setOrders(data || []);
            setLoading(false);
        };

        fetchMyOrders();
    }, [user, authLoading]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#1E3A8A]" /></div>;

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <StoreHeader />
            <main className="max-w-4xl mx-auto px-6 py-16 w-full flex-grow">
                <h1 className="text-5xl font-black uppercase italic text-[#1E3A8A] mb-2">My Orders</h1>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-12">Welcome back, {user?.user_metadata?.full_name}</p>

                <div className="space-y-6">
                    {orders.length > 0 ? orders.map(order => (
                        <div key={order.id} className="p-8 rounded-[40px] border border-gray-100 bg-gray-50/30 shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="px-4 py-1 rounded-full bg-blue-100 text-[#1E3A8A] text-[10px] font-black uppercase tracking-widest">{order.status}</span>
                                    <h3 className="text-xl font-black uppercase italic mt-3">Order #{order.id.slice(0,8)}</h3>
                                </div>
                                <p className="text-2xl font-black text-[#1E3A8A]">R {order.total_amount}</p>
                            </div>
                            <div className="grid gap-2 text-xs font-bold text-gray-500 uppercase">
                                <p className="flex items-center gap-2"><MapPin size={14}/> {order.delivery_address}</p>
                                <p className="flex items-center gap-2"><Clock size={14}/> {order.delivery_slot}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                            <p className="font-black text-gray-400 uppercase italic">You haven't ordered anything yet.</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}