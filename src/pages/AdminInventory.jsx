import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import { Plus, Minus, Package, AlertTriangle, TrendingUp, Loader2, Trash2 } from 'lucide-react';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [form, setForm] = useState({ name: '', brand: 'Montego', image_url: '', price: '', category: 'Dog Food', stock: 0 });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const categories = ["All", "Dog Food", "Cat Food", "Bird Food", "Medicine", "Accessories"];

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      const { data } = await supabase.from('products').select('*').order('name');
      if (!active) return;
      setProducts(data || []);
      setLoading(false);
    }

    loadProducts();
    const channel = supabase.channel('products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, loadProducts)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  async function adjustStock(id, currentStock, amount) {
    const newStock = Math.max(0, currentStock + amount);
    const { error } = await supabase.from('products').update({ stock_level: newStock }).eq('id', id);
    if (!error) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock_level: newStock } : p));
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    setUploading(true);
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    
    // FIXED: Uploads to the products/ subfolder as required by your Supabase setup
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(`products/${fileName}`, file);

    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(`products/${fileName}`);
      
      setForm({ ...form, image_url: publicUrl });
    } else if (error) {
      alert("Upload failed: " + error.message);
    }

    setUploading(false);
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    const { data, error } = await supabase.from('products').insert([{
      name: form.name,
      brand: form.brand,
      image_url: form.image_url,
      price: parseFloat(form.price),
      category: form.category,
      stock_level: parseInt(form.stock, 10)
    }]).select();

    if (!error && data) {
      setProducts(prev => [...prev, ...data]);
      setForm({ name: '', brand: 'Montego', image_url: '', price: '', category: 'Dog Food', stock: 0 });
      setImagePreview(null);
    }
  }

  async function handleDeleteProduct(id) {
    if(!confirm("Delete this product?")) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(product => product.id !== id));
  }

  const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock_level), 0);
  const lowStockCount = products.filter(p => p.stock_level <= 5).length;
  const filteredProducts = activeTab === 'All' ? products : products.filter(p => p.category === activeTab);

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500 px-6 lg:px-12 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-4 rounded-2xl text-green-600"><TrendingUp /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Floor Value</p>
            <p className="text-2xl font-black text-slate-800 italic">R {totalValue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="bg-orange-50 p-4 rounded-2xl text-orange-600"><Package /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bags</p>
            <p className="text-2xl font-black text-slate-800 italic">{products.reduce((acc, p) => acc + p.stock_level, 0)}</p>
          </div>
        </div>
        <div className={`p-6 rounded-3xl border shadow-sm flex items-center gap-4 transition-all ${lowStockCount > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100'}`}>
          <div className={`p-4 rounded-2xl ${lowStockCount > 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-50 text-slate-400'}`}><AlertTriangle /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Low Stock Alerts</p>
            <p className={`text-2xl font-black italic ${lowStockCount > 0 ? 'text-red-600' : 'text-slate-800'}`}>{lowStockCount} Items</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        
        <div className="xl:col-span-1">
          <form onSubmit={handleAddProduct} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 sticky top-10">
            <h3 className="text-lg font-black uppercase italic text-[#004694] mb-6">Receive New Batch</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Item Name" className="w-full bg-slate-50 p-4 rounded-2xl border-none font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              <input type="text" placeholder="Brand" className="w-full bg-slate-50 p-4 rounded-2xl border-none font-bold" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} required />
              
              <div className="space-y-3">
                <label className="block">
                  {/* accept="image/*" triggers the Camera/Gallery menu on mobile */}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="w-full bg-slate-50 p-4 rounded-2xl border-none font-bold cursor-pointer file:cursor-pointer file:bg-blue-500 file:text-white file:font-bold file:px-4 file:py-2 file:rounded-lg file:border-0 disabled:opacity-50"
                  />
                </label>
                {imagePreview && (
                  <div className="w-full h-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                {uploading && <p className="text-[12px] text-slate-500 font-bold">Uploading...</p>}
              </div>

              <select className="w-full bg-slate-50 p-4 rounded-2xl border-none font-bold" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Price (R)" className="w-full bg-slate-50 p-4 rounded-2xl border-none font-bold" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
              <input type="number" placeholder="Opening Stock" className="w-full bg-slate-50 p-4 rounded-2xl border-none font-bold" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} required />
              <button className="w-full bg-[#004694] text-white py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg">Register Stock</button>
            </div>
          </form>
        </div>

        <div className="xl:col-span-3 space-y-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveTab(cat)} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === cat ? 'bg-[#004694] text-white shadow-lg' : 'bg-white text-slate-400 border'}`}>
                {cat}
              </button>
            ))}
          </div>

          {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-300" size={40}/></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map(product => (
                <div key={product.id} className="relative bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                  <button onClick={() => handleDeleteProduct(product.id)} className="absolute top-4 right-4 z-10 w-11 h-11 rounded-2xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm">
                    <Trash2 size={18} />
                  </button>

                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-24 h-24 rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] uppercase font-black text-slate-400">No image</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[13px] font-black text-slate-900 uppercase tracking-[0.15em]">{product.stock_level}</span>
                        <span className="text-[9px] uppercase tracking-[0.3em] text-slate-400">Stock</span>
                      </div>
                      <h4 className="font-black text-slate-800 uppercase italic tracking-tight leading-none mb-2">{product.name}</h4>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{product.brand} • {product.category}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-[auto_auto] gap-3 items-center">
                    <div className="flex items-center gap-2">
                      <button onClick={() => adjustStock(product.id, product.stock_level, -1)} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"><Minus size={18}/></button>
                      <button onClick={() => adjustStock(product.id, product.stock_level, 1)} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all"><Plus size={18}/></button>
                      <div className="h-10 w-px bg-slate-100 mx-2"></div>
                      <button onClick={() => adjustStock(product.id, product.stock_level, 10)} className="px-3 py-2 rounded-2xl bg-blue-50 text-petBlue font-black text-[10px] hover:bg-petBlue hover:text-white transition-all">+10</button>
                      <button onClick={() => adjustStock(product.id, product.stock_level, 20)} className="px-3 py-2 rounded-2xl bg-blue-50 text-petBlue font-black text-[10px] hover:bg-petBlue hover:text-white transition-all">+20</button>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black">Current stock</p>
                      <p className="text-xl font-black uppercase text-slate-900">{product.stock_level} bags</p>
                      <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">R {product.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>  </AdminLayout>  );
}