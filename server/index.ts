import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import Parser from 'rss-parser';
import { promises as fs } from 'node:fs';
import path from 'node:path';

type Topic = 'general' | 'design' | 'ai' | 'sports' | 'economy' | 'wine';

interface FeedConfig {
  name: string;
  url: string;
  topic: Topic;
  country: string;
  language: 'en' | 'es' | 'pt';
}

const RSS_FEEDS: FeedConfig[] = [
  { name: 'Reuters World News', url: 'https://www.reutersagency.com/feed/?best-topics=world', topic: 'general', country: 'global', language: 'en' },
  { name: 'The Guardian World', url: 'https://www.theguardian.com/world/rss', topic: 'general', country: 'uk', language: 'en' },
  { name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml', topic: 'general', country: 'us', language: 'en' },
  { name: 'TechCrunch', url: 'https://feeds.feedburner.com/TechCrunch/', topic: 'ai', country: 'us', language: 'en' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', topic: 'ai', country: 'us', language: 'en' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss', topic: 'ai', country: 'us', language: 'en' },
  { name: 'Financial Times', url: 'https://www.ft.com/world?format=rss', topic: 'economy', country: 'uk', language: 'en' },
  { name: 'MarketWatch', url: 'https://www.marketwatch.com/rss/topstories', topic: 'economy', country: 'us', language: 'en' },
  { name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/rss.xml', topic: 'sports', country: 'uk', language: 'en' },
  { name: 'ESPN', url: 'https://www.espn.com/espn/rss/news', topic: 'sports', country: 'us', language: 'en' },
  { name: 'UX Collective', url: 'https://uxdesign.cc/feed', topic: 'design', country: 'global', language: 'en' },
  { name: 'Smashing Magazine', url: 'https://www.smashingmagazine.com/feed/', topic: 'design', country: 'global', language: 'en' },
  { name: 'Decanter', url: 'https://www.decanter.com/wine-news/feed', topic: 'wine', country: 'global', language: 'en' },
  { name: 'Wine Enthusiast', url: 'https://www.winemag.com/feed/', topic: 'wine', country: 'us', language: 'en' },
  { name: 'El País', url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada', topic: 'general', country: 'es', language: 'es' },
  { name: 'Xataka', url: 'https://www.xataka.com/index.xml', topic: 'ai', country: 'es', language: 'es' },
  { name: 'Público', url: 'https://www.publico.pt/rss', topic: 'general', country: 'pt', language: 'pt' },
  { name: 'Sapo Tek', url: 'https://tek.sapo.pt/rss', topic: 'ai', country: 'pt', language: 'pt' },
];

const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
    ],
  },
});

const cache = new Map<string, { lastFetched: string; articles: any[] }>();
const CACHE_DURATION_MS = 15 * 60 * 1000;
const CACHE_FILE_PATH = process.env.CACHE_FILE_PATH;
const app = new Hono();
let persistTimeout: NodeJS.Timeout | null = null;

app.use('*', logger());
app.use('/api/*', cors());

