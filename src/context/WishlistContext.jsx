import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const { user } = useAuth();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);

    // Cargar wishlist al iniciar sesión
    useEffect(() => {
        const fetchWishlist = async () => {
            if (user) {
                try {
                    const docRef = doc(db, 'wishlists', user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setWishlist(docSnap.data().items || []);
                    } else {
                        // Crear documento si no existe
                        await setDoc(docRef, { items: [] });
                        setWishlist([]);
                    }
                } catch (error) {
                    console.error("Error fetching wishlist:", error);
                }
            } else {
                setWishlist([]);
            }
            setLoading(false);
        };

        fetchWishlist();
    }, [user]);

    const addToWishlist = async (product) => {
        if (!user) {
            addToast("Inicia sesión para guardar tus favoritos", "info");
            return;
        }

        const safeId = String(product.id);

        // Evitar duplicados (comprobación robusta)
        if (wishlist.some(item => String(item.id) === safeId)) {
            addToast("Este producto ya está en tus favoritos", "info");
            return;
        }

        const newItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image || null,
            category: product.category
        };

        // --- ACTUALIZACIÓN OPTIMISTA (UI Instantánea) ---
        // 1. Actualizamos el estado local inmediatamente
        const previousWishlist = [...wishlist];
        setWishlist(prev => [...prev, newItem]);
        addToast("Agregado a favoritos", "success");

        // 2. Intentamos actualizar la base de datos en segundo plano
        try {
            const docRef = doc(db, 'wishlists', user.uid);
            // Usamos setDoc con merge: true para crear el documento si no existe automáticamente
            await setDoc(docRef, {
                items: arrayUnion(newItem)
            }, { merge: true });
        } catch (error) {
            // 3. Si falla, revertimos el cambio visual y avisamos
            console.error("Error adding to wishlist:", error);
            setWishlist(previousWishlist);
            addToast("No se pudo guardar en favoritos: " + error.message, "error");
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!user) return;

        const safeId = String(productId);
        const itemToRemove = wishlist.find(item => String(item.id) === safeId);

        if (!itemToRemove) return;

        // --- ACTUALIZACIÓN OPTIMISTA ---
        const previousWishlist = [...wishlist];
        setWishlist(prev => prev.filter(item => String(item.id) !== safeId));
        addToast("Eliminado de favoritos", "info");

        try {
            const docRef = doc(db, 'wishlists', user.uid);
            // Nota: arrayRemove requiere el objeto EXACTO para funcionar en Firestore.
            // Si el objeto local difiere minimamente del de DB, esto podría fallar.
            // Una estrategia más robusta suele ser leer, filtrar y reescribir todo el array, 
            // pero para este caso usaremos arrayRemove confiando en la consistencia.
            await updateDoc(docRef, {
                items: arrayRemove(itemToRemove)
            });
        } catch (error) {
            console.error("Error removing from wishlist:", error);
            setWishlist(previousWishlist); // Revertir
            addToast("Error al actualizar favoritos", "error");
        }
    };

    const isInWishlist = (productId) => {
        if (!productId) return false;
        return wishlist.some(item => String(item.id) === String(productId));
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, loading }}>
            {children}
        </WishlistContext.Provider>
    );
};
