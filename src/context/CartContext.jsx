import React, { createContext, useContext, useState, useEffect } from 'react';
import ReactGA from "react-ga4";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('klerksdorp_cart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('klerksdorp_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        // Analytics Injection
        ReactGA.event("add_to_cart", {
            currency: "ZAR",
            value: product.price,
            items: [{
                item_id: product.id,
                item_name: product.name,
                price: product.price,
                quantity: 1
            }]
        });

        setCart(prev => {
            const exists = prev.find(item => item.id === product.id);
            if (exists) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id));
    
    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('klerksdorp_cart');
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