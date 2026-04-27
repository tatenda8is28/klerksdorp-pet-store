import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import ReactGA from "react-ga4";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
                // Analytics Identification
                ReactGA.set({ userId: session.user.id });
            }
            else setLoading(false);
        });

        // Listen for Auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
                ReactGA.set({ userId: session.user.id });
            }
            else { setProfile(null); setLoading(false); }
        });

        return () => subscription.unsubscribe();
    }, []);

    async function fetchProfile(uid) {
        const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
        setProfile(data);
        setLoading(false);
    }

    const signOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);