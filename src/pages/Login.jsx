import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Loader2, ArrowLeft } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            alert(error.message);
            setLoading(false);
            return;
        }

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
        
        if (profile?.role === 'admin') navigate('/admin');
        else if (profile?.role === 'driver') navigate('/driver');
        else navigate('/store');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#00142b] p-6">
            <div className="bg-white p-10 rounded-[40px] w-full max-w-md shadow-2xl">
                
                {/* NEW: RETURN TO STORE BUTTON */}
                <Link 
                    to="/" 
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-[#1E3A8A] text-[10px] font-black uppercase tracking-widest mb-8 transition-all group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
                    Return to Store
                </Link>

                <form onSubmit={handleLogin}>
                    <img src="/logo.png" className="w-20 h-20 mx-auto mb-6 rounded-full" alt="Logo" />
                    <h1 className="text-2xl font-black uppercase italic text-center text-[#1E3A8A] mb-8 tracking-tighter">
                        Internal Access
                    </h1>
                    
                    <div className="space-y-4 mb-8">
                        <input 
                            type="email" 
                            placeholder="Email" 
                            className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            required 
                        />
                        <input 
                            type="password" 
                            placeholder="Password" 
                            className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                        />
                    </div>

                    <button 
                        disabled={loading} 
                        className="w-full bg-[#1E3A8A] text-white py-5 rounded-2xl font-black uppercase italic flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20 hover:bg-blue-800 transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><LogIn size={20} /> Sign In</>}
                    </button>
                </form>
                
                <p className="text-center mt-8 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">
                    Klerksdorp Hondekos © 2024
                </p>
            </div>
        </div>
    );
}