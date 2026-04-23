import { useDarkMode } from './hooks/useDarkMode';
import { useBedTimeMode } from './hooks/useBedTimeMode';
import { useReadArticles } from './hooks/useReadArticles';
import { useRouter } from './hooks/useRouter';
import { Article, Topic, Language } from './types';
import { API_CONFIG, TOPICS, APP_CONFIG } from './constants';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from './utils/toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useState, useEffect, useMemo, useCallback, useRef, useLayoutEffect, lazy, Suspense } from 'react';
import { ArticleCard } from './components/ArticleCard';
import { SwipeableArticleCard } from './components/SwipeableArticleCard';
import { NewsSkeleton } from './components/NewsSkeleton';
import { EmptyState } from './components/EmptyState';
import { TopicNav } from './components/TopicNav';
import { PWAHead } from './components/PWAHead';
import { PWAStatusIndicator } from './components/PWAStatusIndicator';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { PullToRefreshIndicator } from './components/PullToRefreshIndicator';
import { FullArticlesToggle } from './components/FullArticlesToggle';
import { SafeAreaWrapper } from './components/SafeAreaWrapper';
import { usePullToRefresh } from './hooks/usePullToRefresh';
import { Search, X, MoreVertical, Heart } from 'lucide-react';

// Lazy load heavy components for better initial load performance
const Settings = lazy(() => import('./components/Settings').then(m => ({ default: m.Settings })));
const ShareModal = lazy(() => import('./components/ShareModal').then(m => ({ default: m.ShareModal })));
const ArticlePage = lazy(() => import('./components/ArticlePage').then(m => ({ default: m.ArticlePage })));

