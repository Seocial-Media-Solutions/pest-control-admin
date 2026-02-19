import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Always false for light mode
    const isDark = false;

    // Apply to document
    useEffect(() => {
        const root = document.documentElement;
        root.classList.remove('dark');
        root.classList.add('light');
        // Optional: Remove local storage item if it exists to clean up
        localStorage.removeItem('theme');
    }, []);

    const toggleTheme = () => {
        // No-op or log warning
        console.warn('Theme toggling is disabled.');
    };

    const resetToSystem = () => {
        // No-op
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, resetToSystem, themePreference: 'light' }}>
            {children}
        </ThemeContext.Provider>
    );
};
