import React from 'react';
import StoreHeader from '../components/StoreHeader';
import { MapPin, Phone, Clock } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-white">
      <StoreHeader />
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
          <div className="space-y-10">
            <h2 className="text-6xl font-black text-[#004694] uppercase italic tracking-tighter leading-none">Visit Our <br/> Store</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl">
                <MapPin className="text-[#004694]" size={30}/>
                <span className="font-bold uppercase text-sm tracking-tight">123 Street Name, Klerksdorp</span>
              </div>
              <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl">
                <Phone className="text-[#004694]" size={30}/>
                <span className="font-bold uppercase text-sm tracking-tight">012 345 6789</span>
              </div>
              <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl">
                <Clock className="text-[#004694]" size={30}/>
                <span className="font-bold uppercase text-sm tracking-tight italic">Mon - Sat: 08:00 - 17:00</span>
              </div>
            </div>
          </div>
          <div className="bg-[#004694] rounded-[3rem] p-1 shadow-2xl overflow-hidden min-h-[400px] flex items-center justify-center text-blue-200 uppercase font-black tracking-widest border-8 border-white">
            [ Map Location View ]
          </div>
        </div>
      </main>
    </div>
  );
}