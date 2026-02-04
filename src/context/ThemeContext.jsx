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
    const [themePreference, setThemePreference] = useState(() => {
        // null means 'system'
        return localStorage.getItem('theme');
    });

    const [systemTheme, setSystemTheme] = useState(() => {
        // Initial system check
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    // Listen to system changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Persist preference
    useEffect(() => {
        if (themePreference) {
            localStorage.setItem('theme', themePreference);
        } else {
            localStorage.removeItem('theme');
        }
    }, [themePreference]);

    // Derive effective theme
    const isDark = themePreference === 'dark' || (themePreference === null && systemTheme === 'dark');

    // Apply to document
    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.add('light');
            root.classList.remove('dark');
        }
    }, [isDark]);

    const toggleTheme = () => {
        // If currently dark, switch to light. If light, switch to dark.
        // This sets an explicit preference.
        if (isDark) {
            setThemePreference('light');
        } else {
            setThemePreference('dark');
        }
    };

    const resetToSystem = () => {
        setThemePreference(null); // Clear manual override
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, resetToSystem, themePreference }}>
            {children}
        </ThemeContext.Provider>
    );
};
