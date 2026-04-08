import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Package, Trash2, LayoutDashboard } from 'lucide-react';

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Montego');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    setLoading(true);
    let imageUrl = '';

    if (image) {
      const fileName = `${Date.now()}-${image.name}`;
      const { data: storageData } = await supabase.storage.from('product-images').upload(fileName, image);
      if (storageData) {
        const { data: publicUrl } = supabase.storage.from('product-images').getPublicUrl(fileName);
        imageUrl = publicUrl.publicUrl;
      }
    }

    const { error } = await supabase.from('products').insert([{ name, brand, price: parseFloat(price), image_url: imageUrl }]);
    if (!error) {
      setName(''); setPrice(''); fetchProducts();
      alert("Product synced to store.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <LayoutDashboard className="text-brand-primary" /> Store Management
            </h1>
            <p className="text-gray-500">Inventory for Klerksdorp Hondekos</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Add Product Sidebar */}
          <div className="lg:col-span-1">
            <form onSubmit={handleAddProduct} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold mb-6 text-gray-800">New Product</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Product Name</label>
                  <input type="text" className="w-full mt-1 border-none bg-gray-100 p-4 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Brand</label>
                  <select className="w-full mt-1 border-none bg-gray-100 p-4 rounded-xl outline-none" value={brand} onChange={(e) => setBrand(e.target.value)}>
                    {["Montego", "Jock", "Nutribyte", "Royal Canin", "Paws", "Trusty", "Ideal"].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Price (ZAR)</label>
                  <input type="number" className="w-full mt-1 border-none bg-gray-100 p-4 rounded-xl outline-none" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Photo</label>
                  <input type="file" className="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-brand-accent file:text-brand-primary" onChange={(e) => setImage(e.target.files[0])} />
                </div>

                <button disabled={loading} className="w-full bg-brand-dark text-white py-4 rounded-xl font-bold mt-4 hover:bg-brand-primary transition-colors flex items-center justify-center gap-2">
                  {loading ? "Processing..." : <><Plus size={20} /> Add to Inventory</>}
                </button>
              </div>
            </form>
          </div>

          {/* Product List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Package size={20} /> Live Inventory ({products.length})
            </h2>
            <div className="grid gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-2xl flex items-center gap-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <img src={p.image_url} alt="" className="w-16 h-16 rounded-xl object-cover bg-gray-50" />
                  <div className="flex-grow">
                    <h4 className="font-bold text-gray-800">{p.name}</h4>
                    <span className="text-xs font-bold text-brand-primary uppercase tracking-tighter">{p.brand}</span>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-bold text-gray-900 text-lg">R {p.price}</p>
                  </div>
                  <button className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}