import { TransactionRateLimiter } from "./transaction-rate-limiter.js";

const limiter = new TransactionRateLimiter();

// console.log("==== example 1 ======");
// console.log(limiter.shouldAllow("user1", 1)); // true
// console.log(limiter.shouldAllow("user1", 2)); // true
// console.log(limiter.shouldAllow("user1", 3)); // true
// console.log(limiter.shouldAllow("user1", 4)); // true
// console.log(limiter.shouldAllow("user1", 5)); // true
// console.log(limiter.shouldAllow("user1", 6)); // true
// console.log(limiter.shouldAllow("user1", 7)); // true
// console.log(limiter.shouldAllow("user1", 8)); // true
// console.log(limiter.shouldAllow("user1", 9)); // true
// console.log(limiter.shouldAllow("user1", 10)); // true (10th successful call)
// console.log(limiter.shouldAllow("user1", 11)); // false (Exceeds 10 requests in the window)

// console.log("==== example 2 ======");
// console.log(limiter.shouldAllow("user1", 1)); // true
// console.log(limiter.shouldAllow("user2", 2)); // true
// console.log(limiter.shouldAllow("user1", 60)); // true
// console.log(limiter.shouldAllow("user1", 61)); // true

console.log("==== example 3 ======");
for (let i = 1; i <= 10; i++) {
  console.log(limiter.shouldAllow("userA", i * 5)); // Timestamps: 5, 10, ..., 50 -> all return true
}
console.log(limiter.shouldAllow("userA", 55)); // false (11th request, window is [0, 55])
console.log(limiter.shouldAllow("userA", 64)); // false (Oldest request at ts=5 is still valid in window [5, 64])
console.log(limiter.shouldAllow("userA", 65)); // true (Oldest request at ts=5 has expired from window [6, 65])
