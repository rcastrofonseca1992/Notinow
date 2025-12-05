import { memo, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Heart, Share2 } from 'lucide-react';
import { ArticleCard } from './ArticleCard';
import { Article } from '../types';

interface SwipeableArticleCardProps {
  article: Article;
  onClick: () => void;
  isSaved?: boolean;
  isRead?: boolean;
  onToggleSave?: (article: Article) => void;
  onShare?: (article: Article) => void;
}

const SWIPE_THRESHOLD = 80;
const ACTION_WIDTH = 80;

export const SwipeableArticleCard = memo(function SwipeableArticleCard({
  article,
  onClick,
  isSaved = false,
  isRead = false,
  onToggleSave,
  onShare,
}: SwipeableArticleCardProps) {
  const x = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const opacity = useTransform(xSpring, [-ACTION_WIDTH, 0], [1, 0]);
  const actionX = useTransform(xSpring, (val) => val + ACTION_WIDTH);
  
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    const deltaX = e.touches[0].clientX - startX.current;
    
    // Only allow left swipe (negative deltaX)
    if (deltaX < 0) {
      x.set(Math.max(deltaX, -ACTION_WIDTH * 2));
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const currentX = x.get();
    
    if (currentX < -SWIPE_THRESHOLD) {
      // Swipe completed - keep it open
      x.set(-ACTION_WIDTH);
    } else {
      // Spring back
      x.set(0);
    }
    
    setIsDragging(false);
  };

  const handleActionClick = (action: () => void) => {
    action();
    // Close after action
    x.set(0);
  };

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ touchAction: 'pan-y' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Action buttons (revealed on swipe) */}
      <motion.div
        className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-4 z-10"
        style={{
          x: actionX,
          opacity,
        }}
      >
        {onShare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleActionClick(() => onShare(article));
            }}
            className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            aria-label="Share article"
          >
            <Share2 className="w-5 h-5" />
          </button>
        )}
        {onToggleSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleActionClick(() => onToggleSave(article));
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform ${
              isSaved 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-700 text-white'
            }`}
            aria-label={isSaved ? 'Remove from saved' : 'Save article'}
          >
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}
      </motion.div>

      {/* Card content */}
      <motion.div
        style={{ x: xSpring }}
        onClick={onClick}
      >
        <ArticleCard
          article={article}
          onClick={onClick}
          isSaved={isSaved}
          isRead={isRead}
          onToggleSave={onToggleSave}
          onShare={onShare}
        />
      </motion.div>
    </div>
  );
});

