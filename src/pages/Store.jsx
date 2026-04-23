import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import StoreHeader from '../components/StoreHeader';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'; 

export default function Store() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const categories = ["All", "Dog Food", "Cat Food", "Bird Food", "Medicine", "Accessories"];

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
        setCurrentPage(1); // Reset to page 1 when category changes
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

  // Search Logic
  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // PAGINATION LOGIC
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <StoreHeader />
      
      <main className="max-w-7xl mx-auto px-6 py-10 md:py-16 w-full flex-grow">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          
          <h2 className="text-3xl md:text-4xl font-black text-[#004694] uppercase italic tracking-tighter leading-none">
            Our Food <span className="text-gray-200">/ {filter}</span>
          </h2>
          
          <div className="w-full md:w-auto flex flex-wrap md:flex-nowrap gap-2">
            {categories.map(c => (
              <button 
                key={c} 
                onClick={() => {setFilter(c); setSearchTerm('');}}
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

        <div className="relative mb-12 max-w-2xl">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="text-gray-300" size={18} />
          </div>
          <input 
            type="text"
            placeholder="SEARCH PRODUCTS OR BRANDS..."
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
            className="w-full bg-gray-50 border-2 border-gray-100 py-5 pl-14 pr-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] focus:border-[#004694] focus:bg-white outline-none transition-all"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004694]"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {currentItems.length > 0 ? (
                currentItems.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))
              ) : (
                <div className="col-span-full text-center py-20 text-gray-400 font-bold uppercase italic border-2 border-dashed border-gray-100 rounded-3xl">
                  No products found.
                </div>
              )}
            </div>

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-16 mb-10">
                <button 
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-4 rounded-xl border-2 border-gray-100 disabled:opacity-30 hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-2">
                  <span className="font-black text-[10px] uppercase tracking-widest text-gray-400">Page</span>
                  <span className="font-black text-lg text-[#004694] italic">{currentPage}</span>
                  <span className="font-black text-[10px] uppercase tracking-widest text-gray-400">of {totalPages}</span>
                </div>

                <button 
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-4 rounded-xl border-2 border-gray-100 disabled:opacity-30 hover:bg-gray-50 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}