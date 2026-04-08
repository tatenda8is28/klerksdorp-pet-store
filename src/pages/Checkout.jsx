import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import StoreHeader from '../components/StoreHeader';
import Footer from '../components/Footer';
import { Truck, ShieldCheck, MapPin, Loader2, CheckCircle2 } from 'lucide-react';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (cart.length === 0) return alert("Your cart is empty!");

    setLoading(true);
    try {
      // 1. Insert into Supabase 'orders' table
      const { error } = await supabase.from('orders').insert([{
        customer_name: form.name,
        phone: form.phone,
        delivery_address: form.address,
        total_amount: cartTotal,
        status: 'Pending',
        // We store the items as a string so you can see what they bought in Admin
        items_summary: cart.map(item => `${item.quantity}x ${item.name}`).join(', ')
      }]);

      if (error) throw error;

      // 2. Success
      setSubmitted(true);
      clearCart();
    } catch (err) {
      alert("Error placing order: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 size={80} className="text-green-500 mb-6 animate-bounce" />
        <h2 className="text-4xl font-black text-[#004694] uppercase italic tracking-tighter mb-4">Order Received!</h2>
        <p className="text-gray-500 max-w-sm font-medium mb-8">
          Thank you {form.name}. Klerksdorp Hondekos will contact you shortly on {form.phone} to confirm your delivery.
        </p>
        <button onClick={() => window.location.href = '/'} className="bg-[#004694] text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <StoreHeader />
      
      <main className="max-w-7xl mx-auto px-6 py-16 w-full flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* LEFT: DELIVERY FORM */}
          <div>
            <h2 className="text-4xl font-black text-[#004694] uppercase italic tracking-tighter mb-10">Delivery Details</h2>
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Full Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your name" 
                  className="w-full p-5 rounded-2xl bg-white border-none shadow-sm focus:ring-2 focus:ring-[#004694] outline-none"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">WhatsApp / Phone Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. 012 345 6789" 
                  className="w-full p-5 rounded-2xl bg-white border-none shadow-sm focus:ring-2 focus:ring-[#004694] outline-none"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Delivery Address (Klerksdorp)</label>
                <textarea 
                  placeholder="Street, Suburb, and any special instructions" 
                  className="w-full p-5 rounded-2xl bg-white border-none shadow-sm focus:ring-2 focus:ring-[#004694] outline-none h-32"
                  value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})}
                  required 
                />
              </div>

              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center gap-4">
                <Truck className="text-[#004694]" size={24} />
                <p className="text-xs font-bold text-[#004694] uppercase tracking-wide">
                  Payment Method: <span className="underline italic">Cash or Card on Delivery</span>
                </p>
              </div>

              <button 
                disabled={loading || cart.length === 0}
                className="w-full bg-[#004694] hover:bg-black text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-lg shadow-2xl transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Confirm Order"}
              </button>
            </form>
          </div>

          {/* RIGHT: DYNAMIC ORDER SUMMARY */}
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 h-fit sticky top-32">
            <h3 className="text-xl font-black text-gray-800 uppercase italic mb-8 tracking-tighter">Order Summary</h3>
            
            <div className="divide-y divide-gray-50 mb-8">
              {cart.length > 0 ? cart.map(item => (
                <div key={item.id} className="py-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center p-2">
                       <img src={item.image_url} alt="" className="object-contain" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm uppercase">{item.name}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase">{item.quantity} x R {item.price}</p>
                    </div>
                  </div>
                  <p className="font-black text-gray-800 italic">R {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              )) : (
                <p className="py-10 text-center text-gray-400 font-bold uppercase text-xs italic">Your bag is empty</p>
              )}
            </div>

            <div className="border-t-4 border-gray-100 pt-8 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Subtotal</span>
                <span className="font-bold text-gray-800">R {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Delivery</span>
                <span className="text-xs font-black text-green-600 uppercase italic">FREE (Klerksdorp)</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-sm font-black text-gray-800 uppercase tracking-widest">Total to Pay</span>
                <span className="text-4xl font-black text-[#004694] italic tracking-tighter leading-none">R {cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-10 space-y-3">
              <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase"><ShieldCheck size={16} className="text-green-500"/> 100% Quality Guaranteed</div>
              <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase"><MapPin size={16} className="text-red-500"/> Serving Klerksdorp Since 2014</div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}