function cleanHtml(html: string): string {
  return (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveUrl(url: string | undefined | null, baseUrl?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('data:')) return null;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (!baseUrl) return null;
  try {
    return new URL(trimmed, baseUrl).toString();
  } catch {
    return null;
  }
}

function extractImage(item: any, baseUrl?: string): string | null {
  const candidates: Array<string | undefined> = [];

  const enclosureType = item.enclosure?.type || '';
  const isVideo = typeof enclosureType === 'string' && enclosureType.startsWith('video/');
  if (!isVideo) {
    candidates.push(item.enclosure?.url);
  }

  const mediaContent = item.mediaContent || item['media:content'];
  if (Array.isArray(mediaContent)) {
    candidates.push(mediaContent[0]?.url, mediaContent[0]?.$?.url);
  } else {
    candidates.push(mediaContent?.url, mediaContent?.$?.url);
  }

  const mediaThumbnail = item.mediaThumbnail || item['media:thumbnail'];
  if (Array.isArray(mediaThumbnail)) {
    candidates.push(mediaThumbnail[0]?.url, mediaThumbnail[0]?.$?.url);
  } else {
    candidates.push(mediaThumbnail?.url, mediaThumbnail?.$?.url);
  }

  const html = item.contentEncoded || item['content:encoded'] || item.content || item.description || '';
  const img = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  const source = html.match(/<source[^>]+srcset=["']([^"'\s,]+)/i);
  candidates.push(img?.[1], source?.[1]);

  for (const candidate of candidates) {
    const resolved = resolveUrl(candidate, baseUrl);
    if (resolved) return resolved;
  }
  return null;
}

function dedupe(items: any[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.link || ''}|${item.title || ''}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchNews(topic?: string) {
  const feeds = topic && topic !== 'today' ? RSS_FEEDS.filter((f) => f.topic === topic) : RSS_FEEDS;
  const articles = await Promise.all(
    feeds.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        const baseUrl = parsed.link || feed.url;
        return parsed.items.slice(0, 10).map((item: any) => {
          const contentHtml = item.contentEncoded || item['content:encoded'] || item.content || null;
          const summary = cleanHtml(item.contentSnippet || item.description || contentHtml || '').slice(0, 240);
          const contentText = contentHtml ? cleanHtml(contentHtml) : null;
          const hasFull = Boolean(contentText && contentText.length > 400);
          return {
            title: item.title || 'Untitled',
            summary,
            content: contentText,
            contentHtml,
            link: item.link || '',
            urlToImage: extractImage(item, baseUrl),
            source: feed.name,
            topic: feed.topic,
            country: feed.country,
            language: feed.language,
            publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
            author: item.creator || item.author || '',
            guid: item.guid || item.link || '',
            hasFull,
          };
        });
      } catch {
        return [];
      }
    }),
  );

  return dedupe(articles.flat()).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

async function loadCacheFromFile() {
  if (!CACHE_FILE_PATH) return;
  try {
    const fileContents = await fs.readFile(CACHE_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(fileContents) as Record<string, { lastFetched: string; articles: any[] }>;
    for (const [key, value] of Object.entries(parsed || {})) {
      if (value?.lastFetched && Array.isArray(value.articles)) {
        cache.set(key, value);
      }
    }
    console.log(`Loaded ${cache.size} cache entries from ${CACHE_FILE_PATH}`);
  } catch (error: any) {
    if (error?.code !== 'ENOENT') {
      console.error(`Failed to load cache file ${CACHE_FILE_PATH}:`, error);
    }
  }
}

async function persistCacheToFile() {
  if (!CACHE_FILE_PATH) return;
  try {
    await fs.mkdir(path.dirname(CACHE_FILE_PATH), { recursive: true });
    const serialized = JSON.stringify(Object.fromEntries(cache.entries()));
    await fs.writeFile(CACHE_FILE_PATH, serialized, 'utf-8');
  } catch (error) {
    console.error(`Failed to write cache file ${CACHE_FILE_PATH}:`, error);
  }
}

function scheduleCachePersist() {
  if (!CACHE_FILE_PATH) return;
  if (persistTimeout) clearTimeout(persistTimeout);
  persistTimeout = setTimeout(() => {
    void persistCacheToFile();
    persistTimeout = null;
  }, 250);
}

app.get('/api/health', (c) => c.json({ status: 'ok' }));

app.get('/api/feeds/stats', (c) => {
  const byTopic: Record<string, number> = {};
  const byLanguage: Record<string, number> = {};
  for (const feed of RSS_FEEDS) {
    byTopic[feed.topic] = (byTopic[feed.topic] || 0) + 1;
    byLanguage[feed.language] = (byLanguage[feed.language] || 0) + 1;
  }
  return c.json({
    totalFeeds: RSS_FEEDS.length,
    byTopic,
    byLanguage,
    feeds: RSS_FEEDS,
  });
});

app.post('/api/clear-cache', (c) => {
  cache.clear();
  scheduleCachePersist();
  return c.json({ success: true });
});

app.get('/api/rss-news', async (c) => {
  const topic = c.req.query('topic') || 'today';
  const force = c.req.query('force') === '1';
  const key = `rss_${topic}`;
  const existing = cache.get(key);

  if (!force && existing) {
    const age = Date.now() - new Date(existing.lastFetched).getTime();
    if (age < CACHE_DURATION_MS) {
      return c.json({
        articles: existing.articles,
        totalResults: existing.articles.length,
        fromCache: true,
        lastFetched: existing.lastFetched,
      });
    }
  }

  const articles = await fetchNews(topic);
  const payload = {
    articles: articles.slice(0, 500),
    totalResults: articles.length,
    fromCache: false,
    lastFetched: new Date().toISOString(),
  };
  cache.set(key, { articles: payload.articles, lastFetched: payload.lastFetched });
  scheduleCachePersist();
  return c.json(payload);
});

app.use('*', serveStatic({ root: './build' }));
app.get('*', serveStatic({ path: './build/index.html' }));

const port = Number(process.env.PORT || 8787);
void loadCacheFromFile().then(() => {
  serve({ fetch: app.fetch, port });
  console.log(`Notinow self-host server running at http://localhost:${port}`);
  if (CACHE_FILE_PATH) {
    console.log(`File cache enabled at ${CACHE_FILE_PATH}`);
  } else {
    console.log('File cache disabled (set CACHE_FILE_PATH to enable)');
  }
});
