import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Truck, Store, Package, Navigation, Loader2, Phone, CheckCircle2, ArrowLeft, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DriverPortal() {
    const [orders, setOrders] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('pickup');
    const [openOrderId, setOpenOrderId] = useState(null);
    const [orderItems, setOrderItems] = useState({});
    const [weeklyHistory, setWeeklyHistory] = useState([]);
    const navigate = useNavigate();

    const fetchOrders = async () => {
        const { data } = await supabase.from('orders').select('*, driver_id(id, name)').in('status', ['Ready for Pickup', 'Out for Delivery']).order('created_at', { ascending: true });
        setOrders(data || []);
        setLoading(false);
    };

    const fetchDrivers = async () => {
        const { data } = await supabase.from('drivers').select('id, name').order('name');
        setDrivers(data || []);
        if (data?.length && !selectedDriver) {
            setSelectedDriver(data[0]);
        }
    };

    const getCurrentWeekRange = () => {
        const now = new Date();
        const monday = new Date(now);
        monday.setDate(now.getDate() - now.getDay() + 1); // Monday
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6); // Sunday
        sunday.setHours(23, 59, 59, 999);

        return { monday, sunday };
    };

    const fetchWeeklyHistory = async () => {
        if (!selectedDriver?.id) return;

        const { monday, sunday } = getCurrentWeekRange();

        const { data } = await supabase
            .from('orders')
            .select('*, driver_id(id, name)')
            .eq('status', 'Delivered')
            .eq('driver_id', selectedDriver.id)
            .gte('completed_at', monday.toISOString())
            .lte('completed_at', sunday.toISOString())
            .order('completed_at', { ascending: false });

        setWeeklyHistory(data || []);
    };

    const loadOrderItems = async (orderId) => {
        if (orderItems[orderId]) return;

        const { data, error } = await supabase.from('order_items').select('quantity, price_at_time, product_id(name)').eq('order_id', orderId);
        let items = data || [];

        if (error || items.some(item => item && typeof item.product_id !== 'object')) {
            const ids = items.map(item => item.product_id).filter(Boolean);
            if (ids.length) {
                const { data: products } = await supabase.from('products').select('id, name').in('id', ids);
                const productsMap = Object.fromEntries((products || []).map(p => [p.id, p]));
                items = items.map(item => ({
                    ...item,
                    product_id: typeof item.product_id === 'object' ? item.product_id : productsMap[item.product_id] || { name: 'Unknown product' }
                }));
            }
        }

        setOrderItems(prev => ({ ...prev, [orderId]: items }));
    };

    const toggleOrderDetails = async (orderId) => {
        if (openOrderId === orderId) {
            setOpenOrderId(null);
            return;
        }
        setOpenOrderId(orderId);
        await loadOrderItems(orderId);
    };

    useEffect(() => {
        fetchDrivers();
        fetchOrders();
        const sub = supabase.channel('driver-logic').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders).subscribe();
        return () => supabase.removeChannel(sub);
    }, []);

    useEffect(() => {
        if (selectedDriver) {
            fetchWeeklyHistory();
        }
    }, [selectedDriver]);

    const updateStatus = async (order) => {
        const { id, status, driver_id } = order;
        let payload = {};

        if (status === 'Ready for Pickup' && !driver_id) {
            if (!selectedDriver?.id) return;
            payload = { driver_id: selectedDriver.id };
        } else if (status === 'Ready for Pickup' && isAssignedToSelectedDriver(order)) {
            payload = { status: 'Out for Delivery' };
        } else if (status === 'Out for Delivery' && isAssignedToSelectedDriver(order)) {
            payload = { status: 'Delivered', completed_at: new Date().toISOString() };
        } else {
            return;
        }

        const { error } = await supabase.from('orders').update(payload).eq('id', id);
        if (error) {
            console.error('Failed to update order status:', error);
            return;
        }

        fetchOrders();
    };

    const isAssignedToSelectedDriver = (order) => {
        const orderDriverId = order.driver_id?.id ?? order.driver_id;
        return selectedDriver && String(orderDriverId) === String(selectedDriver.id);
    };

    const pickupList = orders.filter(o =>
        o.status === 'Ready for Pickup' && (!o.driver_id || isAssignedToSelectedDriver(o))
    );
    const deliveryList = orders.filter(o => o.status === 'Out for Delivery' && isAssignedToSelectedDriver(o));

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#002147]"><Loader2 className="animate-spin text-white" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            {/* Header - Strictly Deep Blue #002147 */}
            <div className="bg-[#002147] text-white p-8 rounded-b-[45px] shadow-2xl sticky top-0 z-10">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="p-2 bg-[#003366] rounded-full"><ArrowLeft size={20}/></button>
                        <div>
                            <h1 className="text-xl font-black uppercase italic tracking-tighter">Driver Command</h1>
                            <p className="text-sm text-blue-200">Selected driver: {selectedDriver?.name || 'None'}</p>
                        </div>
                    </div>
                    <div>
                        <select value={selectedDriver?.id || ''} onChange={e => {
                            const value = e.target.value;
                            setSelectedDriver(drivers.find(driver => String(driver.id) === value) || null);
                        }} className="rounded-3xl bg-[#00142b] border border-blue-700 px-5 py-3 text-sm text-white outline-none">
                            {drivers.map(driver => (
                                <option key={driver.id} value={driver.id}>{driver.name}</option>
                            ))}
                        </select>
                    </div>
                    <Truck size={24} className="text-yellow-400" />
                </div>
                {/* Tab Switcher - Strictly Blue and White */}
                <div className="flex bg-[#00142b] p-2 rounded-[30px] gap-2">
                    <button onClick={() => setView('pickup')} className={`flex-1 py-4 rounded-[25px] font-black uppercase text-[10px] tracking-widest flex flex-col items-center gap-1 transition-all ${view === 'pickup' ? 'bg-white text-[#002147] shadow-xl' : 'text-blue-300'}`}>
                        <Store size={18} /> SHOP ({pickupList.length})
                    </button>
                    <button onClick={() => setView('delivery')} className={`flex-1 py-4 rounded-[25px] font-black uppercase text-[10px] tracking-widest flex flex-col items-center gap-1 transition-all ${view === 'delivery' ? 'bg-white text-[#002147] shadow-xl' : 'text-blue-300'}`}>
                        <Package size={18} /> TRUCK ({deliveryList.length})
                    </button>
                    <button onClick={() => setView('history')} className={`flex-1 py-4 rounded-[25px] font-black uppercase text-[10px] tracking-widest flex flex-col items-center gap-1 transition-all ${view === 'history' ? 'bg-white text-[#002147] shadow-xl' : 'text-blue-300'}`}>
                        <CheckCircle2 size={18} /> HISTORY
                    </button>
                </div>
            </div>

            <div className="p-6 space-y-4">
                {view === 'history' && (
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-black text-gray-900 italic uppercase leading-none mb-6">Weekly Earnings</h2>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="bg-slate-50 p-6 rounded-3xl">
                                    <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 font-black">Orders Delivered</p>
                                    <p className="text-3xl font-black text-slate-900">{weeklyHistory.length}</p>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-3xl">
                                    <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 font-black">Rate per Order</p>
                                    <p className="text-3xl font-black text-slate-900">R 40</p>
                                </div>
                                <div className="bg-green-50 p-6 rounded-3xl">
                                    <p className="text-[10px] uppercase tracking-[0.35em] text-green-600 font-black">Total Earnings</p>
                                    <p className="text-3xl font-black text-green-600">R {weeklyHistory.length * 40}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-black text-gray-900 italic uppercase">This Week's Deliveries</h3>
                            {weeklyHistory.length ? (
                                weeklyHistory.map(order => (
                                    <div key={order.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                                        <div className="flex justify-between mb-4">
                                            <h4 className="text-xl font-black text-gray-900 italic uppercase leading-none">{order.customer_name}</h4>
                                            <div className="text-right">
                                                <p className="font-black text-[#002147] italic">R {order.total_amount}</p>
                                                <p className="text-[10px] uppercase font-black tracking-[0.35em] text-green-600">+R 40 earned</p>
                                            </div>
                                        </div>
                                        <p className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-tighter flex items-center gap-2">
                                            <MapPin size={14} className="text-[#002147]" /> {order.delivery_address}
                                        </p>
                                        <p className="text-[10px] uppercase font-black tracking-[0.35em] text-slate-400">
                                            Completed: {new Date(order.completed_at).toLocaleDateString('en-ZA', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white p-12 rounded-[40px] shadow-sm border border-gray-100 text-center">
                                    <CheckCircle2 size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-lg font-black text-gray-400 uppercase tracking-tighter">No deliveries this week yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {view !== 'history' && (view === 'pickup' ? pickupList : deliveryList).map(order => (
                    <div key={order.id} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex justify-between mb-4">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 italic uppercase leading-none">{order.customer_name}</h3>
                                <p className="text-[10px] uppercase font-black tracking-[0.35em] text-slate-400 mt-2">
                                    {order.status === 'Ready for Pickup'
                                        ? order.driver_id
                                            ? 'Accepted - Arrive at store'
                                            : 'Awaiting acceptance'
                                        : 'Out for Delivery'}
                                </p>
                            </div>
                            <p className="font-black text-[#002147] italic">R {order.total_amount}</p>
                        </div>
                        <p className="text-xs font-bold text-gray-400 mb-8 uppercase tracking-tighter flex items-center gap-2">
                            <MapPin size={14} className="text-[#002147]" /> {order.delivery_address}
                        </p>
                        <div className="flex flex-col gap-4 sm:flex-row justify-between items-stretch">
                            <button onClick={() => toggleOrderDetails(order.id)} className="w-full sm:w-auto px-6 py-4 rounded-[25px] border border-slate-200 font-black uppercase italic tracking-tighter text-sm text-slate-700 bg-slate-50 hover:bg-slate-100 transition-all">
                                {openOrderId === order.id ? 'Hide Details' : 'View Details'}
                            </button>
                            <button onClick={() => updateStatus(order)} disabled={!selectedDriver} className={`w-full sm:w-auto py-5 text-white rounded-[25px] font-black uppercase italic tracking-tighter text-lg shadow-lg ${order.status === 'Out for Delivery' ? 'bg-green-500' : 'bg-[#002147]'} ${!selectedDriver ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {order.status === 'Ready for Pickup'
                                    ? order.driver_id
                                        ? 'Load to Truck'
                                        : 'Accept Order'
                                    : 'Confirm Delivery'}
                            </button>
                        </div>
                        {openOrderId === order.id && (
                            <div className="mt-6 border-t border-slate-100 pt-6 text-sm text-slate-600 space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 font-black">Phone</p>
                                        <p className="font-black text-slate-900">{order.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 font-black">Delivery Slot</p>
                                        <p className="font-black text-slate-900">{order.delivery_slot}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 font-black">Payment</p>
                                        <p className="font-black text-slate-900">{order.payment_method || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 font-black">Order Items</p>
                                    {orderItems[order.id] ? (
                                        orderItems[order.id].length ? (
                                            <div className="space-y-2">
                                                {orderItems[order.id].map((item, index) => (
                                                    <div key={index} className="flex justify-between items-center gap-4 rounded-3xl bg-slate-50 p-4">
                                                        <div>
                                                            <p className="font-black text-slate-900">{item.quantity}x {item.product_id?.name || 'Unknown item'}</p>
                                                            <p className="text-[11px] text-slate-400">R {item.price_at_time} each</p>
                                                        </div>
                                                        <p className="font-black text-slate-900">R {item.price_at_time * item.quantity}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-slate-500">No line items found for this order.</p>
                                        )
                                    ) : (
                                        <p className="text-slate-500">Loading items…</p>
                                    )}
                                </div>
                                {order.special_instructions && (
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 font-black">Special Instructions</p>
                                        <p className="font-black text-slate-900">{order.special_instructions}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}