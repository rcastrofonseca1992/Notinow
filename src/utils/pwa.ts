/**
 * PWA Configuration and Utilities
 * Handles PWA manifest and meta tags for iOS and Android
 */

export const PWA_CONFIG = {
  name: 'Notinow by Ricardo Fonseca',
  shortName: 'Notinow',
  description: 'Pure RSS News Reader - UX/UI Design, AI, Tennis, Football, and Investing news',
  themeColor: {
    light: '#F8F9FA',
    dark: '#0F172A',
  },
  backgroundColor: {
    light: '#F8F9FA',
    dark: '#0F172A',
  },
  display: 'standalone' as const,
  orientation: 'portrait-primary' as const,
  scope: '/',
  startUrl: '/',
};

/**
 * Initialize PWA meta tags for optimal iOS and Android support
 * Call this on app initialization
 */
export function initializePWAMetaTags(isDarkMode: boolean = false) {
  const themeColor = isDarkMode ? PWA_CONFIG.themeColor.dark : PWA_CONFIG.themeColor.light;
  
  const metaTags = [
    // Standard theme color (Android Chrome, Edge, etc.)
    { name: 'theme-color', content: themeColor },
    
    // iOS meta tags
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'apple-mobile-web-app-title', content: PWA_CONFIG.shortName },
    
    // Microsoft/Windows meta tags
    { name: 'msapplication-navbutton-color', content: themeColor },
    { name: 'msapplication-TileColor', content: themeColor },
    { name: 'msapplication-starturl', content: PWA_CONFIG.startUrl },
    
    // Mobile viewport optimization
    { name: 'mobile-web-app-capable', content: 'yes' },
    
    // Format detection (iOS)
    { name: 'format-detection', content: 'telephone=no' },
  ];
  
  metaTags.forEach(({ name, content }) => {
    let meta = document.querySelector(`meta[name="${name}"]`);
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    
    meta.setAttribute('content', content);
  });
}

/**
 * Generate a manifest.json object dynamically
 * Can be used to create a data URL manifest
 */
export function generateManifest(isDarkMode: boolean = false, iconUrl?: string) {
  const themeColor = isDarkMode ? PWA_CONFIG.themeColor.dark : PWA_CONFIG.themeColor.light;
  const backgroundColor = isDarkMode ? PWA_CONFIG.backgroundColor.dark : PWA_CONFIG.backgroundColor.light;
  
  // Use the provided favicon icon for all sizes
  const iconSrc = iconUrl || '/favicon.png';
  
  return {
    name: PWA_CONFIG.name,
    short_name: PWA_CONFIG.shortName,
    description: PWA_CONFIG.description,
    start_url: PWA_CONFIG.startUrl,
    scope: PWA_CONFIG.scope,
    display: PWA_CONFIG.display,
    orientation: PWA_CONFIG.orientation,
    theme_color: themeColor,
    background_color: backgroundColor,
    icons: [
      {
        src: iconSrc,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: iconSrc,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    categories: ['news', 'productivity'],
    lang: 'en',
    dir: 'ltr',
  };
}

/**
 * Update the manifest link to support dynamic theme changes
 */
export function updateManifestTheme(isDarkMode: boolean, iconUrl?: string) {
  const manifest = generateManifest(isDarkMode, iconUrl);
  const manifestString = JSON.stringify(manifest);
  const blob = new Blob([manifestString], { type: 'application/json' });
  const manifestURL = URL.createObjectURL(blob);
  
  let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
  
  if (!link) {
    link = document.createElement('link');
    link.rel = 'manifest';
    document.head.appendChild(link);
  }
  
  // Revoke old URL if it exists
  if (link.href && link.href.startsWith('blob:')) {
    URL.revokeObjectURL(link.href);
  }
  
  link.href = manifestURL;
}

/**
 * PWA Debug Utilities
 * Helper functions to debug and verify PWA configuration
 */

/**
 * Check if the app is running in standalone mode (installed as PWA)
 */
export function isPWAInstalled(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    
    // Check various PWA display modes
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
    const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;
    
    // iOS Safari specific check
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    return isStandalone || isFullscreen || isMinimalUI || isIOSStandalone;
  } catch {
    return false;
  }
}

/**
 * Get the current display mode
 */
export function getDisplayMode(): string {
  try {
    if (typeof window === 'undefined') return 'browser';
    
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
      return 'fullscreen';
    }
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return 'standalone';
    }
    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      return 'minimal-ui';
    }
    return 'browser';
  } catch {
    return 'browser';
  }
}

/**
 * Get platform information
 */
