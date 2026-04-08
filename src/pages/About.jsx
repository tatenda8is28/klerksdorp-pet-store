import React from 'react';
import StoreHeader from '../components/StoreHeader';
import { Award, ShieldCheck, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <StoreHeader />
      <main className="max-w-4xl mx-auto px-6 py-24 text-center">
        <span className="text-[#004694] font-black uppercase tracking-[0.3em] text-xs leading-none">Family Business Est. 2014</span>
        <h2 className="text-6xl font-black text-gray-900 uppercase italic italic tracking-tighter mt-4 mb-10 leading-none">Our Story</h2>
        
        <div className="space-y-8 text-xl text-gray-500 font-medium leading-relaxed italic">
          <p>
            We are a family business established in 2014. We know how important your pets are to you. 
            That is why our staff is trained to help you select the correct food for your dog or cat's needs.
          </p>
          <p>
            As the market leader in pet products in Klerksdorp, we take pride in being the bridge 
            between premium pet nutrition and your doorstep.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-24">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-[#004694] mb-6 shadow-inner"><Award size={32}/></div>
            <h4 className="font-black uppercase text-sm italic mb-2 tracking-widest tracking-tighter">Market Leader</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Top Quality Brands Only</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-[#004694] mb-6 shadow-inner"><Heart size={32}/></div>
            <h4 className="font-black uppercase text-sm italic mb-2 tracking-widest tracking-tighter">We Love Pets</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Bring them to meet us!</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-[#004694] mb-6 shadow-inner"><ShieldCheck size={32}/></div>
            <h4 className="font-black uppercase text-sm italic mb-2 tracking-widest tracking-tighter">Expert Advice</h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Nutrition Trained Staff</p>
          </div>
        </div>
      </main>
    </div>
  );
}