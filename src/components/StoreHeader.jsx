import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, NavLink } from 'react-router-dom';

export default function StoreHeader() {
    const { getCartCount, getCartTotal } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const count = getCartCount() || 0;
    const total = getCartTotal() || 0;

    const formattedTotal = new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: 0,
    }).format(total);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMenuOpen]);

    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

    return (
        <>
            {/* --- Main Header Bar --- */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-40 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
                    {/* MOBILE: Hamburger Button */}
                    <div className="md:hidden">
                        <button 
                            onClick={() => setIsMenuOpen(true)} 
                            className="p-2 rounded-md text-[#1E3A8A]"
                            aria-label="Open menu"
                        >
                            <Menu size={28} />
                        </button>
                    </div>

                    {/* DESKTOP: Logo (Left) */}
                    <Link to="/" className="hidden md:flex items-center gap-3">
                        <img src="/logo.png" alt="Klerksdorp Hondekos" className="w-16 h-16 object-contain rounded-full" />
                        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-[#1E3A8A]">
                            Klerksdorp Hondekos
                        </h1>
                    </Link>
                    
                    {/* MOBILE: Logo (Center) */}
                    <Link to="/" className="md:hidden">
                         <img src="/logo.png" alt="Klerksdorp Hondekos" className="w-14 h-14 object-contain rounded-full" />
                    </Link>

                    {/* DESKTOP: Navigation (Center) */}
                    <nav className="hidden md:flex items-center gap-10">
                        <NavLink to="/" className={({isActive}) => `text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-[#1E3A8A]' : 'text-gray-400'} hover:text-[#1E3A8A]`}>Home</NavLink>
                        <NavLink to="/store" className={({isActive}) => `text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-[#1E3A8A]' : 'text-gray-400'} hover:text-[#1E3A8A]`}>Our Food</NavLink>
                        <NavLink to="/about" className={({isActive}) => `text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-[#1E3A8A]' : 'text-gray-400'} hover:text-[#1E3A8A]`}>About Us</NavLink>
                        <NavLink to="/contact" className={({isActive}) => `text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-[#1E3A8A]' : 'text-gray-400'} hover:text-[#1E3A8A]`}>Contact</NavLink>
                    </nav>

                    {/* ALL SIZES: Cart Button (Right) */}
                    <Link to="/checkout" className="bg-[#1E3A8A] text-white px-6 py-3 rounded-2xl flex items-center gap-4 hover:bg-blue-800 transition-all shadow-lg shadow-blue-100">
                        <div className="relative">
                            <ShoppingCart size={22} />
                            <span className="absolute -top-2 -right-2 bg-yellow-400 text-[#1E3A8A] text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#1E3A8A]">
                                {count}
                            </span>
                        </div>
                        <span className="hidden lg:block text-lg font-black italic tracking-tighter">{formattedTotal}</span>
                    </Link>
                </div>
            </header>

            {/* --- MOBILE SIDE-SWIPE MENU (IMPROVED DESIGN) --- */}
            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 md:hidden ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMenuOpen(false)}
            ></div>

            {/* Menu Panel */}
            <div 
                className={`fixed top-0 left-0 h-full w-4/5 max-w-xs bg-white z-50 shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Flex container to structure the menu vertically */}
                <div className="p-6 flex flex-col h-full">
                    {/* 1. Menu Header with Logo */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                        <Link to="/" onClick={handleLinkClick} className="flex items-center gap-3">
                            <img src="/logo.png" alt="Logo" className="w-12 h-12 rounded-full" />
                            <span className="font-black text-lg text-[#1E3A8A] uppercase tracking-tighter">Klerksdorp Hondekos</span>
                        </Link>
                         <button onClick={() => setIsMenuOpen(false)} className="p-2 -mr-2 rounded-md text-gray-500 hover:text-[#1E3A8A] hover:bg-gray-100">
                             <X size={24} />
                         </button>
                    </div>

                    {/* 2. Navigation Links with Separators */}
                    <nav className="flex-grow mt-8">
                        <Link to="/" onClick={handleLinkClick} className="block py-4 text-lg font-black uppercase tracking-widest text-gray-600 hover:text-[#1E3A8A] border-b border-gray-100">Home</Link>
                        <Link to="/store" onClick={handleLinkClick} className="block py-4 text-lg font-black uppercase tracking-widest text-[#1E3A8A] border-b border-gray-100">Our Food</Link>
                        <Link to="/about" onClick={handleLinkClick} className="block py-4 text-lg font-black uppercase tracking-widest text-gray-600 hover:text-[#1E3A8A] border-b border-gray-100">About Us</Link>
                        <Link to="/contact" onClick={handleLinkClick} className="block py-4 text-lg font-black uppercase tracking-widest text-gray-600 hover:text-[#1E3A8A] border-b border-gray-100">Contact</Link>
                    </nav>

                    {/* 3. Menu Footer */}
                    <div className="mt-auto text-center">
                         <p className="text-sm text-gray-400">© 2024 Klerksdorp Hondekos</p>
                         <p className="text-xs text-gray-400 mt-1">Bulk Savings, Delivered.</p>
                    </div>
                </div>
            </div>
        </>
    );
}