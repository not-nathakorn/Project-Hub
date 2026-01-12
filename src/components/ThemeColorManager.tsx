import { useEffect } from 'react';
import { useTheme } from './theme-provider';

export function ThemeColorManager() {
  const { theme } = useTheme();

  useEffect(() => {
    const updateThemeColor = () => {
      // 1. Determine the active theme (light/dark)
      let activeTheme = theme;
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        activeTheme = systemTheme;
      }

      // 2. Define exact colors
      const lightColor = '#EBF4FF';
      const darkColor = '#000000';
      const color = activeTheme === 'dark' ? darkColor : lightColor;

      // 3. Update or Create meta tag for theme-color (Mobile Browsers/PWA)
      const metaName = 'theme-color';
      let meta = document.querySelector(`meta[name="${metaName}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', metaName);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', color);

      // 4. Force HTML background color (Safari Overscroll / Fallback)
      document.documentElement.style.backgroundColor = color;
      
      // 5. Force Body background color (Double insurance for Safari Edge)
      document.body.style.backgroundColor = color;
    };

    // Run immediately
    updateThemeColor();

    // Listen for system changes if needed
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
       if (theme === 'system') {
         updateThemeColor();
       }
    };
    
    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  return null;
}
