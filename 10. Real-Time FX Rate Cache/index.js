import TTLCache from "./in-memory-cache.js";

/**
 * A helper function to simulate waiting for a specific duration.
 * @param {number} ms The number of milliseconds to wait.
 * @returns {Promise<void>} A promise that resolves after the specified duration.
 */
async function waiting(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Demo 1: Basic TTL functionality.
 * - Sets a key with the default TTL.
 * - Gets the key before it expires.
 * - Gets the key after it expires.
 */
async function runDemo1() {
  console.log("Starting cache demo 1...");
  const key = "USD/THB";
  const value = 36.5;

  // Default TTL is 200ms
  const cache = new TTLCache(200);

  cache.set(key, value); // Uses default TTL (expires at 200ms from now)

  // Wait for 100ms
  await waiting(100);
  console.log("Value after 100ms:", cache.get(key)); // Expected: 36.5 (Not expired yet)

  // Wait for another 150ms (total 250ms have passed)
  await waiting(150);
  console.log("Value after 250ms:", cache.get(key)); // Expected: null (Expired)
  console.log("Cache demo finished.");
}

/**
 * Demo 2: Custom TTL functionality.
 * - Sets a key with a custom TTL shorter than the default.
 * - Gets the key after the custom TTL has expired.
 */
async function runDemo2() {
  console.log("Starting cache demo 2...");
  const key = "EUR/USD";
  const value = 1.08;

  // Default TTL is 500ms
  const cache = new TTLCache(500);

  cache.set(key, value, 100); // Uses custom TTL (expires at 100ms)
  console.log("Value after 0ms:", cache.get(key)); // Expected: 1.08 (Not expired yet)

  // After 120ms
  await waiting(120);
  console.log("Value after 120ms:", cache.get(key)); // Expected: null (Expired)
  console.log("Cache demo finished.");
}

/**
 * Demo 3: Updating a key's value and TTL.
 * - Sets a key with the default TTL.
 * - Gets the key before it expires.
 * - Updates the key with a new value, which also resets the TTL.
 * - Gets the key after the original TTL would have expired, but before the new TTL expires.
 * - Gets the key after the new TTL has expired.
 */
async function runDemo3() {
  console.log("Starting cache demo 3...");
  const key = "JPY/THB";
  const value = 0.23;

  // Default TTL is 300ms
  const cache = new TTLCache(300);

  cache.set(key, value); // Uses default TTL (expires at 300ms)

  await waiting(100);
  console.log("Value after 100ms:", cache.get(key)); // Expected: 0.23 (Not expired yet)

  cache.set(key, 0.24); // Value is updated, TTL is reset to the default 300ms
  await waiting(250);
  console.log("Value after 350ms (100 + 250):", cache.get(key)); // Expected: 0.24 (Still valid)

  // Total time elapsed: 100 + 250 = 350ms. The key was updated at 100ms.
  // The new expiry is 100 + 300 = 400ms.
  // Let's wait another 60ms to pass the 400ms mark.
  await waiting(60); // Total time: 350 + 60 = 410ms
  console.log("Value after 410ms:", cache.get(key)); // Expected: null (Expired)
  console.log("Cache demo finished.");
}

/**
 * Demo 4: Getting a non-existent key.
 * - Gets a key that has not been set.
 * - Sets the key.
 * - Gets the key again.
 */
async function runDemo4() {
  console.log("Starting cache demo 4...");
  const key = "GBP/USD";
  const value = 1.25;

  // Default TTL is 1000ms
  const cache = new TTLCache(1000);

  console.log("Value before setting:", cache.get(key)); // Expected: null
  cache.set(key, value); // Uses default TTL
  console.log("Value after setting:", cache.get(key)); // Expected: 1.25
  console.log("Cache demo finished.");
}

/**
 * Demo 5: Caching multiple keys with different TTLs.
 * - Sets two keys with different TTLs.
 * - Gets both keys before any have expired.
 * - Waits for one key to expire and gets both again.
 */
async function runDemo5() {
  console.log("Starting cache demo 5...");

  // Default TTL is 100ms
  const cache = new TTLCache(100);

  cache.set("AUD/USD", 0.66, 50); // Expires at 50ms
  cache.set("NZD/USD", 0.61, 200); // Expires at 200ms
  console.log("Value of AUD/USD at 0ms:", cache.get("AUD/USD")); // Expected: 0.66
  console.log("Value of NZD/USD at 0ms:", cache.get("NZD/USD")); // Expected: 0.61

  await waiting(60);
  console.log("Value of AUD/USD after 60ms:", cache.get("AUD/USD")); // Expected: null (Expired)
  console.log("Value of NZD/USD after 60ms:", cache.get("NZD/USD")); // Expected: 0.61 (Not expired)

  console.log("Cache demo finished.");
}

(async () => {
  console.log("========= DEMO 1 ========");
  await runDemo1();
  console.log("\n========= DEMO 2 ========");
  await runDemo2();
  console.log("\n========= DEMO 3 ========");
  await runDemo3();
  console.log("\n========= DEMO 4 ========");
  await runDemo4();
  console.log("\n========= DEMO 5 ========");
  await runDemo5();
})();
