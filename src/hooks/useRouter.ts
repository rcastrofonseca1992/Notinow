import { useState, useEffect, useCallback } from 'react';

export interface Route {
  path: 'home' | 'article' | 'saved';
  params?: Record<string, string>;
}

interface ScrollPosition {
  route: string;
  scrollY: number;
  timestamp: number;
}

const SCROLL_POSITIONS_KEY = 'notinow_scroll_positions';
const MAX_STORED_POSITIONS = 10;

/**
 * Custom router hook for navigation
 * Uses hash-based routing for PWA compatibility
 */
export function useRouter() {
  // CRITICAL: Initialize from window.location.hash to support deep links
  const [currentRoute, setCurrentRoute] = useState<Route>(() => {
    const initialRoute = parseRoute(window.location.hash);
    console.log('Router initialized with route:', initialRoute);
    return initialRoute;
  });
  
  const [scrollPositions, setScrollPositions] = useState<ScrollPosition[]>(() => {
    try {
      const stored = localStorage.getItem(SCROLL_POSITIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Parse hash to route
  function parseRoute(hash: string): Route {
    // Remove leading #
    const path = hash.slice(1) || '/';
    
    // Parse article route: #/article/:articleId
    const articleMatch = path.match(/^\/article\/(.+)$/);
    if (articleMatch) {
      const articleId = decodeURIComponent(articleMatch[1]);
      console.log('Parsed article route with ID:', articleId);
      return {
        path: 'article',
        params: { articleId }
      };
    }

    // Parse saved route: #/saved
    if (path === '/saved' || path === '/saved/') {
      return { path: 'saved' };
    }
    
    // Default to home
    return { path: 'home' };
  }

  // Build hash from route
  function buildHash(route: Route): string {
    if (route.path === 'article' && route.params?.articleId) {
      return `#/article/${encodeURIComponent(route.params.articleId)}`;
    }
    if (route.path === 'saved') {
      return '#/saved';
    }
    return '#/';
  }

  // Save scroll position for current route
  const saveScrollPosition = useCallback((route: Route, scrollY: number) => {
    const routeKey = buildHash(route);
    setScrollPositions(prev => {
      const filtered = prev.filter(p => p.route !== routeKey);
      const updated = [
        { route: routeKey, scrollY, timestamp: Date.now() },
        ...filtered
      ].slice(0, MAX_STORED_POSITIONS);
      
      try {
        localStorage.setItem(SCROLL_POSITIONS_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      
      return updated;
    });
  }, []);

  // Get saved scroll position for route
  const getScrollPosition = useCallback((route: Route): number => {
    const routeKey = buildHash(route);
    const position = scrollPositions.find(p => p.route === routeKey);
    return position?.scrollY ?? 0;
  }, [scrollPositions]);

  // Navigate to a route
  const navigate = useCallback((route: Route) => {
    // Save current scroll position before navigating
    saveScrollPosition(currentRoute, window.scrollY);
    
    const hash = buildHash(route);
    window.location.hash = hash;
  }, [currentRoute, saveScrollPosition]);

  // Go back
  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to home
      navigate({ path: 'home' });
    }
  }, [navigate]);

  // Listen to hash changes
  useEffect(() => {
    // Disable scroll restoration to prevent flickering
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const handleHashChange = () => {
      const newRoute = parseRoute(window.location.hash);
      console.log('Hash changed, new route:', newRoute);
      setCurrentRoute(newRoute);
    };

    const handlePopState = (e: PopStateEvent) => {
      // Sync state immediately on back/forward
      const newRoute = parseRoute(window.location.hash);
      setCurrentRoute(newRoute);
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [getScrollPosition]);

  // Save scroll position periodically while on a route
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          saveScrollPosition(currentRoute, window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentRoute, saveScrollPosition]);

  return {
    currentRoute,
    navigate,
    goBack,
    parseRoute,
    buildHash
  };
}