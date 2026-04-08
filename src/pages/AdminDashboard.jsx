import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  TrendingUp, 
  ShoppingBag, 
  Truck, 
  AlertCircle, 
  Clock, 
  ChevronRight,
  ArrowUpRight,
  Package
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({
    revenue: 0,
    pending: 0,
    outForDelivery: 0,
    totalOrders: 0,
    lowStockCount: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // 1. Fetch Orders
      const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (orderError) throw orderError;

      // 2. Fetch Products (to check stock levels)
      const { data: products } = await supabase.from('products').select('id');

      // 3. Calculate Stats
      if (orders) {
        const deliveredOrders = orders.filter(o => o.status === 'Delivered');
        const revenue = deliveredOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
        
        setStats({
          revenue: revenue,
          pending: orders.filter(o => o.status === 'Pending').length,
          outForDelivery: orders.filter(o => o.status === 'Out for Delivery').length,
          totalOrders: orders.length,
          lowStockCount: products?.length || 0 // You can replace with real stock logic later
        });
        
        // Only show last 5 orders in "Priority" view
        setRecentOrders(orders.slice(0, 5));
      }
    } catch (error) {
      console.error('Dashboard Error:', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* SECTION 1: TOP LINE KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Revenue" 
          value={`R ${stats.revenue.toLocaleString()}`} 
          sub="Delivered Orders" 
          icon={<TrendingUp className="text-green-600"/>} 
          trend="+12%"
          color="bg-green-50"
        />
        <KPICard 
          title="Active Orders" 
          value={stats.pending} 
          sub="Awaiting Packing" 
          icon={<Clock className="text-orange-600"/>} 
          trend="Action Required"
          color="bg-orange-50"
        />
        <KPICard 
          title="On The Road" 
          value={stats.outForDelivery} 
          sub="In Klerksdorp" 
          icon={<Truck className="text-blue-600"/>} 
          trend="Live Tracking"
          color="bg-blue-50"
        />
        <KPICard 
          title="Total Inventory" 
          value={stats.lowStockCount} 
          sub="Products in Catalog" 
          icon={<Package className="text-purple-600"/>} 
          trend="Healthy"
          color="bg-purple-50"
        />
      </div>

      {/* SECTION 2: COMMAND CENTER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEFT: PRIORITY DELIVERIES TABLE */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Priority Deliveries</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Last 5 Activities</p>
            </div>
            <Link to="/admin/orders" className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#004694] hover:text-white transition-all shadow-sm">
              View All Orders
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-8 py-4">Customer</th>
                  <th className="px-8 py-4">Location</th>
                  <th className="px-8 py-4">Total</th>
                  <th className="px-8 py-4 text-right font-black">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.length > 0 ? recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="font-black text-slate-800 uppercase text-sm italic tracking-tighter">{order.customer_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{order.phone}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-slate-500 line-clamp-1">{order.delivery_address}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="font-black text-slate-800 italic">R {order.total_amount}</p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        order.status === 'Pending' ? 'bg-orange-100 text-orange-600 border-orange-200' :
                        order.status === 'Out for Delivery' ? 'bg-blue-100 text-[#004694] border-blue-200' :
                        'bg-green-100 text-green-600 border-green-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center text-slate-300 font-black uppercase italic tracking-widest">
                      Awaiting first order of the day...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: SYSTEM ALERTS & ACTION CENTER */}
        <div className="space-y-6">
          <div className="bg-[#004694] p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
               <AlertCircle size={120} />
            </div>
            <h4 className="text-lg font-black uppercase italic tracking-tighter mb-4">Stock Alerts</h4>
            <div className="space-y-4 relative z-10">
               <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Low Stock</p>
                  <p className="font-bold text-sm mt-1 uppercase italic tracking-tighter text-yellow-400">Rimax Adult 20kg</p>
                  <div className="w-full bg-white/20 h-1.5 rounded-full mt-3 overflow-hidden">
                     <div className="bg-yellow-400 w-1/4 h-full"></div>
                  </div>
               </div>
               <Link to="/admin/inventory" className="flex items-center justify-center gap-2 w-full py-4 bg-white text-[#004694] rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-yellow-400 hover:text-[#004694] transition-all">
                  Manage Inventory <ArrowUpRight size={14}/>
               </Link>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
            <h4 className="text-lg font-black text-slate-800 uppercase italic tracking-tighter mb-6">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-4">
               <Link to="/admin/inventory" className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 hover:bg-[#004694] hover:text-white transition-all group">
                  <Package className="mb-2 text-slate-400 group-hover:text-white"/>
                  <span className="text-[9px] font-black uppercase tracking-widest">Add Product</span>
               </Link>
               <button onClick={() => window.print()} className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 hover:bg-[#004694] hover:text-white transition-all group">
                  <ShoppingBag className="mb-2 text-slate-400 group-hover:text-white"/>
                  <span className="text-[9px] font-black uppercase tracking-widest">Export PDF</span>
               </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function KPICard({ title, value, sub, icon, trend, color }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-2xl transition-all duration-500">
      <div className="flex justify-between items-start mb-6">
        <div className={`${color} p-4 rounded-2xl shadow-inner group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <span className="text-[9px] font-black px-2 py-1 bg-slate-100 rounded text-slate-400 uppercase tracking-tighter group-hover:bg-[#004694] group-hover:text-white transition-colors">
          {trend}
        </span>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
      <h2 className="text-3xl font-black text-slate-800 mt-2 tracking-tighter italic uppercase">{value}</h2>
      <p className="text-[10px] font-bold text-slate-400 mt-2 border-t pt-4 border-slate-50 uppercase tracking-widest">{sub}</p>
    </div>
  );
}