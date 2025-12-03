import { useEffect, useRef, useCallback, useState } from 'react';

interface UsePullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  enabled?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
}

export function usePullToRefresh({ 
  onRefresh, 
  threshold = 80,
  enabled = true,
  containerRef
}: UsePullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  
  const getScrollTop = useCallback(() => {
    return containerRef?.current ? containerRef.current.scrollTop : window.scrollY;
  }, [containerRef]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || isRefreshing) return;
    
    // Only trigger if at top of page
    if (getScrollTop() === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, [enabled, isRefreshing, getScrollTop]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || isRefreshing || startY.current === 0) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;
    
    // Only pull down when at top of page
    if (getScrollTop() === 0 && distance > 0) {
      // If pulling, prevent default to avoid scrolling/refreshing
      // But if we are in a scroll container, we might need to prevent bubbling?
      // The 'overscroll-behavior-y: contain' CSS handles most of it.
      
      setIsPulling(true);
      // Apply resistance for smooth feel
      const resistance = 0.5;
      setPullDistance(Math.min(distance * resistance, threshold * 1.5));
      
      // Prevent default scroll behavior when pulling to stop native refresh
      if (distance > 10) {
        if (e.cancelable) e.preventDefault();
      }
    }
  }, [enabled, isRefreshing, threshold, getScrollTop]);

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || isRefreshing) return;
    
    if (isPulling && pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        // Small delay for better UX
        setTimeout(() => {
          setIsRefreshing(false);
          setIsPulling(false);
          setPullDistance(0);
        }, 300);
      }
    } else {
      setIsPulling(false);
      setPullDistance(0);
    }
    
    startY.current = 0;
  }, [enabled, isRefreshing, isPulling, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    if (!enabled) return;

    // Attach listeners to the container if provided, or document if not?
    // Pull to refresh gesture usually starts on the screen.
    // If we use container scroll, 'touchstart' on document is fine, but we check scrollTop.
    // Ideally we attach to the container.
    const target = containerRef?.current || document;

    // We need to bind to the element to prevent default properly?
    // Actually document level is safer for catching the gesture globally if usage is full screen.
    
    // Using non-passive for touchmove to allow preventDefault
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd, containerRef]);

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    threshold,
  };
}
