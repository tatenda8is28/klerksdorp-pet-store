import React, { useState } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
    const { getCartCount, getCartTotal } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    
    const count = getCartCount() || 0;
    const total = getCartTotal() || 0;

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/store', label: 'Our Food' },
        { path: '/about', label: 'About Us' },
        { path: '/contact', label: 'Contact' },
    ];

    return (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-[100] py-4">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link onClick={() => setIsMenuOpen(false)} to="/" className="flex items-center gap-3">
                    <img src="/logo.png" alt="Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain rounded-full" />
                    <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-[#1E3A8A]">
                        Klerksdorp Hondekos
                    </h1>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-10">
                    {navLinks.map(link => (
                        <Link key={link.path} to={link.path} className={`text-[11px] font-black uppercase tracking-widest transition-colors ${location.pathname === link.path ? 'text-[#1E3A8A]' : 'text-gray-400 hover:text-[#1E3A8A]'}`}>
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    {/* Cart - Visible Always */}
                    <Link to="/checkout" className="bg-[#1E3A8A] text-white px-4 md:px-6 py-3 rounded-2xl flex items-center gap-3 hover:bg-blue-800 transition-all shadow-lg">
                        <div className="relative">
                            <ShoppingCart size={20} />
                            <span className="absolute -top-2 -right-2 bg-yellow-400 text-[#1E3A8A] text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#1E3A8A]">
                                {count}
                            </span>
                        </div>
                        <span className="text-sm md:text-lg font-black italic tracking-tighter">R {total}</span>
                    </Link>

                    {/* Mobile Hamburger Button */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden p-3 bg-gray-50 rounded-xl text-[#1E3A8A]"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-2xl animate-in slide-in-from-top duration-300">
                    <nav className="flex flex-col p-6 gap-4">
                        {navLinks.map(link => (
                            <Link 
                                key={link.path} 
                                to={link.path} 
                                onClick={() => setIsMenuOpen(false)}
                                className={`p-4 rounded-xl text-sm font-black uppercase tracking-widest ${location.pathname === link.path ? 'bg-blue-50 text-[#1E3A8A]' : 'text-gray-500'}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}