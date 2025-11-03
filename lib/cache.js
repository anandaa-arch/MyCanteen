/**
 * Simple in-memory cache with TTL (Time To Live)
 * Used for caching frequently accessed data on the client side
 */

const cache = new Map();

/**
 * Get item from cache if not expired
 * @param {string} key - Cache key
 * @returns {any} - Cached value or null if expired/not found
 */
export function getFromCache(key) {
  const item = cache.get(key);
  
  if (!item) {
    return null;
  }

  // Check if expired
  if (item.expiresAt && item.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }

  return item.value;
}

/**
 * Set item in cache with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttlSeconds - Time to live in seconds (default: 5 minutes)
 */
export function setInCache(key, value, ttlSeconds = 300) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + (ttlSeconds * 1000)
  });
}

/**
 * Clear specific cache entry
 * @param {string} key - Cache key
 */
export function clearCache(key) {
  cache.delete(key);
}

/**
 * Clear all cache entries matching a pattern
 * @param {string} pattern - Pattern to match (e.g., 'user_*' clears all user entries)
 */
export function clearCachePattern(pattern) {
  const regex = new RegExp(`^${pattern.replace('*', '.*')}$`);
  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear all cache
 */
export function clearAllCache() {
  cache.clear();
}

/**
 * Get cache stats for debugging
 */
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
    items: Array.from(cache.entries()).map(([key, item]) => ({
      key,
      expiresIn: item.expiresAt ? Math.round((item.expiresAt - Date.now()) / 1000) : null
    }))
  };
}
