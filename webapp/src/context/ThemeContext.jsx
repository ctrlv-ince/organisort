import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import themePresets from '../config/themePresets';

const ThemeContext = createContext();

/**
 * Inject CSS variables from a theme preset onto the document root
 */
const applyThemeVars = (themeId) => {
    const preset = themePresets[themeId] || themePresets.default;
    const root = document.documentElement;
    Object.entries(preset.vars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
    });
};

/**
 * ThemeProvider
 * Reads the user's saved theme from userData.preferences.dashboardTheme,
 * injects CSS variables, and persists changes to the backend.
 */
export const ThemeProvider = ({ children, userData }) => {
    const initialTheme = userData?.preferences?.dashboardTheme || 'default';
    const [theme, setThemeState] = useState(initialTheme);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Apply CSS vars whenever theme changes
    useEffect(() => {
        applyThemeVars(theme);
    }, [theme]);

    // Re-sync if userData loads after mount (e.g. async fetch)
    useEffect(() => {
        const saved = userData?.preferences?.dashboardTheme;
        if (saved && saved !== theme && themePresets[saved]) {
            setThemeState(saved);
        }
    }, [userData?.preferences?.dashboardTheme]);

    /**
     * Set theme + persist to backend
     */
    const setTheme = useCallback(async (newTheme) => {
        if (!themePresets[newTheme]) return;
        setThemeState(newTheme);

        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/api/users/me/preferences`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ dashboardTheme: newTheme }),
            });
        } catch (err) {
            console.error('Failed to save theme preference:', err);
        }
    }, [API_URL]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, presets: themePresets }}>
            {children}
        </ThemeContext.Provider>
    );
};

/**
 * Hook to access theme context
 * Usage: const { theme, setTheme, presets } = useTheme();
 */
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
