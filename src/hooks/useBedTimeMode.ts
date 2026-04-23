import { useEffect, useState } from 'react';

/**
 * Custom hook for Bed Time Mode management
 * 
 * E-reader inspired design optimized for nighttime reading:
 * - Pure black (#000000) background for OLED power savings
 * - Soft gray text (minimal contrast, like e-ink)
 * - No bright colors or harsh contrasts
 * - Calm, focused reading experience
 * - WCAG AA compliant for accessibility
 * 
 * When enabled, disables light/dark mode toggles
 */
export function useBedTimeMode() {
  const [isBedTimeMode, setIsBedTimeMode] = useState(() => {
    const stored = localStorage.getItem('bedTimeMode');
    return stored === 'true';
  });

  useEffect(() => {
    // Update document class and localStorage
    if (isBedTimeMode) {
      // Remove both light and dark modes when bed time mode is enabled
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('bed-time');
      localStorage.setItem('bedTimeMode', 'true');
      
      // Update PWA theme color to pure black for status bar (OLED)
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#000000');
      }
      
      // Add data attribute for easier CSS targeting
      document.documentElement.setAttribute('data-bed-time', 'true');
    } else {
      // Clean removal of bed time mode
      document.documentElement.classList.remove('bed-time');
      document.documentElement.removeAttribute('data-bed-time');
      localStorage.setItem('bedTimeMode', 'false');
      
      // Restore dark mode if it was enabled before
      const wasDark = localStorage.getItem('darkMode') === 'true';
      if (wasDark) {
        document.documentElement.classList.add('dark');
        // Restore dark mode theme color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          metaThemeColor.setAttribute('content', '#0F172A');
        }
      } else {
        // Light mode theme color
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          metaThemeColor.setAttribute('content', '#FFFFFF');
        }
      }
    }
  }, [isBedTimeMode]);

  const toggleBedTimeMode = () => {
    const newState = !isBedTimeMode;
    setIsBedTimeMode(newState);
  };

  return { 
    isBedTimeMode, 
    toggleBedTimeMode,
  };
}
