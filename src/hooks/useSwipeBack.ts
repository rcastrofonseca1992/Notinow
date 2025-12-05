import { useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';

interface UseSwipeBackOptions {
  onSwipeBack: () => void;
  enabled?: boolean;
  threshold?: number; // Distance in pixels to trigger swipe back
}

/**
 * Hook for iOS-style swipe back gesture
 * Provides smooth animation and native feel
 */
export function useSwipeBack({
  onSwipeBack,
  enabled = true,
  threshold = 100,
}: UseSwipeBackOptions) {
  const x = useMotionValue(0);
  const springConfig = { stiffness: 300, damping: 30 };
  const xSpring = useSpring(x, springConfig);
  const opacity = useTransform(xSpring, [0, threshold], [1, 0.3]);
  const scale = useTransform(xSpring, [0, threshold], [1, 0.95]);
  
  const startX = useRef<number>(0);
  const isDragging = useRef(false);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const startXPos = touch.clientX;
    
    // Only allow swipe back from left edge (iOS style)
    if (startXPos > 50) return;
    
    startX.current = startXPos;
    isDragging.current = true;
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging.current || !enabled || e.touches.length !== 1) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startX.current;
    
    // Only allow right swipe (back gesture)
    if (deltaX > 0) {
      x.set(Math.min(deltaX, threshold * 1.5));
      e.preventDefault(); // Prevent scrolling while swiping
    }
  }, [enabled, x, threshold]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    
    const currentX = x.get();
    
    if (currentX >= threshold) {
      // Swipe back completed - trigger callback
      onSwipeBack();
      // Reset immediately after callback
      x.set(0);
    } else {
      // Spring back to original position
      x.set(0);
    }
    
    isDragging.current = false;
  }, [x, threshold, onSwipeBack]);

  const setRef = useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const element = elementRef.current || document;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ref: setRef,
    x: xSpring,
    opacity,
    scale,
  };
}

