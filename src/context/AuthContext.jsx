import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider, facebookProvider } from '../firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Get additional user data from Firestore if needed
                // For now, we just use the firebase user object
                setUser(firebaseUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const register = async (email, password, fullName) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update display name
        await updateProfile(user, { displayName: fullName });

        // Create user document in Firestore
        await setDoc(doc(db, 'customers', user.uid), {
            uid: user.uid,
            email: user.email,
            fullName: fullName,
            createdAt: new Date(),
            totalSpent: 0,
            orderCount: 0
        });

        return user;
    };

    const loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user exists in Firestore, if not create
        const userDoc = await getDoc(doc(db, 'customers', user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'customers', user.uid), {
                uid: user.uid,
                email: user.email,
                fullName: user.displayName,
                createdAt: new Date(),
                totalSpent: 0,
                orderCount: 0
            });
        }
        return user;
    };

    const loginWithFacebook = async () => {
        const result = await signInWithPopup(auth, facebookProvider);
        const user = result.user;

        // Check if user exists in Firestore, if not create
        const userDoc = await getDoc(doc(db, 'customers', user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'customers', user.uid), {
                uid: user.uid,
                email: user.email,
                fullName: user.displayName,
                createdAt: new Date(),
                totalSpent: 0,
                orderCount: 0
            });
        }
        return user;
    };

    const logout = () => {
        return signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, loginWithGoogle, loginWithFacebook, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
