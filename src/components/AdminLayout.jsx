import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ClipboardList, Store, Menu, X, Truck, LogOut } from 'lucide-react';

export default function AdminLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    
    const menuItems = [
        { path: '/admin', icon: <LayoutDashboard size={24} />, label: 'OVERVIEW' },
        { path: '/admin/inventory', icon: <Package size={24} />, label: 'STOCK' },
        { path: '/admin/orders', icon: <ClipboardList size={24} />, label: 'ORDERS' },
    ];

    // Sidebar for Desktop and Side-Drawer for Mobile Extra Links
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
                {/* Additional link for Drivers in the sidebar */}
                <Link
                    to="/admin/drivers"
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${
                        location.pathname === '/admin/drivers' 
                        ? 'bg-white text-[#1E3A8A] shadow-lg' 
                        : 'text-blue-100 hover:bg-blue-800'
                    }`}
                >
                    <Truck size={20} />
                    <span className="uppercase text-[10px] tracking-widest">DRIVERS</span>
                </Link>
            </nav>

            <Link to="/" className="mt-auto flex items-center gap-4 px-6 py-4 text-blue-300 hover:text-white uppercase text-[10px] font-black tracking-widest">
                <Store size={20} /> Storefront
            </Link>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* DESKTOP SIDEBAR */}
            <aside className="hidden lg:flex w-72 bg-[#1E3A8A] text-white flex-col sticky top-0 h-screen shadow-xl">
                <SidebarContent />
            </aside>

            {/* MOBILE TOP HEADER */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-[60]">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" className="w-10 h-10 rounded-full" alt="logo" />
                    <span className="font-black text-[#1E3A8A] uppercase italic tracking-tighter">COMMAND</span>
                </div>
                {/* Extra Menu for things like Drivers */}
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-400">
                    <Menu size={24} />
                </button>
            </div>

            {/* MOBILE SIDE DRAWER (For secondary links) */}
            {isSidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-[100]">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-64 bg-[#1E3A8A] text-white animate-in slide-in-from-right duration-300">
                        <div className="p-8 flex justify-end">
                            <button onClick={() => setIsSidebarOpen(false)}><X size={28}/></button>
                        </div>
                        <nav className="px-4 space-y-2">
                             <Link to="/admin/drivers" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 px-6 py-4 text-white font-black uppercase text-xs tracking-widest">
                                <Truck size={20} /> Drivers
                             </Link>
                             <Link to="/" className="flex items-center gap-4 px-6 py-4 text-blue-300 font-black uppercase text-xs tracking-widest border-t border-white/10 mt-4 pt-8">
                                <LogOut size={20} /> Exit to Store
                             </Link>
                        </nav>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 pt-24 pb-24 lg:pt-0 lg:pb-0">
                {children}
            </main>

            {/* MOBILE BOTTOM NAVIGATION (As requested in 2nd screenshot) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-[60] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex flex-col items-center gap-1 transition-all ${
                            location.pathname === item.path 
                            ? 'text-[#1E3A8A]' 
                            : 'text-gray-300'
                        }`}
                    >
                        {item.icon}
                        <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                    </Link>
                ))}
                
                {/* EXIT BUTTON */}
                <Link to="/" className="flex flex-col items-center gap-1 text-gray-300">
                    <LogOut size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest">EXIT</span>
                </Link>
            </nav>
        </div>
    );
}