import { useEffect } from 'react';
import { useTheme } from './theme-provider';

export function ThemeColorManager() {
  const { theme } = useTheme();

  useEffect(() => {
    const updateThemeColor = () => {
      // Determine colors
      // We want to update immediately to prevent visible lag
      let activeTheme = theme;
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        activeTheme = systemTheme;
      }

      const lightColor = '#EBF4FF';
      const darkColor = '#0a0a0a';
      const color = activeTheme === 'dark' ? darkColor : lightColor;

      // Update meta tag
      // Cleanest way: remove all, add one.
      const existingMetas = document.querySelectorAll('meta[name="theme-color"]');
      existingMetas.forEach(meta => meta.remove());

      const newMeta = document.createElement('meta');
      newMeta.setAttribute('name', 'theme-color');
      newMeta.setAttribute('content', color);
      document.head.appendChild(newMeta);
    };

    updateThemeColor();

    // Listen for system theme changes if using 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateThemeColor);

    return () => mediaQuery.removeEventListener('change', updateThemeColor);
  }, [theme]);

  return null;
}
