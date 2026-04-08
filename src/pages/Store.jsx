import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import StoreHeader from '../components/StoreHeader';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

export default function Store() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        let q = supabase.from('products').select('*').order('created_at', { ascending: false });
        
        if (filter !== 'All') {
          q = q.eq('brand', filter);
        }

        const { data, error } = await q;
        
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [filter]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <StoreHeader />
      
      <main className="max-w-7xl mx-auto px-6 py-16 w-full flex-grow">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
          <h2 className="text-4xl font-black text-[#004694] uppercase italic tracking-tighter leading-none">
            Our Food <span className="text-gray-300">/ {filter}</span>
          </h2>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {["All", "Montego", "Jock", "Nutribyte", "Rimax", "Ideal"].map(b => (
              <button 
                key={b} 
                onClick={() => setFilter(b)}
                className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${
                  filter === b 
                  ? 'bg-[#004694] border-[#004694] text-white shadow-lg' 
                  : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004694]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.length > 0 ? (
              products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-gray-400 font-bold uppercase italic">
                No products found in this category.
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}