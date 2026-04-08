import React from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { cart, addToCart, removeFromCart } = useCart();
  const cartItem = cart.find(item => item.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm flex flex-col group">
      <div className="aspect-square bg-gray-50 rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center p-4">
        <img src={product.image_url} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
      </div>
      <div className="flex-grow">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{product.brand}</p>
        <h3 className="text-md font-black text-gray-800 uppercase leading-tight mt-1 mb-4 h-10 overflow-hidden">{product.name}</h3>
        <p className="text-2xl font-black text-[#004694] italic mb-4 leading-none text-right">R {product.price}</p>
      </div>

      {quantity === 0 ? (
        <button onClick={() => addToCart(product)} className="w-full bg-[#004694] text-white py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-colors">
          <ShoppingCart size={16} /> Add to Cart
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button onClick={() => removeFromCart(product.id)} className="bg-gray-100 p-4 rounded-2xl hover:bg-red-500 hover:text-white transition-colors"><Minus size={16}/></button>
          <div className="flex-grow text-center font-black text-[#004694]">{quantity} in Bag</div>
          <button onClick={() => addToCart(product)} className="bg-[#004694] text-white p-4 rounded-2xl hover:bg-black transition-colors"><Plus size={16}/></button>
        </div>
      )}
    </div>
  );
}