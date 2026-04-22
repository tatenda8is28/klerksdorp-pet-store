import React from 'react';
import StoreHeader from '../components/StoreHeader';
import Footer from '../components/Footer';

export default function About() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <StoreHeader />
            <main className="max-w-7xl mx-auto px-6 py-20 w-full flex-grow">
                <div className="max-w-3xl">
                    <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-[#1E3A8A] mb-8 leading-none">
                        Family Owned <br/> <span className="text-yellow-400">Since 2014</span>
                    </h1>
                    <div className="space-y-6 text-gray-500 font-bold uppercase text-sm tracking-wide leading-relaxed">
                        <p className="border-l-4 border-[#1E3A8A] pl-6 italic text-lg text-slate-800">
                            Klerksdorp Hondekos is the market leader in pet nutrition within the North West province.
                        </p>
                        <p>
                            We specialize in bulk pet food distribution, ensuring that your furry friends get the best quality nutrition at the best possible price. Our "Pallet Buster" specials are designed to bring maximum value directly to your doorstep.
                        </p>
                        <p>
                            With nearly a decade of experience, our mission remains the same: Seamless online shopping, reliable delivery, and a passion for pet health.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}