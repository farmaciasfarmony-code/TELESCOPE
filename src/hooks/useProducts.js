import { useState, useEffect } from 'react';
import { subscribeToProducts } from '../services/productService';

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Subscribe to real-time updates
        const unsubscribe = subscribeToProducts(
            (data) => {
                setProducts(data);
                setLoading(false);
            },
            (err) => {
                console.error("Subscription error:", err);
                setError(err);
                setLoading(false);
            },
            true // Pass true to fetch only active products for public view
        );

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const getProductById = async (id) => {
        // If products are already loaded, find it there first to save a read
        const found = products.find(p => p.id === id);
        if (found) return found;

        // Otherwise fetch from DB (handled by the component calling the service directly usually, but we can wrap it)
        // We need to import getProduct from service.
        // Actually, let's just return the find logic here for now, and let the component handle the direct fetch if needed, 
        // OR we can import getProduct here.
        // Let's import getProduct at the top.
        const { getProduct } = await import('../services/productService');
        return await getProduct(id);
    };

    return { products, loading, error, getProductById };
};
