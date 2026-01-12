import { useLayoutEffect, useRef } from 'react';
import { useTheme } from './theme-provider';

export function ThemeColorManager() {
  const { theme } = useTheme();
  const previousTheme = useRef<string | null>(null);

  useLayoutEffect(() => {
    // Determine the active theme (light/dark)
    let activeTheme: 'light' | 'dark' = 'light';
    if (theme === 'system') {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } else {
      activeTheme = theme;
    }

    // Skip if theme hasn't actually changed (prevents unnecessary DOM thrashing)
    if (previousTheme.current === activeTheme) {
      return;
    }
    previousTheme.current = activeTheme;

    // Define exact colors
    const lightColor = '#EBF4FF';
    const darkColor = '#000000';
    const color = activeTheme === 'dark' ? darkColor : lightColor;

    // === AGGRESSIVE SAFARI FIX ===
    // Safari caches the theme-color meta tag aggressively.
    // The most reliable workaround is to:
    // 1. Remove all existing meta tags
    // 2. Force a tiny layout reflow
    // 3. Insert a brand new meta tag

    const existingMetas = document.querySelectorAll('meta[name="theme-color"]');
    existingMetas.forEach(m => m.remove());

    // Force a synchronous reflow to ensure Safari processes the removal
    // This is a necessary hack for Safari's stubborn caching behavior.
    void document.documentElement.offsetHeight;

    // Create and insert a fresh meta tag
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', color);
    document.head.appendChild(meta);

    // Force HTML and Body background color
    document.documentElement.style.setProperty('background-color', color, 'important');
    document.body.style.setProperty('background-color', color, 'important');

    // Listen for system changes if needed
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
       if (theme === 'system') {
         // Reset previous theme to force re-run
         previousTheme.current = null;
       }
    };
    
    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  return null;
}
