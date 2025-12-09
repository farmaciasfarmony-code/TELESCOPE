import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettings } from '../services/settingsService';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState({
        primaryColor: '#4169E1',
        secondaryColor: '#87CEEB',
        siteName: 'Farmony',
        logo: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTheme = async () => {
            const settings = await getSettings();
            if (settings) {
                setTheme(settings);
                // Apply CSS Variables globally
                const root = document.documentElement;
                if (settings.primaryColor) {
                    root.style.setProperty('--primary-color', settings.primaryColor);
                }
                if (settings.secondaryColor) {
                    root.style.setProperty('--secondary-color', settings.secondaryColor);
                }
            }
            setLoading(false);
        };
        loadTheme();
    }, []);

    const updateThemeLocally = (newSettings) => {
        setTheme(prev => ({ ...prev, ...newSettings }));
        const root = document.documentElement;
        if (newSettings.primaryColor) {
            root.style.setProperty('--primary-color', newSettings.primaryColor);
        }
        if (newSettings.secondaryColor) {
            root.style.setProperty('--secondary-color', newSettings.secondaryColor);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, updateThemeLocally, loading }}>
            {children}
        </ThemeContext.Provider>
    );
};
