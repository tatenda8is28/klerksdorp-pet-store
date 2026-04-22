import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Truck, Store, Package, Loader2, CheckCircle2, ArrowLeft, MapPin, LogOut, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DriverPortal() {
    const { user, signOut } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('pickup'); // 'pickup' = SHOP, 'delivery' = TRUCK, 'history' = HISTORY
    const [orderItems, setOrderItems] = useState({});
    const [weeklyHistory, setWeeklyHistory] = useState([]);
    const navigate = useNavigate();

    const fetchOrders = async () => {
        const { data } = await supabase.from('orders').select('*').in('status', ['Ready for Pickup', 'Out for Delivery']).order('created_at', { ascending: true });
        setOrders(data || []);
        setLoading(false);
    };

    const fetchWeeklyHistory = async () => {
        if (!user?.id) return;
        const now = new Date();
        const monday = new Date(now.setDate(now.getDate() - now.getDay() + 1));
        monday.setHours(0,0,0,0);

        const { data } = await supabase.from('orders').select('*').eq('status', 'Delivered').eq('driver_id', user.id).gte('completed_at', monday.toISOString()).order('completed_at', { ascending: false });
        setWeeklyHistory(data || []);
    };

    useEffect(() => {
        if (!user) navigate('/login');
        fetchOrders();
        fetchWeeklyHistory();
        const sub = supabase.channel('drivers').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => { fetchOrders(); fetchWeeklyHistory(); }).subscribe();
        return () => supabase.removeChannel(sub);
    }, [user]);

    const loadOrderItems = async (orderId) => {
        if (orderItems[orderId]) return;
        const { data } = await supabase.from('order_items').select('quantity, product_id(name)').eq('order_id', orderId);
        setOrderItems(prev => ({ ...prev, [orderId]: data || [] }));
    };

    const updateStatus = async (order) => {
        const { id, status, driver_id } = order;
        
        // 1. ACCEPT: Only if driver_id is NULL
        if (status === 'Ready for Pickup' && !driver_id) {
            const { error, count } = await supabase.from('orders').update({ driver_id: user.id }).eq('id', id).is('driver_id', null);
            if (error) alert("Order already taken!");
            else setView('delivery'); // Move driver to Truck tab automatically
        } 
        // 2. LOAD TO TRUCK
        else if (status === 'Ready for Pickup' && driver_id === user.id) {
            await supabase.from('orders').update({ status: 'Out for Delivery' }).eq('id', id);
        } 
        // 3. DELIVERED
        else if (status === 'Out for Delivery' && driver_id === user.id) {
            await supabase.from('orders').update({ status: 'Delivered', completed_at: new Date().toISOString() }).eq('id', id);
        }
        fetchOrders();
    };

    // TAB FILTERING LOGIC
    const pickupList = orders.filter(o => o.status === 'Ready for Pickup' && !o.driver_id);
    const deliveryList = orders.filter(o => (o.status === 'Ready for Pickup' || o.status === 'Out for Delivery') && o.driver_id === user?.id);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#002147] text-white"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-[#002147] text-white p-8 rounded-b-[45px] sticky top-0 z-10 shadow-xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-xl font-black uppercase italic">Driver Portal</h1>
                    <button onClick={signOut} className="p-2 bg-white/10 rounded-full"><LogOut size={18} /></button>
                </div>
                <div className="flex bg-[#00142b] p-2 rounded-[30px] gap-2">
                    <button onClick={() => setView('pickup')} className={`flex-1 py-4 rounded-[25px] font-black uppercase text-[10px] tracking-widest transition-all ${view === 'pickup' ? 'bg-white text-[#002147]' : 'text-blue-300'}`}>SHOP ({pickupList.length})</button>
                    <button onClick={() => setView('delivery')} className={`flex-1 py-4 rounded-[25px] font-black uppercase text-[10px] tracking-widest transition-all ${view === 'delivery' ? 'bg-white text-[#002147]' : 'text-blue-300'}`}>MY TRUCK ({deliveryList.length})</button>
                    <button onClick={() => setView('history')} className={`flex-1 py-4 rounded-[25px] font-black uppercase text-[10px] tracking-widest transition-all ${view === 'history' ? 'bg-white text-[#002147]' : 'text-blue-300'}`}>HISTORY</button>
                </div>
            </div>

            <div className="p-6 space-y-4">
                {view === 'history' && (
                    <div className="bg-white p-8 rounded-[40px] shadow-sm mb-6 border border-gray-100">
                        <h2 className="text-xl font-black uppercase italic mb-4">Weekly Earnings</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-5 rounded-3xl text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase">Delivered</p>
                                <p className="text-2xl font-black">{weeklyHistory.length}</p>
                            </div>
                            <div className="bg-green-50 p-5 rounded-3xl text-center">
                                <p className="text-[10px] font-black text-green-600 uppercase">Earned</p>
                                <p className="text-2xl font-black text-green-600">R {weeklyHistory.length * 40}</p>
                            </div>
                        </div>
                    </div>
                )}

                {(view === 'history' ? weeklyHistory : view === 'pickup' ? pickupList : deliveryList).map(order => (
                    <div key={order.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                        <div className="flex justify-between mb-4">
                            <h3 className="text-xl font-black uppercase italic">{order.customer_name}</h3>
                            <p className="font-black text-[#002147] italic">R {order.total_amount}</p>
                        </div>

                        {/* ONLY SHOW DETAILS IF IN MY TRUCK OR HISTORY */}
                        {view !== 'pickup' && (
                            <div className="space-y-3 mb-6">
                                <p className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase tracking-tight"><MapPin size={14} className="text-blue-500"/> {order.delivery_address}</p>
                                <p className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase tracking-tight"><Phone size={14} className="text-blue-500"/> {order.phone}</p>
                                <button onClick={() => { loadOrderItems(order.id); }} className="text-[10px] font-black text-blue-400 uppercase tracking-widest underline">View Items</button>
                                {orderItems[order.id] && (
                                    <div className="bg-slate-50 p-4 rounded-2xl mt-2">
                                        {orderItems[order.id].map((item, i) => <p key={i} className="text-[10px] font-bold text-gray-600">{item.quantity}x {item.product_id?.name}</p>)}
                                    </div>
                                )}
                            </div>
                        )}

                        {view !== 'history' && (
                            <button onClick={() => updateStatus(order)} className={`w-full py-5 rounded-[25px] font-black uppercase italic text-lg shadow-lg transition-all ${order.status === 'Out for Delivery' ? 'bg-green-500' : 'bg-[#002147]'}`}>
                                {order.status === 'Ready for Pickup' ? (order.driver_id ? 'Load to Truck' : 'Accept Order') : 'Confirm Delivery'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}