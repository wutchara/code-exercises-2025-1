# G0 - Real-Time FX Rate Cache

This project is a Go language implementation of a thread-safe, in-memory Time-To-Live (TTL) cache for storing floating-point values, such as real-time FX rates.

The cache is designed to be efficient and easy to use, with a background "janitor" goroutine that periodically cleans up expired entries.

## Requirements:

Design and implement a `TTLCache` with the following functionality:

1.  **`NewTTLCache(defaultTTL time.Duration, janitorInterval time.Duration)`**:
    -   `defaultTTL`: A `time.Duration` for the default lifetime of items in the cache.
    -   `janitorInterval`: A `time.Duration` for how often the cache should check for and remove expired items.
    -   Returns a new `TTLCache` instance.

2.  **`Set(key string, value float64, ttl ...time.Duration)`**:
    -   `key`: A `string` to reference the data.
    -   `value`: A `float64` representing the value to be stored (e.g., an exchange rate).
    -   `ttl`: (Optional) A `time.Duration` for the specific lifetime of this `key`. If not provided, it uses the `defaultTTL`.
    -   Adds or updates an item in the cache and sets its expiration time.

3.  **`Get(key string)`**:
    -   `key`: The `string` of the item to retrieve.
    -   Returns the `value` associated with the `key` and a boolean `true` if the key exists and has not expired.
    -   If the key does not exist or has been removed by the cleanup process, it returns `0` and `false`.

## Getting Started

### Prerequisites

- Go (v1.16 or later)

### How to Run

To run the demo, navigate to the project directory and execute the following command:

```sh
go run .
```

This will compile and run the `main.go` and `cache.go` files, which contain several demonstrations of the `TTLCache` functionality.

## Features

The `TTLCache` struct has the following methods:

-   **`NewTTLCache(defaultTTL, janitorInterval)`**: Initializes the cache with a default TTL and a cleanup interval.
-   **`Set(key, value, ttl ...)`**: Adds or updates a key-value pair in the cache with an optional TTL.
-   **`Get(key)`**: Retrieves a value from the cache.
-   **`StopJanitor()`**: Stops the background cleanup goroutine for a graceful shutdown.

## Implementation Details

The `TTLCache` is implemented using a `map[string]CacheEntry` and a `sync.RWMutex` to ensure thread-safe access.

-   **`CacheEntry`**: Each item in the cache is a `CacheEntry` struct containing the `Value` (`float64`) and its `ExpiresAt` timestamp (Unix milliseconds).
-   **Janitor Goroutine**: On initialization, `NewTTLCache` starts a background goroutine (a "janitor") that runs at the specified `janitorInterval`. This goroutine periodically scans the cache and removes any items where the current time has passed the `ExpiresAt` timestamp. This approach avoids the need to check for expiration on every `Get` call, making reads faster.

## Demo

The `main.go` file provides five demos to showcase the cache's functionality:

-   **Demo 1: Basic TTL**: Shows a value expiring after the default TTL.
-   **Demo 2: Custom TTL**: Demonstrates setting a custom TTL for a specific key.
-   **Demo 3: Update Key TTL**: Shows how updating a key's value also resets its TTL.
-   **Demo 4: Get Non-existent Key**: Illustrates the behavior of getting a key that hasn't been set.
-   **Demo 5: Multiple Keys & TTLs**: Shows the cache handling multiple keys with different expiration times.