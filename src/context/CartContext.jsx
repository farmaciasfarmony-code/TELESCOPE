import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext'; // Asumiendo que existe un ToastContext
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';


const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe ser usado dentro de un CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const { addToast } = useToast();
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // NUCLEAR FIX: Versioning to force flush of corrupted data
    const CART_VERSION = 'v3.1-fix-chrome-jorge';

    // Initialize cart from local storage with robust error handling and legacy patching
    const [cartItems, setCartItems] = useState(() => {
        try {
            // CHECK VERSION FIRST
            const storedVersion = localStorage.getItem('cart_version');
            if (storedVersion !== CART_VERSION) {
                console.warn("🚨 Cart version mismatch or corruption detected. FORCING RESET for fresh start.");
                localStorage.removeItem('cart');
                return [];
            }

            const saved = localStorage.getItem('cart');
            if (!saved) return [];

            const parsed = JSON.parse(saved);

            if (!Array.isArray(parsed)) return [];

            // Helper to sanitize item
            const sanitizeItem = (item) => {
                if (!item || typeof item !== 'object') return null;

                // Must have a name to be valid
                if (!item.name) return null;

                // Ensure ID exists and is a string
                if (!item.id) {
                    item.id = item.name.replace(/\s+/g, '-').toLowerCase() + '-' + Date.now() + Math.floor(Math.random() * 1000);
                } else {
                    item.id = String(item.id);
                }

                // Sanitize numeric values
                item.quantity = parseInt(item.quantity) || 1;

                // Sanitize Price
                let p = 0;
                if (typeof item.price === 'string') {
                    p = parseFloat(item.price.replace(/[$,]/g, '')) || 0;
                } else {
                    p = parseFloat(item.price) || 0;
                }

                if (p <= 0) return null; // Reject free/invalid items
                item.price = p;

                return item;
            };

            // Deduplicate and Sanitize
            const uniqueItemsMap = new Map();

            parsed.forEach((rawItem) => {
                const item = sanitizeItem(rawItem);
                if (item) {
                    // Use strict string ID as key
                    const key = item.id;
                    if (uniqueItemsMap.has(key)) {
                        const existing = uniqueItemsMap.get(key);
                        existing.quantity += item.quantity;
                    } else {
                        uniqueItemsMap.set(key, item);
                    }
                }
            });

            return Array.from(uniqueItemsMap.values());
        } catch (e) {
            console.error("Error loading cart from localStorage, resetting:", e);
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    // Sync to local storage whenever cart items change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
        localStorage.setItem('cart_version', CART_VERSION);
    }, [cartItems]);

    // Clear cart if user is not logged in
    useEffect(() => {
        if (!loading && !user && cartItems.length > 0) {
            setCartItems([]);
        }
    }, [user, loading, cartItems.length]);

    const addToCart = useCallback((product) => {
        if (!user) {
            addToast('Inicia sesión para agregar productos.', 'info');
            navigate('/login');
            return;
        }

        addToast(`Se agregó ${product.name} al carrito`);
        setCartItems((prevItems) => {
            // Sanitize price on entry
            let price = product.price;
            if (typeof price === 'string') {
                price = parseFloat(price.replace(/[$,]/g, '')) || 0;
            } else {
                price = parseFloat(price) || 0;
            }

            if (price <= 0) return prevItems; // Safety check

            // Ensure Product ID is a String
            // Prefer existing ID, fallback to generated one.
            const productId = product.id ? String(product.id) : `gen-${product.name.replace(/\s+/g, '-').toLowerCase()}`;

            const newItem = { ...product, price, id: productId, quantity: 1 };

            // Check if exists by STRICT ID
            const existingItemIndex = prevItems.findIndex((item) => String(item.id) === productId);

            if (existingItemIndex >= 0) {
                // Update existing
                const updatedItems = [...prevItems];
                const existingItem = updatedItems[existingItemIndex];
                updatedItems[existingItemIndex] = {
                    ...existingItem,
                    quantity: parseInt(existingItem.quantity) + 1
                };
                return updatedItems;
            }

            // Add new
            return [...prevItems, newItem];
        });
    }, [addToast, user, navigate]);

    const removeFromCart = useCallback((id, name) => {
        setCartItems((prevItems) =>
            prevItems.filter((item) => {
                // Try to match by ID first
                if (id && item.id && String(item.id) === String(id)) return false; // Remove it
                // Fallback to name
                if (name && item.name === name) return false; // Remove it
                return true; // Keep it
            })
        );
    }, []);

    const updateQuantity = useCallback((id, name, newQuantity) => {
        const qty = parseInt(newQuantity);
        if (isNaN(qty) || qty < 1) return;

        console.log(`[CartContext] Request update: ID=${id}, Name=${name} -> ${qty}`);

        setCartItems((prevItems) => {
            // Priority 1: ID Match
            let existingIndex = -1;

            if (id) {
                existingIndex = prevItems.findIndex(item => String(item.id) === String(id));
            }

            // Priority 2: Name Match (if ID failed)
            if (existingIndex === -1 && name) {
                console.warn(`[CartContext] ID mismatch for ${name}, falling back to Name matching.`);
                existingIndex = prevItems.findIndex(item => item.name === name);
            }

            if (existingIndex === -1) {
                console.error(`[CartContext] CRITICAL FAILURE: Could not find item ${name} (ID: ${id})`);
                addToast(`Error: No se pudo sincronizar el producto: ${name}`, 'error');
                return prevItems;
            }

            // Update item
            const updatedItems = [...prevItems];
            updatedItems[existingIndex] = {
                ...updatedItems[existingIndex],
                quantity: qty
            };

            // Log success
            console.log(`[CartContext] Success: Updated ${updatedItems[existingIndex].name} to ${qty}`);

            return updatedItems;
        });
    }, [addToast]);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    // Calculate totals directly on every render to ensure they are always in sync
    const cartTotal = cartItems.reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        const qty = parseInt(item.quantity) || 1;
        return total + (price * qty);
    }, 0);

    const cartCount = cartItems.reduce((count, item) => count + (parseInt(item.quantity) || 0), 0);

    // Debug log for total changes
    useEffect(() => {
        console.log("🔄 Cart Total Updated:", cartTotal);
    }, [cartTotal]);

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
