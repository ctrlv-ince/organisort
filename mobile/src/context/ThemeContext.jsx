import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import themePresets from '@/src/config/themePresets';
import apiClient from '@/src/utils/apiClient';

const STORAGE_KEY = 'appTheme';
const ThemeContext = createContext();

/**
 * ThemeProvider
 * Loads the saved theme from AsyncStorage / backend, provides colors
 * to the whole app, and persists changes.
 */
export const ThemeProvider = ({ children }) => {
    const [themeId, setThemeId] = useState('default');
    const [ready, setReady] = useState(false);

    // Load theme on mount — check local storage first, then backend
    useEffect(() => {
        const load = async () => {
            try {
                // 1. Local cache (instant)
                const local = await AsyncStorage.getItem(STORAGE_KEY);
                if (local && themePresets[local]) {
                    setThemeId(local);
                }

                // 2. Backend (authoritative)
                const token = await AsyncStorage.getItem('token');
                if (token) {
                    const response = await apiClient.get('/api/users/me');
                    const saved = response.data?.data?.preferences?.dashboardTheme;
                    if (saved && themePresets[saved]) {
                        setThemeId(saved);
                        await AsyncStorage.setItem(STORAGE_KEY, saved);
                    }
                }
            } catch (err) {
                console.error('Failed to load theme preference:', err);
            } finally {
                setReady(true);
            }
        };
        load();
    }, []);

    /**
     * Set theme — updates state, persists locally and to backend
     */
    const setTheme = useCallback(async (newTheme) => {
        if (!themePresets[newTheme]) return;
        setThemeId(newTheme);
        await AsyncStorage.setItem(STORAGE_KEY, newTheme);

        try {
            await apiClient.put('/api/users/me/preferences', {
                dashboardTheme: newTheme,
            });
        } catch (err) {
            console.error('Failed to save theme preference:', err);
        }
    }, []);

    const preset = themePresets[themeId] || themePresets.default;

    return (
        <ThemeContext.Provider
            value={{
                theme: themeId,
                colors: preset.colors,
                setTheme,
                presets: themePresets,
                ready,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

/**
 * Hook to access the current theme.
 * Usage: const { theme, colors, setTheme, presets } = useTheme();
 */
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
