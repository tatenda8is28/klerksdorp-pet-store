import React from 'react';
import StoreHeader from '../components/StoreHeader';
import Footer from '../components/Footer';
import { Phone, MapPin, Mail, Clock } from 'lucide-react';

export default function Contact() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <StoreHeader />
            <main className="max-w-7xl mx-auto px-6 py-20 w-full flex-grow">
                <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-[#1E3A8A] mb-12">
                    Get in <span className="text-yellow-400">Touch</span>
                </h1>

                <div className="grid md:grid-cols-2 gap-16">
                    <div className="space-y-10">
                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1E3A8A] flex-shrink-0">
                                <Phone size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Call Us</p>
                                <p className="text-xl font-black text-slate-800">0823076935</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1E3A8A] flex-shrink-0">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Visit Warehouse</p>
                                <p className="text-xl font-black text-slate-800">67 Buffeldoorn Wilkopies, Klerksdorp</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1E3A8A] flex-shrink-0">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Operating Hours</p>
                                <p className="text-xl font-black text-slate-800 uppercase italic">Mon - Sat: 08:00 - 17:00</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-[45px] p-10 border border-gray-100">
                        <p className="text-sm font-black uppercase italic text-[#1E3A8A] mb-4 tracking-tighter">Emergency Delivery?</p>
                        <p className="text-gray-500 font-bold text-xs uppercase leading-relaxed">
                            If you've run out of food and need an urgent same-day delivery, please call our dispatch office directly. We prioritize emergency pet needs within Klerksdorp and Stilfontein.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}