/**
 * Analytics utilities for tracking user interactions
 * Sends events to Supabase Edge Function for storage in KV store
 */

import { projectId, publicAnonKey } from './supabase/info';

// Queue for batching analytics events
let eventQueue: any[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

// Send analytics event to server
async function sendAnalyticsEvent(type: string, name?: string, metadata?: any) {
  if (typeof window === 'undefined') return;
  
  const event = {
    type,
    name,
    path: window.location.pathname,
    referrer: document.referrer || undefined,
    metadata: metadata || undefined,
    timestamp: new Date().toISOString(),
  };
  
  // Add to queue
  eventQueue.push(event);
  
  // Schedule flush (debounced to 2 seconds)
  if (flushTimeout) {
    clearTimeout(flushTimeout);
  }
  
  flushTimeout = setTimeout(() => {
    flushEvents();
  }, 2000);
  
  // Also flush immediately if queue is large
  if (eventQueue.length >= 10) {
    flushEvents();
  }
}

// Flush queued events to server
async function flushEvents() {
  if (eventQueue.length === 0) return;
  
  const eventsToSend = [...eventQueue];
  eventQueue = [];
  
  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }
  
  // Send all events in parallel (fire and forget)
  eventsToSend.forEach(event => {
    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b78002f5/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(event),
    }).catch(err => {
      // Silently fail - analytics shouldn't break the app
      console.debug('Analytics error:', err);
    });
  });
}

// Flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    flushEvents();
  });
}

export const Analytics = {
  // Track page views
  trackPageView: () => {
    sendAnalyticsEvent('pageview');
    console.debug('📊 Page view tracked');
  },

  // Track events
  trackEvent: (category: string, action: string, label?: string, metadata?: any) => {
    const eventName = `${category}_${action}`;
    const eventMetadata = {
      category,
      action,
      label,
      ...metadata,
    };
    sendAnalyticsEvent('event', eventName, eventMetadata);
    console.debug(`📊 Event: ${category} - ${action}${label ? ` - ${label}` : ''}`);
  },

  // Topic changes
  topicChanged: (topic: string) => {
    Analytics.trackEvent('navigation', 'topic_changed', topic);
  },

  // Article interactions
  articleOpened: (data: { title: string; source: string; topic: string }) => {
    Analytics.trackEvent('article', 'opened', `${data.source} - ${data.topic}`);
  },

  // Feature usage
  fullArticlesToggled: (enabled: boolean) => {
    Analytics.trackEvent('feature', 'full_articles_toggled', enabled ? 'enabled' : 'disabled');
  },

  darkModeToggled: (enabled: boolean) => {
    Analytics.trackEvent('feature', 'dark_mode_toggled', enabled ? 'enabled' : 'disabled');
  },

  pullToRefresh: () => {
    Analytics.trackEvent('interaction', 'pull_to_refresh');
  },

  refreshClicked: () => {
    Analytics.trackEvent('interaction', 'refresh_clicked');
  },

  // Article actions
  articleSaved: (title: string) => {
    Analytics.trackEvent('article', 'saved', title);
  },

  articleUnsaved: (title: string) => {
    Analytics.trackEvent('article', 'unsaved', title);
  },

  articleShared: (title: string) => {
    Analytics.trackEvent('article', 'shared', title);
  },

  // Bed time mode tracking
  bedTimeModeToggled: (enabled: boolean) => {
    Analytics.trackEvent('feature', 'bed_time_mode_toggled', enabled ? 'enabled' : 'disabled', {
      timeOfDay: new Date().getHours(),
    });
  },

  // Language filter
  languageFilterChanged: (languages: string[]) => {
    Analytics.trackEvent('feature', 'language_filter_changed', languages.join(','), {
      count: languages.length,
    });
  },

  // Settings opened
  settingsOpened: () => {
    Analytics.trackEvent('navigation', 'settings_opened');
  },

  // PWA install
  pwaInstallPrompted: () => {
    Analytics.trackEvent('pwa', 'install_prompted');
  },

  pwaInstallAccepted: () => {
    Analytics.trackEvent('pwa', 'install_accepted');
  },

  pwaInstallDismissed: () => {
    Analytics.trackEvent('pwa', 'install_dismissed');
  },
};

// Export trackPageView as named export for backwards compatibility
export const trackPageView = Analytics.trackPageView;

// Debug helper - view analytics in console
if (typeof window !== 'undefined') {
  (window as any).viewAnalytics = async (date?: string) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b78002f5/analytics?date=${targetDate}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      console.log('📊 Analytics Data:', data);
      console.log(`\n📅 Date: ${data.date}`);
      console.log(`👁️  Pageviews: ${data.pageviews}`);
      console.log(`✨ Custom Events: ${data.customEvents}`);
      console.log(`📈 Total Events: ${data.count}`);
      console.log('\n🎯 Event Breakdown:');
      Object.entries(data.eventTypes || {})
        .sort(([, a]: any, [, b]: any) => b - a)
        .forEach(([name, count]) => {
          console.log(`  ${name}: ${count}`);
        });
      console.log('\n💡 Recent Events:', data.events.slice(0, 10));
      return data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };
  
  console.log('💡 Analytics Debug Helper loaded! Try: viewAnalytics() or viewAnalytics("2024-11-16")');
}