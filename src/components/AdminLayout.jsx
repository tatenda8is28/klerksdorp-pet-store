import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Home, Menu, X } from 'lucide-react';

export default function AdminLayout() {
  const { pathname } = useLocation();
  const nav = [
    { name: 'Overview', path: '/admin', icon: <LayoutDashboard size={20}/> },
    { name: 'Stock', path: '/admin/inventory', icon: <Package size={20}/> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={20}/> },
  ];

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] pb-20 md:pb-0">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="w-72 bg-[#004694] text-white hidden md:flex fixed h-full flex-col z-50">
        <div className="p-8 border-b border-blue-800 flex flex-col items-center text-center">
          <img src="/logo.png" className="w-20 h-20 bg-white p-1 rounded-full mb-4" alt="Logo" />
          <span className="font-black text-[10px] tracking-[0.3em] uppercase text-blue-300">Operational Command</span>
        </div>
        <nav className="flex-grow p-4 mt-4 space-y-1">
          {nav.map(item => (
            <Link key={item.name} to={item.path} className={`flex items-center gap-4 p-4 rounded-xl font-bold text-xs uppercase transition-all ${pathname === item.path ? 'bg-white text-[#004694] shadow-lg' : 'hover:bg-blue-800'}`}>
              {item.icon} {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-800">
          <Link to="/" className="flex items-center gap-4 p-4 text-blue-300 font-bold text-xs uppercase"><Home size={18}/> Storefront</Link>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t flex justify-around p-3 z-[100] shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        {nav.map(item => (
          <Link key={item.name} to={item.path} className={`flex flex-col items-center gap-1 ${pathname === item.path ? 'text-[#004694]' : 'text-gray-400'}`}>
            {item.icon}
            <span className="text-[10px] font-bold uppercase">{item.name}</span>
          </Link>
        ))}
        <Link to="/" className="flex flex-col items-center gap-1 text-gray-400">
          <Home size={20}/>
          <span className="text-[10px] font-bold uppercase">Exit</span>
        </Link>
      </nav>

      {/* MAIN CONTENT Area (Adjusting margin for mobile/desktop) */}
      <main className="flex-grow md:ml-72 p-4 md:p-12 w-full">
        <div className="md:hidden flex justify-between items-center mb-6">
           <img src="/logo.png" className="w-10 h-10 object-contain rounded-full border shadow-sm" alt="Logo" />
           <h2 className="font-black text-[#004694] uppercase italic tracking-tighter">Command Center</h2>
        </div>
        <Outlet />
      </main>
    </div>
  );
}