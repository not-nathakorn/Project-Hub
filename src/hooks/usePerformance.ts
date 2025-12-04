import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to scroll to top on route change
 * Improves UX by ensuring users start at the top of each page
 */
export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });
  }, [pathname]);
};

/**
 * Custom hook for debouncing values
 * Useful for search inputs and resize handlers
 */
export const useDebounce = <T,>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for lazy loading images
 * Improves initial page load performance
 */
export const useLazyLoad = (ref: React.RefObject<HTMLElement>) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return isVisible;
};

/**
 * Custom hook for prefetching data
 * Improves perceived performance
 */
export const usePrefetch = () => {
  const prefetchData = async (url: string) => {
    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    } catch (error) {
      console.error('Prefetch error:', error);
    }
  };

  return { prefetchData };
};
