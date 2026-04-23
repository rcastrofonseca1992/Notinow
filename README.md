
# Notinow

Notinow is now a self-hosted RSS web app with no Supabase and no database.

## Local development

- `npm install`
- `npm run dev`

This starts:
- frontend on `http://localhost:3000`
- local RSS API server on `http://localhost:8787`

## Production self-host (ZimaOS friendly)

- `npm install`
- `npm run build`
- `npm run start`

The app server serves both:
- API routes (`/api/rss-news`, `/api/feeds/stats`)
- built frontend from `build/`

## Notes

- No analytics tracking is sent anywhere.
- Default cache is in-memory.
- Optional persisted cache (no DB): set `CACHE_FILE_PATH`, for example:
  - `CACHE_FILE_PATH=.cache/rss-cache.json npm run start`
  - this keeps recent cached articles across restarts.
  