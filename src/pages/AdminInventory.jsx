import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';

const brands = ["Montego", "Jock", "Nutribyte", "Royal Canin", "Paws", "Trusty", "Ideal", "Rimax", "Bravecto", "N3Q"];

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', brand: 'Montego', price: '', image: null });

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    setLoading(true);
    let imageUrl = '';

    try {
      if (form.image) {
        const fileName = `${Date.now()}-${form.image.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, form.image);
        
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from('products').insert([
        { name: form.name, brand: form.brand, price: parseFloat(form.price), image_url: imageUrl }
      ]);

      if (error) throw error;
      setForm({ name: '', brand: 'Montego', price: '', image: null });
      fetchProducts();
      alert("Product added to live store!");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id) {
    if (window.confirm("Delete this product?")) {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-gray-800 uppercase italic">Stock Management</h1>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm text-sm font-bold text-[#004694]">
          {products.length} Items in Catalog
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* ADD PRODUCT FORM */}
        <form onSubmit={handleAddProduct} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 h-fit sticky top-10">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-[#004694]">
            <Plus className="bg-[#004694] text-white rounded-lg p-1" /> NEW PRODUCT
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
              <input type="text" placeholder="e.g. Rimax Adult 20kg" className="w-full mt-1 bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-[#004694]" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Brand</label>
                <select className="w-full mt-1 bg-gray-50 border-none p-4 rounded-2xl" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (R)</label>
                <input type="number" placeholder="480" className="w-full mt-1 bg-gray-50 border-none p-4 rounded-2xl" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Photo</label>
              <div className="mt-1 flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="text-gray-400 mb-2" />
                    <p className="text-xs text-gray-500 font-bold uppercase">{form.image ? form.image.name : "Click to upload"}</p>
                  </div>
                  <input type="file" className="hidden" onChange={e => setForm({...form, image: e.target.files[0]})} />
                </label>
              </div>
            </div>

            <button disabled={loading} className="w-full bg-[#004694] hover:bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg">
              {loading ? <Loader2 className="animate-spin mx-auto"/> : "Add to Store"}
            </button>
          </div>
        </form>

        {/* INVENTORY LIST */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white p-4 rounded-3xl flex items-center gap-4 shadow-sm border border-gray-100 hover:shadow-md">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                <img src={p.image_url} className="w-full h-full object-contain p-2" alt="" />
              </div>
              <div className="flex-grow">
                <h4 className="font-black text-gray-800 uppercase text-sm leading-tight">{p.name}</h4>
                <p className="text-[#004694] font-bold text-xs">{p.brand}</p>
                <p className="font-black text-lg mt-1">R {p.price}</p>
              </div>
              <button onClick={() => deleteProduct(p.id)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}