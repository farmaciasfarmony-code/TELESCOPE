import {
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    updateDoc,
    onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION_NAME = 'orders';

// Subscribe to orders in real-time
export const subscribeToOrders = (callback) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() // Convert Timestamp to Date
        }));
        callback(orders);
    }, (error) => {
        console.error("Error subscribing to orders: ", error);
    });
};

// Update order status
export const updateOrderStatus = async (orderId, newStatus) => {
    try {
        const orderRef = doc(db, COLLECTION_NAME, orderId);
        await updateDoc(orderRef, { status: newStatus });
    } catch (error) {
        console.error("Error updating order status: ", error);
        throw error;
    }
};
