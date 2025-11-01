import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { Settings, Theme } from '../types';
import { settingsApi } from '../services/mockApiService';

interface SettingsContextType extends Settings {
    isLoading: boolean;
    updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
    setTheme: (theme: Theme) => void;
}

// Default configuration with test data
const DEFAULT_SETTINGS: Settings = {
    theme: 'dark',
    googleSheetUrl: 'https://docs.google.com/spreadsheets/d/1cTdP17tqW1GLpwxc25ewxZ7cRHMNjZeMatnEASH7gsE/edit?gid=0#gid=0',
    googleSheetsApiKey: 'AIzaSyBoVqFPgUzd_MmNjmcV5jSlBDdKfwY7qKA',
    aiApiKey: '',
    userName: 'Business Owner',
};

export const SettingsContext = createContext<SettingsContextType>({} as SettingsContextType);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);

    const loadSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const savedSettings = await settingsApi.get();
            
            // Migration: Handle old apiKey field
            let migratedSettings = { ...savedSettings };
            if ((savedSettings as any).apiKey && !savedSettings.googleSheetsApiKey && !savedSettings.aiApiKey) {
                console.log('🔄 Migrating old API key to Google Sheets API key');
                migratedSettings.googleSheetsApiKey = (savedSettings as any).apiKey;
                // Remove old apiKey field
                delete (migratedSettings as any).apiKey;
            }
            
            // Merge saved settings with defaults (defaults take precedence if saved values are empty)
            const mergedSettings: Settings = {
                theme: migratedSettings.theme || DEFAULT_SETTINGS.theme,
                googleSheetUrl: migratedSettings.googleSheetUrl || DEFAULT_SETTINGS.googleSheetUrl,
                googleSheetsApiKey: migratedSettings.googleSheetsApiKey || DEFAULT_SETTINGS.googleSheetsApiKey,
                aiApiKey: migratedSettings.aiApiKey || DEFAULT_SETTINGS.aiApiKey,
                userName: migratedSettings.userName || DEFAULT_SETTINGS.userName,
            };
            
            setSettings(mergedSettings);
            
            // Save merged settings back to localStorage
            await settingsApi.update(mergedSettings);
        } catch (error) {
            console.error('Error loading settings:', error);
            setSettings(DEFAULT_SETTINGS);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    useEffect(() => {
        if (!isLoading) {
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(settings.theme);
        }
    }, [settings.theme, isLoading]);

    const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
        console.log('🔧 Updating settings:', newSettings);
        const updated = await settingsApi.update(newSettings);
        console.log('✅ Settings updated:', updated);
        setSettings(updated);
    }, []);
    
    const setTheme = useCallback((theme: Theme) => {
        updateSettings({ theme });
    }, [updateSettings]);

    const value = {
        ...settings,
        isLoading,
        updateSettings,
        setTheme,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};