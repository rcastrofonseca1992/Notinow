# Analytics System Documentation

## Overview

Notinow includes a privacy-focused analytics system that tracks user interactions without external services. All data is stored in your Supabase KV store.

## Features

- **Immediate Pageview Tracking**: Inline script captures pageviews before React loads
- **React-based Event Tracking**: Captures user interactions (clicks, toggles, etc.)
- **Daily Aggregation**: Events are grouped by date for easy analysis
- **Batched Sending**: Events are queued and sent in batches to reduce network requests
- **Fire-and-Forget**: Analytics never block user interactions or slow down the app
- **Dual Tracking**: Combines immediate inline script + React-based analytics for complete coverage

## Tracked Events

### Automatic Events
- `pageview` - Page loads

### User Interactions
- `navigation_topic_changed` - Topic filter changed
- `navigation_settings_opened` - Settings panel opened
- `feature_dark_mode_toggled` - Dark mode toggle
- `feature_bed_mode_toggled` - Bed mode toggle (manual)
- `feature_bed_mode_auto_enabled` - Bed mode auto-enabled (22:00-06:00)
- `feature_full_articles_toggled` - Full articles filter toggle
- `feature_language_filter_changed` - Language selection changed
- `article_opened` - Article viewed
- `article_saved` - Article bookmarked
- `article_unsaved` - Article removed from bookmarks
- `article_shared` - Article shared
- `interaction_pull_to_refresh` - Pull to refresh gesture
- `interaction_refresh_clicked` - Manual refresh button clicked
- `pwa_install_prompted` - PWA install prompt shown
- `pwa_install_accepted` - User installed PWA
- `pwa_install_dismissed` - User dismissed PWA prompt

## Data Structure

Each event contains:
```typescript
{
  type: 'pageview' | 'event',
  name?: string,           // Event name (e.g., 'navigation_topic_changed')
  path: string,            // URL path
  referrer?: string,       // Referrer URL
  metadata?: object,       // Additional context
  timestamp: string        // ISO timestamp
}
```

## Storage

Events are stored in the KV store with keys:
- `analytics_{YYYY-MM-DD}` - Contains all events for that date
- Maximum 10,000 events per day (auto-trimmed)

## Viewing Analytics

### Browser Console
Open the browser console and use:
```javascript
// View today's analytics
await viewAnalytics()

// View specific date
await viewAnalytics('2024-11-17')
```

### API Endpoint
```bash
# Get analytics for today
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-b78002f5/analytics \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Get analytics for specific date
curl "https://YOUR_PROJECT.supabase.co/functions/v1/make-server-b78002f5/analytics?date=2024-11-17" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Response Format
```json
{
  "date": "2024-11-17",
  "count": 150,
  "pageviews": 45,
  "customEvents": 105,
  "eventTypes": {
    "navigation_topic_changed": 20,
    "article_opened": 35,
    "feature_bed_mode_toggled": 5
  },
  "events": [...]
}
```

## Privacy & Compliance

- ✅ No external tracking services
- ✅ No cookies or localStorage for tracking
- ✅ No personally identifiable information (PII)
- ✅ No cross-site tracking
- ✅ Data stored in your own Supabase instance
- ✅ Can be disabled by removing analytics calls

## Performance

- Events are batched and sent every 2 seconds
- Maximum batch size: 10 events
- Fire-and-forget: Never blocks UI
- Automatic flush on page unload
- Minimal network overhead

## Implementation Details

### Inline Script (`/components/AnalyticsScript.tsx`)
- Executes immediately on page load
- Sends initial pageview before React hydration
- Uses native fetch API
- Zero dependencies, maximum performance

### Frontend (`/utils/analytics.ts`)
- Event queue with debounced flushing
- Batch sending to reduce requests
- Debug helper in console
- React-based tracking for user interactions

### Backend (`/supabase/functions/server/index.tsx`)
- POST `/analytics` - Store event
- GET `/analytics?date=YYYY-MM-DD` - Retrieve analytics
- Daily aggregation with event type counting
- Automatic event trimming (10k limit per day)

## Extending Analytics

To add new event types:

```typescript
// 1. Add method to Analytics object in /utils/analytics.ts
myCustomEvent: (data: any) => {
  Analytics.trackEvent('category', 'action', 'label', { 
    customField: data 
  });
}

// 2. Call it in your component
import { Analytics } from '../utils/analytics';

Analytics.myCustomEvent({ someData: 'value' });
```

## Disabling Analytics

To disable analytics:
1. Remove or comment out `Analytics` calls in components
2. Or modify `sendAnalyticsEvent()` to return early

## Data Retention

Currently, analytics data is stored indefinitely. To implement retention:

```typescript
// Add to server endpoint
const cutoffDate = new Date();
cutoffDate.setDate(cutoffDate.getDate() - 90); // 90 days
await kv.del(`analytics_${cutoffDate.toISOString().split('T')[0]}`);
```

## Notes

- Analytics are stored in KV store, not a traditional database
- For high-traffic apps, consider moving to a real analytics service
- Current limit: 10,000 events per day per date key
- Events are never retried if sending fails (by design)
