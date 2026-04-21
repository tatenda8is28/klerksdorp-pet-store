import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { supabase } from '../lib/supabase';
import { Package, Truck, CheckCircle, Clock, MapPin, Loader2, Download, Calendar } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openOrderId, setOpenOrderId] = useState(null);
    const [orderItems, setOrderItems] = useState({});
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchOrders = async () => {
        const { data } = await supabase.from('orders').select('*, driver_id(id, name)').order('created_at', { ascending: false });
        setOrders(data || []);
        setLoading(false);
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
        fetchOrders();
        const sub = supabase.channel('orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders).subscribe();
        return () => supabase.removeChannel(sub);
    }, []);

    const setReady = async (id) => {
        await supabase.from('orders').update({ status: 'Ready for Pickup' }).eq('id', id);
        fetchOrders();
    };

    // Group orders by date
    const groupOrdersByDate = () => {
        const grouped = {};
        orders.forEach(order => {
            const date = new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(order);
        });
        return Object.entries(grouped).sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA));
    };

    // Filter orders by date range
    const filterOrdersByDateRange = () => {
        if (!startDate && !endDate) return orders;
        
        return orders.filter(order => {
            const orderDate = new Date(order.created_at);
            const start = startDate ? new Date(startDate) : new Date('1970-01-01');
            const end = endDate ? new Date(endDate) : new Date('2099-12-31');
            
            return orderDate >= start && orderDate <= end;
        });
    };

    // Export to PDF
    const exportToPDF = () => {
        const filteredOrders = filterOrdersByDateRange();
        if (!filteredOrders.length) {
            alert('No orders to export for the selected date range.');
            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Add title
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('Order Report', pageWidth / 2, 20, { align: 'center' });

        // Add date range info
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const dateInfo = startDate && endDate 
            ? `${startDate} to ${endDate}` 
            : 'All Orders';
        doc.text(`Date Range: ${dateInfo}`, pageWidth / 2, 30, { align: 'center' });

        // Prepare table data
        const tableData = filteredOrders.map(order => [
            new Date(order.created_at).toLocaleDateString(),
            order.customer_name,
            order.delivery_address,
            order.delivery_slot,
            `R ${order.total_amount.toFixed(2)}`,
            order.status,
            order.driver_id?.name || 'Unassigned'
        ]);

        // Add table
        autoTable(doc, {
            head: [['Date', 'Customer', 'Address', 'Slot', 'Amount', 'Status', 'Driver']],
            body: tableData,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold' },
            bodyStyles: { textColor: [0, 0, 0] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 28 },
                2: { cellWidth: 40 },
                3: { cellWidth: 28 },
                4: { cellWidth: 20 },
                5: { cellWidth: 20 },
                6: { cellWidth: 25 }
            }
        });

        // Add summary
        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total_amount, 0);
        const deliveredCount = filteredOrders.filter(o => o.status === 'Delivered').length;
        
        doc.text(`Total Orders: ${filteredOrders.length}`, 20, finalY);
        doc.text(`Delivered: ${deliveredCount}`, 20, finalY + 8);
        doc.text(`Total Revenue: R ${totalRevenue.toFixed(2)}`, 20, finalY + 16);

        // Save PDF
        doc.save(`orders_${new Date().toISOString().split('T')[0]}.pdf`);
    };


    if (loading) return <AdminLayout><div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-[#1E3A8A]" /></div></AdminLayout>;

    const filteredOrders = filterOrdersByDateRange();
    const groupedOrders = () => {
        const grouped = {};
        filteredOrders.forEach(order => {
            const date = new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(order);
        });
        return Object.entries(grouped).sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA));
    };

    const displayedGroupedOrders = groupedOrders();
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total_amount, 0);
    const totalDelivered = filteredOrders.filter(o => o.status === 'Delivered').length;

    return (
        <AdminLayout>
            <div className="p-12">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-[#1E3A8A]">Order Management</h1>
                    </div>

                    {/* DATE RANGE FILTER & EXPORT */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-end">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">From Date</label>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-4 py-3 rounded-2xl border border-slate-200 bg-white font-black text-sm focus:outline-none focus:border-[#1E3A8A]"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">To Date</label>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-4 py-3 rounded-2xl border border-slate-200 bg-white font-black text-sm focus:outline-none focus:border-[#1E3A8A]"
                            />
                        </div>
                        <button
                            onClick={() => { setStartDate(''); setEndDate(''); }}
                            className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-700 font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
                        >
                            Clear Dates
                        </button>
                        <button
                            onClick={exportToPDF}
                            className="px-6 py-3 rounded-2xl bg-[#1E3A8A] text-white font-black text-sm uppercase tracking-widest hover:bg-blue-900 transition-all flex items-center gap-2 shadow-lg"
                        >
                            <Download size={16} /> Export PDF
                        </button>
                    </div>
                </div>

                {/* SUMMARY STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Total Orders</p>
                        <p className="text-3xl font-black text-blue-900">{filteredOrders.length}</p>
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Total Revenue</p>
                        <p className="text-3xl font-black text-emerald-900">R {totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">Delivered</p>
                        <p className="text-3xl font-black text-green-900">{totalDelivered} / {filteredOrders.length}</p>
                    </div>
                </div>

                <div className="space-y-10">
                    {displayedGroupedOrders.length === 0 ? (
                        <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
                            <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
                            <p className="text-slate-400 font-bold text-lg">No orders found for this date range</p>
                        </div>
                    ) : (
                        displayedGroupedOrders.map(([date, dateOrders]) => {
                        const dailyRevenue = dateOrders.reduce((sum, order) => sum + order.total_amount, 0);
                        const deliveredCount = dateOrders.filter(o => o.status === 'Delivered').length;
                        
                        return (
                            <div key={date}>
                                {/* DATE HEADER WITH DAILY STATS */}
                                <div className="mb-6">
                                    <h2 className="text-2xl font-black uppercase italic text-slate-900 mb-3">{date}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Total Orders</p>
                                            <p className="text-2xl font-black text-blue-900">{dateOrders.length}</p>
                                        </div>
                                        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Daily Revenue</p>
                                            <p className="text-2xl font-black text-emerald-900">R {dailyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                                            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Delivered</p>
                                            <p className="text-2xl font-black text-green-900">{deliveredCount} / {dateOrders.length}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* ORDERS FOR THIS DATE */}
                                <div className="grid gap-4">
                                    {dateOrders.map(order => (
                                        <div key={order.id} className="bg-white p-10 rounded-[45px] border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
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
                                <div className="text-right">
                                    <p className="text-2xl font-black text-[#1E3A8A] italic">R {order.total_amount}</p>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">{order.status}{order.driver_id?.name ? ` • ${order.driver_id.name}` : ''}</p>
                                </div>
                                {order.status === 'Pending' && (
                                    <button onClick={() => setReady(order.id)} className="bg-[#1E3A8A] text-white px-8 py-4 rounded-3xl font-black uppercase italic tracking-tighter text-xs shadow-lg shadow-blue-100 hover:bg-[#152a66] transition-all">
                                        Confirm & Pack
                                    </button>
                                )}
                                <button onClick={() => toggleOrderDetails(order.id)} className="bg-slate-100 text-slate-700 px-6 py-3 rounded-3xl font-black uppercase italic tracking-tighter text-xs border border-slate-200 hover:bg-slate-200 transition-all">
                                    {openOrderId === order.id ? 'Hide Details' : 'View Details'}
                                </button>
                            </div>

                            {openOrderId === order.id && (
                                <div className="mt-8 border-t border-slate-100 pt-6 text-sm text-slate-600 space-y-5">
                                    <div className="bg-slate-50 p-6 rounded-3xl mb-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 font-black">Subtotal</p>
                                                <p className="font-black text-slate-900">R {(order.total_amount - 40).toFixed(2)}</p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 font-black">Delivery Fee</p>
                                                <p className="font-black text-green-600">R 40.00</p>
                                            </div>
                                            <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                                                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-600 font-black">Total Amount</p>
                                                <p className="font-black text-[#1E3A8A] text-lg">R {order.total_amount}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 font-black">Customer</p>
                                            <p className="font-black text-slate-900">{order.customer_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 font-black">Phone</p>
                                            <p className="font-black text-slate-900">{order.phone || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 font-black">Delivery Address</p>
                                            <p className="font-black text-slate-900">{order.delivery_address}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 font-black">Delivery Slot</p>
                                            <p className="font-black text-slate-900">{order.delivery_slot}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 font-black">Payment Method</p>
                                            <p className="font-black text-slate-900">{order.payment_method || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400 font-black">Assigned Driver</p>
                                            <p className="font-black text-slate-900">{order.driver_id?.name || 'Unassigned'}</p>
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
                    })
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}