import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    where,
    writeBatch,
    onSnapshot
} from 'firebase/firestore';

import { db, adminDb } from '../firebase'; // Assuming firebase.js exports 'db' and 'adminDb'

const COLLECTION_NAME = 'products';

// Suscribirse a cambios en productos (Real-time)
export const subscribeToProducts = (callback, onError, onlyActive = false) => {
    let q;
    if (onlyActive) {
        q = query(
            collection(db, COLLECTION_NAME),
            where('status', '==', 'active')
        );
    } else {
        q = query(collection(db, COLLECTION_NAME), orderBy('name'));
    }

    return onSnapshot(q, (snapshot) => {
        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(products);
    }, (error) => {
        console.error("Error subscribing to products: ", error);
        if (onError) onError(error);
    });
};

// Obtener productos (con opción de filtro para solo activos)
export const getProducts = async (onlyActive = false) => {
    try {
        let q;
        if (onlyActive) {
            q = query(
                collection(db, COLLECTION_NAME),
                where('status', '==', 'active'),
                // orderBy('name') // Nota: Requiere índice compuesto si se usa con where
            );
        } else {
            q = query(collection(db, COLLECTION_NAME), orderBy('name'));
        }

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting products: ", error);
        throw error;
    }
};

// Obtener un solo producto
export const getProduct = async (id) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting product: ", error);
        throw error;
    }
};

// Helper para asegurar números válidos (Firestore rechaza NaN)
const safeFloat = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
};

const safeInt = (val) => {
    const num = parseInt(val);
    return isNaN(num) ? 0 : num;
};

// Agregar un nuevo producto
export const addProduct = async (productData) => {
    try {
        const dataToSave = {
            ...productData,
            price: safeFloat(productData.price),
            discount: safeFloat(productData.discount),
            stock: safeInt(productData.stock),
            status: productData.status || 'active', // Por defecto active si se crea manual
            createdAt: new Date()
        };
        const docRef = await addDoc(collection(adminDb, COLLECTION_NAME), dataToSave);
        return { id: docRef.id, ...dataToSave };
    } catch (error) {
        console.error("Error adding product: ", error);
        throw error;
    }
};

// Actualizar un producto existente
export const updateProduct = async (id, productData) => {
    try {
        const productRef = doc(adminDb, COLLECTION_NAME, id);
        const dataToUpdate = {
            ...productData,
            price: safeFloat(productData.price),
            discount: safeFloat(productData.discount),
            stock: safeInt(productData.stock),
            updatedAt: new Date()
        };
        await updateDoc(productRef, dataToUpdate);
        return { id, ...dataToUpdate };
    } catch (error) {
        console.error("Error updating product: ", error);
        throw error;
    }
};

// Cambiar estado de publicación (Aprobar/Desactivar)
export const toggleProductStatus = async (id, currentStatus) => {
    try {
        const newStatus = currentStatus === 'active' ? 'pending' : 'active';
        const productRef = doc(adminDb, COLLECTION_NAME, id);
        await updateDoc(productRef, { status: newStatus });
        return newStatus;
    } catch (error) {
        console.error("Error toggling status: ", error);
        throw error;
    }
};

// Eliminar un producto
export const deleteProduct = async (id) => {
    try {
        await deleteDoc(doc(adminDb, COLLECTION_NAME, id));
        return id;
    } catch (error) {
        console.error("Error deleting product: ", error);
        throw error;
    }
};

// Agregar múltiples productos en lote (Batch) con soporte para >500 items
export const batchAddProducts = async (productsData) => {
    try {
        const collectionRef = collection(adminDb, COLLECTION_NAME);
        const chunkSize = 450; // Firestore limit is 500, safe margin
        let totalAdded = 0;

        for (let i = 0; i < productsData.length; i += chunkSize) {
            const chunk = productsData.slice(i, i + chunkSize);
            const batch = writeBatch(adminDb);

            chunk.forEach(product => {
                const docRef = doc(collectionRef);
                const dataToSave = {
                    ...product,
                    price: parseFloat(product.price) || 0,
                    discount: product.discount ? parseFloat(product.discount) : 0,
                    stock: parseInt(product.stock) || 0,
                    status: product.status || 'active', // Respetar estado o default a active
                    createdAt: new Date()
                };
                batch.set(docRef, dataToSave);
            });

            await batch.commit();
            totalAdded += chunk.length;
            console.log("Lote procesado: " + totalAdded + " de " + productsData.length);
        }

        return totalAdded;
    } catch (error) {
        console.error("Error batch adding products: ", error);
        throw error;
    }
};

// Eliminar TODOS los productos (Peligroso - Solo para desarrollo/reset)
export const deleteAllProducts = async () => {
    try {
        const q = query(collection(adminDb, COLLECTION_NAME));
        const snapshot = await getDocs(q);
        const batch = writeBatch(adminDb);

        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        return snapshot.size;
    } catch (error) {
        console.error("Error deleting all products: ", error);
        throw error;
    }
};
