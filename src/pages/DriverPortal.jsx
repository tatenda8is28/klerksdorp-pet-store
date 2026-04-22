import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Truck, Store, Package, MapPin, Loader2, LogOut, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DriverPortal() {
    const { user, signOut } = useAuth();
    const [orders, setOrders] = useState([]);
    const [view, setView] = useState('pickup');
    const [loading, setLoading] = useState(true);
    const [orderItems, setOrderItems] = useState({});
    const [weeklyHistory, setWeeklyHistory] = useState([]);
    const navigate = useNavigate();

    const fetchData = async () => {
        if (!user) return;
        const { data: ords } = await supabase.from('orders').select('*').in('status', ['Ready for Pickup', 'Out for Delivery']).order('created_at', { ascending: true });
        setOrders(ords || []);

        const now = new Date();
        const monday = new Date(now.setDate(now.getDate() - now.getDay() + 1));
        monday.setHours(0,0,0,0);
        const { data: hist } = await supabase.from('orders').select('*').eq('status', 'Delivered').eq('driver_id', user.id).gte('completed_at', monday.toISOString());
        setWeeklyHistory(hist || []);
        setLoading(false);
    };

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchData();
        const sub = supabase.channel('portal').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchData).subscribe();
        return () => supabase.removeChannel(sub);
    }, [user]);

    const loadOrderItems = async (orderId) => {
        if (orderItems[orderId]) return;
        const { data } = await supabase.from('order_items').select('quantity, product_id(name)').eq('order_id', orderId);
        setOrderItems(prev => ({ ...prev, [orderId]: data || [] }));
    };

    const updateStatus = async (order) => {
        if (order.status === 'Ready for Pickup' && !order.driver_id) {
            await supabase.from('orders').update({ driver_id: user.id }).eq('id', order.id).is('driver_id', null);
            setView('delivery');
        } else if (order.driver_id === user.id) {
            const nextStatus = order.status === 'Ready for Pickup' ? 'Out for Delivery' : 'Delivered';
            const payload = { status: nextStatus };
            if (nextStatus === 'Delivered') payload.completed_at = new Date().toISOString();
            await supabase.from('orders').update(payload).eq('id', order.id);
        }
        fetchData();
    };

    const pickupList = orders.filter(o => o.status === 'Ready for Pickup' && !o.driver_id);
    const deliveryList = orders.filter(o => (o.status === 'Ready for Pickup' || o.status === 'Out for Delivery') && o.driver_id === user?.id);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#002147] text-white"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            <div className="bg-[#002147] text-white p-8 rounded-b-[45px] sticky top-0 z-10 shadow-xl">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-xl font-black uppercase italic tracking-tighter">Driver Command</h1>
                    <button onClick={signOut} className="p-2 bg-white/10 rounded-full"><LogOut size={18}/></button>
                </div>
                <div className="flex bg-[#00142b] p-2 rounded-[30px] gap-2">
                    <button onClick={() => setView('pickup')} className={`flex-1 py-4 rounded-[25px] font-black text-[10px] uppercase tracking-widest ${view === 'pickup' ? 'bg-white text-[#002147]' : 'text-blue-300'}`}>SHOP ({pickupList.length})</button>
                    <button onClick={() => setView('delivery')} className={`flex-1 py-4 rounded-[25px] font-black text-[10px] uppercase tracking-widest ${view === 'delivery' ? 'bg-white text-[#002147]' : 'text-blue-300'}`}>TRUCK ({deliveryList.length})</button>
                    <button onClick={() => setView('history')} className={`flex-1 py-4 rounded-[25px] font-black text-[10px] uppercase tracking-widest ${view === 'history' ? 'bg-white text-[#002147]' : 'text-blue-300'}`}>HISTORY</button>
                </div>
            </div>

            <div className="p-6 space-y-4">
                {view === 'history' && (
                    <div className="bg-white p-8 rounded-[40px] shadow-sm flex justify-between items-center mb-6">
                        <div><p className="text-[10px] font-black text-gray-400 uppercase">Weekly Earnings</p><p className="text-3xl font-black text-green-600 italic uppercase">R {weeklyHistory.length * 40}</p></div>
                        <div className="text-right"><p className="text-[10px] font-black text-gray-400 uppercase">Deliveries</p><p className="text-3xl font-black text-[#002147] italic uppercase">{weeklyHistory.length}</p></div>
                    </div>
                )}

                {(view === 'history' ? weeklyHistory : view === 'pickup' ? pickupList : deliveryList).map(order => (
                    <div key={order.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                        <div className="flex justify-between mb-4">
                            <h3 className="text-xl font-black uppercase italic">{order.customer_name}</h3>
                            <p className="font-black text-[#002147] italic uppercase">R {order.total_amount}</p>
                        </div>
                        {view !== 'pickup' && (
                            <div className="space-y-2 mb-6 text-xs font-bold text-gray-500 uppercase tracking-tight">
                                <p className="flex items-center gap-2"><MapPin size={14} className="text-blue-500"/> {order.delivery_address}</p>
                                <p className="flex items-center gap-2"><Phone size={14} className="text-blue-500"/> {order.phone}</p>
                                <button onClick={() => loadOrderItems(order.id)} className="text-[10px] underline font-black text-blue-400 uppercase mt-4">View Items</button>
                                {orderItems[order.id] && <div className="mt-2 bg-gray-50 p-4 rounded-2xl">{orderItems[order.id].map((item, i) => <p key={i} className="text-[10px] font-bold">{item.quantity}x {item.product_id?.name}</p>)}</div>}
                            </div>
                        )}
                        {view !== 'history' && (
                            <button onClick={() => updateStatus(order)} className={`w-full py-5 rounded-[25px] font-black uppercase italic text-white shadow-lg ${order.status === 'Out for Delivery' ? 'bg-green-500' : 'bg-[#002147]'}`}>
                                {order.status === 'Ready for Pickup' ? (order.driver_id ? 'Load to Truck' : 'Accept Order') : 'Confirm Delivery'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}