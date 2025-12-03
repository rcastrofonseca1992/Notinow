// Shared TypeScript types for the application

export interface Article {
  title: string;
  summary: string;
  content: string | null;
  contentHtml: string | null;
  link: string;
  urlToImage: string | null;
  videoUrl?: string | null; // Video URL from enclosure (mp4, webm, etc.)
  source: string;
  topic: 'design' | 'ai' | 'sports' | 'economy' | 'wine' | 'general';
  country?: 'pt' | 'br' | 'es' | 'uk' | 'us' | 'global';
  language?: 'en' | 'es' | 'pt';
  publishedAt: string;
  author?: string;
  guid?: string;
  hasFull?: boolean; // Indicates if article has full content (>400 chars)
}

export interface FeedResponse {
  articles: Article[];
  totalResults: number;
  fromCache: boolean;
  lastFetched: string;
}

export interface APIError {
  error: string;
  message?: string;
  details?: unknown;
}

export type Topic = 'today' | 'design' | 'ai' | 'sports' | 'economy' | 'wine' | 'saved';

export interface ReaderSettings {
  fontSize: number; // 14-24px
  darkMode: boolean;
}
