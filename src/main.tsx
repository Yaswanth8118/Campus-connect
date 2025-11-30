import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { useThemeStore } from './store/themeStore';

// Theme initialization component
const ThemeInitializer = () => {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Initialize theme on app start
    setTheme(theme);
  }, [theme, setTheme]);

  return null;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeInitializer />
    <App />
  </StrictMode>
);