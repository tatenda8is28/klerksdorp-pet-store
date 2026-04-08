import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Truck, CheckCircle, XCircle, Search } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }

  async function updateStatus(id, status) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) fetchOrders();
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-gray-800 uppercase italic">Delivery Tracker</h1>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18}/>
          <input type="text" placeholder="Search orders..." className="pl-10 pr-4 py-2 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-[#004694]" />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              <th className="p-6">Customer / Contact</th>
              <th className="p-6">Delivery Address</th>
              <th className="p-6">Total Amount</th>
              <th className="p-6">Status</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-6">
                  <p className="font-black text-gray-800 uppercase">{order.customer_name}</p>
                  <p className="text-xs text-[#004694] font-bold">{order.phone}</p>
                </td>
                <td className="p-6 text-sm font-medium text-gray-500">
                  {order.delivery_address}
                </td>
                <td className="p-6">
                  <span className="text-lg font-black text-gray-800 font-mono italic">R {order.total_amount}</span>
                </td>
                <td className="p-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                    order.status === 'Pending' ? 'bg-orange-100 text-orange-600' :
                    order.status === 'Out for Delivery' ? 'bg-blue-100 text-[#004694]' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-6 text-right space-x-2">
                   <button onClick={() => updateStatus(order.id, 'Out for Delivery')} className="p-2 bg-blue-100 text-[#004694] rounded-lg hover:bg-[#004694] hover:text-white transition-all shadow-sm" title="Mark Out for Delivery"><Truck size={18}/></button>
                   <button onClick={() => updateStatus(order.id, 'Delivered')} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm" title="Mark Delivered"><CheckCircle size={18}/></button>
                   <button onClick={() => updateStatus(order.id, 'Cancelled')} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm" title="Cancel Order"><XCircle size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && !loading && (
          <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest">
            No orders found. Sit tight!
          </div>
        )}
      </div>
    </div>
  );
}