function AppContent() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { isBedTimeMode, toggleBedTimeMode } = useBedTimeMode();
  const { markAsRead, isRead } = useReadArticles();
  const { currentRoute, navigate, goBack } = useRouter();

  // State
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
  const [savedArticles, setSavedArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastFetched, setLastFetched] = useState<string>('');
  const [fromCache, setFromCache] = useState(false);
  const [fullArticlesOnly, setFullArticlesOnly] = useState(() => {
    const saved = localStorage.getItem('fullArticlesOnly');
    return saved ? JSON.parse(saved) : false;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>(() => {
    const saved = localStorage.getItem('selectedLanguages');
    try {
      return saved ? JSON.parse(saved) : ['en', 'pt', 'es'];
    } catch {
      return ['en', 'pt', 'es'];
    }
  });
  
  // Infinite scroll state
  const [visibleCount, setVisibleCount] = useState(30); // Start with 30 articles
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Share modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareModalData, setShareModalData] = useState<{ url: string; title: string } | null>(null);

  // Derived state for view management
  const isArticleView = currentRoute.path === 'article';
  const isSavedView = currentRoute.path === 'saved';
  const homeScrollRef = useRef(0);
  const mainScrollRef = useRef<HTMLDivElement>(null);

  // Track initial pageview and log PWA status (debug)
  useEffect(() => {
    // Fix 1: Force a micro-reflow on load to fix iOS PWA hitbox drift
    setTimeout(() => {
      document.documentElement.style.height = '100dvh';
    }, 0);
    
    // Debug: Log PWA status on mount (only in development)
    try {
      import('./utils/env').then(({ isDevelopment }) => {
        if (isDevelopment()) {
          // Add a small delay to ensure DOM is ready
          setTimeout(() => {
            import('./utils/pwa').then(({ logPWAStatus }) => {
              if (logPWAStatus && typeof logPWAStatus === 'function') {
                logPWAStatus();
              }
            }).catch((error) => {
              // Silently fail if pwaDebug can't be loaded
              console.debug('PWA debug not available:', error);
            });
          }, 100);
        }
      }).catch((error) => {
        // Silently fail if env can't be loaded
        console.debug('Env utils not available:', error);
      });
    } catch (error) {
      console.debug('Error initializing debug tools:', error);
    }
  }, []);

  // FIX 2: Save + Restore Scroll Position (Persistence for Page Reload)
  useEffect(() => {
    const saved = sessionStorage.getItem("listScroll");
    const container = mainScrollRef.current;

    if (saved && container) {
      requestAnimationFrame(() => {
        container.scrollTo(0, parseFloat(saved));
      });
    }

    const handleSave = () => {
      if (mainScrollRef.current) {
        sessionStorage.setItem("listScroll", mainScrollRef.current.scrollTop.toString());
      }
    };
    
    // Save on page unload
    window.addEventListener('beforeunload', handleSave);
    
    return () => {
      window.removeEventListener('beforeunload', handleSave);
      // Also save on cleanup (unmount) if navigating away
      handleSave();
    };
  }, []);

  // Load saved articles from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedArticles');
    if (saved) {
      try {
        setSavedArticles(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved articles:', e);
      }
    }
  }, []);

  // Restore scroll position when returning to home view
  useLayoutEffect(() => {
    if (!isArticleView && mainScrollRef.current && homeScrollRef.current > 0) {
      mainScrollRef.current.scrollTop = homeScrollRef.current;
    }
  }, [isArticleView]);

  // Save scroll position when scrolling on home view (Internal tracking) - Optimized
  useEffect(() => {
    const container = mainScrollRef.current;
    if (!container) return;

    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        if (!isArticleView) {
          homeScrollRef.current = container.scrollTop;
        }
      });
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isArticleView]);

  // Toggle save article
  const toggleSaveArticle = useCallback((article: Article) => {
    setSavedArticles(prev => {
      const isSaved = prev.some(a => a.link === article.link);
      const updated = isSaved
        ? prev.filter(a => a.link !== article.link)
        : [article, ...prev].slice(0, API_CONFIG.MAX_CACHED_ARTICLES);
      
      localStorage.setItem('savedArticles', JSON.stringify(updated));
      
      toast.show(isSaved ? 'Removed from saved' : 'Saved for later', {
        icon: isSaved ? '💔' : '❤️',
      });
      
      return updated;
    });
  }, []);

  // Share article
  const shareArticle = useCallback((article: Article) => {
    // Use the original article link for sharing - cleaner and more trustworthy
    const shareUrl = article.link;
    
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.title,
        url: shareUrl,
      }).catch((error) => {
        console.log('Share failed, trying clipboard:', error);
        tryClipboardCopy(shareUrl, article.title);
      });
    } else {
      tryClipboardCopy(shareUrl, article.title);
    }
    
    function tryClipboardCopy(url: string, title: string) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url)
          .then(() => {
            toast.show('Link copied to clipboard', { icon: '🔗' });
          })
          .catch((error) => {
            console.log('Clipboard failed, showing modal:', error);
            setShareModalData({ url, title });
            setShareModalOpen(true);
          });
      } else {
        setShareModalData({ url, title });
        setShareModalOpen(true);
      }
    }
  }, []);

  // Fetch RSS news
  const fetchNews = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      // Always fetch all news ('today') and filter client-side
      const url = `/api/rss-news?topic=today`;
      
      console.log('Fetching all RSS news');

      const response = await fetch(url);
      const contentType = response.headers.get('content-type') || '';
      let data: any;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const raw = await response.text();
        throw new Error(
          `API returned non-JSON response from ${url}. Check that /api routes are served by the Node server. First bytes: ${raw.slice(0, 120)}`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch news');
      }

      setArticles(data.articles || []);
      setLastFetched(data.lastFetched || new Date().toISOString());
      setFromCache(data.fromCache || false);
      
      if (!data.fromCache && showLoading) {
        toast.success('News updated');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch news');
      toast.error('Failed to load news');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchNews();
    
    const interval = setInterval(() => {
      fetchNews(false);
    }, API_CONFIG.AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchNews]);

  // Manual refresh
  const handleRefresh = useCallback(async (source: 'pull' | 'button' = 'button') => {
    await fetchNews();
  }, [fetchNews]);

  // Handle full articles toggle
  const handleFullArticlesToggle = useCallback((enabled: boolean) => {
    setFullArticlesOnly(enabled);
    localStorage.setItem('fullArticlesOnly', JSON.stringify(enabled));
  }, []);

  // Handle language change
  const handleLanguagesChange = useCallback((languages: Language[]) => {
    setSelectedLanguages(languages);
    localStorage.setItem('selectedLanguages', JSON.stringify(languages));
  }, []);

  // Filter articles - Optimized with early returns and better memoization
  const filteredArticles = useMemo(() => {
    let filtered = isSavedView ? savedArticles : articles;
    
    // Early return if no articles
    if (filtered.length === 0) return [];
    
    // Filter by topics (only in Home view)
    if (!isSavedView && selectedTopics.length > 0) {
      filtered = filtered.filter(article => selectedTopics.includes(article.topic));
      if (filtered.length === 0) return [];
    }
    
    // Filter by languages
    filtered = filtered.filter(article => selectedLanguages.includes(article.language as Language));
    if (filtered.length === 0) return [];
    
    // Filter by full articles toggle
    if (fullArticlesOnly) {
      filtered = filtered.filter(article => article.hasFull);
      if (filtered.length === 0) return [];
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query) ||
        article.source.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [articles, savedArticles, selectedTopics, searchQuery, fullArticlesOnly, selectedLanguages, isSavedView]);

  // Topic toggle
  const handleTopicToggle = useCallback((topic: Topic) => {
    setSelectedTopics(prev => {
      const isSelected = prev.includes(topic);
      if (isSelected) {
        return prev.filter(t => t !== topic);
      } else {
        return [...prev, topic];
      }
    });
    setVisibleCount(30);
    // Use container scroll
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Get current article
  const currentArticle = useMemo(() => {
    if (!isArticleView || !currentRoute.params?.articleId) {
      return null;
    }
    
    const allArticles = [...articles, ...savedArticles];
    return allArticles.find(a => a.link === currentRoute.params?.articleId) || null;
  }, [isArticleView, currentRoute, articles, savedArticles]);

  // Pull to refresh
  const pullToRefresh = usePullToRefresh({
    onRefresh: () => handleRefresh('pull'),
    threshold: 80,
    enabled: currentRoute.path === 'home' && !loading,
    containerRef: mainScrollRef, // Use ref for container scroll detection
  });

  // Handle article click
  const handleArticleClick = useCallback((article: Article) => {
    markAsRead(article.link);
    navigate({ path: 'article', params: { articleId: article.link } });
  }, [markAsRead, navigate]);

  // Infinite scroll - Optimized with better debouncing
  useEffect(() => {
    const container = mainScrollRef.current;
    if (isArticleView || loading || isLoadingMore || !container) {
      return;
    }

    let rafId: number | null = null;
    let lastScrollTop = 0;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const clientHeight = container.clientHeight;
      const scrollHeight = container.scrollHeight;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

      // Only check if scrolled down significantly (performance optimization)
      if (Math.abs(scrollTop - lastScrollTop) < 50) {
        return;
      }
      lastScrollTop = scrollTop;

      if (distanceFromBottom < 500 && visibleCount < filteredArticles.length) {
        setIsLoadingMore(true);
        // Use requestIdleCallback if available for better performance
        const scheduleLoad = (window as any).requestIdleCallback || ((cb: () => void) => setTimeout(cb, 100));
        scheduleLoad(() => {
          setVisibleCount(prev => Math.min(prev + 30, filteredArticles.length));
          setIsLoadingMore(false);
        });
      }
    };

    const onScroll = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(handleScroll);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', onScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isArticleView, loading, isLoadingMore, visibleCount, filteredArticles.length]);

  // --- RENDER HELPERS ---

  // Article View Content
  const renderArticleView = () => {
    if (!currentArticle) {
      if (loading && articles.length === 0) {
        return (
           <div className="min-h-screen bg-background flex items-center justify-center">
             <div className="text-center">
               <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
               <p className="text-muted-foreground">Loading article...</p>
             </div>
           </div>
        );
      }
      return (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Article not found</p>
              <button
                onClick={() => navigate({ path: 'home' })}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
      );
    }

    return (
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading article...</p>
          </div>
        </div>
      }>
        <ArticlePage
          article={currentArticle}
          onBack={goBack}
          isSaved={savedArticles.some(a => a.link === currentArticle.link)}
          onToggleSave={() => toggleSaveArticle(currentArticle)}
          onShare={() => shareArticle(currentArticle)}
        />
      </Suspense>
    );
  };

  return (
    <>
      {/* Dynamic PWA Head */}
      <PWAHead article={isArticleView && currentArticle ? {
        title: currentArticle.title,
        summary: currentArticle.summary,
        image: currentArticle.urlToImage || undefined,
        link: currentArticle.link
      } : undefined} />
      
      <PWAStatusIndicator />
      <PWAInstallPrompt />
      
      <PullToRefreshIndicator
        isPulling={pullToRefresh.isPulling}
        pullDistance={pullToRefresh.pullDistance}
        isRefreshing={pullToRefresh.isRefreshing}
        threshold={pullToRefresh.threshold}
      />
      
      {/* SAFE AREA WRAPPER - Replaces previous container */}
      <SafeAreaWrapper>
        <div className="flex flex-col h-screen w-full relative" style={{ height: '100dvh' }}>
        {/* Header - Now Static, Outside Scroll View */}
        <header 
          data-pwa-header
          className="z-40 bg-background border-b border-border"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.h1 
                className="text-2xl font-semibold tracking-tight cursor-pointer"
                onClick={() => {
                  if (selectedTopics.length === 0) {
                    handleRefresh('button');
                  } else {
                    setSelectedTopics([]);
                    setVisibleCount(30);
                    if (mainScrollRef.current) {
                      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{ willChange: 'transform' }}
              >
                <span className="text-foreground">Noti</span>
                <span className="text-[#FBBF24] logo-accent">now</span>
              </motion.h1>

              <div className="flex items-center gap-4">
                <FullArticlesToggle
                  enabled={fullArticlesOnly}
                  onChange={handleFullArticlesToggle}
                />
                <motion.button
                  onClick={() => {
                    if (isSavedView) {
                      navigate({ path: 'home' });
                    } else {
                      navigate({ path: 'saved' });
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  style={{ willChange: 'transform' }}
                  aria-label={isSavedView ? "Go Home" : "View Saved"}
                >
                  <Heart className={`w-5 h-5 ${isSavedView ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
                </motion.button>
                <motion.button
                  onClick={() => {
                    setIsSettingsOpen(true);
                  }}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  style={{ willChange: 'transform' }}
                  aria-label="Settings"
                >
                  <MoreVertical className="w-5 h-5 text-foreground" />
                </motion.button>
              </div>
            </div>
          </div>

          {!isSavedView && (
            <TopicNav
              selectedTopics={selectedTopics}
              onTopicToggle={handleTopicToggle}
              isLoading={loading}
            />
          )}
        </header>

        {/* Main Scroll Content */}
        <div 
          ref={mainScrollRef}
          className="main-scroll flex-1 relative"
        >
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-8">
              <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 h-12 rounded-xl border border-border bg-card text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {loading && !isSavedView ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                  <NewsSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => fetchNews()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filteredArticles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles.slice(0, visibleCount).map((article, index) => (
                    <SwipeableArticleCard
                      key={`${article.link}-${index}`}
                      article={article}
                      onClick={() => handleArticleClick(article)}
                      isSaved={savedArticles.some(a => a.link === article.link)}
                      isRead={isRead(article.link)}
                      onToggleSave={toggleSaveArticle}
                      onShare={shareArticle}
                    />
                  ))}
                </div>
                
                {isLoadingMore && (
                  <div className="flex justify-center items-center py-12">
                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                      <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin" />
                      <span className="text-sm">Loading more articles...</span>
                    </div>
                  </div>
                )}
                
                {visibleCount >= filteredArticles.length && !isLoadingMore && (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        🎉 You've reached the end!
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-600">
                        Showing all {filteredArticles.length} articles
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <EmptyState 
                type={
                  fullArticlesOnly && !searchQuery 
                    ? 'no-full-articles' 
                    : searchQuery 
                      ? 'no-results' 
                      : isSavedView
                        ? 'no-saved' 
                        : 'no-articles'
                }
                searchQuery={searchQuery}
                onReset={() => {
                  setSearchQuery('');
                  if (fullArticlesOnly) {
                    handleFullArticlesToggle(false);
                  }
                }}
              />
            )}
          </main>

          <footer className="border-t border-gray-200 dark:border-gray-900 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
              <div className="text-center">
                <p className="text-xs text-gray-400 dark:text-gray-600">
                  Auto-refreshes every 30 minutes • No tracking • No ads
                </p>
              </div>
            </div>
          </footer>
        </div>
        </div>
      </SafeAreaWrapper>

      <Suspense fallback={null}>
        {isSettingsOpen && (
          <Settings
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            isBedTimeMode={isBedTimeMode}
            onToggleBedTimeMode={toggleBedTimeMode}
            selectedLanguages={selectedLanguages}
            onLanguagesChange={handleLanguagesChange}
            fromCache={fromCache}
            lastFetched={lastFetched}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {shareModalData && (
          <ShareModal
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            url={shareModalData.url}
            title={shareModalData.title}
          />
        )}
      </Suspense>

      {/* ARTICLE VIEW OVERLAY */}
      <AnimatePresence>
        {isArticleView && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%', transition: { ease: "easeInOut", duration: 0.25 } }}
            transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
            className="fixed inset-0 z-50 bg-background w-full h-full overflow-hidden"
            style={{ 
              willChange: 'transform',
              transform: 'translateZ(0)', // Force GPU acceleration
              backfaceVisibility: 'hidden', // Optimize rendering
            }}
          >
            <SafeAreaWrapper className="h-full">
              {renderArticleView()}
            </SafeAreaWrapper>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
