import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Truck, Store, Package, MapPin, Loader2, LogOut } from 'lucide-react';

export default function DriverPortal() {
    const { user, profile, signOut } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('pickup');

    const fetchOrders = async () => {
        const { data } = await supabase
            .from('orders')
            .select('*')
            .in('status', ['Ready for Pickup', 'Out for Delivery'])
            .order('created_at', { ascending: true });
        setOrders(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
        const sub = supabase.channel('drivers').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders).subscribe();
        return () => supabase.removeChannel(sub);
    }, []);

    const updateStatus = async (order) => {
        const { id, status, driver_id } = order;

        // ACCEPT: First driver to click wins (links to user.id)
        if (status === 'Ready for Pickup' && !driver_id) {
            const { error } = await supabase.from('orders').update({ driver_id: user.id }).eq('id', id).is('driver_id', null);
            if (error) alert("Too slow! Another driver took it.");
        } 
        // LOAD/DELIVER: Only the assigned driver can progress
        else if (status === 'Ready for Pickup' && driver_id === user.id) {
            await supabase.from('orders').update({ status: 'Out for Delivery' }).eq('id', id);
        } else if (status === 'Out for Delivery' && driver_id === user.id) {
            await supabase.from('orders').update({ status: 'Delivered', completed_at: new Date().toISOString() }).eq('id', id);
        }
        fetchOrders();
    };

    const pickupList = orders.filter(o => o.status === 'Ready for Pickup' && (!o.driver_id || o.driver_id === user?.id));
    const deliveryList = orders.filter(o => o.status === 'Out for Delivery' && o.driver_id === user?.id);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#002147]"><Loader2 className="animate-spin text-white" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-[#002147] text-white p-8 rounded-b-[45px] sticky top-0 z-10">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-xl font-black uppercase italic">Driver Portal</h1>
                    <button onClick={signOut}><LogOut size={20}/></button>
                </div>
                <div className="flex bg-[#00142b] p-2 rounded-[30px] gap-2 text-[10px] font-black">
                    <button onClick={() => setView('pickup')} className={`flex-1 py-4 rounded-[25px] ${view === 'pickup' ? 'bg-white text-[#002147]' : 'text-blue-300'}`}>OPEN JOBS ({pickupList.length})</button>
                    <button onClick={() => setView('delivery')} className={`flex-1 py-4 rounded-[25px] ${view === 'delivery' ? 'bg-white text-[#002147]' : 'text-blue-300'}`}>MY TRUCK ({deliveryList.length})</button>
                </div>
            </div>

            <div className="p-6 space-y-4">
                {(view === 'pickup' ? pickupList : deliveryList).map(order => (
                    <div key={order.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                        <div className="flex justify-between mb-2">
                            <h3 className="text-xl font-black uppercase italic text-gray-800">{order.customer_name}</h3>
                            <p className="font-black text-[#002147] italic">R {order.total_amount}</p>
                        </div>
                        <p className="text-xs font-bold text-gray-400 mb-6 flex items-center gap-2"><MapPin size={14}/> {order.delivery_address}</p>
                        <button onClick={() => updateStatus(order)} className={`w-full py-5 rounded-[25px] font-black uppercase italic text-white shadow-lg ${order.status === 'Out for Delivery' ? 'bg-green-500' : 'bg-[#002147]'}`}>
                            {order.status === 'Ready for Pickup' ? (order.driver_id ? 'Load to Truck' : 'Accept Order') : 'Confirm Delivery'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}