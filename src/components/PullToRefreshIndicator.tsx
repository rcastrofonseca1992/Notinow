import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, ChevronDown } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  threshold: number;
}

export function PullToRefreshIndicator({ 
  isPulling, 
  pullDistance, 
  isRefreshing, 
  threshold 
}: PullToRefreshIndicatorProps) {
  const isReadyToRefresh = pullDistance >= threshold;
  const progress = Math.min((pullDistance / threshold) * 100, 100);

  return (
    <AnimatePresence>
      {(isPulling || isRefreshing) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
          style={{
            transform: `translateY(${isRefreshing ? 60 : pullDistance}px)`,
            transition: isRefreshing ? 'transform 0.3s ease-out' : 'none',
          }}
        >
          <div className="bg-background/95 backdrop-blur-lg border border-border rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
            {isRefreshing ? (
              <>
                <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                <span className="text-sm font-medium text-foreground">Refreshing...</span>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ 
                    rotate: isReadyToRefresh ? 180 : 0,
                    scale: isReadyToRefresh ? 1.1 : 1 
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {isReadyToRefresh ? (
                    <RefreshCw className="w-4 h-4 text-primary" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </motion.div>
                <span className="text-sm font-medium text-foreground">
                  {isReadyToRefresh ? 'Release to refresh' : 'Pull to refresh'}
                </span>
                
                {/* Progress indicator */}
                <div className="w-8 h-1 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
