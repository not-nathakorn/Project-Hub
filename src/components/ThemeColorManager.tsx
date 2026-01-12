import { useEffect } from 'react';
import { useTheme } from './theme-provider';

export function ThemeColorManager() {
  const { theme } = useTheme();

  useEffect(() => {
    const updateThemeColor = () => {
      // Determine the current active theme (system or explicit)
      let activeTheme = theme;
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        activeTheme = systemTheme;
      }

      // Define colors
      const lightColor = '#EBF4FF'; // Matches the liquid background base
      const darkColor = '#0a0a0a';  // Matches neutral-950

      const color = activeTheme === 'dark' ? darkColor : lightColor;

      // Update existing meta tags or invoke specific behavior
      // Note: modifying meta tags directly might conflict with some hydration, 
      // but for theme-color it's the standard way.
      
      // Update specific light/dark media tags if they exist to force consistency
      const lightMeta = document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: light)"]');
      const darkMeta = document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: dark)"]');
      
      if (lightMeta) lightMeta.setAttribute('content', color);
      if (darkMeta) darkMeta.setAttribute('content', color);
      
      // Also update/create a generic one as fallback/primary
      let genericMeta = document.querySelector('meta[name="theme-color"]:not([media])');
      if (!genericMeta) {
        genericMeta = document.createElement('meta');
        genericMeta.setAttribute('name', 'theme-color');
        document.head.appendChild(genericMeta);
      }
      genericMeta.setAttribute('content', color);
    };

    updateThemeColor();

    // Listen for system theme changes if using 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateThemeColor);

    return () => mediaQuery.removeEventListener('change', updateThemeColor);
  }, [theme]);

  return null;
}
