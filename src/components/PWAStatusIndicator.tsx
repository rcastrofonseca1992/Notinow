import { useEffect, useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { isPWAInstalled, getDisplayMode, getPlatformInfo } from '../utils/pwa';
import { isProduction } from '../utils/env';

/**
 * PWA Status Indicator Component
 * Shows current PWA status in development mode
 * Only visible in non-production environments
 */
export function PWAStatusIndicator() {
  const [status, setStatus] = useState<{
    isPWA: boolean;
    displayMode: string;
    platform: string;
  } | null>(null);
  
  // Only show in development mode
  if (isProduction()) {
    return null;
  }
  
  useEffect(() => {
    const platformInfo = getPlatformInfo();
    setStatus({
      isPWA: isPWAInstalled(),
      displayMode: getDisplayMode(),
      platform: platformInfo.isIOS ? 'iOS' : platformInfo.isAndroid ? 'Android' : 'Desktop',
    });
  }, []);
  
  if (!status) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white text-xs rounded-lg p-2 backdrop-blur-sm border border-white/10 shadow-lg max-w-[200px]">
      <div className="flex items-center gap-2 mb-1">
        {status.isPWA ? (
          <Smartphone className="w-3 h-3 text-green-400" />
        ) : (
          <Monitor className="w-3 h-3 text-yellow-400" />
        )}
        <span className="font-semibold">
          {status.isPWA ? 'PWA Mode' : 'Browser Mode'}
        </span>
      </div>
      <div className="space-y-0.5 text-gray-300">
        <div>Display: {status.displayMode}</div>
        <div>Platform: {status.platform}</div>
      </div>
    </div>
  );
}
