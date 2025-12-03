import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ExternalLink, Type, Heart, Share2, Play, MoreVertical, X } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Article } from '../types';
import { formatFullDate } from '../utils/helpers';
import { READER_SETTINGS } from '../constants';
import { Slider } from './ui/slider';
import { motion, AnimatePresence } from 'motion/react';
import { TopicBadge } from './TopicBadge';
import { SourceBadge } from './SourceBadge';

interface ArticlePageProps {
  article: Article;
  onBack: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onShare?: () => void;
}

// HTML sanitization function (kept from original)
function sanitizeHTML(html: string): string {
  if (!html) return '';
  
  // List of allowed video embed domains
  const allowedVideoHosts = [
    'youtube.com', 'www.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com',
    'player.vimeo.com', 'vimeo.com', 'dailymotion.com', 'www.dailymotion.com',
    'videopress.com', 'ted.com', 'embed.ted.com', 'fast.wistia.net',
    'player.twitch.tv', 'streamable.com', 'content.jwplatform.com',
  ];
  
  // Remove script tags and dangerous attributes
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
  
  // Filter iframes
  cleaned = cleaned.replace(/<iframe\b[^>]*>/gi, (match) => {
    const srcMatch = match.match(/src=["']([^"']+)["']/i);
    if (!srcMatch) return '';
    const src = srcMatch[1];
    try {
      const url = new URL(src);
      const isAllowed = allowedVideoHosts.some(host => 
        url.hostname === host || url.hostname.endsWith('.' + host)
      );
      if (isAllowed) {
        let responsiveIframe = match
          .replace(/on\w+="[^"]*"/gi, '')
          .replace(/javascript:/gi, '');
        if (!responsiveIframe.includes('allowfullscreen')) responsiveIframe = responsiveIframe.replace(/>$/, ' allowfullscreen>');
        if (!responsiveIframe.includes('loading=')) responsiveIframe = responsiveIframe.replace(/>$/, ' loading="lazy">');
        return responsiveIframe;
      }
    } catch { return ''; }
    return '';
  });
  return cleaned;
}

export function ArticlePage({
  article,
  onBack,
  isSaved = false,
  onToggleSave,
  onShare,
}: ArticlePageProps) {
  const [fontSize, setFontSize] = useState(READER_SETTINGS.DEFAULT_FONT_SIZE);
  const [showFontControls, setShowFontControls] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load saved font size
  useEffect(() => {
    const saved = localStorage.getItem('readerFontSize');
    if (saved) setFontSize(parseInt(saved, 10));
  }, []);

  // Save font size
  useEffect(() => {
    localStorage.setItem('readerFontSize', fontSize.toString());
  }, [fontSize]);

  const sanitizedContent = article.contentHtml ? sanitizeHTML(article.contentHtml) : null;

  return (
    <div className="relative min-h-screen bg-background">
      {/* Fixed Header Actions */}
      <header className="fixed top-0 inset-x-0 z-50 px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between pointer-events-none">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="pointer-events-auto w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-black/40 transition-colors shadow-sm"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-3 pointer-events-auto">
           <button
            onClick={() => setShowFontControls(!showFontControls)}
            className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-black/40 transition-colors shadow-sm"
            aria-label="Font settings"
          >
            <Type className="w-5 h-5" />
          </button>
          
          {onToggleSave && (
            <button
              onClick={onToggleSave}
              className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border border-white/10 transition-all shadow-sm ${
                isSaved 
                  ? 'bg-primary text-white' 
                  : 'bg-black/20 text-white hover:bg-black/40'
              }`}
              aria-label={isSaved ? 'Remove from saved' : 'Save article'}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}
          
          {onShare && (
            <button
              onClick={onShare}
              className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-black/40 transition-colors shadow-sm"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Font Size Controls Panel (Fixed below header) */}
      <AnimatePresence>
        {showFontControls && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-[calc(4rem+env(safe-area-inset-top))] right-4 z-50 w-64 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-xl overflow-hidden"
          >
             <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Font Size</span>
                  <button onClick={() => setShowFontControls(false)}>
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs">A</span>
                  <Slider
                    value={[fontSize]}
                    onValueChange={(v) => v[0] && setFontSize(v[0])}
                    min={READER_SETTINGS.MIN_FONT_SIZE}
                    max={READER_SETTINGS.MAX_FONT_SIZE}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-lg">A</span>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Image Background */}
      <div className="fixed inset-x-0 top-0 h-[55vh] z-0">
         {article.videoUrl ? (
            <video
              src={article.videoUrl}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
         ) : (
            <ImageWithFallback
              src={article.urlToImage || ''}
              alt={article.title}
              className="w-full h-full object-cover"
            />
         )}
         {/* Gradient Overlay for Text Legibility */}
         <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
      </div>

      {/* Scrollable Content */}
      <div 
        ref={scrollRef}
        className="relative z-10 h-screen overflow-y-auto overflow-x-hidden"
      >
        {/* Transparent Spacer with Tag Overlay */}
        <div className="w-full h-[45vh] flex flex-col justify-end items-start px-6 pb-6">
           <TopicBadge topic={article.topic} variant="default" />
        </div>

        {/* Content Card */}
        <div className="bg-background rounded-t-[32px] min-h-screen shadow-[0_-10px_40px_rgba(0,0,0,0.15)] relative -mt-4">
           {/* Drag Handle Visual */}
           <div className="w-full flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
           </div>

           <article className="max-w-3xl mx-auto px-6 sm:px-8 pb-24 pt-4">
              
              {/* Title Header */}
              <div className="mb-8">
                 {/* Note: TopicBadge moved back to overlay above */}
                 
                 <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
                   {article.title}
                 </h1>

                 <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <span>{formatFullDate(article.publishedAt)}</span>
                 </div>
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-border mb-8" />

              {/* Source Info */}
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
                 {/* Source Logo Fallback */}
                 <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-secondary-foreground">
                    {article.source.charAt(0)}
                 </div>
                 <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                       <span className="font-bold text-foreground">{article.source}</span>
                       <SourceBadge sourceName={article.source} variant="compact" />
                    </div>
                    {article.author && (
                       <span className="text-xs text-muted-foreground">By {article.author}</span>
                    )}
                 </div>
                 {/* External Link Button */}
                 <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors"
                    title="Read original"
                 >
                    <ExternalLink className="w-5 h-5" />
                 </a>
              </div>

              {/* Body Text */}
              {sanitizedContent ? (
                <div 
                  className="prose prose-gray dark:prose-invert max-w-none"
                  style={{ fontSize: `${fontSize}px` }}
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
              ) : (
                <div 
                  className="text-foreground/80 leading-relaxed space-y-4"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <p>{article.summary}</p>
                  {!article.hasFull && (
                     <div className="p-4 bg-secondary/50 rounded-xl mt-6 text-sm text-muted-foreground">
                        <p>Full content not available. Read the full story on the source website.</p>
                     </div>
                  )}
                </div>
              )}
              
              {/* Read Original CTA */}
              <div className="mt-12">
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3.5 bg-primary text-primary-foreground text-center font-medium rounded-xl hover:opacity-90 transition-opacity shadow-sm"
                >
                  Read full article
                </a>
              </div>
           </article>
        </div>
      </div>
    </div>
  );
}