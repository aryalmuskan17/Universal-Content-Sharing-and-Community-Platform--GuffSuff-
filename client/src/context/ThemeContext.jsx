// client/src/context/ThemeContext.jsx

import React, { createContext, useState, useEffect } from 'react';

// Create a new Context. This will be used to provide and consume the theme state.
const ThemeContext = createContext();

// This component acts as the Provider for the ThemeContext.
// It holds the state and logic for the theme and makes it available to its children.
const ThemeProvider = ({ children }) => {
  // State for the current theme mode, initialized from local storage.
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if a theme is saved in local storage.
    const savedTheme = localStorage.getItem('theme');
    // Return true for 'dark' theme, otherwise default to false (light mode).
    return savedTheme === 'dark';
  });

  // Effect hook to synchronize the theme state with the DOM and local storage.
  useEffect(() => {
    // Add or remove the 'dark' class on the document's root element (<html>).
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]); // Re-run the effect whenever isDarkMode changes.

  // Function to toggle the theme mode.
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // The Provider component makes the state and the toggle function available to all
  // components wrapped inside it.
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Export the Context and the Provider for use in other parts of the application.
export { ThemeContext, ThemeProvider };