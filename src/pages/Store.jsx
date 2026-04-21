import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import StoreHeader from '../components/StoreHeader';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

export default function Store() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // The 5 categories from your Admin panel
  const categories = ["All", "Dog Food", "Cat Food", "Bird Food", "Medicine"];

  useEffect(() => {
    let channel;

    async function fetchProducts() {
      setLoading(true);
      try {
        let q = supabase.from('products').select('*').order('created_at', { ascending: false });
        
        if (filter !== 'All') {
          q = q.eq('category', filter);
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
    channel = supabase.channel('products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchProducts)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [filter]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <StoreHeader />
      
      <main className="max-w-7xl mx-auto px-6 py-10 md:py-16 w-full flex-grow">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          
          <h2 className="text-3xl md:text-4xl font-black text-[#004694] uppercase italic tracking-tighter leading-none">
            Our Food <span className="text-gray-200">/ {filter}</span>
          </h2>
          
          {/* FIXED: Changed to flex-wrap so MEDICINE shows up on the next line on small screens */}
          <div className="w-full md:w-auto flex flex-wrap md:flex-nowrap gap-2">
            {categories.map(c => (
              <button 
                key={c} 
                onClick={() => setFilter(c)}
                className={`px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 transition-all whitespace-nowrap ${
                  filter === c 
                  ? 'bg-[#004694] border-[#004694] text-white shadow-lg' 
                  : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                }`}
              >
                {c}
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
              <div className="col-span-full text-center py-20 text-gray-400 font-bold uppercase italic border-2 border-dashed border-gray-100 rounded-3xl">
                No products found in {filter}.
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}