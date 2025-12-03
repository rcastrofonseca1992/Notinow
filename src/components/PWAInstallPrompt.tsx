import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isPWAInstalled, getPlatformInfo } from '../utils/pwa';
import { Analytics } from '../utils/analytics';

/**
 * PWA Install Prompt Component
 * Shows a prompt to install the app on mobile devices
 * Only appears for non-installed users on mobile
 */
export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [platform, setPlatform] = useState<'ios' | 'android' | null>(null);
  
  useEffect(() => {
    // Check if already installed
    if (isPWAInstalled()) {
      return;
    }
    
    // Check if user dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }
    
    // Get platform info
    const platformInfo = getPlatformInfo();
    
    if (!platformInfo.isMobile) {
      return; // Don't show on desktop
    }
    
    // Set platform for instruction text
    if (platformInfo.isIOS) {
      setPlatform('ios');
      // Show iOS prompt after a short delay
      setTimeout(() => {
        setShowPrompt(true);
        Analytics.pwaInstallPrompted();
      }, 3000);
    } else if (platformInfo.isAndroid) {
      setPlatform('android');
      
      // Listen for install prompt on Android
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setTimeout(() => {
          setShowPrompt(true);
          Analytics.pwaInstallPrompted();
        }, 3000);
      };
      
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);
  
  const handleInstall = async () => {
    if (platform === 'android' && deferredPrompt) {
      // Show Android install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        Analytics.pwaInstallAccepted();
      } else {
        Analytics.pwaInstallDismissed();
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
    // For iOS, the prompt just shows instructions
  };
  
  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    Analytics.pwaInstallDismissed();
  };
  
  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe-area-pb"
        >
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
            
            {/* Content */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Install Notinow
                </h3>
                
                {platform === 'ios' ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Tap the share button <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 dark:bg-blue-900 rounded text-xs">↑</span> and select "Add to Home Screen"
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Install Notinow for a faster, app-like experience. No ads, no tracking.
                  </p>
                )}
                
                {platform === 'android' && deferredPrompt && (
                  <button
                    onClick={handleInstall}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Install Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
