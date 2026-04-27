import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StoreHeader from '../components/StoreHeader';
import Footer from '../components/Footer';
import { Loader2, ChevronLeft, Banknote, CreditCard } from 'lucide-react';
import ReactGA from "react-ga4";

const DELIVERY_SLOTS = ['Morning (08:00 - 12:00)', 'Afternoon (12:00 - 16:00)'];

export default function Checkout() {
    const { cart, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customer_name: user?.user_metadata?.full_name || '',
        phone: '',
        delivery_address: '',
        special_instructions: '',
        delivery_slot: DELIVERY_SLOTS[0],
        payment_method: 'COD'
    });

    useEffect(() => {
        const savedForm = localStorage.getItem('pending_order');
        if (savedForm) { setFormData(JSON.parse(savedForm)); localStorage.removeItem('pending_order'); }
    }, []);

    const handleConfirm = async (e) => {
        e.preventDefault();
        if (!user) {
            localStorage.setItem('pending_order', JSON.stringify(formData));
            await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/checkout' } });
            return;
        }

        setLoading(true);
        try {
            const { data: order, error } = await supabase.from('orders').insert([{ ...formData, total_amount: getCartTotal() + 40, status: 'Pending', user_id: user.id }]).select('id').single();
            if (!error) {
                const items = cart.map(i => ({ order_id: order.id, product_id: i.id, quantity: i.quantity, price_at_time: i.price }));
                await supabase.from('order_items').insert(items);

                // Analytics Injection: Purchase Event
                ReactGA.event("purchase", {
                    transaction_id: order.id,
                    value: getCartTotal() + 40,
                    currency: "ZAR",
                    shipping: 40,
                    items: cart.map(item => ({
                        item_id: item.id,
                        item_name: item.name,
                        price: item.price,
                        quantity: item.quantity
                    }))
                });

                clearCart();
                navigate('/orders');
            }
        } catch (err) { alert(err.message); }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <StoreHeader />
            <main className="max-w-7xl mx-auto px-6 py-10 lg:py-20">
                <div className="flex justify-between items-end mb-10">
                    <h1 className="text-4xl lg:text-6xl font-black italic uppercase tracking-tighter text-[#1E3A8A]">Finish Order</h1>
                    <button onClick={() => navigate('/store')} className="text-[10px] font-black uppercase text-gray-400">Back</button>
                </div>

                <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
                    <form onSubmit={handleConfirm} className="bg-white p-8 lg:p-12 rounded-[48px] shadow-xl space-y-6 border border-slate-100">
                        <div className="grid gap-4 md:grid-cols-2">
                            <input required className="p-5 bg-gray-50 rounded-2xl font-bold border-none" placeholder="Full Name" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} />
                            <input required className="p-5 bg-gray-50 rounded-2xl font-bold border-none" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <textarea required className="w-full p-5 bg-gray-50 rounded-[30px] font-bold border-none h-32" placeholder="Delivery Address" value={formData.delivery_address} onChange={e => setFormData({...formData, delivery_address: e.target.value})} />
                        <div className="grid gap-4 md:grid-cols-2">
                            <select className="p-5 bg-gray-50 rounded-2xl font-bold border-none" value={formData.delivery_slot} onChange={e => setFormData({...formData, delivery_slot: e.target.value})}>
                                {DELIVERY_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <input className="p-5 bg-gray-50 rounded-2xl font-bold border-none" placeholder="Special Instructions" value={formData.special_instructions} onChange={e => setFormData({...formData, special_instructions: e.target.value})} />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <button type="button" onClick={() => setFormData({...formData, payment_method: 'COD'})} className={`p-6 rounded-3xl border-2 transition-all ${formData.payment_method === 'COD' ? 'border-[#1E3A8A] bg-blue-50' : 'border-gray-50'}`}>
                                <Banknote className="mb-2" /> <p className="font-black uppercase text-[10px]">Cash on Delivery</p>
                            </button>
                            <button type="button" onClick={() => setFormData({...formData, payment_method: 'Card (COD)'})} className={`p-6 rounded-3xl border-2 transition-all ${formData.payment_method === 'Card (COD)' ? 'border-[#1E3A8A] bg-blue-50' : 'border-gray-100'}`}>
                                <CreditCard className="mb-2" /> <p className="font-black uppercase text-[10px]">Card on Delivery</p>
                            </button>
                        </div>
                        <button disabled={loading || !cart.length} className="w-full bg-[#1E3A8A] text-white py-6 rounded-[30px] font-black uppercase italic text-xl">
                            {loading ? <Loader2 className="animate-spin mx-auto" /> : `Confirm Order R ${getCartTotal() + 40}`}
                        </button>
                    </form>

                    <aside className="bg-[#1E3A8A] p-8 lg:p-12 rounded-[50px] text-white shadow-2xl h-fit">
                        <h2 className="text-2xl font-black uppercase italic mb-8 border-b border-white/10 pb-6 text-yellow-400">Order Summary</h2>
                        <div className="space-y-4 mb-8">
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between bg-white/10 p-5 rounded-2xl">
                                    <p className="font-bold text-sm">{item.quantity}x {item.name}</p>
                                    <p className="font-black text-yellow-300 italic">R {item.price * item.quantity}</p>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-3 px-2 border-t border-white/10 pt-6">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-blue-200"><span>Items</span><span>R {getCartTotal()}</span></div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-blue-200"><span>Delivery Fee</span><span>R 40</span></div>
                            <div className="flex justify-between text-4xl font-black italic text-yellow-400 mt-4 tracking-tighter"><span>TOTAL</span><span>R {getCartTotal() + 40}</span></div>
                        </div>
                    </aside>
                </div>
            </main>
            <Footer />
        </div>
    );
}