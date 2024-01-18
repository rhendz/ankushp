"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

interface RootLayoutProps {
  children: React.ReactNode;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

const updateThemeColorMetaTag = (color: string) => {
  const existingMetaTag = document.querySelector('meta[name="theme-color"]');
  if (existingMetaTag) {
    // Update existing meta tag
    existingMetaTag.setAttribute('content', color);
  } else {
    // Create new meta tag
    const newMetaTag = document.createElement('meta');
    newMetaTag.name = 'theme-color';
    newMetaTag.content = color;
    document.head.appendChild(newMetaTag);
  }
};

export const ThemeProvider: React.FC<RootLayoutProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Update isDarkMode on initial render
  useEffect(() => {
    // This must be done client-side when window is defined
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    updateThemeColorMetaTag(isDarkMode ? "#171219" : "#e6e8e6")
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prevDarkMode) => !prevDarkMode);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    updateThemeColorMetaTag(isDarkMode ? "#171219" : "#e6e8e6")
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
