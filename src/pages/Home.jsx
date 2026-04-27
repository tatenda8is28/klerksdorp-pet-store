import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import StoreHeader from '../components/StoreHeader';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { ArrowRight, Store } from 'lucide-react';
import ReactGA from "react-ga4";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await supabase.from('products').select('*').limit(4).order('created_at', { ascending: false });
        if (data) setProducts(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetch();
  }, []);

  // Tracking function for the store buttons
  const trackStoreVisit = (label) => {
    ReactGA.event("select_content", {
      content_type: "button",
      item_id: `visit_store_${label}`
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <StoreHeader />
      
      {/* Hero Section */}
      <section className="bg-[#004694] overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center">
          
          {/* Left Side: Text and DESKTOP Button */}
          <div className="lg:w-1/2 p-10 lg:p-20 text-white z-10">
            <h2 className="text-6xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.9] mb-8">
              Pallet Buster <br/> 
              <span className="text-yellow-400">Specials</span>
            </h2>
            <p className="text-blue-100 text-lg font-bold border-l-4 border-yellow-400 pl-6 uppercase max-w-md italic mb-10">
              Bulk savings delivered directly to your door.
            </p>

            {/* DESKTOP ONLY BUTTON */}
            <Link 
              to="/store" 
              onClick={() => trackStoreVisit('desktop_hero')}
              className="hidden lg:inline-flex items-center gap-4 bg-yellow-400 text-[#004694] px-10 py-5 rounded-[20px] font-black uppercase italic tracking-tighter hover:bg-white transition-all shadow-xl"
            >
              Visit Store <ArrowRight size={20} />
            </Link>
          </div>

          {/* Right Side: Store Photo + MOBILE Button Overlay */}
          <div className="lg:w-1/2 h-[450px] lg:h-[600px] w-full relative">
            <img 
              src="/store-main.jpg" 
              className="w-full h-full object-cover" 
              alt="Klerksdorp Hondekos Store" 
            />
            
            <div className="absolute inset-0 bg-gradient-to-r from-[#004694] via-transparent to-transparent lg:block hidden"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#004694] via-transparent to-transparent lg:hidden block"></div>

            {/* MOBILE ONLY BUTTON */}
            <div className="absolute inset-0 flex items-center justify-center lg:hidden">
              <Link 
                to="/store" 
                onClick={() => trackStoreVisit('mobile_hero')}
                className="flex items-center gap-4 bg-yellow-400 text-[#004694] px-8 py-4 rounded-[20px] font-black uppercase italic tracking-tighter shadow-2xl"
              >
                <Store size={20} /> Visit Store
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Specials */}
      <main className="max-w-7xl mx-auto px-6 py-20 w-full flex-grow">
        <h3 className="text-4xl font-black text-gray-900 uppercase italic mb-12 tracking-tighter">
            Featured Specials
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {products.length > 0 ? (
            products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))
          ) : (
            <div className="col-span-full py-10 text-center text-gray-400 font-bold uppercase italic">
                Loading specials...
            </div>
          )}
        </div>

        {/* BOTTOM VISIT STORE BUTTON */}
        <div className="flex justify-center md:justify-end border-t border-gray-100 pt-16">
          <Link 
            to="/store" 
            onClick={() => trackStoreVisit('footer_link')}
            className="group flex items-center gap-4 bg-[#004694] text-white pl-10 pr-6 py-5 rounded-[25px] font-black uppercase italic tracking-tighter hover:bg-blue-800 transition-all shadow-2xl"
          >
            Go to Full Store
            <div className="w-10 h-10 rounded-full bg-yellow-400 text-[#004694] flex items-center justify-center group-hover:translate-x-2 transition-transform">
              <ArrowRight size={20} />
            </div>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}