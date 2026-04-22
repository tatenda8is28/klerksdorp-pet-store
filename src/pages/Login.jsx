import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';

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
            <form onSubmit={handleLogin} className="bg-white p-10 rounded-[40px] w-full max-w-md shadow-2xl">
                <img src="/logo.png" className="w-20 h-20 mx-auto mb-6 rounded-full" alt="Logo" />
                <h1 className="text-2xl font-black uppercase italic text-center text-[#1E3A8A] mb-8">Internal Access</h1>
                <input type="email" placeholder="Email" className="w-full p-4 bg-gray-100 rounded-2xl mb-4 font-bold outline-none" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" className="w-full p-4 bg-gray-100 rounded-2xl mb-6 font-bold outline-none" value={password} onChange={e => setPassword(e.target.value)} required />
                <button disabled={loading} className="w-full bg-[#1E3A8A] text-white py-5 rounded-2xl font-black uppercase italic flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="animate-spin" /> : <><LogIn size={20} /> Sign In</>}
                </button>
            </form>
        </div>
    );
}