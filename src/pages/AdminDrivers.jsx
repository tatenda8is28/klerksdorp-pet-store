import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import { Truck, TrendingUp, Package, DollarSign, Calendar, Loader2, ChevronDown } from 'lucide-react';

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [driverStats, setDriverStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedDriver, setExpandedDriver] = useState(null);

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

  const formatDateRange = () => {
    const { monday, sunday } = getCurrentWeekRange();
    return `${monday.toLocaleDateString()} - ${sunday.toLocaleDateString()}`;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Fetch all drivers
      const { data: driversData } = await supabase
        .from('drivers')
        .select('id, name')
        .order('name');

      setDrivers(driversData || []);

      // Fetch weekly stats for each driver
      if (driversData && driversData.length > 0) {
        const { monday, sunday } = getCurrentWeekRange();
        const stats = {};
        const BASE_DELIVERY_RATE = 40; // R40 per delivery

        for (const driver of driversData) {
          // Get delivered orders for the week
          const { data: orders } = await supabase
            .from('orders')
            .select('id, total_amount, completed_at')
            .eq('driver_id', driver.id)
            .eq('status', 'Delivered')
            .gte('completed_at', monday.toISOString())
            .lte('completed_at', sunday.toISOString());

          const numDeliveries = orders?.length || 0;
          const totalPayout = numDeliveries * BASE_DELIVERY_RATE;

          stats[driver.id] = {
            numDeliveries,
            totalPayout,
            orders: orders || [],
          };
        }

        setDriverStats(stats);
      }

      setLoading(false);
    };

    loadData();
  }, []);

  const totalOrdersAllDrivers = Object.values(driverStats).reduce((acc, stat) => acc + stat.numDeliveries, 0);
  const totalPayoutAllDrivers = Object.values(driverStats).reduce((acc, stat) => acc + stat.totalPayout, 0);
  const averagePayoutPerDriver = drivers.length > 0 ? totalPayoutAllDrivers / drivers.length : 0;

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500 px-6 lg:px-12 py-10 lg:py-12">
        
        {/* HEADER SECTION */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Calendar size={20} className="text-slate-400" />
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Week of {formatDateRange()}</p>
          </div>
          <h1 className="text-4xl font-black uppercase italic text-slate-900 mb-8">Driver Analytics</h1>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><Truck size={24} /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Drivers</p>
            </div>
            <p className="text-4xl font-black text-slate-900">{drivers.length}</p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><Package size={24} /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deliveries This Week</p>
            </div>
            <p className="text-4xl font-black text-slate-900">{totalOrdersAllDrivers}</p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600"><TrendingUp size={24} /></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Weekly Payout</p>
            </div>
            <p className="text-4xl font-black text-emerald-600">R {totalPayoutAllDrivers.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* DRIVERS DETAILED LIST */}
        <div>
          <h2 className="text-2xl font-black uppercase italic text-slate-900 mb-6">Driver Performance</h2>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-slate-300" size={40} />
            </div>
          ) : drivers.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
              <Truck size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold text-lg">No drivers found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {drivers.map((driver) => {
                const stat = driverStats[driver.id] || { numDeliveries: 0, totalPayout: 0, orders: [] };
                const isExpanded = expandedDriver === driver.id;

                return (
                  <div key={driver.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                    {/* MAIN DRIVER CARD */}
                    <button
                      onClick={() => setExpandedDriver(isExpanded ? null : driver.id)}
                      className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-6 flex-1">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                          <Truck size={28} />
                        </div>
                        
                        <div className="text-left flex-1">
                          <h3 className="text-lg font-black uppercase text-slate-900 mb-2">{driver.name}</h3>
                          <div className="flex gap-6 text-sm">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deliveries</p>
                              <p className="text-xl font-black text-blue-600">{stat.numDeliveries}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weekly Payout</p>
                              <p className="text-xl font-black text-emerald-600">R {stat.totalPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <ChevronDown
                        size={24}
                        className={`text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* EXPANDED DETAILS */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 p-6 bg-slate-50 space-y-4">
                        {stat.orders.length === 0 ? (
                          <p className="text-slate-400 font-bold text-center py-4">No deliveries this week</p>
                        ) : (
                          <div>
                            <h4 className="font-black uppercase text-slate-900 mb-4 text-sm">Weekly Deliveries ({stat.orders.length})</h4>
                            <div className="space-y-3">
                              {stat.orders.map((order, idx) => (
                                <div key={order.id} className="bg-white p-4 rounded-xl border border-slate-100">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <p className="font-bold text-slate-900 text-sm">Delivery #{idx + 1}</p>
                                      <p className="text-xs text-slate-500 mt-1">
                                        {new Date(order.completed_at).toLocaleDateString()} at {new Date(order.completed_at).toLocaleTimeString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="bg-emerald-50 p-3 rounded-lg">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payout (R40)</p>
                                    <p className="font-black text-emerald-600 text-lg">R 40.00</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AVERAGE STATS */}
        {drivers.length > 0 && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-3xl shadow-lg">
            <h3 className="text-lg font-black uppercase italic mb-6 tracking-tight">Weekly Averages Per Driver</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-2">Avg Deliveries</p>
                <p className="text-4xl font-black">{(totalOrdersAllDrivers / drivers.length).toFixed(1)}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-2">Avg Payout (R40 × Deliveries)</p>
                <p className="text-4xl font-black">R {averagePayoutPerDriver.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
