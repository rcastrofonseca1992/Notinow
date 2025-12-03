import { useEffect } from 'react';
import { updateManifestTheme, initializePWAMetaTags, PWA_CONFIG } from '../utils/pwa';
import { faviconUrl } from '../components/FaviconLinks';

/**
 * Custom hook to manage PWA theme color for iOS and Android status bars
 * Updates the theme-color meta tag and manifest based on dark mode state
 */
export function useThemeColor(isDarkMode: boolean) {
  // Initialize PWA meta tags on mount
  useEffect(() => {
    initializePWAMetaTags(isDarkMode);
  }, []);
  
  // Update theme colors when dark mode changes
  useEffect(() => {
    const themeColor = isDarkMode ? PWA_CONFIG.themeColor.dark : PWA_CONFIG.themeColor.light;
    
    // Update theme-color meta tag
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColor);
    }
    
    // Update msapplication-navbutton-color
    const msNavButton = document.querySelector('meta[name="msapplication-navbutton-color"]');
    if (msNavButton) {
      msNavButton.setAttribute('content', themeColor);
    }
    
    // Update msapplication-TileColor
    const msTileColor = document.querySelector('meta[name="msapplication-TileColor"]');
    if (msTileColor) {
      msTileColor.setAttribute('content', themeColor);
    }
    
    // Update manifest with new theme and favicon icon
    updateManifestTheme(isDarkMode, faviconUrl);
    
  }, [isDarkMode]);
}
