# Real-Time FX Rate Cache

**Difficulty:** Medium  
**Tags:** `Design`, `Hash Table`, `Data Structure`, `FinTech`

---

## Problem Statement

You are developing a trading platform for Foreign Exchange (FX). To reduce the load and cost of calling an external data provider's API for every currency rate request, your team has decided to implement an in-memory caching system.

### Requirements:

Design and implement a `TTLCache` (Time-To-Live Cache) class in **Node.js** with the following functionality:

1.  **`constructor(defaultTTL)`**:

    - `defaultTTL`: An integer representing the default lifetime in milliseconds for items stored in the cache if no specific TTL is provided.

2.  **`set(key, value, ttl)`**:

    - `key`: A `string` used to reference the data.
    - `value`: A `number` representing the exchange rate to be stored.
    - `ttl`: (Optional) A `number` for the specific lifetime of this `key` in milliseconds. If not provided, it will use the `defaultTTL` from the constructor.
    - This function adds or updates the data in the cache and sets its expiration time.

3.  **`get(key)`**:
    - `key`: The `string` of the data to retrieve.
    - This function should return the `value` associated with the `key` if the key exists in the cache and **has not yet expired**.
    - If the key does not exist or **has already expired**, it should return `null`.

---

## Getting Started

### Prerequisites

- Node.js (v14.x or later)

### Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```sh
   cd 10.\ Real-Time\ FX\ Rate\ Cache
   ```

### How to Run

To run the demo, execute the following command:

```sh
npm start
```

This will run the `index.js` file, which contains several demonstrations of the `TTLCache` functionality.

---

## Features

The `TTLCache` class has the following methods:

- **`constructor(defaultTTL)`**: Initializes the cache with a default TTL.
- **`set(key, value, ttl)`**: Adds or updates a key-value pair in the cache with an optional TTL.
- **`get(key)`**: Retrieves a value from the cache. Returns `null` if the key is not found or has expired.
- **`has(key)`**: Checks if a key exists in the cache and has not expired.
- **`delete(key)`**: Deletes a key from the cache.
- **`clear()`**: Clears all entries from the cache.
- **`keys()`**: Returns an iterator for the keys in the cache.

---

## Implementation Details

The `TTLCache` is implemented using a `Map` data structure, which stores the cache entries. Each entry in the cache is an object with the following properties:

- **`value`**: The value of the cache entry.
- **`timestamp`**: The time when the entry was added or updated, in milliseconds.
- **`ttl`**: The time-to-live for the entry, in milliseconds.

When `get(key)` is called, it checks if the key exists and if the current time is greater than the entry's timestamp plus its TTL. If the entry has expired, it is deleted from the cache, and `null` is returned.

---

## Examples

**Example 1: Basic TTL**

```javascript
// Assuming start time is 0ms
const cache = new TTLCache(200); // Default TTL is 200ms

cache.set("USD/THB", 36.5); // Uses default TTL (expires at 200ms)

// After 100ms
cache.get("USD/THB"); // Output: 36.50 (Not expired yet)

// After another 150ms (total 250ms have passed)
cache.get("USD/THB"); // Output: null (Expired)
```

**Example 2: Custom TTL**

```javascript
const cache = new TTLCache(500); // Default TTL is 500ms

cache.set("EUR/USD", 1.08, 100); // Custom TTL is 100ms

// After 120ms
cache.get("EUR/USD"); // Output: null (Expired)
```

**Example 3: Updating a Key**

```javascript
const cache = new TTLCache(300); // Default TTL is 300ms

cache.set("JPY/THB", 0.23); // Expires at 300ms

// After 100ms
cache.get("JPY/THB"); // Output: 0.23

cache.set("JPY/THB", 0.24); // Value is updated, TTL is reset to 300ms

// After another 250ms (total 350ms passed since the key was updated)
cache.get("JPY/THB"); // Output: 0.24
```
