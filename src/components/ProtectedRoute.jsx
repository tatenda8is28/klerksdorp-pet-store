import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roleRequired }) {
    const { user, profile, loading } = useAuth();

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-white">Loading...</div>;

    // If not logged in, or role doesn't match, send to login/home
    if (!user || (roleRequired && profile?.role !== roleRequired)) {
        return <Navigate to="/login" replace />;
    }

    return children;
}