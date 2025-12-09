import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, adminDb } from '../firebase';

const SETTINGS_COLLECTION = 'settings';
const GENERAL_DOC_ID = 'general';

// Obtener configuración global
export const getSettings = async () => {
    try {
        // Leemos con 'db' (público) para que la tienda cargue los colores
        const docRef = doc(db, SETTINGS_COLLECTION, GENERAL_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            // Default settings
            return {
                primaryColor: '#4169E1',
                secondaryColor: '#87CEEB',
                siteName: 'Farmony',
                logo: null,
                footer: {
                    columns: [
                        {
                            title: 'Atención a clientes',
                            links: [
                                { name: 'Contacto', to: '/contact' },
                                { name: 'Preguntas frecuentes', to: '/faq' },
                                { name: 'Facturación Electrónica', to: '/billing' },
                                { name: 'Sucursales', to: '/stores' },
                            ]
                        },
                        {
                            title: 'Nuestra Empresa',
                            links: [
                                { name: 'Quiénes Somos', to: '/about' },
                                { name: 'Bolsa de Trabajo', to: '/jobs' },
                                { name: 'Relación con Inversionistas', to: '/investors' },
                                { name: 'Aviso de privacidad', to: '/privacy' },
                            ]
                        },
                        {
                            title: 'Servicios',
                            links: [
                                { name: 'Consultorio Médico', to: '/services/consultorio' },
                                { name: 'Análisis clínicos', to: '/services/analisis' },
                                { name: 'Farmacia en Línea', to: '/' },
                                { name: 'Envío a domicilio', to: '/checkout' },
                            ]
                        }
                    ],
                    social: {
                        facebook: "https://www.facebook.com/profile.php?id=61575232563621",
                        twitter: "https://www.twitter.com",
                        instagram: "https://www.instagram.com"
                    },
                    contact: {
                        phone: "(55) 5555-5555"
                    }
                }
            };
        }
    } catch (error) {
        console.error("Error fetching settings:", error);
        return null;
    }
};

// Guardar configuración (Solo Admin)
export const saveSettings = async (settings) => {
    try {
        // Escribimos con 'adminDb' (privado)
        const docRef = doc(adminDb, SETTINGS_COLLECTION, GENERAL_DOC_ID);
        await setDoc(docRef, {
            ...settings,
            updatedAt: new Date()
        }, { merge: true });
        return true;
    } catch (error) {
        console.error("Error saving settings:", error);
        throw error;
    }
};
