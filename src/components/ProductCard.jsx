import React from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full">
      <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-50 mb-6">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        {/* NEW WEIGHT BADGE */}
        {product.weight && (
          <div className="absolute top-4 left-4 bg-[#004694] text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase italic tracking-widest shadow-lg">
            {product.weight}
          </div>
        )}
      </div>

      <div className="flex-grow space-y-2">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
          {product.brand}
        </p>
        <h3 className="font-black text-slate-800 uppercase italic tracking-tighter text-lg leading-tight break-words">
          {product.name}
        </h3>
      </div>

      <div className="mt-6 space-y-4">
        <p className="text-3xl font-black text-[#004694] italic tracking-tighter">
          R {product.price}
        </p>
        <button 
          onClick={() => addToCart(product)}
          className="w-full bg-[#004694] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
        >
          <ShoppingCart size={16} /> Add to Cart
        </button>
      </div>
    </div>
  );
}