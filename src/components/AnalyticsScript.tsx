import { useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

/**
 * Simple analytics script injector
 * Adds a basic pageview tracking script to the page
 * This runs immediately on page load, before React hydration
 */
export function AnalyticsScript() {
  useEffect(() => {
    // This effect ensures the script is available
    // The actual tracking is done by the inline script below
    console.debug('📊 Analytics script loaded');
  }, []);

  const scriptContent = `
(function() {
  fetch("https://${projectId}.supabase.co/functions/v1/make-server-b78002f5/analytics", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": "Bearer ${publicAnonKey}"
    },
    body: JSON.stringify({
      type: "pageview",
      path: window.location.pathname,
      referrer: document.referrer || null,
      timestamp: new Date().toISOString()
    })
  }).catch(function(err) {
    console.debug('Analytics pageview error:', err);
  });
})();
  `.trim();

  return (
    <>
      {/* Inline script for immediate pageview tracking */}
      <script dangerouslySetInnerHTML={{ __html: scriptContent }} />
    </>
  );
}
