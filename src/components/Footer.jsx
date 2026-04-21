import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#1E3A8A] text-white py-16">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full" />
                            <h2 className="text-lg font-black italic uppercase tracking-tighter">Klerksdorp Hondekos</h2>
                        </div>
                        <p className="text-xs font-medium text-blue-200 leading-relaxed">Family business est. 2014. Market leader in pet nutrition.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 lg:contents">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-yellow-400 mb-6">Links</h4>
                            <ul className="space-y-3 text-xs font-bold uppercase">
                                <li><Link to="/" className="hover:text-yellow-400">Home</Link></li>
                                <li><Link to="/store" className="hover:text-yellow-400">Our Food</Link></li>
                                <li><Link to="/about" className="hover:text-yellow-400">About Us</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-yellow-400 mb-6">Support</h4>
                            <ul className="space-y-3 text-xs font-bold uppercase">
                                <li><Link to="/contact" className="hover:text-yellow-400">Contact</Link></li>
                                <li><Link to="/contact" className="hover:text-yellow-400">Delivery</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-yellow-400 mb-6">Find Us</h4>
                        <ul className="space-y-4 text-xs font-bold">
                            <li className="flex gap-2 items-start"><MapPin size={16} className="text-yellow-400" /> 123 Main St, Klerksdorp</li>
                            <li className="flex gap-2 items-center"><Phone size={16} className="text-yellow-400" /> 012 345 6789</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-yellow-400 mb-6">Trading</h4>
                        <ul className="space-y-4 text-xs font-bold">
                            <li className="flex gap-2 items-center"><Clock size={16} className="text-yellow-400" /> Mon-Sat: 08:00 - 17:00</li>
                            <li className="text-[9px] uppercase font-black text-yellow-400/50 italic">Closed Sundays</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-300">© 2024 Klerksdorp Hondekos</p>
                    <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
                        <Link to="/admin" className="w-full md:w-auto text-center px-8 py-3 border border-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-[#1E3A8A] transition-all">
                            Staff Access
                        </Link>
                        <Link to="/driver" className="text-[9px] font-black uppercase tracking-widest text-yellow-400 hover:text-white transition-colors underline underline-offset-8">
                            Driver Login
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}