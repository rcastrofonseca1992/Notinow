// Application constants and configuration

import { Topic } from '../types';

// Topic-based navigation
export const TOPICS: { value: Topic; label: string; color: string }[] = [
  { value: 'design', label: 'UX', color: '#2563EB' },
  { value: 'ai', label: 'AI', color: '#2563EB' },
  { value: 'sports', label: 'Sports', color: '#16A34A' },
  { value: 'economy', label: 'Economy', color: '#0D9488' },
  { value: 'wine', label: 'Wine', color: '#9F1239' },
];

export const API_CONFIG = {
  CACHE_DURATION_MS: 30 * 60 * 1000, // 30 minutes
  AUTO_REFRESH_INTERVAL: 15 * 60 * 1000, // 15 minutes
  MAX_CACHED_ARTICLES: 100,
  DEBOUNCE_DELAY: 300,
} as const;

export const APP_CONFIG = {
  // Your production domain
  DOMAIN: 'https://notinow.xyz',
  // Always use current origin for now until custom domain is configured
  getAppUrl: () => {
    if (typeof window !== 'undefined') {
      // Always use the current origin where the app is actually running
      // This ensures share links work regardless of the domain
      return window.location.origin;
    }
    // Fallback (shouldn't reach here in browser)
    return 'https://notinow.xyz';
  }
} as const;

export const BRAND_COLORS = {
  lightBackground: '#F8F9FA',
  darkBackground: '#1E293B',
  neutralText: '#1E293B',
  mutedText: '#64748B',
  accentBlue: '#2563EB',
  border: '#E2E8F0',
} as const;

export const READER_SETTINGS = {
  MIN_FONT_SIZE: 14,
  MAX_FONT_SIZE: 24,
  DEFAULT_FONT_SIZE: 16,
} as const;

// Source classifications
export const PREMIUM_SOURCES = [
  'Financial Times',
  'The Economist',
  'Bloomberg',
  'Wall Street Journal',
  'New York Times',
  'Washington Post',
  'HBR',
  'Harvard Business Review',
  'Medium',
  'Wired',
  'The Atlantic',
  'New Yorker',
  'Quanta Magazine', // Often technical/niche but free access usually
  'National Geographic',
];

export const FREE_SOURCES = [
  'BBC',
  'Reuters',
  'AP News',
  'NPR',
  'The Guardian',
  'Al Jazeera',
  'CBC',
  'ABC News',
  'CNN',
  'Fox News',
  'Sky News',
  'France 24',
  'Deutsche Welle',
  'VentureBeat',
  'TechCrunch',
  'The Verge',
  'Ars Technica',
  'Engadget',
  'Gizmodo',
  'Mashable',
  'UX Collective', // Medium but often free link
  'Smashing Magazine',
  'A List Apart',
  'WebDesignerDepot',
  'Google AI Blog',
  'NASA',
  'Space.com',
  'LiveScience',
  'Science Daily',
];
