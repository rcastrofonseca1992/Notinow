import { X, Moon, Sun, Languages, Info, BarChart3, BookOpen, Rss, Mail } from 'lucide-react';
import { Analytics } from '../utils/analytics';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type Language = 'en' | 'pt' | 'es';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isBedTimeMode: boolean;
  onToggleBedTimeMode: () => void;
  selectedLanguages: Language[];
  onLanguagesChange: (languages: Language[]) => void;
  fromCache?: boolean;
  lastFetched?: string;
}

const LANGUAGES = [
  { value: 'en' as const, label: 'English', flag: '🇬🇧' },
  { value: 'pt' as const, label: 'Português', flag: '🇵🇹' },
  { value: 'es' as const, label: 'Español', flag: '🇪🇸' },
];

interface RSSFeed {
  name: string;
  topic: string;
  language: string;
  country: string;
}

interface RSSFeedStats {
  totalFeeds: number;
  byTopic: Record<string, number>;
  byLanguage: Record<string, number>;
  feeds: RSSFeed[];
}

export const Settings = memo(function Settings({
  isOpen,
  onClose,
  isDarkMode,
  onToggleDarkMode,
  isBedTimeMode,
  onToggleBedTimeMode,
  selectedLanguages,
  onLanguagesChange,
  fromCache,
  lastFetched,
}: SettingsProps) {
  const [feedStats, setFeedStats] = useState<RSSFeedStats | null>(null);
  const [loadingFeeds, setLoadingFeeds] = useState(false);

  useEffect(() => {
    if (isOpen && !feedStats) {
      fetchFeedStats();
    }
  }, [isOpen]);

  const fetchFeedStats = async () => {
    setLoadingFeeds(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-b78002f5/feeds/stats`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFeedStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch feed stats:', error);
    } finally {
      setLoadingFeeds(false);
    }
  };

  const handleLanguageToggle = (lang: Language) => {
    const isSelected = selectedLanguages.includes(lang);
    
    if (isSelected) {
      // Don't allow deselecting if it's the only one selected
      if (selectedLanguages.length > 1) {
        onLanguagesChange(selectedLanguages.filter(l => l !== lang));
      }
    } else {
      onLanguagesChange([...selectedLanguages, lang]);
    }
  };

  const groupFeedsByTopic = (feeds: RSSFeed[]) => {
    const grouped: Record<string, RSSFeed[]> = {};
    feeds.forEach(feed => {
      if (!grouped[feed.topic]) {
        grouped[feed.topic] = [];
      }
      grouped[feed.topic].push(feed);
    });
    return grouped;
  };

  const getTopicLabel = (topic: string) => {
    const labels: Record<string, string> = {
      'design': 'UX Design',
      'ai': 'AI & Tech',
      'tennis': 'Tennis',
      'economy': 'Economy',
      'general': 'General News',
    };
    return labels[topic] || topic;
  };

  const getLanguageFlag = (lang: string) => {
    const flags: Record<string, string> = {
      'en': '🇬🇧',
      'pt': '🇵🇹',
      'es': '🇪🇸',
    };
    return flags[lang] || '🌐';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Settings Panel */}
          <motion.div
            initial={{ opacity: 0, x: 320 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-background shadow-2xl z-50 overflow-y-auto"
            style={{
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {/* Header - extends to top with safe area */}
            <div 
              className="sticky top-0 bg-background border-b border-border z-10"
              style={{
                paddingTop: 'max(env(safe-area-inset-top), 0.5rem)',
              }}
            >
              <div className="px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Settings</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Close settings"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Appearance Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  {isBedTimeMode ? (
                    <BookOpen className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  ) : isDarkMode ? (
                    <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  ) : (
                    <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  )}
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Appearance</h3>
                </div>
                
                <div className="space-y-3">
                  {/* Bed Time Mode Toggle */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                    <button
                      onClick={onToggleBedTimeMode}
                      className="w-full flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center group-hover:scale-105 transition-transform">
                          <BookOpen className={`w-5 h-5 ${isBedTimeMode ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Bed Time Mode
                            </p>
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded uppercase tracking-wide">
                              E-Reader
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            OLED black, minimal contrast
                          </p>
                        </div>
                      </div>
                      
                      {/* Toggle Switch */}
                      <div
                        className={`
                          relative w-12 h-6 rounded-full transition-colors border dark:border-transparent shrink-0 ml-2
                          ${isBedTimeMode ? 'bg-blue-600 border-blue-600' : 'bg-gray-300 border-gray-400 dark:bg-gray-600'}
                        `}
                      >
                        <motion.div
                          animate={{ x: isBedTimeMode ? 24 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                        />
                      </div>
                    </button>
                  </div>

                  {/* Dark/Light Mode Toggle - Disabled when Bed Time is active */}
                  <div className={`
                    bg-gray-50 dark:bg-gray-800 rounded-lg p-4 transition-all border-2
                    ${isBedTimeMode ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-transparent' : 'border-gray-200 dark:border-transparent hover:border-blue-200 dark:hover:border-blue-800'}
                  `}>
                    <button
                      onClick={() => {
                        if (!isBedTimeMode) {
                          onToggleDarkMode();
                          Analytics.darkModeToggled(!isDarkMode);
                        }
                      }}
                      disabled={isBedTimeMode}
                      className="w-full flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center group-hover:scale-105 transition-transform">
                          {isDarkMode ? (
                            <Moon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Sun className="w-5 h-5 text-yellow-600" />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Dark Mode
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {isBedTimeMode ? 'Disabled in Bed Time' : `Currently ${isDarkMode ? 'enabled' : 'disabled'}`}
                          </p>
                        </div>
                      </div>
                      
                      {/* Toggle Switch */}
                      <div
                        className={`
                          relative w-12 h-6 rounded-full transition-colors border dark:border-transparent
                          ${isDarkMode ? 'bg-blue-600 border-blue-600' : 'bg-gray-300 border-gray-400 dark:bg-gray-600'}
                        `}
                      >
                        <motion.div
                          animate={{ x: isDarkMode ? 24 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                        />
                      </div>
                    </button>
                  </div>
                </div>
              </section>

              {/* Language Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Languages className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Language Filter</h3>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Select one or more languages to show
                </p>

                <div className="space-y-2">
                  {LANGUAGES.map((lang) => {
                    const isSelected = selectedLanguages.includes(lang.value);
                    const isOnlySelected = isSelected && selectedLanguages.length === 1;
                    
                    return (
                      <button
                        key={lang.value}
                        onClick={() => handleLanguageToggle(lang.value)}
                        disabled={isOnlySelected}
                        className={`
                          w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                          ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-500 dark:border-blue-600'
                              : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-700'
                          }
                          ${isOnlySelected ? 'opacity-60 cursor-not-allowed' : ''}
                        `}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <div className="flex-1 text-left">
                          <p className={`
                            text-sm font-medium
                            ${
                              isSelected
                                ? 'text-blue-700 dark:text-blue-300'
                                : 'text-gray-900 dark:text-gray-100'
                            }
                          `}>
                            {lang.label}
                          </p>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center"
                          >
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </motion.div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* RSS Sources Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">RSS Sources</h3>
                </div>
                
                {loadingFeeds ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">Loading sources...</p>
                    </div>
                  </div>
                ) : feedStats ? (
                  <>
                    {/* Stats Overview */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-4 mb-4 border border-blue-100 dark:border-blue-900">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                            {feedStats.totalFeeds}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Sources</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">
                            {Object.keys(feedStats.byTopic).length}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Topics</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                            {Object.keys(feedStats.byLanguage).length}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Languages</p>
                        </div>
                      </div>
                    </div>

                    {/* Feeds by Topic */}
                    <Accordion type="single" collapsible className="space-y-2">
                      {Object.entries(groupFeedsByTopic(feedStats.feeds)).map(([topic, feeds]) => (
                        <AccordionItem
                          key={topic}
                          value={topic}
                          className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                        >
                          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
                            <div className="flex items-center justify-between w-full pr-2">
                              <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                {getTopicLabel(topic)}
                              </span>
                              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
                                {feeds.length} {feeds.length === 1 ? 'source' : 'sources'}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-3">
                            <div className="space-y-2 pt-2">
                              {feeds.map((feed, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between py-2 px-3 bg-card rounded border border-border"
                                >
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {feed.name}
                                  </span>
                                  <span className="text-base">
                                    {getLanguageFlag(feed.language)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
                    <Rss className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Failed to load RSS sources
                    </p>
                  </div>
                )}
              </section>

              {/* Data Status Section */}
              {fromCache && lastFetched && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Data Status</h3>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span>Cached Content</span>
                    </div>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1 ml-4">
                      Last updated: {new Date(lastFetched).toLocaleTimeString()}
                    </p>
                  </div>
                </section>
              )}

              {/* Contact Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Contact Me</h3>
                </div>
                
                <a 
                  href="mailto:rfonseca1992@gmail.com"
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all group"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                      Send Feedback
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      rfonseca1992@gmail.com
                    </span>
                  </div>
                  <Mail className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </a>
              </section>

              {/* Info Section */}
              <section className="pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="text-center space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Notinow v2.57
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 pt-2">
                    Created by Ricardo Fonseca
                  </p>
                </div>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});