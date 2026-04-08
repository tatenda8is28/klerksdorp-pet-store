import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import StoreHeader from '../components/StoreHeader';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('products').select('*').limit(4).order('created_at', { ascending: false });
      setProducts(data || []);
    }
    fetch();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <StoreHeader />
      <section className="bg-[#004694] overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 p-12 lg:p-20 text-white">
            <h2 className="text-6xl font-black uppercase italic tracking-tighter leading-none mb-6">Pallet Buster <br/> <span className="text-yellow-400">Specials</span></h2>
            <p className="text-blue-100 text-lg font-bold border-l-4 border-yellow-400 pl-6 uppercase max-w-md italic">Bulk savings delivered directly to your door.</p>
          </div>
          <div className="lg:w-1/2 h-[450px] w-full relative">
            <img src="/store-main.jpg" className="w-full h-full object-cover" alt="Storefront" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#004694] via-transparent to-transparent"></div>
          </div>
        </div>
      </section>
      <main className="max-w-7xl mx-auto px-6 py-20 w-full">
        <h3 className="text-3xl font-black text-gray-900 uppercase italic mb-10 tracking-tighter">Featured Specials</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </main>
      <Footer />
    </div>
  );
}