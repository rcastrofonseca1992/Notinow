import { PREMIUM_SOURCES, FREE_SOURCES } from '../constants';

/**
 * Determine if a source is premium (requires subscription)
 */
export function isPremiumSource(sourceName: string): boolean {
  return PREMIUM_SOURCES.some(
    (premium) => sourceName.toLowerCase().includes(premium.toLowerCase())
  );
}

/**
 * Determine if a source is free/open access
 */
export function isFreeSource(sourceName: string): boolean {
  return FREE_SOURCES.some(
    (free) => sourceName.toLowerCase().includes(free.toLowerCase())
  );
}

/**
 * Get source type label
 */
export function getSourceType(sourceName: string): 'premium' | 'free' | 'unknown' {
  if (isPremiumSource(sourceName)) return 'premium';
  if (isFreeSource(sourceName)) return 'free';
  return 'unknown';
}

/**
 * Group articles by similar titles to find related coverage
 * Uses simple word matching - in production, use proper NLP or API
 */
export function findRelatedArticles(
  article: { title: string },
  allArticles: { title: string; source: { name: string }; url: string; publishedAt: string }[]
): Array<{ name: string; url: string; publishedAt: string; isPremium: boolean }> {
  // Extract significant words from title (remove common words)
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'must', 'can', 'says', 'said', 'after', 'new', 'over', 'more', 'than',
  ]);

  const getSignificantWords = (title: string): Set<string> => {
    return new Set(
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((word) => word.length > 3 && !commonWords.has(word))
    );
  };

  const titleWords = getSignificantWords(article.title);
  
  if (titleWords.size === 0) return [];

  // Find articles with overlapping keywords
  const related = allArticles
    .filter((other) => {
      // Don't include the same article
      if (other.title === article.title) return false;

      const otherWords = getSignificantWords(other.title);
      
      // Calculate overlap
      const overlap = [...titleWords].filter((word) => otherWords.has(word)).length;
      
      // Require at least 2 matching significant words
      return overlap >= 2;
    })
    .map((other) => ({
      name: other.source.name,
      url: other.url,
      publishedAt: other.publishedAt,
      isPremium: isPremiumSource(other.source.name),
    }))
    // Limit to 5 related sources
    .slice(0, 5);

  return related;
}
