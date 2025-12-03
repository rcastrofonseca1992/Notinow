import { useState, useEffect, useCallback } from 'react';

const READ_ARTICLES_KEY = 'readArticles';
const MAX_READ_ARTICLES = 1000; // Prevent localStorage from getting too large

export function useReadArticles() {
  const [readArticles, setReadArticles] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(READ_ARTICLES_KEY);
    if (stored) {
      try {
        return new Set(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load read articles:', e);
        return new Set();
      }
    }
    return new Set();
  });

  // Save to localStorage whenever readArticles changes
  useEffect(() => {
    localStorage.setItem(READ_ARTICLES_KEY, JSON.stringify([...readArticles]));
  }, [readArticles]);

  // Mark an article as read
  const markAsRead = useCallback((articleLink: string) => {
    setReadArticles(prev => {
      const updated = new Set(prev);
      updated.add(articleLink);
      
      // Keep only the most recent articles to prevent localStorage bloat
      if (updated.size > MAX_READ_ARTICLES) {
        const array = [...updated];
        // Remove oldest entries (first in the set)
        array.splice(0, updated.size - MAX_READ_ARTICLES);
        return new Set(array);
      }
      
      return updated;
    });
  }, []);

  // Check if an article is read
  const isRead = useCallback((articleLink: string) => {
    return readArticles.has(articleLink);
  }, [readArticles]);

  // Clear all read articles
  const clearReadArticles = useCallback(() => {
    setReadArticles(new Set());
    localStorage.removeItem(READ_ARTICLES_KEY);
  }, []);

  return {
    markAsRead,
    isRead,
    clearReadArticles,
    readCount: readArticles.size,
  };
}
