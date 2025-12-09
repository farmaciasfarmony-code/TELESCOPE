import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, adminDb } from '../firebase';

const LAYOUT_COLLECTION = 'settings';
const LAYOUT_DOC_ID = 'home_layout';

// Default layout configuration
const DEFAULT_LAYOUT = {
    sections: [
        {
            id: 'hero',
            component: 'HeroSection',
            visible: true,
            label: 'Banner Principal',
            props: {}
        },
        {
            id: 'info',
            component: 'InfoSection',
            visible: true,
            label: 'Información y Confianza',
            props: {}
        },
        {
            id: 'personal_care',
            component: 'PersonalCare',
            visible: true,
            label: 'Sección Cuidado Personal',
            props: {}
        },
        {
            id: 'special_offers',
            component: 'SpecialOffers',
            visible: true,
            label: 'Ofertas Especiales',
            props: {}
        },
        {
            id: 'trending',
            component: 'TrendingProducts',
            visible: true,
            label: 'Productos en Tendencia',
            props: {}
        },
        {
            id: 'health_tips',
            component: 'HealthTips',
            visible: true,
            label: 'Consejos de Salud',
            props: {}
        },
        {
            id: 'chatbot',
            component: 'ChatBot',
            visible: true,
            label: 'Asistente Virtual',
            props: {}
        }
    ]
};

export const getLayout = async () => {
    try {
        const docRef = doc(db, LAYOUT_COLLECTION, LAYOUT_DOC_ID);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // Merge with default to ensure all properties exist if schema updates
            return { ...DEFAULT_LAYOUT, ...docSnap.data() };
        } else {
            return DEFAULT_LAYOUT;
        }
    } catch (error) {
        console.error("Error getting layout:", error);
        return DEFAULT_LAYOUT;
    }
};

export const saveLayout = async (layoutData) => {
    try {
        const docRef = doc(adminDb, LAYOUT_COLLECTION, LAYOUT_DOC_ID);
        await setDoc(docRef, { ...layoutData, updatedAt: new Date() });
        return true;
    } catch (error) {
        console.error("Error saving layout:", error);
        throw error;
    }
};
