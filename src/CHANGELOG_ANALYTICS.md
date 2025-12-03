# Analytics & Sports Category Update

## Date: November 17, 2024

### 🎯 Major Changes

#### 1. Comprehensive Analytics System
✅ **Dual-layer tracking system implemented:**
- **Inline Script** (`/components/AnalyticsScript.tsx`): Immediate pageview tracking before React loads
- **React-based Analytics** (`/utils/analytics.ts`): User interaction tracking with intelligent batching

✅ **Backend Integration:**
- Events stored in Supabase KV store (`analytics_YYYY-MM-DD`)
- Daily aggregation with automatic event type counting
- 10,000 events per day limit (auto-trimmed)

✅ **Tracked Events:**
- Pageviews (both inline script + React)
- Navigation: topic changes, settings opened
- Features: dark mode, bed mode (manual + auto), full articles toggle, language filter
- Articles: opened, saved, unsaved, shared
- Interactions: pull to refresh, manual refresh
- PWA: install prompted, accepted, dismissed

✅ **Developer Tools:**
- Browser console helper: `viewAnalytics()` or `viewAnalytics('2024-11-17')`
- Detailed logging with emoji indicators
- AnalyticsDashboard component (can be added to UI if needed)

✅ **Privacy-First:**
- No external services
- No PII collected
- No cookies
- All data in your Supabase instance

#### 2. Sports Category Merge
✅ **Merged tennis + football into single "Sports" category:**
- Updated TypeScript types (`/types/index.ts`)
- Updated frontend constants (`/constants/index.ts`)
- Updated backend RSS feeds (`/supabase/functions/server/index.tsx`)
- Updated cache clearing logic
- Topic nav now shows: All, UX, AI, Sports, Invest, Saved

### 📁 New Files Created

1. **`/components/AnalyticsScript.tsx`**
   - Inline script component for immediate pageview tracking
   - Uses native fetch, zero dependencies
   - Executes before React hydration

2. **`/components/AnalyticsDashboard.tsx`**
   - Optional dashboard UI for viewing analytics
   - Date selector, stats overview, event breakdown
   - Can be integrated into settings or accessed separately

3. **`/ANALYTICS.md`**
   - Comprehensive documentation
   - Usage examples, API reference
   - Privacy notes, implementation details

4. **`/CHANGELOG_ANALYTICS.md`** (this file)
   - Summary of all changes

### 🔧 Modified Files

1. **`/utils/analytics.ts`**
   - Added batched event sending (2s debounce or 10 event batch)
   - Integrated with Supabase Edge Function
   - Added console debug helper `viewAnalytics()`
   - New tracking methods for bed mode, PWA, language filter

2. **`/App.tsx`**
   - Import AnalyticsScript component
   - Added to render at top of app
   - Settings button now tracks opens

3. **`/hooks/useBedMode.ts`**
   - Import Analytics
   - Track manual bed mode toggles
   - Track auto-enabled bed mode (22:00-06:00)

4. **`/components/PWAInstallPrompt.tsx`**
   - Import Analytics
   - Track PWA install prompted, accepted, dismissed

5. **`/components/Settings.tsx`**
   - Added "Analytics tracking active" indicator in footer

6. **`/types/index.ts`**
   - Changed `'tennis' | 'football'` to `'sports'`
   - Updated Topic type

7. **`/constants/index.ts`**
   - Merged Tennis + Football into Sports
   - Updated TOPICS array
   - Updated RSS_FEEDS array

8. **`/supabase/functions/server/index.tsx`**
   - Changed `topic: 'tennis'` to `topic: 'sports'` for all sports feeds
   - Updated clear-cache endpoint topics array

### 🧪 Testing

#### Test Analytics Tracking:
1. Open browser console
2. Navigate around the app
3. After 2 seconds, run: `await viewAnalytics()`
4. You should see:
   - Pageviews count
   - Event breakdown
   - Recent events list

#### Test Sports Category:
1. Click "Sports" topic nav
2. Should see combined tennis + football content
3. All language filters (EN, PT, ES) should work

#### Verify Events Are Stored:
```bash
# Via API
curl "https://wenzyegtbzyfgbkmtvyp.supabase.co/functions/v1/make-server-b78002f5/analytics?date=2024-11-17" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 📊 Analytics Data Structure

```typescript
{
  date: "2024-11-17",
  count: 150,              // Total events
  pageviews: 45,           // Pageview events
  customEvents: 105,       // Non-pageview events
  eventTypes: {
    "navigation_topic_changed": 20,
    "article_opened": 35,
    "feature_bed_mode_toggled": 5
  },
  events: [...]            // Last 100 events
}
```

### 🎨 UI Changes

- Topic nav: "Tennis" + "Football" → "Sports" (single button)
- Settings footer: Added "Analytics tracking active" text
- No visual changes to analytics (runs in background)

### 🚀 Performance Impact

- Inline script: ~1KB, executes in <1ms
- React analytics: Batched sends, ~2KB overhead
- Network: 1 request per 2 seconds max (or 10 events)
- Storage: ~100KB per 10,000 events in KV store

### 📝 Next Steps (Optional)

1. Add AnalyticsDashboard to Settings UI
2. Implement data retention (auto-delete old analytics)
3. Add more granular event tracking as needed
4. Export analytics data to CSV
5. Create weekly/monthly aggregation reports

### ⚠️ Important Notes

- Analytics endpoint at: `/make-server-b78002f5/analytics`
- Events stored with key pattern: `analytics_YYYY-MM-DD`
- 10,000 event limit per day (configurable in server)
- Failed analytics requests silently fail (by design)
- No retry logic (analytics shouldn't break app)

### 🔗 Related Documentation

- See `/ANALYTICS.md` for full documentation
- See `/supabase/functions/server/index.tsx` lines 552-687 for backend code
- See `/utils/analytics.ts` for frontend implementation
