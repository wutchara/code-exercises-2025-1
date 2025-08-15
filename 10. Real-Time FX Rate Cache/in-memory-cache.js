/**
 * A simple in-memory cache with a Time-To-Live (TTL) for each entry.
 */
class TTLCache {
  /**
   * Creates an instance of TTLCache.
   * @param {number} defaultTTL The default time-to-live in milliseconds for cache entries.
   * @throws {Error} If the TTL is not a positive number.
   */
  constructor(defaultTTL) {
    if (typeof defaultTTL !== "number" || defaultTTL <= 0) {
      throw new Error("TTL must be a positive number.");
    }
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  /**
   * Sets a key-value pair in the cache with an optional TTL.
   * If the key already exists, its value and TTL will be updated.
   * @param {string} key The key to set.
   * @param {number} value The value to associate with the key.
   * @param {number} [ttl=this.defaultTTL] The time-to-live for this specific entry in milliseconds.
   */
  set(key, value, ttl) {
    const now = Date.now();
    const entryTtl = ttl || this.defaultTTL;
    this.cache.set(key, {
      value,
      timestamp: now,
      ttl: entryTtl,
    });
  }

  /**
   * Retrieves a value from the cache.
   * If the key does not exist or has expired, it returns null.
   * @param {string} key The key to retrieve.
   * @returns {any|null} The value associated with the key, or null if not found or expired.
   */
  get(key) {
    const now = Date.now();
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if the entry has expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key); // Clean up expired entry
      return null;
    }

    return entry.value;
  }

  /**
   * Checks if a key exists in the cache and has not expired.
   * This method does not delete the key if it has expired.
   * @param {string} key The key to check.
   * @returns {boolean} True if the key exists and is valid, false otherwise.
   */
  has(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }
    // Check for expiration without causing a deletion
    return Date.now() - entry.timestamp <= entry.ttl;
  }

  /**
   * Deletes a key from the cache.
   * @param {string} key The key to delete.
   * @returns {boolean} True if the key was deleted, false otherwise.
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clears all entries from the cache.
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Returns an iterator for the keys in the cache.
   * @returns {IterableIterator<string>} An iterator for the cache keys.
   */
  keys() {
    return this.cache.keys();
  }
}

export default TTLCache;
