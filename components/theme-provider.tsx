"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      // Set initial mode based on prefers-color-scheme
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDarkMode;
    }
    // Default to false if window is not defined (e.g., during server-side rendering)
    return false;
  });
  
  const toggleTheme = () => {
    setIsDarkMode((prevDarkMode) => !prevDarkMode);
  };

  useEffect(() => {
    // Update data-theme attribute based on the theme
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
