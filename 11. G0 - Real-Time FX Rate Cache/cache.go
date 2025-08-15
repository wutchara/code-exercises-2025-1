package main

import (
	"fmt"
	"sync"
	"time"
)

// CacheEntry represents an entry in the TTL cache.
type CacheEntry struct {
	Value float64
	// ExpiresAt is the Unix timestamp in milliseconds when the entry will expire.
	ExpiresAt int64
}

// TTLCache is a thread-safe in-memory cache with a Time-To-Live (TTL) for each entry.
type TTLCache struct {
	cache       map[string]CacheEntry
	defaultTTL  time.Duration
	mu          sync.RWMutex
	stopJanitor chan struct{}
}

const (
	DefaultCacheTTL        = 5 * time.Second
	DefaultJanitorInterval = 50 * time.Millisecond
)

// NewTTLCache creates a new instance of TTLCache.
// It takes a defaultTTL for cache entries and an optional janitorInterval
// for the cleanup goroutine. If zero values are provided, it uses
// DefaultCacheTTL and DefaultJanitorInterval respectively.
// It returns an error if the provided durations are invalid (e.g., negative,
// or a janitor interval greater than the default TTL).
func NewTTLCache(defaultTTL time.Duration, janitorInterval ...time.Duration) (*TTLCache, error) {
	effectiveJanitorInterval := DefaultJanitorInterval
	if len(janitorInterval) > 0 {
		effectiveJanitorInterval = janitorInterval[0]
	}

	// A negative TTL is invalid.
	if defaultTTL < 0 {
		return nil, fmt.Errorf("default TTL must not be negative")
	}
	// A negative janitor interval is invalid.
	if effectiveJanitorInterval < 0 {
		return nil, fmt.Errorf("janitor interval must not be negative")
	}

	// Use defaults for zero values, allowing for easy configuration.
	if defaultTTL == 0 {
		defaultTTL = DefaultCacheTTL
	}

	if effectiveJanitorInterval == 0 {
		effectiveJanitorInterval = DefaultJanitorInterval
	}

	// It is inefficient for the cleanup interval to be longer than the item lifetime.
	if effectiveJanitorInterval > defaultTTL {
		return nil, fmt.Errorf("janitor interval (%v) must not be greater than default TTL (%v)", janitorInterval, defaultTTL)
	}

	cache := &TTLCache{
		cache:       make(map[string]CacheEntry),
		defaultTTL:  defaultTTL,
		stopJanitor: make(chan struct{}),
	}

	// Start the background cleanup goroutine (the "Janitor")
	cache.startJanitor(effectiveJanitorInterval)

	return cache, nil
}

// startJanitor starts a background goroutine to clean up expired entries periodically.
func (c *TTLCache) startJanitor(interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		for {
			select {
			case <-ticker.C:
				c.cleanupExpired()
			case <-c.stopJanitor:
				ticker.Stop()
				return
			}
		}
	}()
}

// StopJanitor stops the background janitor goroutine, allowing for a graceful shutdown.
func (c *TTLCache) StopJanitor() {
	if c.stopJanitor != nil {
		close(c.stopJanitor)
	}
}

// cleanupExpired removes all expired entries from the cache.
func (c *TTLCache) cleanupExpired() {
	c.mu.Lock()
	defer c.mu.Unlock()

	now := time.Now().UnixMilli()
	for key, entry := range c.cache {
		if now >= entry.ExpiresAt {
			delete(c.cache, key)
		}
	}
}

// Set adds or updates a key-value pair in the cache. It takes an optional
// ttl (time.Duration) for the entry. If no TTL is provided, it uses the
// cache's default TTL.
func (c *TTLCache) Set(key string, value float64, ttl ...time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	effectiveTTL := c.defaultTTL
	if len(ttl) > 0 && ttl[0] > 0 {
		effectiveTTL = ttl[0]
	}

	expiresAt := time.Now().Add(effectiveTTL).UnixMilli()

	c.cache[key] = CacheEntry{
		Value:     value,
		ExpiresAt: expiresAt,
	}
}

// Get retrieves a value from the cache. It returns the value and a boolean
// indicating whether the key was found. Expired keys are removed by the
// background janitor, so Get doesn't need to check for expiration.
func (c *TTLCache) Get(key string) (float64, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	entry, found := c.cache[key]
	if !found {
		return 0, false
	}
	return entry.Value, true
}
