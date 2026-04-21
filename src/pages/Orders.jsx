import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import StoreHeader from '../components/StoreHeader';
import Footer from '../components/Footer';
import { Search, MapPin, Clock, Package, CheckCircle } from 'lucide-react';

export default function Orders() {
    const [phone, setPhone] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const trackOrder = async (e) => {
        e.preventDefault();
        if (!phone) return;
        
        setLoading(true);
        setHasSearched(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('phone', phone)
            .order('created_at', { ascending: false });
        
        if (data) setOrders(data);
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <StoreHeader />
            <main className="max-w-4xl mx-auto px-6 py-16 w-full flex-grow">
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-[#1E3A8A] mb-4">Track Your Order</h1>
                    <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.3em]">Enter your phone number to see your recent orders</p>
                </div>

                <form onSubmit={trackOrder} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4 mb-16">
                    <input 
                        type="text" 
                        placeholder="Enter Phone Number (e.g. 0821234567)" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-grow px-8 py-5 rounded-[25px] border-2 border-gray-100 font-black text-lg focus:outline-none focus:border-[#1E3A8A] transition-all"
                    />
                    <button className="bg-[#1E3A8A] text-white px-10 py-5 rounded-[25px] font-black uppercase italic tracking-tighter flex items-center justify-center gap-2 shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all">
                        <Search size={20} /> Track
                    </button>
                </form>

                <div className="space-y-8">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order.id} className="bg-white p-8 md:p-10 rounded-[45px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${order.status === 'Delivered' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-[#1E3A8A]'}`}>
                                            {order.status === 'Delivered' ? <CheckCircle size={30} /> : <Package size={30} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                                                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-[#1E3A8A]'
                                                }`}>
                                                    {order.status}
                                                </span>
                                                <span className="text-gray-300 font-bold text-xs uppercase">#{order.id.slice(0,8)}</span>
                                            </div>
                                            <h3 className="text-2xl font-black uppercase italic text-gray-900 leading-none">{order.customer_name}</h3>
                                        </div>
                                    </div>
                                    <div className="text-left md:text-right w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                                        <p className="text-3xl font-black text-[#1E3A8A] italic">R {order.total_amount}</p>
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">
                                            Ordered {new Date(order.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-gray-50">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="text-[#1E3A8A] flex-shrink-0" size={18} />
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Delivery Address</p>
                                            <p className="font-bold text-gray-800 text-sm leading-tight">{order.delivery_address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="text-[#1E3A8A] flex-shrink-0" size={18} />
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Delivery Slot</p>
                                            <p className="font-bold text-gray-800 text-sm">{order.delivery_slot}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    
                    {hasSearched && !loading && orders.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 rounded-[45px] border-2 border-dashed border-gray-200">
                            <p className="text-gray-400 font-black uppercase italic text-xl">No orders found for this phone number.</p>
                            <p className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-widest">Please check the number and try again.</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}