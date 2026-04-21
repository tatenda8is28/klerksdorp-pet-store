import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ClipboardList, Store, Menu, X, Truck } from 'lucide-react';

export default function AdminLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    
    const menuItems = [
        { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'OVERVIEW' },
        { path: '/admin/orders', icon: <ClipboardList size={20} />, label: 'ORDERS' },
        { path: '/admin/inventory', icon: <Package size={20} />, label: 'STOCK' },
        { path: '/admin/drivers', icon: <Truck size={20} />, label: 'DRIVERS' },
    ];

    const SidebarContent = () => (
        <div className="p-8 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-12">
                <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-full border-2 border-white/10" />
                <div>
                    <h1 className="font-black italic uppercase text-sm leading-none">Operational</h1>
                    <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Command</p>
                </div>
            </div>

            <nav className="space-y-2 flex-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${
                            location.pathname === item.path 
                            ? 'bg-white text-[#1E3A8A] shadow-lg' 
                            : 'text-blue-100 hover:bg-blue-800'
                        }`}
                    >
                        {item.icon}
                        <span className="uppercase text-[10px] tracking-widest">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <Link to="/" className="mt-auto flex items-center gap-4 px-6 py-4 text-blue-300 hover:text-white uppercase text-[10px] font-black tracking-widest">
                <Store size={20} /> Storefront
            </Link>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 bg-[#1E3A8A] text-white flex-col sticky top-0 h-screen shadow-xl">
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#1E3A8A] text-white p-4 flex items-center justify-between z-[60] shadow-lg">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" className="w-8 h-8 rounded-full" alt="logo" />
                    <span className="font-black text-xs uppercase italic">Command</span>
                </div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-blue-800 rounded-lg">
                    {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-[55]">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#1E3A8A] text-white animate-in slide-in-from-left duration-300">
                        <SidebarContent />
                    </div>
                </div>
            )}

            <main className="flex-1 pt-20 lg:pt-0">
                {children}
            </main>
        </div>
    );
}