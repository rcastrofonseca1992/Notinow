import { memo } from 'react';
import { Play, ScrollText } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Article } from '../types';
import { formatRelativeTime } from '../utils/helpers';
import { motion } from 'motion/react';
import { TOPICS } from '../constants';

interface ArticleCardProps {
  article: Article;
  onClick: () => void;
  isSaved?: boolean;
  isRead?: boolean;
  onToggleSave?: (article: Article) => void;
  onShare?: (article: Article) => void;
}

export const ArticleCard = memo(function ArticleCard({ 
  article, 
  onClick, 
  isRead = false,
}: ArticleCardProps) {

  // Get topic color for placeholder gradient
  const topicColor = TOPICS.find(t => t.value === article.topic)?.color || '#6B7280';
  
  // Only consider it having media if there is a valid image URL
  const hasMedia = !!article.urlToImage;
  const finalImageSrc = article.urlToImage || '';

  // Modern gradient palettes for each topic - following best UI practices
  const getGradientStyle = () => {
    switch (article.topic) {
      case 'design':
        return {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          overlay: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)'
        };
      case 'ai':
        return {
          background: 'linear-gradient(135deg, #4158d0 0%, #c850c0 50%, #ffcc70 100%)',
          overlay: 'radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)'
        };
      case 'tennis':
        return {
          background: 'linear-gradient(135deg, #0ba360 0%, #3cba92 50%, #30dd8a 100%)',
          overlay: 'radial-gradient(circle at 50% 40%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)'
        };
      case 'football':
        return {
          background: 'linear-gradient(135deg, #134e5e 0%, #71b280 50%, #a8e6cf 100%)',
          overlay: 'radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)'
        };
      case 'economy':
        return {
          background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #5eead4 100%)',
          overlay: 'radial-gradient(circle at 60% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 50%, #d1d5db 100%)',
          overlay: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)'
        };
    }
  };

  const gradientStyle = getGradientStyle();

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`group cursor-pointer bg-transparent rounded-xl md:hover:bg-card/50 transition-colors flex gap-4 h-full ${isRead ? 'opacity-75' : ''}`}
    >
      {/* Image - Left side, square aspect ratio, rounded corners */}
      <div className="relative flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden shadow-sm">
        {hasMedia ? (
          <>
            <div className="w-full h-full bg-gray-100 dark:bg-gray-800">
              <ImageWithFallback
                src={finalImageSrc}
                alt={article.title}
                loading="lazy"
                className={`w-full h-full object-cover transition-transform duration-300 md:group-hover:scale-105 ${isRead ? 'grayscale-[0.5]' : ''}`}
              />
            </div>
            
            {/* Read Overlay */}
            {isRead && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                 <span className="text-xs font-bold text-white uppercase tracking-wider">Read</span>
              </div>
            )}

            {/* Video Play Button Overlay (Only show if not read, or show smaller?) */}
            {article.videoUrl && !isRead && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="p-2 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
                  <Play className="w-4 h-4 text-primary fill-current" />
                </div>
              </div>
            )}
          </>
        ) : (
          /* Gradient placeholder */
          <div 
            className="w-full h-full relative overflow-hidden"
            style={{ background: gradientStyle.background }}
          >
            {isRead && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px] z-10">
                 <span className="text-xs font-bold text-white uppercase tracking-wider">Read</span>
              </div>
            )}

            {/* Video Play Button Overlay for Gradient (Video without image) */}
            {article.videoUrl && !isRead && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-20">
                <div className="p-2 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm">
                  <Play className="w-4 h-4 text-primary fill-current" />
                </div>
              </div>
            )}

            <div 
              className="absolute inset-0 opacity-40 dark:opacity-30" 
              style={{ background: gradientStyle.overlay }}
            />
            <div 
              className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundSize: '200px 200px'
              }}
            />
          </div>
        )}

        {/* Full Article Badge */}
        {article.hasFull && !isRead && (
          <div className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-primary/90 shadow-sm backdrop-blur-[2px]">
            <ScrollText className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* Content - Right side */}
      <div className="flex-1 flex flex-col min-w-0 h-full pt-[3px] pr-[0px] pb-[0px] pl-[0px] p-[0px]">
        
        {/* Category - Top */}
        <div className="text-[5px]">
           <span className="font-medium text-primary/80 capitalize truncate text-xs leading-none">
            {article.topic === 'today' ? 'General' : article.topic}
           </span>
        </div>

        {/* Title */}
        <h3 className={`text-base sm:text-lg font-bold text-foreground mb-1 mt-1 line-clamp-3 leading-tight ${isRead ? 'text-muted-foreground' : ''}`}>
          {article.title}
        </h3>

        {/* Source • Date - Bottom */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-auto">
          <span className="font-medium truncate max-w-[120px]">
            {article.source}
          </span>
          <span>•</span>
          <span>{formatRelativeTime(article.publishedAt)}</span>
        </div>
      </div>
    </motion.article>
  );
});