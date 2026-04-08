import React, { useState } from 'react';
import { ShoppingCart, Menu, X, Phone, MapPin } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function StoreHeader() {
  const { cartCount, cartTotal } = useCart();
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const nav = [
    { name: 'Home', path: '/' },
    { name: 'Our Food', path: '/store' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="bg-white border-b sticky top-0 z-[100] w-full">
      <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
        
        {/* MOBILE MENU BUTTON */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-600">
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" className="w-10 h-10 md:w-14 md:h-14 object-contain rounded-full border shadow-sm" alt="Logo" />
          <h1 className="text-sm md:text-xl font-black text-[#004694] uppercase italic tracking-tighter leading-none">
            Klerksdorp <br className="md:hidden"/> Hondekos
          </h1>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:flex gap-8 text-[11px] font-black uppercase tracking-widest text-gray-400">
          {nav.map(item => (
            <Link key={item.name} to={item.path} className={pathname === item.path ? 'text-[#004694]' : 'hover:text-[#004694]'}>
              {item.name}
            </Link>
          ))}
        </nav>

        {/* CART BUTTON (Always Visible) */}
        <Link to="/checkout" className="flex items-center gap-2 md:gap-4 bg-[#004694] text-white px-3 md:px-6 py-2 rounded-xl shadow-lg active:scale-95 transition-all">
          <div className="relative">
            <ShoppingCart size={20} />
            <span className="absolute -top-3 -right-3 bg-red-600 w-5 h-5 rounded-full text-[10px] flex items-center justify-center border-2 border-white font-black">{cartCount}</span>
          </div>
          <span className="font-bold text-xs md:text-sm italic">R {cartTotal.toFixed(0)}</span>
        </Link>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t absolute w-full shadow-2xl animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col p-6 space-y-6">
            {nav.map(item => (
              <Link 
                key={item.name} 
                to={item.path} 
                onClick={() => setIsMenuOpen(false)}
                className={`text-lg font-black uppercase tracking-tighter ${pathname === item.path ? 'text-[#004694]' : 'text-gray-400'}`}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-6 border-t border-gray-100 flex flex-col gap-4">
               <a href="tel:0123456789" className="flex items-center gap-3 font-bold text-[#004694]"><Phone size={18}/> Call Support</a>
               <p className="flex items-center gap-3 text-sm text-gray-400 font-bold"><MapPin size={18}/> 123 Main St, Klerksdorp</p>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}