export function getPlatformInfo() {
  try {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return {
        isIOS: false,
        isAndroid: false,
        isMobile: false,
        isPWA: false,
        displayMode: 'browser',
        userAgent: '',
      };
    }
    
    const ua = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);
    const isMobile = isIOS || isAndroid;
    
    return {
      isIOS,
      isAndroid,
      isMobile,
      isPWA: isPWAInstalled(),
      displayMode: getDisplayMode(),
      userAgent: ua,
    };
  } catch {
    return {
      isIOS: false,
      isAndroid: false,
      isMobile: false,
      isPWA: false,
      displayMode: 'browser',
      userAgent: '',
    };
  }
}

/**
 * Log PWA configuration status (useful for debugging)
 */
export function logPWAStatus() {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.log('PWA Debug: Not running in browser environment');
      return null;
    }
    
    const platform = getPlatformInfo();
    const metaTags = {
      themeColor: document.querySelector('meta[name="theme-color"]')?.getAttribute('content'),
      viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content'),
      appleCapable: document.querySelector('meta[name="apple-mobile-web-app-capable"]')?.getAttribute('content'),
      appleStatusBar: document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')?.getAttribute('content'),
      manifest: document.querySelector('link[rel="manifest"]')?.getAttribute('href'),
    };
    
    const safeAreas = {
      top: getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)') || '0px',
      bottom: getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-bottom)') || '0px',
      left: getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-left)') || '0px',
      right: getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-right)') || '0px',
    };
    
    console.group('🔍 PWA Status');
    console.log('Platform:', platform);
    console.log('Meta Tags:', metaTags);
    console.log('Safe Areas:', safeAreas);
    console.log('Dark Mode:', document.documentElement.classList.contains('dark'));
    console.groupEnd();
    
    return {
      platform,
      metaTags,
      safeAreas,
      isDarkMode: document.documentElement.classList.contains('dark'),
    };
  } catch (error) {
    console.error('Error logging PWA status:', error);
    return null;
  }
}

/**
 * Check if PWA installation is available
 */
export function canInstallPWA(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    // Check if BeforeInstallPromptEvent is supported
    return 'BeforeInstallPromptEvent' in window;
  } catch {
    return false;
  }
}

/**
 * Listen for PWA install prompt
 * Returns a function to trigger the install prompt
 */
export function setupPWAInstallPrompt(
  onPromptAvailable?: () => void,
  onInstalled?: () => void
): (() => Promise<void>) | null {
  try {
    if (typeof window === 'undefined') return null;
    
    let deferredPrompt: any = null;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the default prompt
      e.preventDefault();
      // Save the event for later use
      deferredPrompt = e;
      
      if (onPromptAvailable && typeof onPromptAvailable === 'function') {
        try {
          onPromptAvailable();
        } catch (error) {
          console.error('Error in onPromptAvailable callback:', error);
        }
      }
      
      console.log('💾 PWA install prompt available');
    });
    
    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installed successfully');
      deferredPrompt = null;
      
      if (onInstalled && typeof onInstalled === 'function') {
        try {
          onInstalled();
        } catch (error) {
          console.error('Error in onInstalled callback:', error);
        }
      }
    });
    
    // Return a function to trigger the install prompt
    return async () => {
      if (!deferredPrompt) {
        console.warn('⚠️ PWA install prompt not available');
        return;
      }
      
      try {
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`👤 User response to install prompt: ${outcome}`);
        
        // Clear the saved prompt
        deferredPrompt = null;
      } catch (error) {
        console.error('Error showing install prompt:', error);
      }
    };
  } catch (error) {
    console.error('Error setting up PWA install prompt:', error);
    return null;
  }
}

/**
 * Get safe area inset values
 */
export function getSafeAreaInsets() {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return {
        top: '0px',
        bottom: '0px',
        left: '0px',
        right: '0px',
      };
    }
    
    const style = getComputedStyle(document.documentElement);
    
    // Try to get actual values, fallback to 0
    const getValue = (prop: string) => {
      const value = style.getPropertyValue(prop);
      return value || '0px';
    };
    
    return {
      top: getValue('env(safe-area-inset-top)'),
      bottom: getValue('env(safe-area-inset-bottom)'),
      left: getValue('env(safe-area-inset-left)'),
      right: getValue('env(safe-area-inset-right)'),
    };
  } catch {
    return {
      top: '0px',
      bottom: '0px',
      left: '0px',
      right: '0px',
    };
  }
}

// Export for console debugging
if (typeof window !== 'undefined') {
  try {
    (window as any).pwaDebug = {
      isPWAInstalled,
      getDisplayMode,
      getPlatformInfo,
      logPWAStatus,
      canInstallPWA,
      getSafeAreaInsets,
    };
  } catch (error) {
    console.debug('Could not attach pwaDebug to window:', error);
  }
}
