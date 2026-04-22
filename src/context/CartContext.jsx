import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // 1. Load cart from localStorage on startup
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('pet_store_cart');
        return saved ? JSON.parse(saved) : [];
    });

    // 2. Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('pet_store_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart(prev => {
            const exists = prev.find(item => item.id === product.id);
            if (exists) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('pet_store_cart');
    };

    const getCartTotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const getCartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, getCartTotal, getCartCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);