import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAuth, adminDb as db } from '../firebase';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(adminAuth, async (user) => {
            if (user) {
                // Fetch admin details from Firestore
                try {
                    const docRef = doc(db, 'admins', user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const adminData = docSnap.data();
                        if (adminData.status === 'active' || user.email === 'farmaciasfarmony@gmail.com') {
                            setAdminUser({ ...user, ...adminData, status: 'active', role: user.email === 'farmaciasfarmony@gmail.com' ? 'super_admin' : adminData.role });
                        } else {
                            setAdminUser(null);
                        }
                    } else {
                        // If doc missing but is super admin email, allow
                        if (user.email === 'farmaciasfarmony@gmail.com') {
                            setAdminUser({ ...user, status: 'active', role: 'super_admin' });
                        } else {
                            setAdminUser(null);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching admin data:", error);
                    if (error.code === 'permission-denied' && user.email === 'farmaciasfarmony@gmail.com') {
                        console.warn("Permission denied for Super Admin check. Bypassing.");
                        setAdminUser({ ...user, status: 'active', role: 'super_admin' });
                    } else {
                        setAdminUser(null);
                    }
                }
            } else {
                setAdminUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(adminAuth, email, password);
            const user = userCredential.user;

            // Check Firestore status
            const docRef = doc(db, 'admins', user.uid);
            let docSnap;
            try {
                docSnap = await getDoc(docRef);
            } catch (err) {
                // If permission denied but it is the super admin, allow access
                if (email === 'farmaciasfarmony@gmail.com' && err.code === 'permission-denied') {
                    console.warn("Firestore permission denied. Bypassing for Super Admin.");
                    return { success: true };
                }
                throw err;
            }

            if (!docSnap.exists()) {
                // If it's the super admin, create the doc on the fly
                // Check against the authenticated user's email, lowercased
                if (user.email && user.email.toLowerCase() === 'farmaciasfarmony@gmail.com') {
                    try {
                        await setDoc(docRef, {
                            email: user.email,
                            role: 'super_admin',
                            status: 'active',
                            createdAt: new Date()
                        });
                    } catch (writeErr) {
                        console.error("Error creating admin doc:", writeErr);
                        // If we can't write self-doc due to permissions, still allow login
                        if (writeErr.code === 'permission-denied') {
                            return { success: true };
                        }
                    }
                    return { success: true };
                }

                await signOut(adminAuth);
                return { success: false, message: 'No tienes cuenta de administrador.' };
            }

            const adminData = docSnap.data();

            // Super Admin Bypass
            if (email === 'farmaciasfarmony@gmail.com') {
                // Ensure they are active and super_admin in DB if not already
                if (adminData.status !== 'active' || adminData.role !== 'super_admin') {
                    try {
                        await setDoc(docRef, { ...adminData, status: 'active', role: 'super_admin' }, { merge: true });
                    } catch (updateErr) {
                        console.warn("Could not update admin role due to permissions", updateErr);
                    }
                }
                return { success: true };
            }

            if (adminData.status === 'pending') {
                await signOut(adminAuth);
                return { success: false, message: 'Tu cuenta está pendiente de aprobación. Se te notificará por correo.' };
            }

            if (adminData.status !== 'active') {
                await signOut(adminAuth);
                return { success: false, message: 'Acceso denegado.' };
            }

            return { success: true };
        } catch (error) {
            console.error("Login error:", error);
            if (error.code === 'permission-denied' && email === 'farmaciasfarmony@gmail.com') {
                return { success: true };
            }
            return { success: false, message: error.message };
        }
    };

    const register = async (email, password) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(adminAuth, email, password);
            const user = userCredential.user;

            // Create pending admin document (Auto-approve if super admin email)
            const isSuperAdmin = email === 'farmaciasfarmony@gmail.com';

            await setDoc(doc(db, 'admins', user.uid), {
                email: user.email,
                role: isSuperAdmin ? 'super_admin' : 'admin',
                status: isSuperAdmin ? 'active' : 'pending',
                createdAt: new Date()
            });

            if (isSuperAdmin) {
                return { success: true, message: 'Cuenta Super Admin creada y activada.' };
            }

            // Send email notification (Simulation)
            // In a real app, use EmailJS or a Cloud Function here.
            console.log(`[SIMULATION] Sending email to farmaciasfarmony@gmail.com: New admin request from ${email}`);

            // Sign out immediately
            await signOut(adminAuth);

            return { success: true, message: 'Solicitud enviada. Espera la autorización del administrador principal.' };
        } catch (error) {
            console.error("Register error:", error);
            return { success: false, message: error.message };
        }
    };

    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(adminAuth, email);
            return { success: true };
        } catch (error) {
            console.error("Reset password error:", error);
            return { success: false, message: error.message };
        }
    };

    const logout = async () => {
        try {
            await signOut(adminAuth);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    // Helper to check permissions
    const canAccess = (module) => {
        if (!adminUser) return false;
        if (adminUser.status !== 'active') return false;
        return true;
    };

    return (
        <AdminAuthContext.Provider value={{ adminUser, login, register, resetPassword, logout, loading, canAccess }}>
            {children}
        </AdminAuthContext.Provider>
    );
};
