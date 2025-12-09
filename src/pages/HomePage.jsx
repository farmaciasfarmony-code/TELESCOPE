import React, { useEffect, useState } from 'react';
import { getLayout } from '../services/layoutService';
import HeroSection from '../components/HeroSection';
import InfoSection from '../components/InfoSection';
import PersonalCare from '../components/PersonalCare';
import SpecialOffers from '../components/SpecialOffers';
import TrendingProducts from '../components/TrendingProducts';
import HealthTips from '../components/HealthTips';
import ChatBot from '../components/ChatBot';

const COMPONENT_MAP = {
    'HeroSection': HeroSection,
    'InfoSection': InfoSection,
    'PersonalCare': PersonalCare,
    'SpecialOffers': SpecialOffers,
    'TrendingProducts': TrendingProducts,
    'HealthTips': HealthTips,
    'ChatBot': ChatBot
};

const HomePage = () => {
    const [layout, setLayout] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadLayout = async () => {
            const data = await getLayout();
            setLayout(data);
            setLoading(false);
        };
        loadLayout();
    }, []);

    if (loading) {
        return <div style={{ padding: '4rem', textAlign: 'center' }}>Cargando página...</div>;
    }

    if (!layout || !layout.sections) return null;

    return (
        <div className="home-page-dynamic">
            {layout.sections.map((section) => {
                if (!section.visible) return null;
                const Component = COMPONENT_MAP[section.component];
                if (!Component) return null;

                // Pass props from configuration if we implement editing later
                return <Component key={section.id} {...section.props} />;
            })}
        </div>
    );
};

export default HomePage;
