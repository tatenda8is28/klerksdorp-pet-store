import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import StoreHeader from '../components/StoreHeader'; // CHANGED THIS
import Footer from '../components/Footer';
import { Loader2, ChevronLeft, Banknote, CreditCard } from 'lucide-react';

const DELIVERY_SLOTS = [
    'Morning (08:00 - 12:00)',
    'Afternoon (12:00 - 16:00)',
    'Evening (16:00 - 20:00)'
];

export default function Checkout() {
    const { cart, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        customer_name: '',
        phone: '',
        delivery_address: '',
        special_instructions: '',
        delivery_slot: DELIVERY_SLOTS[0],
        payment_method: 'COD'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!cart.length) {
            setError('Your cart is empty. Add items before confirming your order.');
            return;
        }

        if (!formData.customer_name || !formData.phone || !formData.delivery_address) {
            setError('Please complete name, phone and delivery address before checkout.');
            return;
        }

        setLoading(true);

        try {
            const { data: order, error: orderError } = await supabase.from('orders').insert([{
                customer_name: formData.customer_name,
                phone: formData.phone,
                delivery_address: formData.delivery_address,
                special_instructions: formData.special_instructions,
                total_amount: getCartTotal() + 40, 
                delivery_fee: 40, 
                status: 'Pending',
                payment_method: formData.payment_method,
                delivery_slot: formData.delivery_slot
            }]).select('id').single();

            if (orderError || !order) {
                throw orderError || new Error('Unable to create order.');
            }

            const items = cart.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                price_at_time: item.price
            }));

            const { error: itemsError } = await supabase.from('order_items').insert(items);
            if (itemsError) {
                throw itemsError;
            }

            for (const item of cart) {
                const { data: product } = await supabase.from('products').select('stock_level').eq('id', item.id).single();
                if (product) {
                    const newStock = Math.max(0, product.stock_level - item.quantity);
                    await supabase.from('products').update({ stock_level: newStock }).eq('id', item.id);
                }
            }

            clearCart();
            setSuccess('Your order is confirmed! You will be redirected home shortly.');
            setTimeout(() => navigate('/'), 1200);
        } catch (err) {
            console.error(err);
            setError(err?.message || 'Unable to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <StoreHeader /> {/* CHANGED FROM NAVBAR TO STOREHEADER */}
            
            <main className="max-w-7xl mx-auto px-6 py-10 lg:py-20">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between mb-10">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-[#1E3A8A] font-black">Checkout</p>
                        <h1 className="mt-4 text-4xl lg:text-6xl font-black italic uppercase tracking-tighter text-[#1E3A8A]">Finish your order</h1>
                    </div>
                    <button
                        onClick={() => navigate('/store')}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 transition hover:border-[#1E3A8A] hover:text-[#1E3A8A]"
                    >
                        <ChevronLeft size={16} /> Back to store
                    </button>
                </div>

                <div className="grid gap-10 lg:grid-cols-[1.5fr_0.95fr]">
                    <section className="rounded-[48px] border border-slate-200 bg-white p-8 lg:p-12 shadow-xl">
                        <div className="mb-8">
                            <p className="text-sm uppercase tracking-[0.35em] text-[#1E3A8A] font-black">Delivery details</p>
                            <h2 className="mt-4 text-3xl lg:text-4xl font-black uppercase tracking-tighter text-slate-900">Where should we deliver?</h2>
                        </div>

                        {error && (
                            <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-red-700">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-emerald-700">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="space-y-2">
                                    <span className="text-xs uppercase tracking-[0.35em] text-slate-400 font-black">Full name</span>
                                    <input
                                        required
                                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-black outline-none transition focus:border-[#1E3A8A]"
                                        placeholder="Full Name"
                                        value={formData.customer_name}
                                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                    />
                                </label>
                                <label className="space-y-2">
                                    <span className="text-xs uppercase tracking-[0.35em] text-slate-400 font-black">Phone</span>
                                    <input
                                        required
                                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-black outline-none transition focus:border-[#1E3A8A]"
                                        placeholder="Phone Number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </label>
                            </div>

                            <label className="space-y-2">
                                <span className="text-xs uppercase tracking-[0.35em] text-slate-400 font-black">Delivery address</span>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full rounded-[40px] border border-slate-200 bg-slate-50 px-6 py-5 text-sm font-black outline-none transition focus:border-[#1E3A8A]"
                                    placeholder="Full Address"
                                    value={formData.delivery_address}
                                    onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                                />
                            </label>

                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="space-y-2">
                                    <span className="text-xs uppercase tracking-[0.35em] text-slate-400 font-black">Delivery slot</span>
                                    <select
                                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-black outline-none transition focus:border-[#1E3A8A]"
                                        value={formData.delivery_slot}
                                        onChange={(e) => setFormData({ ...formData, delivery_slot: e.target.value })}
                                    >
                                        {DELIVERY_SLOTS.map((slot) => (
                                            <option key={slot} value={slot}>{slot}</option>
                                        ))}
                                    </select>
                                </label>
                                <label className="space-y-2">
                                    <span className="text-xs uppercase tracking-[0.35em] text-slate-400 font-black">Special instructions</span>
                                    <input
                                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-black outline-none transition focus:border-[#1E3A8A]"
                                        placeholder="Leave at gate, etc."
                                        value={formData.special_instructions}
                                        onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                                    />
                                </label>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, payment_method: 'COD' })}
                                    className={`rounded-[30px] border px-6 py-5 text-left transition ${formData.payment_method === 'COD' ? 'border-[#1E3A8A] bg-[#EFF6FF] text-[#1E3A8A]' : 'border-slate-200 bg-white text-slate-500 hover:border-[#1E3A8A]'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Banknote size={24} />
                                        <div>
                                            <p className="font-black uppercase tracking-[0.35em] text-xs">Cash</p>
                                            <p className="text-[11px] text-slate-400">Pay on delivery</p>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, payment_method: 'Card (COD)' })}
                                    className={`rounded-[30px] border px-6 py-5 text-left transition ${formData.payment_method === 'Card (COD)' ? 'border-[#1E3A8A] bg-[#EFF6FF] text-[#1E3A8A]' : 'border-slate-200 bg-white text-slate-500 hover:border-[#1E3A8A]'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <CreditCard size={24} />
                                        <div>
                                            <p className="font-black uppercase tracking-[0.35em] text-xs">Card</p>
                                            <p className="text-[11px] text-slate-400">Debit / credit</p>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !cart.length}
                                className="w-full rounded-[30px] bg-[#1E3A8A] px-8 py-5 text-xl font-black uppercase tracking-tighter text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="mx-auto animate-spin" /> : 'Confirm Order'}
                            </button>
                        </form>
                    </section>

                    <aside className="rounded-[50px] bg-[#1E3A8A] p-8 lg:p-12 text-white shadow-2xl">
                        <div className="mb-8 border-b border-white/10 pb-6">
                            <p className="text-xs uppercase tracking-[0.35em] text-blue-200 font-black">Order summary</p>
                            <h2 className="mt-4 text-3xl font-black uppercase tracking-tighter">{cart.length ? `${cart.length} items ready` : 'Cart is empty'}</h2>
                        </div>

                        <div className="space-y-4 mb-8">
                            {cart.map((item) => (
                                <div key={item.id} className="flex items-center justify-between gap-4 rounded-3xl bg-white/10 px-5 py-4">
                                    <div>
                                        <p className="font-black uppercase tracking-[0.2em] text-sm">{item.name}</p>
                                        <p className="text-xs text-blue-100">Qty {item.quantity}</p>
                                    </div>
                                    <p className="font-black text-lg text-yellow-300">R {(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-[40px] bg-white/10 px-6 py-6">
                            <div className="flex justify-between text-sm uppercase tracking-[0.3em] text-blue-100 mb-3">
                                <span>Subtotal</span>
                                <span>R {getCartTotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm uppercase tracking-[0.3em] text-blue-100 mb-3">
                                <span>Delivery fee</span>
                                <span>R 40.00</span>
                            </div>
                            <div className="mt-4 flex justify-between text-3xl font-black uppercase tracking-tighter text-yellow-300">
                                <span>Total</span>
                                <span>R {(getCartTotal() + 40).toFixed(2)}</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
            <Footer />
        </div>
    );
}