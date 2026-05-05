import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { supabase } from '../lib/supabase';
import { Package, Truck, CheckCircle, Clock, MapPin, Loader2, Download, Calendar, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openOrderId, setOpenOrderId] = useState(null);
    const [orderItems, setOrderItems] = useState({});
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [driverMap, setDriverMap] = useState({});

    const fetchOrders = async () => {
        const { data: drvData } = await supabase.from('drivers').select('id, name');
        const map = {};
        drvData?.forEach(d => map[d.id] = d.name);
        setDriverMap(map);

        const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        setOrders(data || []);
        setLoading(false);
    };

    const loadOrderItems = async (orderId) => {
        if (orderItems[orderId]) return;
        const { data } = await supabase.from('order_items').select('quantity, price_at_time, product_id(name)').eq('order_id', orderId);
        setOrderItems(prev => ({ ...prev, [orderId]: data || [] }));
    };

    const toggleOrderDetails = async (orderId) => {
        if (openOrderId === orderId) { setOpenOrderId(null); return; }
        setOpenOrderId(orderId);
        await loadOrderItems(orderId);
    };

    useEffect(() => {
        fetchOrders();
        const sub = supabase.channel('orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders).subscribe();
        return () => supabase.removeChannel(sub);
    }, []);

    const setReady = async (id) => {
        await supabase.from('orders').update({ status: 'Ready for Pickup' }).eq('id', id);
        fetchOrders();
    };

    // FIXED: Performs sequential deletion to avoid foreign key errors
    const deleteOrder = async (id) => {
        if (!confirm("Delete this order? This will remove all associated records.")) return;
        
        // Step 1: Delete children (order_items) first
        const { error: itemsError } = await supabase.from('order_items').delete().eq('order_id', id);
        
        if (itemsError) {
            alert("Error clearing order items: " + itemsError.message);
            return;
        }

        // Step 2: Delete parent (orders)
        const { error: orderError } = await supabase.from('orders').delete().eq('id', id);
        
        if (!orderError) {
            fetchOrders();
        } else {
            alert("Error deleting order: " + orderError.message);
        }
    };

    const filterOrdersByDateRange = () => {
        if (!startDate && !endDate) return orders;
        return orders.filter(order => {
            const orderDate = new Date(order.created_at);
            const start = startDate ? new Date(startDate) : new Date('1970-01-01');
            const end = endDate ? new Date(endDate) : new Date('2099-12-31');
            return orderDate >= start && orderDate <= end;
        });
    };

    const exportToPDF = () => {
        const filteredOrders = filterOrdersByDateRange();
        const doc = new jsPDF();
        const tableData = filteredOrders.map(order => [
            new Date(order.created_at).toLocaleDateString(),
            order.customer_name,
            order.delivery_address,
            order.delivery_slot,
            `R ${order.total_amount}`,
            order.status,
            driverMap[order.driver_id] || 'Unassigned'
        ]);
        autoTable(doc, {
            head: [['Date', 'Customer', 'Address', 'Slot', 'Amount', 'Status', 'Driver']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [30, 58, 138] }
        });
        doc.save(`orders_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if (loading) return <AdminLayout><div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-[#1E3A8A]" /></div></AdminLayout>;

    const filteredOrders = filterOrdersByDateRange();
    const groupedOrders = () => {
        const grouped = {};
        filteredOrders.forEach(order => {
            const date = new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(order);
        });
        return Object.entries(grouped).sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA));
    };

    const displayedGroupedOrders = groupedOrders();
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

    return (
        <AdminLayout>
            <div className="p-12">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12">
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter text-[#1E3A8A]">Order Management</h1>
                    <div className="flex flex-col gap-4 md:flex-row md:items-end">
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold" />
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold" />
                        <button onClick={exportToPDF} className="px-6 py-3 rounded-2xl bg-[#1E3A8A] text-white font-black text-sm uppercase italic flex items-center gap-2 shadow-lg hover:bg-blue-900 transition-all">
                            <Download size={16} /> Export PDF
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100"><p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Total Orders</p><p className="text-3xl font-black text-blue-900">{filteredOrders.length}</p></div>
                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100"><p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Total Revenue</p><p className="text-3xl font-black text-emerald-900">R {totalRevenue.toFixed(2)}</p></div>
                </div>

                <div className="space-y-10">
                    {displayedGroupedOrders.map(([date, dateOrders]) => (
                        <div key={date}>
                            <h2 className="text-2xl font-black uppercase italic text-slate-900 mb-6">{date}</h2>
                            <div className="grid gap-4">
                                {dateOrders.map(order => (
                                    <div key={order.id} className="bg-white p-10 rounded-[45px] border border-gray-100 flex flex-col shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-8">
                                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#F1F5F9] text-[#1E3A8A]">
                                                    {order.status === 'Delivered' ? <CheckCircle className="text-green-500" /> : <Package />}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-2xl uppercase italic text-gray-900 leading-none">{order.customer_name}</h3>
                                                    <div className="flex gap-4 mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        <span className="flex items-center gap-1"><Clock size={14}/> {order.delivery_slot}</span>
                                                        <span className="flex items-center gap-1"><MapPin size={14}/> {order.delivery_address}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-10">
                                                <div className="flex items-center gap-4 text-right pr-6 border-r border-slate-100">
                                                    <div>
                                                        <p className="text-2xl font-black text-[#1E3A8A] italic">R {order.total_amount}</p>
                                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">
                                                            {order.status} • {driverMap[order.driver_id] || 'Unassigned'}
                                                        </p>
                                                    </div>
                                                    <button onClick={() => deleteOrder(order.id)} className="p-3 text-red-300 hover:text-red-600 transition-colors">
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                                {order.status === 'Pending' && <button onClick={() => setReady(order.id)} className="bg-[#1E3A8A] text-white px-8 py-4 rounded-3xl font-black uppercase italic text-xs shadow-lg hover:bg-blue-900 transition-all">Confirm & Pack</button>}
                                                <button onClick={() => toggleOrderDetails(order.id)} className="bg-slate-100 text-slate-700 px-6 py-3 rounded-3xl font-black uppercase italic tracking-tighter text-xs border border-slate-200 hover:bg-slate-200 transition-all">
                                                    {openOrderId === order.id ? 'Hide Details' : 'Details'}
                                                </button>
                                            </div>
                                        </div>

                                        {openOrderId === order.id && (
                                            <div className="mt-8 pt-8 border-t border-slate-100 text-sm text-slate-600 space-y-5 animate-in fade-in slide-in-from-top-2">
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div><p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Phone</p><p className="font-black text-slate-900">{order.phone || 'N/A'}</p></div>
                                                    <div><p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Instructions</p><p className="font-black text-slate-900">{order.special_instructions || 'None'}</p></div>
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Items</p>
                                                    {orderItems[order.id]?.map((item, index) => (
                                                        <div key={index} className="flex justify-between bg-slate-50 p-4 rounded-3xl">
                                                            <p className="font-black text-slate-900">{item.quantity}x {item.product_id?.name || 'Unknown item'}</p>
                                                            <p className="font-black text-slate-900">R {item.price_at_time * item.quantity}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}