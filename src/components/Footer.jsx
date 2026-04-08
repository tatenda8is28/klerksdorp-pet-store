import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#004694] text-white pt-16 pb-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-blue-800 pb-12">
        <div className="space-y-6">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 bg-white p-1 rounded-full object-contain" />
          <h3 className="text-xl font-black uppercase italic tracking-tighter leading-none">Klerksdorp Hondekos</h3>
          <p className="text-blue-200 text-sm italic leading-relaxed">Family business est. 2014. Market leader in pet nutrition.</p>
        </div>
        <div>
          <h4 className="text-yellow-400 font-black uppercase text-xs mb-6">Store Links</h4>
          <ul className="space-y-4 text-sm font-bold uppercase tracking-widest">
            <li><Link to="/" className="hover:text-yellow-400">Home</Link></li>
            <li><Link to="/store" className="hover:text-yellow-400">Our Food</Link></li>
            <li><Link to="/about" className="hover:text-yellow-400">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-yellow-400">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-yellow-400 font-black uppercase text-xs mb-6">Find Us</h4>
          <div className="space-y-4 text-sm text-blue-100">
            <p className="flex gap-3 items-start"><MapPin size={18} className="text-yellow-400"/> 123 Main St, Klerksdorp</p>
            <p className="flex gap-3 items-center"><Phone size={18} className="text-yellow-400"/> 012 345 6789</p>
          </div>
        </div>
        <div>
          <h4 className="text-yellow-400 font-black uppercase text-xs mb-6">Trading Hours</h4>
          <div className="space-y-2 text-sm text-blue-100">
            <p className="flex gap-3 items-center"><Clock size={18} className="text-yellow-400"/> Mon-Sat: 08:00 - 17:00</p>
            <p className="text-yellow-400/50 text-[10px] uppercase font-bold mt-2 italic">Closed Sundays</p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-8 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
        <p>© 2024 Klerksdorp Hondekos</p>
        <Link to="/admin" className="hover:text-white border border-blue-800 px-3 py-1 rounded">Staff Access</Link>
      </div>
    </footer>
  );
}