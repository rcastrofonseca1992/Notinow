import { useEffect } from 'react';
import faviconImage from 'figma:asset/623ca8df0e25aaece2310491e7215ad46587656d.png';

/**
 * FaviconLinks Component
 * Manages all favicon and app icon links
 * Uses the Notinow favicon image for all icons
 */
export function FaviconLinks() {
  useEffect(() => {
    // Update or create favicon link
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = faviconImage;
    
    // Add shortcut icon
    let shortcutIcon = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement;
    if (!shortcutIcon) {
      shortcutIcon = document.createElement('link');
      shortcutIcon.rel = 'shortcut icon';
      document.head.appendChild(shortcutIcon);
    }
    shortcutIcon.href = faviconImage;
    
    // Add Apple Touch Icon (iOS home screen)
    let appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
    if (!appleTouchIcon) {
      appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleTouchIcon);
    }
    appleTouchIcon.href = faviconImage;
    
    // Add Apple Touch Icon with sizes for better iOS support
    const appleSizes = ['180x180', '167x167', '152x152', '120x120'];
    appleSizes.forEach(size => {
      let sizedIcon = document.querySelector(`link[rel="apple-touch-icon"][sizes="${size}"]`) as HTMLLinkElement;
      if (!sizedIcon) {
        sizedIcon = document.createElement('link');
        sizedIcon.rel = 'apple-touch-icon';
        sizedIcon.sizes = size;
        document.head.appendChild(sizedIcon);
      }
      sizedIcon.href = faviconImage;
    });
    
    // Add mask icon for Safari pinned tabs (optional, but good to have)
    let maskIcon = document.querySelector('link[rel="mask-icon"]') as HTMLLinkElement;
    if (!maskIcon) {
      maskIcon = document.createElement('link');
      maskIcon.rel = 'mask-icon';
      maskIcon.setAttribute('color', '#FBBF24'); // Yellow color from logo
      document.head.appendChild(maskIcon);
    }
    maskIcon.href = faviconImage;
    
  }, []);
  
  // Export the favicon URL so other components can use it
  return null;
}

// Export the favicon URL for use in other components
export const faviconUrl = faviconImage;
