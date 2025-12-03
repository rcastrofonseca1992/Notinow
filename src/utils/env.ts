/**
 * Environment Detection Utilities
 * Provides safe access to environment variables
 */

/**
 * Check if we're running in development mode
 */
export function isDevelopment(): boolean {
  try {
    // Try various methods to detect development mode
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      return true;
    }
    
    // Check if running on localhost
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Check if we're running in production mode
 */
export function isProduction(): boolean {
  try {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
      return true;
    }
    
    return !isDevelopment();
  } catch {
    return true; // Default to production for safety
  }
}

/**
 * Get the current environment name
 */
export function getEnvironment(): 'development' | 'production' {
  return isDevelopment() ? 'development' : 'production';
}
