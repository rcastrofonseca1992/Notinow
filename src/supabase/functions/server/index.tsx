import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import Parser from "npm:rss-parser";

const app = new Hono();
const rssParser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['og:image', 'ogImage'],
    ]
  }
});

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-b78002f5/health", (c) => {
  return c.json({ status: "ok" });
});

// RSS Feeds stats endpoint
app.get("/make-server-b78002f5/feeds/stats", (c) => {
  try {
    const byTopic: Record<string, number> = {};
    const byLanguage: Record<string, number> = {};
    
    RSS_FEEDS.forEach(feed => {
      byTopic[feed.topic] = (byTopic[feed.topic] || 0) + 1;
      byLanguage[feed.language] = (byLanguage[feed.language] || 0) + 1;
    });
    
    return c.json({
      totalFeeds: RSS_FEEDS.length,
      byTopic,
      byLanguage,
      feeds: RSS_FEEDS.map(f => ({
        name: f.name,
        topic: f.topic,
        language: f.language,
        country: f.country,
      })),
    });
  } catch (error) {
    console.error('Error fetching feeds stats:', error);
    return c.json({ error: 'Failed to fetch feeds stats' }, 500);
  }
});

// RSS Feed definitions
const RSS_FEEDS = [
  // ============================================
  // WORLD NEWS (Top Tier International)
  // ============================================
  { name: 'Reuters World News', url: 'https://www.reutersagency.com/feed/?best-topics=world', topic: 'general', country: 'global', language: 'en' },
  { name: 'AP News', url: 'https://apnews.com/rss', topic: 'general', country: 'us', language: 'en' },
  { name: 'The Guardian World', url: 'https://www.theguardian.com/world/rss', topic: 'general', country: 'uk', language: 'en' },
  { name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml', topic: 'general', country: 'us', language: 'en' },
  { name: 'Deutsche Welle', url: 'https://rss.dw.com/rdf/rss-en-top', topic: 'general', country: 'global', language: 'en' },
  { name: 'ABC News US', url: 'https://abcnews.go.com/abcnews/topstories', topic: 'general', country: 'us', language: 'en' },
  { name: 'Politico', url: 'https://www.politico.com/rss/totals.xml', topic: 'general', country: 'us', language: 'en' },

  // ============================================
  // TECH & INNOVATION (Top Tier)
  // ============================================
  { name: 'TechCrunch', url: 'https://feeds.feedburner.com/TechCrunch/', topic: 'ai', country: 'us', language: 'en' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', topic: 'ai', country: 'us', language: 'en' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss', topic: 'ai', country: 'us', language: 'en' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index/', topic: 'ai', country: 'global', language: 'en' },
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/', topic: 'ai', country: 'us', language: 'en' },
  { name: 'Engadget', url: 'https://www.engadget.com/rss.xml', topic: 'ai', country: 'us', language: 'en' },
  { name: 'Gizmodo', url: 'https://gizmodo.com/rss', topic: 'ai', country: 'us', language: 'en' },
  { name: 'Mashable', url: 'https://mashable.com/feeds/rss', topic: 'ai', country: 'global', language: 'en' },
  { name: 'Scientific American', url: 'https://www.scientificamerican.com/feed/', topic: 'ai', country: 'us', language: 'en' },
  { name: 'Popular Science', url: 'https://popsci.com/rss', topic: 'ai', country: 'us', language: 'en' },

  // ============================================
  // AI / DATA SCIENCE / MACHINE LEARNING
  // ============================================
  { name: 'The Decoder', url: 'https://the-decoder.com/feed/', topic: 'ai', country: 'global', language: 'en' },
  { name: 'KDnuggets', url: 'https://www.kdnuggets.com/feed', topic: 'ai', country: 'global', language: 'en' },
  { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/', topic: 'ai', country: 'us', language: 'en' },
  { name: 'Machine Learning Mastery', url: 'https://machinelearningmastery.com/blog/feed/', topic: 'ai', country: 'global', language: 'en' },
  { name: 'Google AI Blog', url: 'https://ai.googleblog.com/atom.xml', topic: 'ai', country: 'global', language: 'en' },
  { name: 'InfoQ', url: 'https://www.infoq.com/feed', topic: 'ai', country: 'global', language: 'en' },
  { name: 'BD Tech Talks', url: 'https://bdtechtalks.com/feed/', topic: 'ai', country: 'global', language: 'en' },
  { name: 'Nature ML', url: 'https://www.nature.com/subjects/machine-learning.rss', topic: 'ai', country: 'global', language: 'en' },

  // ============================================
  // BUSINESS / MARKETS / ECONOMY
  // ============================================
  { name: 'Financial Times', url: 'https://www.ft.com/world?format=rss', topic: 'economy', country: 'uk', language: 'en' },
  { name: 'Bloomberg', url: 'https://www.bloomberg.com/feeds/', topic: 'economy', country: 'us', language: 'en' },
  { name: 'The Economist', url: 'https://www.economist.com/latest/rss.xml', topic: 'economy', country: 'global', language: 'en' },
  { name: 'MarketWatch', url: 'https://www.marketwatch.com/rss/topstories', topic: 'economy', country: 'us', language: 'en' },
  { name: 'CNBC', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.xml', topic: 'economy', country: 'us', language: 'en' },
  { name: 'A Wealth of Common Sense', url: 'https://awealthofcommonsense.com/feed/', topic: 'economy', country: 'us', language: 'en' },

  // ============================================
  // SPORTS (Football, Tennis, US Sports)
  // ============================================
  { name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/rss.xml', topic: 'sports', country: 'uk', language: 'en' },
  { name: 'ESPN', url: 'https://www.espn.com/espn/rss/news', topic: 'sports', country: 'us', language: 'en' },
  { name: 'Sky Sports', url: 'https://www.skysports.com/rss/12040', topic: 'sports', country: 'uk', language: 'en' },
  { name: 'Eurosport Tennis', url: 'https://www.eurosport.com/rss.xml', topic: 'sports', country: 'global', language: 'en' },

  // ============================================
  // UX/UI DESIGN
  // ============================================
  { name: 'UX Collective', url: 'https://uxdesign.cc/feed', topic: 'design', country: 'global', language: 'en' },
  { name: 'Smashing Magazine', url: 'https://www.smashingmagazine.com/feed/', topic: 'design', country: 'global', language: 'en' },
  { name: 'Nielsen Norman Group', url: 'https://www.nngroup.com/feed/rss/', topic: 'design', country: 'us', language: 'en' },
  { name: 'A List Apart', url: 'https://alistapart.com/main/feed/', topic: 'design', country: 'global', language: 'en' },
  { name: 'WebDesignerDepot', url: 'https://www.webdesignerdepot.com/feed/', topic: 'design', country: 'global', language: 'en' },

  // ============================================
  // SCIENCE / SPACE / HEALTH
  // ============================================
  { name: 'Nature', url: 'https://www.nature.com/nature.rss', topic: 'general', country: 'global', language: 'en' },
  { name: 'NASA', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', topic: 'general', country: 'us', language: 'en' },
  { name: 'Space.com', url: 'https://www.space.com/feeds/all', topic: 'general', country: 'us', language: 'en' },
  { name: 'LiveScience', url: 'https://www.livescience.com/feeds/all', topic: 'general', country: 'global', language: 'en' },
  { name: 'New Scientist', url: 'https://www.newscientist.com/feed/home/', topic: 'general', country: 'global', language: 'en' },
  { name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/all.xml', topic: 'general', country: 'global', language: 'en' },
  { name: 'Wired Science', url: 'https://www.wired.com/feed/category/science/latest/rss', topic: 'general', country: 'us', language: 'en' },
  { name: 'The Economist Science', url: 'https://www.economist.com/science-and-technology/rss.xml', topic: 'general', country: 'global', language: 'en' },

  // ============================================
  // CULTURE / LIFESTYLE / LONGFORM JOURNALISM
  // ============================================
  { name: 'The Atlantic', url: 'https://www.theatlantic.com/feed/latest/', topic: 'general', country: 'us', language: 'en' },
  { name: 'Vox', url: 'https://www.vox.com/rss/index.xml', topic: 'general', country: 'us', language: 'en' },
  { name: 'The New York Review of Books', url: 'https://www.nybooks.com/feed/', topic: 'general', country: 'us', language: 'en' },
  { name: 'The New Yorker', url: 'https://www.newyorker.com/feed/news', topic: 'general', country: 'us', language: 'en' },
  { name: 'Quanta Magazine', url: 'https://www.quantamagazine.org/feed/', topic: 'general', country: 'us', language: 'en' },

  // ============================================
  // SPANISH SOURCES
  // ============================================
  // Sports - Spanish
  { name: 'Marca', url: 'https://e00-marca.uecdn.es/rss/portada.xml', topic: 'sports', country: 'es', language: 'es' },
  { name: 'Mundo Deportivo', url: 'https://www.mundodeportivo.com/rss/home.xml', topic: 'sports', country: 'es', language: 'es' },
  
  // General News - Spanish
  { name: 'El País', url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada', topic: 'general', country: 'es', language: 'es' },
  { name: 'El Mundo', url: 'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml', topic: 'general', country: 'es', language: 'es' },
  { name: 'ABC España', url: 'https://www.abc.es/rss/feeds/abcPortada.xml', topic: 'general', country: 'es', language: 'es' },
  { name: 'El Confidencial', url: 'https://www.elconfidencial.com/rss/', topic: 'general', country: 'es', language: 'es' },
  { name: 'La Vanguardia', url: 'https://www.lavanguardia.com/rss/home.xml', topic: 'general', country: 'es', language: 'es' },
  { name: 'El Diario', url: 'https://www.eldiario.es/rss/', topic: 'general', country: 'es', language: 'es' },
  
  // Tech - Spanish
  { name: 'Xataka', url: 'https://www.xataka.com/index.xml', topic: 'ai', country: 'es', language: 'es' },
  { name: 'Genbeta', url: 'https://www.genbeta.com/feedburner.xml', topic: 'ai', country: 'es', language: 'es' },
  { name: 'Magnet', url: 'https://magnet.xataka.com/feedburner.xml', topic: 'ai', country: 'es', language: 'es' },
  { name: 'Hipertextual', url: 'https://hipertextual.com/feed/', topic: 'ai', country: 'es', language: 'es' },

  // ============================================
  // PORTUGUESE SOURCES
  // ============================================
  // General News - Portuguese (Portugal)
  { name: 'Público', url: 'https://www.publico.pt/rss', topic: 'general', country: 'pt', language: 'pt' },
  { name: 'Observador', url: 'https://observador.pt/feed/', topic: 'general', country: 'pt', language: 'pt' },
  { name: 'Expresso', url: 'https://expresso.pt/rss', topic: 'general', country: 'pt', language: 'pt' },
  
  // Tech - Portuguese (Portugal)
  { name: 'Sapo Tek', url: 'https://tek.sapo.pt/rss', topic: 'ai', country: 'pt', language: 'pt' },
  
  // Sports - Portuguese
  { name: 'Sapo Desporto', url: 'https://desporto.sapo.pt/rss', topic: 'sports', country: 'pt', language: 'pt' },
  { name: 'MaisFutebol', url: 'https://maisfutebol.iol.pt/rss', topic: 'sports', country: 'pt', language: 'pt' },
  
  // Economy / Investing - Portuguese
  { name: 'Jornal Económico', url: 'https://jornaleconomico.pt/feed', topic: 'economy', country: 'pt', language: 'pt' },

  // ============================================
  // WINE & CULTURE
  // ============================================
  { name: 'Decanter', url: 'https://www.decanter.com/wine-news/feed', topic: 'wine', country: 'global', language: 'en' },
  { name: 'wein.plus', url: 'https://magazine.wein.plus/news/feed.xml', topic: 'wine', country: 'global', language: 'en' },
  { name: 'Made in Spain', url: 'https://feeds.buzzsprout.com/2437537.rss', topic: 'wine', country: 'es', language: 'en' },
  { name: 'The Wine Conversation', url: 'https://www.wine-conversation.com/conversations?format=rss', topic: 'wine', country: 'global', language: 'en' },
  
  // Additional Wine Feeds
  { name: 'Wine Enthusiast', url: 'https://www.winemag.com/feed/', topic: 'wine', country: 'us', language: 'en' },
  { name: 'Wine Folly', url: 'https://winefolly.com/feed/', topic: 'wine', country: 'us', language: 'en' },
  { name: 'Vinography', url: 'https://www.vinography.com/feed', topic: 'wine', country: 'us', language: 'en' },
  { name: 'Dr. Vino', url: 'https://www.drvino.com/feed/', topic: 'wine', country: 'us', language: 'en' },
  { name: 'Wine Anorak', url: 'https://www.wineanorak.com/wineblog/feed', topic: 'wine', country: 'uk', language: 'en' },
  { name: 'Reverse Wine Snob', url: 'https://www.reversewinesnob.com/feed', topic: 'wine', country: 'us', language: 'en' },

  // ============================================
  // NEW ADDITIONS (User Requested)
  // ============================================
  // World News
  { name: 'NY Times World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', topic: 'general', country: 'us', language: 'en' },
  { name: 'BBC World News', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', topic: 'general', country: 'uk', language: 'en' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', topic: 'general', country: 'global', language: 'en' },
  { name: 'DW World', url: 'https://www.dw.com/en/top-stories/world/s-1429?rss=1', topic: 'general', country: 'global', language: 'en' },
  { name: 'Euronews', url: 'https://www.euronews.com/rss?level=theme&name=news', topic: 'general', country: 'global', language: 'en' },
  { name: 'France 24', url: 'https://www.france24.com/en/rss', topic: 'general', country: 'fr', language: 'en' },
  { name: 'Reuters World', url: 'https://www.reuters.com/rssFeed/worldNews', topic: 'general', country: 'global', language: 'en' },
  { name: 'NPR World', url: 'https://feeds.npr.org/1004/rss.xml', topic: 'general', country: 'us', language: 'en' },
  { name: 'CBC World', url: 'https://www.cbc.ca/cmlink/rss-world', topic: 'general', country: 'ca', language: 'en' },
  { name: 'CTV News World', url: 'https://www.ctvnews.ca/rss/world/1.822289', topic: 'general', country: 'ca', language: 'en' },
  { name: 'Global News', url: 'https://globalnews.ca/feed/', topic: 'general', country: 'ca', language: 'en' },
  { name: 'LA Times World', url: 'https://www.latimes.com/world-nation/rss2.0.xml', topic: 'general', country: 'us', language: 'en' },
  { name: 'USA Today World', url: 'https://www.usatoday.com/news/world/rss/', topic: 'general', country: 'us', language: 'en' },
  { name: 'AP World News', url: 'https://apnews.com/hub/world-news?output=atom', topic: 'general', country: 'us', language: 'en' },
  { name: 'Hindustan Times World', url: 'https://www.hindustantimes.com/rss/world/news', topic: 'general', country: 'in', language: 'en' },
  { name: 'Indian Express World', url: 'https://indianexpress.com/section/world/feed/', topic: 'general', country: 'in', language: 'en' },
  { name: 'Times of India World', url: 'https://timesofindia.indiatimes.com/rss.cms', topic: 'general', country: 'in', language: 'en' },
  { name: 'Straits Times World', url: 'https://www.straitstimes.com/news/world/latest/rss.xml', topic: 'general', country: 'sg', language: 'en' },

  // US News
  { name: 'ProPublica', url: 'https://www.propublica.org/feeds/propublica/main', topic: 'general', country: 'us', language: 'en' },
  { name: 'Slate', url: 'https://slate.com/feeds/all.rss', topic: 'general', country: 'us', language: 'en' },
  
  // Europe/UK
  { name: 'The Economist World', url: 'https://www.economist.com/the-world-this-week/rss.xml', topic: 'general', country: 'global', language: 'en' },
  { name: 'The Times World', url: 'https://www.thetimes.co.uk/news/world/rss', topic: 'general', country: 'uk', language: 'en' },

  // Middle East / Asia
  { name: 'Japan Times', url: 'https://www.japantimes.co.jp/feed/', topic: 'general', country: 'jp', language: 'en' },
  { name: 'SCMP', url: 'https://www.scmp.com/rss/2/feed', topic: 'general', country: 'hk', language: 'en' },
  { name: 'The National', url: 'https://www.thenationalnews.com/rss', topic: 'general', country: 'ae', language: 'en' },

  // Australia / NZ
  { name: 'ABC Australia', url: 'https://www.abc.net.au/news/feed/51120/rss.xml', topic: 'general', country: 'au', language: 'en' },
  { name: 'RTE World', url: 'https://www.rte.ie/news/rss/world/', topic: 'general', country: 'ie', language: 'en' },
  { name: 'NZ Herald', url: 'https://www.nzherald.co.nz/rss', topic: 'general', country: 'nz', language: 'en' },

  // Science
  { name: 'ScienceAlert', url: 'https://www.sciencealert.com/feed', topic: 'general', country: 'global', language: 'en' },
  { name: 'Nautil.us', url: 'https://nautil.us/feed', topic: 'general', country: 'us', language: 'en' },
  { name: 'Ars Technica Science', url: 'https://arstechnica.com/science/feed/', topic: 'general', country: 'global', language: 'en' },

  // Tech (AI Topic)
  { name: 'Hacker News', url: 'https://news.ycombinator.com/rss', topic: 'ai', country: 'us', language: 'en' },
  { name: 'Quartz', url: 'https://qz.com/feed', topic: 'economy', country: 'us', language: 'en' },

  // Analysis
  { name: 'The Intercept', url: 'https://theintercept.com/feed/?rss', topic: 'general', country: 'us', language: 'en' },
];

// Sources that don't provide full article content in RSS (only excerpts/summaries)
// These will always be marked as hasFull = false regardless of content length
const NO_FULL_CONTENT_SOURCES = [
  'Decanter', 'wein.plus', 'Wine Enthusiast', 'Wine Folly',
  'The Decoder', 'Xataka', 'Genbeta', 'Magnet', 'Hipertextual', 'El País', 'El Mundo', 'ABC España',
  'El Confidencial', 'La Vanguardia', 'El Diario', 'Marca', 'Mundo Deportivo',
  'Público', 'Observador', 'Expresso', 'Sapo Tek', 'Sapo Desporto', 'MaisFutebol',
  'MIT Technology Review', 'The Verge', 'TechCrunch',
  'Ars Technica', 'Wired Science', 'Wired', 'Al Jazeera', 'Sky News', 'France 24',
  'BBC Sport', 'BBC Sport Tennis', 'BBC World News', 'Essentially Sports',
  'VentureBeat AI', 'VentureBeat', 'InfoQ', 'KDnuggets', 'Science Daily',
  'Space.com', 'The Economist Science', 'The Economist', 'Nature ML', 'Nature',
  'Quanta Magazine', 'Reuters World News', 'AP News', 'The Guardian World',
  'The Guardian Football', 'NPR News', 'Deutsche Welle', 'ABC News US',
  'Politico', 'Engadget', 'Gizmodo', 'Mashable', 'Scientific American',
  'Popular Science', 'Google AI Blog', 'Machine Learning Mastery',
  'Financial Times', 'Bloomberg', 'MarketWatch', 'CNBC', 'ESPN', 'Sky Sports',
  'Eurosport Tennis', 'Smashing Magazine', 'Nielsen Norman Group', 'A List Apart',
  'WebDesignerDepot', 'NASA', 'LiveScience', 'New Scientist', 'The Atlantic',
  'Vox', 'The New York Review of Books', 'The New Yorker', 'Quartz',
  // New Additions
  'CBC World', 'CTV News World', 'Global News', 'LA Times World', 'USA Today World', 
  'NZ Herald', 'Hacker News', 'Hindustan Times World', 'Indian Express World', 
  'Times of India World', 'Straits Times World', 'The Times World', 'AP World News', 
  'NPR World', 'Reuters World', 'Euronews', 'France 24',
];

// Helper function to clean HTML content for summary
function cleanHtmlForSummary(html: string): string {
  if (!html) return '';
  
  let cleaned = html.replace(/<[^>]*>/g, ' ');
  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '\"')
    .replace(/&apos;/g, "'")
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/&/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Extract first 1-2 sentences (up to 200 chars)
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [];
  let summary = sentences.slice(0, 2).join(' ');
  
  if (summary.length > 200) {
    summary = summary.substring(0, 197) + '...';
  }
  
  return summary || cleaned.substring(0, 200) + (cleaned.length > 200 ? '...' : '');
}

// Universal function to detect if an RSS item contains a full article
function isFullArticle(item: any): boolean {
  const contentHtml =
    item.contentEncoded ||
    item['content:encoded'] ||
    item.content ||
    item.description ||
    "";

  const plainText = contentHtml.replace(/<[^>]*>/g, '').trim();

  // 1. Content length heuristic (>1500 chars usually means full article)
  if (contentHtml.length > 1500) return true;

  // 2. Paragraph count (5+ paragraphs = full article structure)
  const pCount = (contentHtml.match(/<p[\s>]/g) || []).length;
  if (pCount >= 5) return true;

  // 3. Word count (300+ words = full article)
  const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount >= 300) return true;

  // 4. Media presence (images or figures) combined with decent text
  if (
    contentHtml.includes("<img") ||
    contentHtml.includes("<figure") ||
    contentHtml.includes("media:content") ||
    contentHtml.includes("media:thumbnail")
  ) {
    if (pCount >= 2 || wordCount >= 150) return true;
  }

  // 5. content:encoded field exists (RSS standard for full content)
  if (item.contentEncoded || item['content:encoded']) {
    if (plainText.length >= 500) return true;
  }

  return false;
}

// Extract image from various RSS formats
function extractImage(item: any, baseUrl?: string): string | null {
  let imageUrl: string | null = null;

  // Check enclosure first (common in podcasts and some feeds)
  if (item.enclosure?.url) {
    const videoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    const isVideo = item.enclosure.type && videoTypes.some(type => item.enclosure.type.includes(type));
    if (!isVideo) imageUrl = item.enclosure.url;
  }
  
  // Check media:content and media:thumbnail
  if (!imageUrl && item.mediaContent) {
    if (typeof item.mediaContent === 'string') imageUrl = item.mediaContent;
    else if (item.mediaContent.$?.url) imageUrl = item.mediaContent.$.url;
    else if (item.mediaContent.url) imageUrl = item.mediaContent.url;
    else if (Array.isArray(item.mediaContent) && item.mediaContent[0]) {
      const first = item.mediaContent[0];
      if (typeof first === 'string') imageUrl = first;
      else if (first.$?.url) imageUrl = first.$.url;
      else if (first.url) imageUrl = first.url;
    }
  }
  
  if (!imageUrl && item.mediaThumbnail) {
    if (typeof item.mediaThumbnail === 'string') imageUrl = item.mediaThumbnail;
    else if (item.mediaThumbnail.$?.url) imageUrl = item.mediaThumbnail.$.url;
    else if (Array.isArray(item.mediaThumbnail) && item.mediaThumbnail[0]) {
      const first = item.mediaThumbnail[0];
      if (typeof first === 'string') imageUrl = first;
      else if (first.$?.url) imageUrl = first.$.url;
      else if (first.url) imageUrl = first.url;
    }
  }
  
  // Check namespaced versions
  if (!imageUrl && item['media:content']) {
    const mc = item['media:content'];
    if (typeof mc === 'string') imageUrl = mc;
    else if (mc.$?.url) imageUrl = mc.$.url;
    else if (Array.isArray(mc) && mc[0]) {
      const first = mc[0];
      if (typeof first === 'string') imageUrl = first;
      else if (first.$?.url) imageUrl = first.$.url;
      else if (first.url) imageUrl = first.url;
    }
  }
  
  if (!imageUrl && item['media:thumbnail']) {
    const mt = item['media:thumbnail'];
    if (typeof mt === 'string') imageUrl = mt;
    else if (mt.$?.url) imageUrl = mt.$.url;
    else if (Array.isArray(mt) && mt[0]) {
      const first = mt[0];
      if (typeof first === 'string') imageUrl = first;
      else if (first.$?.url) imageUrl = first.$.url;
      else if (first.url) imageUrl = first.url;
    }
  }
  
  // Check og:image fallback
  if (!imageUrl && item.ogImage) {
    imageUrl = item.ogImage;
  }
  
  // Try to extract from content:encoded or description
  if (!imageUrl) {
    const htmlContent = item.contentEncoded || item['content:encoded'] || item.content || item.description || '';
    if (htmlContent) {
      const imgMatch1 = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch1 && imgMatch1[1]) {
        const imgUrl = imgMatch1[1];
        if (!imgUrl.includes('pixel') && !imgUrl.includes('1x1') && !imgUrl.includes('tracking')) {
          imageUrl = imgUrl;
        }
      }
      
      if (!imageUrl) {
        const pictureMatch = htmlContent.match(/<source[^>]+srcset=["']([^"'\s]+)/i);
        if (pictureMatch && pictureMatch[1]) {
          imageUrl = pictureMatch[1].split(' ')[0];
        }
      }
      
      if (!imageUrl) {
        const figureMatch = htmlContent.match(/<figure[^>]*>.*?<img[^>]+src=["']([^"']+)["']/is);
        if (figureMatch && figureMatch[1]) {
          imageUrl = figureMatch[1];
        }
      }

      if (!imageUrl) {
        const metaMatch = htmlContent.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
        if (metaMatch && metaMatch[1]) imageUrl = metaMatch[1];
      }
    }
  }
  
  // Resolve relative URLs
  if (imageUrl && baseUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    try {
      if (imageUrl.startsWith('//')) {
        imageUrl = 'https:' + imageUrl;
      } else {
        imageUrl = new URL(imageUrl, baseUrl).href;
      }
    } catch (e) {
      // Keep original if resolution fails
    }
  }

  return imageUrl;
}

// Optimized fetcher with concurrency control
async function fetchRSSFeedsParallel(feeds: any[], concurrency: number = 20): Promise<any[]> {
  const allArticles: any[] = [];
  let completed = 0;
  const total = feeds.length;
  
  console.log(`Starting parallel fetch of ${total} feeds with concurrency ${concurrency}`);
  
  const fetchFeed = async (feedConfig: any) => {
    try {
      // Reduced timeout to 8s for snappier performance - skip slow feeds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(feedConfig.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Notinow/2.0; +https://notinow.app)',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        return [];
      }

      const xmlText = await response.text();
      const feed = await rssParser.parseString(xmlText);
      const baseUrl = feed.link || feedConfig.url;
      
      const articles = feed.items.slice(0, 10).map(item => {
        const contentHtml = item.contentEncoded || item['content:encoded'] || null;
        const description = item.contentSnippet || item.description || '';
        
        let author = '';
        const authorField = item.creator || item['dc:creator'];
        if (typeof authorField === 'string') {
          author = authorField;
        } else if (authorField && typeof authorField === 'object') {
          author = authorField.name || authorField._ || '';
        }
        
        // Check if source is known to NOT have full content
        const isKnownNoFull = NO_FULL_CONTENT_SOURCES.includes(feedConfig.name);
        const hasFull = !isKnownNoFull && isFullArticle(item);
        
        let videoUrl = null;
        if (item.enclosure?.url && item.enclosure?.type) {
          const videoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
          if (videoTypes.some(type => item.enclosure.type.includes(type))) {
            videoUrl = item.enclosure.url;
          }
        }
        
        const imageUrl = extractImage(item, baseUrl);
        
        return {
          title: item.title || 'Untitled',
          summary: cleanHtmlForSummary(description || contentHtml || ''),
          content: contentHtml ? cleanHtmlForSummary(contentHtml) : null,
          contentHtml: contentHtml,
          link: item.link || '',
          urlToImage: imageUrl,
          videoUrl: videoUrl,
          source: feedConfig.name,
          topic: feedConfig.topic,
          country: feedConfig.country,
          language: feedConfig.language,
          publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
          author: author,
          guid: item.guid || item.link || '',
          hasFull: hasFull,
        };
      });

      // Filter: Remove entire feed if NO images in ANY article
      const hasImages = articles.some(article => !!article.urlToImage);
      
      if (!hasImages && articles.length > 0) {
        return [];
      }

      return articles;
    } catch (error) {
      // Silent fail for individual feeds to keep logs clean
      return [];
    } finally {
      completed++;
    }
  };

  // Process feeds with concurrency limit
  const results = [];
  const executing = [];
  
  for (const feed of feeds) {
    const p = fetchFeed(feed).then(items => {
      allArticles.push(...items);
    });
    results.push(p);
    
    if (concurrency <= feeds.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= concurrency) {
        await Promise.race(executing);
      }
    }
  }
  
  await Promise.all(results);
  
  console.log(`Fetched ${allArticles.length} articles from ${total} feeds`);
  return allArticles;
}

// Fetch RSS feeds by topic
async function fetchRSSFeeds(topic?: string): Promise<any[]> {
  const feedsToFetch = topic && topic !== 'today' 
    ? RSS_FEEDS.filter(feed => feed.topic === topic)
    : RSS_FEEDS;

  // Use parallel fetching with high concurrency
  return await fetchRSSFeedsParallel(feedsToFetch, 20);
}

// Deduplicate articles by URL and title
function deduplicateArticles(articles: any[]): any[] {
  const seen = new Set<string>();
  return articles.filter(article => {
    const key = `${article.link?.toLowerCase()}|${article.title?.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Main RSS news endpoint
app.get("/make-server-b78002f5/rss-news", async (c) => {
  try {
    const topic = c.req.query('topic') || 'today';
    
    console.log(`RSS news request - topic: ${topic}`);

    // Check cache first
    const cacheKey = `rss_news_v2_${topic}`;
    const cached = await kv.get(cacheKey);
    
    if (cached && typeof cached === 'object' && 'articles' in cached && 'lastFetched' in cached) {
      const cacheAge = Date.now() - new Date(cached.lastFetched as string).getTime();
      
      // Return cached if less than 15 minutes old
      if (cacheAge < 15 * 60 * 1000) {
        console.log(`Returning cached RSS news (age: ${Math.floor(cacheAge / 1000 / 60)} min)`);
        return c.json({
          ...cached,
          fromCache: true,
        });
      }
    }

    // Fetch fresh RSS feeds
    const rssArticles = await fetchRSSFeeds(topic !== 'today' ? topic : undefined);
    const deduplicated = deduplicateArticles(rssArticles);

    // Sort by published date (newest first)
    deduplicated.sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      return dateB - dateA;
    });

    // Keep only last 500 articles for cache
    const limited = deduplicated.slice(0, 500);

    const result = {
      articles: limited,
      totalResults: limited.length,
      lastFetched: new Date().toISOString(),
      fromCache: false,
    };

    // Cache for 15 minutes (will be revalidated on next request after expiry)
    await kv.set(cacheKey, result);

    console.log(`Returning ${limited.length} fresh RSS articles`);

    return c.json(result);

  } catch (error) {
    console.error("Error in RSS news endpoint:", error);
    return c.json({
      error: `Failed to fetch RSS news: ${error.message}`,
    }, 500);
  }
});

// Clear cache endpoint (for manual refresh)
app.post("/make-server-b78002f5/clear-cache", async (c) => {
  try {
    const topics = ['today', 'design', 'ai', 'sports', 'economy', 'wine'];
    
    for (const topic of topics) {
      await kv.del(`rss_news_v2_${topic}`);
    }
    
    return c.json({ success: true, message: "Cache cleared for all topics" });
  } catch (error) {
    console.error("Error clearing cache:", error);
    return c.json({ error: "Failed to clear cache" }, 500);
  }
});

// Analytics endpoint
app.post("/make-server-b78002f5/analytics", async (c) => {
  try {
    const body = await c.req.json();
    const { type, name, path, referrer, metadata, timestamp } = body;
    
    // Log analytics event
    console.log('Analytics Event:', {
      type,
      name,
      path,
      referrer,
      metadata,
      timestamp: timestamp || new Date().toISOString(),
    });
    
    // Store in KV store with daily aggregation
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const analyticsKey = `analytics_${date}`;
    
    // Get existing analytics for today
    const existing = await kv.get(analyticsKey) || { events: [] };
    const events = Array.isArray(existing.events) ? existing.events : [];
    
    // Add new event
    events.push({
      type,
      name,
      path,
      referrer,
      metadata,
      timestamp: timestamp || new Date().toISOString(),
    });
    
    // Keep only last 10000 events per day to prevent storage bloat
    if (events.length > 10000) {
      events.splice(0, events.length - 10000);
    }
    
    // Save updated analytics
    await kv.set(analyticsKey, { events, date });
    
    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving analytics:", error);
    // Return success anyway - analytics shouldn't break the app
    return c.json({ success: true });
  }
});

// Debug endpoint to inspect a specific feed's raw structure
app.get("/make-server-b78002f5/debug-feed", async (c) => {
  try {
    const feedUrl = c.req.query('url') || 'https://feeds.bbci.co.uk/sport/tennis/rss.xml';
    
    console.log(`Debugging feed: ${feedUrl}`);
    
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Notinow/2.0; +https://notinow.app)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    
    if (!response.ok) {
      return c.json({ error: `Feed returned status ${response.status}` }, 500);
    }
    
    const xmlText = await response.text();
    const feed = await rssParser.parseString(xmlText);
    
    // Return first item with all its properties for inspection
    const firstItem = feed.items[0];
    
    return c.json({
      feedTitle: feed.title,
      itemCount: feed.items.length,
      firstItem: {
        title: firstItem.title,
        allKeys: Object.keys(firstItem),
        enclosure: firstItem.enclosure,
        mediaContent: firstItem.mediaContent,
        mediaThumbnail: firstItem.mediaThumbnail,
        'media:content': firstItem['media:content'],
        'media:thumbnail': firstItem['media:thumbnail'],
        contentEncodedLength: firstItem.contentEncoded?.length || 0,
        contentEncodedPreview: firstItem.contentEncoded?.substring(0, 500),
        descriptionLength: firstItem.description?.length || 0,
        descriptionPreview: firstItem.description?.substring(0, 500),
      }
    });
  } catch (error) {
    console.error("Error debugging feed:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Get analytics data (optional - for viewing stats)
app.get("/make-server-b78002f5/analytics", async (c) => {
  try {
    const date = c.req.query('date') || new Date().toISOString().split('T')[0];
    const analyticsKey = `analytics_${date}`;
    
    const data = await kv.get(analyticsKey);
    
    if (!data) {
      return c.json({ date, events: [], count: 0 });
    }
    
    const events = Array.isArray(data.events) ? data.events : [];
    
    // Aggregate stats
    const pageviews = events.filter(e => e.type === 'pageview').length;
    const customEvents = events.filter(e => e.type === 'event').length;
    const eventTypes = events.reduce((acc, e) => {
      if (e.name) {
        acc[e.name] = (acc[e.name] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return c.json({
      date,
      count: events.length,
      pageviews,
      customEvents,
      eventTypes,
      events: events.slice(-100), // Return last 100 events
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return c.json({ error: "Failed to fetch analytics" }, 500);
  }
});

// Share endpoint - Returns HTML with Open Graph meta tags for social media
// This endpoint is used to generate proper link previews in WhatsApp, Telegram, etc.
app.get("/make-server-b78002f5/share/:encodedUrl", async (c) => {
  try {
    const encodedUrl = c.req.param('encodedUrl');
    const articleUrl = decodeURIComponent(encodedUrl);
    
    console.log('Share endpoint hit:', { encodedUrl, articleUrl });
    
    // Try to find the article in cached data to get its details
    // Check all topic caches
    let article = null;
    const topics = ['rss_news_today', 'rss_news_design', 'rss_news_ai', 'rss_news_sports', 'rss_news_economy'];
    
    for (const cacheKey of topics) {
      const cachedData = await kv.get(cacheKey);
      if (cachedData && typeof cachedData === 'object' && 'articles' in cachedData && Array.isArray(cachedData.articles)) {
        article = cachedData.articles.find((a: any) => a.link === articleUrl);
        if (article) {
          console.log(`Found article in cache: ${cacheKey}`);
          break;
        }
      }
    }
    
    // Default values
    const title = article?.title || 'Notinow - Pure RSS News Reader';
    const description = article?.summary?.slice(0, 200) || 'Get the latest updates on UX/UI Design, AI, Tennis, European Football, and Index Funds. No tracking, no ads.';
    
    // Use original image for social meta tags
    let image = 'https://notinow.xyz/favicon.png';
    if (article?.urlToImage) {
      image = article.urlToImage;
    }
    
    const appUrl = `https://notinow.xyz#/article/${encodedUrl}`;
    
    console.log('Serving meta tags:', { title: title.substring(0, 50), image, appUrl, foundArticle: !!article });
    
    // Return HTML with proper meta tags
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Primary Meta Tags -->
  <title>${title} - Notinow</title>
  <meta name="title" content="${title}">
  <meta name="description" content="${description}">
  <meta name="author" content="Notinow">
  <meta name="generator" content="Notinow">
  <meta name="application-name" content="Notinow">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${appUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Notinow">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${appUrl}">
  <meta property="twitter:title" content="${title}">
  <meta property="twitter:description" content="${description}">
  <meta property="twitter:image" content="${image}">
  
  <!-- Redirect to app after meta tags are scraped -->
  <meta http-equiv="refresh" content="0;url=${appUrl}">
  <script>
    // Immediate JavaScript redirect (faster for real users)
    window.location.replace('${appUrl}');
  </script>
</head>
<body>
  <p>Redirecting to <a href="${appUrl}">Notinow</a>...</p>
</body>
</html>`;
    
    return c.html(html);
  } catch (error) {
    console.error('Error in share endpoint:', error);
    // Fallback redirect to home
    return c.redirect('https://notinow.xyz');
  }
});

Deno.serve(app.fetch);