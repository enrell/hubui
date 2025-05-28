/**
 * URL Security Validation Utilities
 * Validates URLs for security risks before allowing iframe embedding
 * Note: HubUI is designed for local service management, so localhost is generally allowed
 */

// Private network ranges - only blocked when allowPrivateNetworks is explicitly false
const PRIVATE_NETWORK_RANGES = [
  /^https?:\/\/10\./,                    // 10.0.0.0/8
  /^https?:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16.0.0/12
  /^https?:\/\/192\.168\./,              // 192.168.0.0/16
  /^https?:\/\/127\./,                   // 127.0.0.0/8 (localhost)
  /^https?:\/\/localhost/,               // localhost variants
  /^https?:\/\/0\.0\.0\.0/,              // 0.0.0.0
  /^https?:\/\/\[::1\]/,                 // IPv6 localhost
  /^https?:\/\/\[::\]/,                  // IPv6 any
];

// Only truly dangerous domains that should always be blocked
const ALWAYS_BLOCKED_DOMAINS: string[] = [
  // Add actual malicious domains here if needed
];

// File protocols and other dangerous schemes
const BLOCKED_PROTOCOLS = [
  'file:',
  'ftp:',
  'javascript:',
  'data:',
  'vbscript:',
  'chrome:',
  'chrome-extension:',
  'moz-extension:'
];

export interface URLValidationResult {
  isValid: boolean;
  reason?: string;
  sanitizedUrl?: string;
}

export interface URLValidationOptions {
  allowHttp?: boolean;
  allowPrivateNetworks?: boolean;
  customBlockedDomains?: string[];
  requireHttps?: boolean;
}

/**
 * Validates a URL for security before iframe embedding
 */
export function validateServiceUrl(
  url: string, 
  options: URLValidationOptions = {}
): URLValidationResult {
  const {
    allowHttp = true,
    allowPrivateNetworks = false,
    customBlockedDomains = [],
    requireHttps = false
  } = options;

  try {
    // Basic format validation
    if (!url || typeof url !== 'string') {
      return { isValid: false, reason: 'Invalid URL format' };
    }

    // Trim and normalize
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      return { isValid: false, reason: 'Empty URL' };
    }

    // Parse URL
    const urlObj = new URL(trimmedUrl);

    // Check protocol
    if (BLOCKED_PROTOCOLS.includes(urlObj.protocol)) {
      return { 
        isValid: false, 
        reason: `Protocol '${urlObj.protocol}' is not allowed for security reasons` 
      };
    }

    // Check HTTP/HTTPS protocol requirements
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { 
        isValid: false, 
        reason: 'Only HTTP and HTTPS protocols are allowed' 
      };
    }

    // Require HTTPS if specified (takes precedence over allowHttp)
    if (requireHttps && urlObj.protocol !== 'https:') {
      return { 
        isValid: false, 
        reason: 'Only HTTPS URLs are allowed by current security settings' 
      };
    }

    // Block HTTP if not allowed (only checked if requireHttps is false)
    if (!requireHttps && !allowHttp && urlObj.protocol === 'http:') {
      return { 
        isValid: false, 
        reason: 'HTTP URLs are not allowed by current security settings. Please use HTTPS.' 
      };
    }

    // Check for blocked domains (only truly malicious ones)
    const hostname = urlObj.hostname.toLowerCase();
    const allBlockedDomains = [...ALWAYS_BLOCKED_DOMAINS, ...customBlockedDomains];
    
    if (allBlockedDomains.includes(hostname)) {
      return { 
        isValid: false, 
        reason: `Domain '${hostname}' is blocked for security reasons` 
      };
    }

    // Check for private network ranges
    if (!allowPrivateNetworks) {
      for (const range of PRIVATE_NETWORK_RANGES) {
        if (range.test(trimmedUrl)) {
          return { 
            isValid: false, 
            reason: 'Private network URLs are not allowed for security reasons' 
          };
        }
      }
    }

    // Check for suspicious patterns
    if (hostname.includes('..') || hostname.includes('%')) {
      return { 
        isValid: false, 
        reason: 'URL contains suspicious characters' 
      };
    }

    // Additional security checks
    if (urlObj.username || urlObj.password) {
      return { 
        isValid: false, 
        reason: 'URLs with credentials are not allowed' 
      };
    }

    return { 
      isValid: true, 
      sanitizedUrl: urlObj.toString() 
    };

  } catch {
    return { 
      isValid: false, 
      reason: 'Invalid URL format' 
    };
  }
}

/**
 * Validates and sanitizes a URL with strict security settings
 */
export function validateSecureUrl(url: string): URLValidationResult {
  return validateServiceUrl(url, {
    allowHttp: false,        // Only HTTPS
    allowPrivateNetworks: false,
    requireHttps: true
  });
}

/**
 * Validates a URL for local development (more permissive)
 */
export function validateLocalUrl(url: string): URLValidationResult {
  return validateServiceUrl(url, {
    allowHttp: true,
    allowPrivateNetworks: true
  });
}

/**
 * Check if URL is likely a local development URL
 */
export function isLocalDevelopmentUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return hostname === 'localhost' ||
           hostname === '127.0.0.1' ||
           hostname.startsWith('192.168.') ||
           hostname.startsWith('10.') ||
           hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) !== null;
  } catch {
    return false;
  }
}
