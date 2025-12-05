import { useRef, useCallback, useEffect } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance in pixels
  velocityThreshold?: number; // Minimum velocity for quick swipes
  enabled?: boolean;
  preventDefault?: boolean;
  edgeSwipeOnly?: boolean; // Only trigger from screen edges
  edgeThreshold?: number; // Distance from edge to consider edge swipe
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  velocityThreshold = 0.3,
  enabled = true,
  preventDefault = false,
  edgeSwipeOnly = false,
  edgeThreshold = 20,
}: SwipeGestureOptions) {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchMove = useRef<{ x: number; y: number; time: number } | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Check if edge swipe is required
    if (edgeSwipeOnly) {
      const isLeftEdge = startX <= edgeThreshold;
      const isRightEdge = startX >= screenWidth - edgeThreshold;
      const isTopEdge = startY <= edgeThreshold;
      const isBottomEdge = startY >= screenHeight - edgeThreshold;

      if (!isLeftEdge && !isRightEdge && !isTopEdge && !isBottomEdge) {
        return; // Not starting from edge, ignore
      }
    }

    touchStart.current = {
      x: startX,
      y: startY,
      time: Date.now(),
    };
    touchMove.current = null;
  }, [enabled, edgeSwipeOnly, edgeThreshold]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStart.current || e.touches.length !== 1) return;

    const touch = e.touches[0];
    touchMove.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    // Prevent default scrolling if we're detecting a horizontal swipe
    if (preventDefault && touchStart.current) {
      const deltaX = Math.abs(touch.clientX - touchStart.current.x);
      const deltaY = Math.abs(touch.clientY - touchStart.current.y);
      
      // If horizontal movement is dominant, prevent default
      if (deltaX > deltaY && deltaX > 10) {
        e.preventDefault();
      }
    }
  }, [preventDefault]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart.current) return;

    const endTouch = touchMove.current || {
      x: e.changedTouches[0]?.clientX || touchStart.current.x,
      y: e.changedTouches[0]?.clientY || touchStart.current.y,
      time: Date.now(),
    };

    const deltaX = endTouch.x - touchStart.current.x;
    const deltaY = endTouch.y - touchStart.current.y;
    const deltaTime = endTouch.time - touchStart.current.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;

    // Determine primary direction
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Check if swipe meets threshold
    if (distance < threshold && velocity < velocityThreshold) {
      touchStart.current = null;
      touchMove.current = null;
      return;
    }

    // Determine swipe direction
    if (absX > absY) {
      // Horizontal swipe
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else {
      // Vertical swipe
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }

    touchStart.current = null;
    touchMove.current = null;
  }, [threshold, velocityThreshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  const setRef = useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const element = elementRef.current || document;
    const options = { passive: !preventDefault };

    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchmove', handleTouchMove, options);
    element.addEventListener('touchend', handleTouchEnd, options);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault]);

  return { ref: setRef };
}

